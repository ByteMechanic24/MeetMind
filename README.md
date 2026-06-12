# MeetMind

AI meeting/video assistant: paste a YouTube URL or local file, get a transcript,
title, summary, action items, key decisions, open questions — then chat with
the meeting via RAG.

This repo now has **two frontends on one backend**:

```
meetmind-project/
├── core/                  ← your existing modules (not included here — copy yours in)
│   ├── transcriber.py
│   ├── summarizer.py
│   ├── extractor.py
│   └── rag_engine.py
├── utils/
│   └── audio_processor.py
├── main.py                 CLI entry point (unchanged)
├── app.py                  Streamlit UI (unchanged, still works standalone)
├── api.py                  NEW — FastAPI wrapper around the same pipeline
├── test.py
├── Requirements.txt         Python deps (now includes fastapi + uvicorn)
├── .gitignore
└── frontend/                NEW — React (Vite) UI, calls api.py over HTTP
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        └── MeetMind.jsx      the "Playful Geometric" UI, wired to /api/*
```

`core/` and `utils/` aren't included in this bundle since you already have
them in your project — drop `api.py`, the updated `Requirements.txt`, and the
`frontend/` folder into your existing repo root alongside them.

---

## Running it (two servers, one terminal each)

### 1. Backend — FastAPI

```bash
pip install -r Requirements.txt --break-system-packages
# make sure your .env (Mistral API key etc.) is in the project root, same as before
uvicorn api:app --reload --port 8000
```

Sanity check: `curl http://localhost:8000/api/health` → `{"ok": true}`

### 2. Frontend — React (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies any `/api/*`
request to `http://localhost:8000`, so the two talk to each other with zero
extra config — just make sure the backend is running first.

---

## How the pieces connect

```
 React UI (5173)          FastAPI (8000)              your pipeline
 ─────────────────        ─────────────────           ─────────────────
 POST /api/analyze   ───▶  starts a background   ───▶  process_input()
                           job, returns job_id          transcribe_all()
                                                          generate_title()
 poll                                                    summarize()
 GET /api/status/:id ───▶  { steps, status }             extract_*()
                                                          build_rag_chain()
 GET /api/result/:id ───▶  title/summary/etc.

 POST /api/chat/:id  ───▶  ask_question(chain, q)  ───▶  your RAG chain
```

Analysis is asynchronous because transcription + embedding are slow: the
frontend fires `POST /api/analyze`, gets a `job_id` back immediately, then
polls `GET /api/status/:job_id` every 1.5s. Each of the 6 pipeline steps
(audio → transcript → title → summary → extract → rag) updates in the
sidebar as it happens — same steps the Streamlit sidebar showed, just driven
by the real backend instead of `st.session_state`.

Job state (and the non-serialisable `rag_chain` object) lives in memory in
`api.py`. That's fine for local use / a single dev server. If you deploy this
for real, swap the in-memory `JOBS`/`CHAINS` dicts for Redis (or similar) and
run the pipeline via a proper task queue (Celery/RQ/arq) instead of
`BackgroundTasks`.

## Still using Streamlit?

`app.py` is untouched and still works exactly as before — `streamlit run app.py`.
The React UI is an alternative frontend on the same backend logic, not a
replacement; run whichever (or both) you like.

## Things I couldn't verify from here

I don't have your `core/`/`utils/` modules, your `.env`, or `ffmpeg`/Whisper
in this sandbox, so I could confirm the **frontend builds cleanly** (`npm run
build` succeeds) and the **backend is syntactically valid**, but the full
loop (YouTube URL → real transcript → real chat answer) needs to be smoke
tested on your machine.
