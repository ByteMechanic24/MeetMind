"""
MeetMind — API layer
─────────────────────
Wraps the existing pipeline (utils/audio_processor.py, core/transcriber.py,
core/summarizer.py, core/extractor.py, core/rag_engine.py) in a small FastAPI
app so the React UI can call it over HTTP instead of importing it directly
(the way app.py / main.py do today).

Run:
    pip install fastapi "uvicorn[standard]" --break-system-packages
    uvicorn api:app --reload --port 8000

The frontend then talks to:
    POST   /api/analyze          → start a job, returns { job_id }
    GET    /api/status/{job_id}  → poll pipeline step status
    GET    /api/result/{job_id}  → fetch the finished result
    POST   /api/chat/{job_id}    → ask a question about that job's transcript
    DELETE /api/session/{job_id} → free memory (rag chain, chunks, etc.)

Design notes:
- Transcription/RAG-building are slow (Whisper + embeddings), so /api/analyze
  returns immediately with a job_id and does the real work in a background
  thread. The frontend polls /api/status the same way the Streamlit sidebar
  showed live step status.
- Job state lives in memory (a dict). Fine for local/single-process use.
  For multiple workers or production, swap JOBS for Redis or a DB and swap
  BackgroundTasks for a real task queue (Celery/RQ/arq).
- rag_chain objects aren't JSON-serialisable, so they're kept in a separate
  in-memory map (CHAINS) keyed by job_id, never returned to the client.
"""

import uuid
import traceback
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from utils.audio_processor import process_input
from core.transcriber import transcribe_all
from core.summarizer import summarize, generate_title
from core.extractor import extract_action_items, extract_key_decisions, extract_questions
from core.rag_engine import build_rag_chain, ask_question

load_dotenv()

app = FastAPI(title="MeetMind API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────
# Add your deployed frontend origin here once you have one.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",   # CRA / Next dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory stores ─────────────────────────────────────────────────────
STEP_ORDER = ["audio", "transcript", "title", "summary", "extract", "rag"]

JOBS: dict[str, dict] = {}     # job_id -> { status, steps, result, error, created_at }
CHAINS: dict[str, object] = {}  # job_id -> rag_chain (kept out of JSON responses)

JOB_TTL = timedelta(hours=6)  # simple cleanup window


def _new_job() -> str:
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {
        "status": "pending",       # pending | running | done | error
        "steps": {k: "pending" for k in STEP_ORDER},
        "result": None,
        "error": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    return job_id


def _set_step(job_id: str, step: str, state: str) -> None:
    if job_id in JOBS:
        JOBS[job_id]["steps"][step] = state


def _cleanup_expired() -> None:
    cutoff = datetime.utcnow() - JOB_TTL
    expired = [
        jid for jid, job in JOBS.items()
        if datetime.fromisoformat(job["created_at"]) < cutoff
    ]
    for jid in expired:
        JOBS.pop(jid, None)
        CHAINS.pop(jid, None)


# ── Request / response models ───────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    source: str
    language: str = "english"   # "english" | "hinglish"


class ChatRequest(BaseModel):
    question: str


# ── Pipeline runner (executed in a background thread) ──────────────────
def _run_pipeline(job_id: str, source: str, language: str) -> None:
    JOBS[job_id]["status"] = "running"
    try:
        _set_step(job_id, "audio", "active")
        chunks = process_input(source)
        _set_step(job_id, "audio", "done")

        _set_step(job_id, "transcript", "active")
        transcript = transcribe_all(chunks, language)
        _set_step(job_id, "transcript", "done")

        _set_step(job_id, "title", "active")
        title = generate_title(transcript)
        _set_step(job_id, "title", "done")

        _set_step(job_id, "summary", "active")
        summary = summarize(transcript)
        _set_step(job_id, "summary", "done")

        _set_step(job_id, "extract", "active")
        action_items = extract_action_items(transcript)
        decisions = extract_key_decisions(transcript)
        questions = extract_questions(transcript)
        _set_step(job_id, "extract", "done")

        _set_step(job_id, "rag", "active")
        rag_chain = build_rag_chain(transcript)
        _set_step(job_id, "rag", "done")

        CHAINS[job_id] = rag_chain
        JOBS[job_id]["result"] = {
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "key_decisions": decisions,
            "open_questions": questions,
        }
        JOBS[job_id]["status"] = "done"

    except Exception as e:
        # Mark whichever step was mid-flight back to "pending" so the UI
        # doesn't show a false "active" spinner forever, and surface the error.
        for step, state in JOBS[job_id]["steps"].items():
            if state == "active":
                JOBS[job_id]["steps"][step] = "pending"
        JOBS[job_id]["status"] = "error"
        JOBS[job_id]["error"] = f"{e}"
        traceback.print_exc()


# ── Routes ────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks):
    if not req.source.strip():
        raise HTTPException(400, "source (YouTube URL or file path) is required")

    _cleanup_expired()
    job_id = _new_job()
    background_tasks.add_task(_run_pipeline, job_id, req.source.strip(), req.language)
    return {"job_id": job_id}


@app.get("/api/status/{job_id}")
def status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "Unknown job_id")
    return {
        "status": job["status"],
        "steps": job["steps"],
        "error": job["error"],
    }


@app.get("/api/result/{job_id}")
def result(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "Unknown job_id")
    if job["status"] == "error":
        raise HTTPException(500, job["error"] or "Pipeline failed")
    if job["status"] != "done":
        raise HTTPException(425, "Job not finished yet — poll /api/status first")
    return job["result"]


@app.post("/api/chat/{job_id}")
def chat(job_id: str, req: ChatRequest):
    if job_id not in CHAINS:
        raise HTTPException(
            404, "No RAG chain for this job — has analysis finished?"
        )
    if not req.question.strip():
        raise HTTPException(400, "question is required")

    answer = ask_question(CHAINS[job_id], req.question.strip())
    return {"answer": answer}


@app.delete("/api/session/{job_id}")
def end_session(job_id: str):
    JOBS.pop(job_id, None)
    CHAINS.pop(job_id, None)
    return {"deleted": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
