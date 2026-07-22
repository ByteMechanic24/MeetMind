<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Streamlit-1.35+-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-LCEL-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
</p>

<h1 align="center">🧠 MeetMind</h1>
<p align="center">
  <strong>Your meetings, remembered.</strong><br/>
  <em>AI-powered meeting & video assistant — transcribe, summarize, extract insights, and chat with your recordings.</em>
</p>

---

## ✨ What It Does

Paste a **YouTube URL** or provide a **local audio/video file**, and MeetMind will:

| Feature | Description |
| :--- | :--- |
| 🎙️ **Transcription** | Dual-mode speech-to-text: Groq Cloud API (`whisper-large-v3-turbo`) for sub-second production latency, fallback to local OpenAI Whisper (`small` model), or Sarvam AI (Hinglish → English translation) |
| 🏷️ **Auto Title** | Generates a concise, professional meeting title |
| 📋 **Smart Summary** | Map-reduce summarization via Mistral AI into structured bullet points |
| ✅ **Action Items** | Extracts tasks with owners and deadlines |
| 🔑 **Key Decisions** | Identifies notable conclusions and agreements |
| ❓ **Open Questions** | Surfaces unresolved topics that need follow-up |
| 💬 **RAG Chat** | Ask natural-language questions about your meeting — answers are grounded in the transcript |

---

## 🏗️ Architecture

```
                   ┌─────────────────────────────────────────────────────┐
                   │                   MeetMind Pipeline                 │
                   └─────────────────────────────────────────────────────┘

  ┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
  │ YouTube  │────▶│    Audio      │────▶│  Transcriber │────▶│  Summarizer  │
  │ URL /    │     │  Processor    │     │  (Whisper /  │     │  (Mistral    │
  │ Local    │     │  (yt-dlp +    │     │   Sarvam AI) │     │   Map-Reduce)│
  │ File     │     │   pydub)      │     │              │     │              │
  └──────────┘     └───────────────┘     └──────┬───────┘     └──────────────┘
                                                │
                          ┌─────────────────────┼─────────────────────┐
                          ▼                     ▼                     ▼
                   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                   │  Extractor   │     │ Vector Store  │     │  RAG Engine  │
                   │  (Actions,   │     │  (ChromaDB +  │     │  (LangChain  │
                   │  Decisions,  │     │  MiniLM-L6)   │     │   LCEL QA)   │
                   │  Questions)  │     │              │     │              │
                   └──────────────┘     └──────────────┘     └──────────────┘
                          │                                          │
                          └──────────────┐  ┌────────────────────────┘
                                         ▼  ▼
                              ┌────────────────────┐
                              │    User Interface   │
                              │  (React / Streamlit │
                              │       / CLI)        │
                              └────────────────────┘
```

---

## 📂 Project Structure

```
meetmind/
├── core/                        # Core AI pipeline modules
│   ├── transcriber.py           # Whisper (English) & Sarvam AI (Hinglish) transcription
│   ├── summarizer.py            # Map-reduce summarization with Mistral AI
│   ├── extractor.py             # Structured extraction: action items, decisions, questions
│   ├── vector_store.py          # ChromaDB vector store with sentence-transformer embeddings
│   └── rag_engine.py            # Conversational RAG chain using LangChain LCEL
│
├── utils/
│   └── audio_processor.py       # YouTube download (yt-dlp), WAV conversion, audio chunking
│
├── frontend/                    # React SPA (Vite + Lucide icons)
│   ├── src/
│   │   ├── main.jsx             # App entrypoint
│   │   └── MeetMind.jsx         # Full UI component with API integration
│   ├── package.json
│   └── vite.config.js           # Dev proxy → FastAPI backend
│
├── main.py                      # CLI entrypoint
├── app.py                       # Streamlit dashboard
├── api.py                       # FastAPI REST API (async job processing)
├── test.py                      # Integration test script
├── requirements.txt             # Python dependencies
└── .env                         # API keys (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for the React frontend)
- **FFmpeg** installed and available on your `PATH`
- API keys configured in `.env`:
  ```env
  MISTRAL_API_KEY=your_mistral_api_key
  GROQ_API_KEY=your_groq_api_key          # Fast Whisper API (whisper-large-v3-turbo)
  SARVAM_API_KEY=your_sarvam_api_key      # Required only for Hinglish
  ```

### 1️⃣ Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2️⃣ Choose Your Interface

<details>
<summary><strong>Option A — React Frontend + FastAPI Backend (Recommended)</strong></summary>

**Terminal 1 — Start the backend:**
```bash
uvicorn api:app --reload --port 8000
```

**Terminal 2 — Start the frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*` requests to the backend automatically.

</details>

<details>
<summary><strong>Option B — Streamlit Dashboard</strong></summary>

```bash
streamlit run app.py
```

Opens a full-featured dashboard with live pipeline status in the sidebar and an integrated chat interface.

</details>

<details>
<summary><strong>Option C — Command Line</strong></summary>

```bash
python main.py
```

Follow the prompts to enter a YouTube URL or file path, then interact with your meeting via the terminal.

</details>

---

## ⚙️ How It Works

### Processing Pipeline

1. **Audio Processing** — Downloads YouTube audio via `yt-dlp` or converts local files to mono 16kHz WAV. Splits long recordings into 10-minute chunks.

2. **Transcription** — Routes audio through either:
   - **Whisper** (local, `small` model) for English
   - **Sarvam AI** (cloud API, auto-translates Hindi/Hinglish → English)

3. **Intelligence Extraction** — Uses Mistral AI (`mistral-small-latest`) via LangChain to:
   - Generate a concise meeting title
   - Produce a structured bullet-point summary (map-reduce)
   - Extract action items, key decisions, and open questions

4. **RAG Setup** — Embeds transcript chunks (500 chars, 50 overlap) using `all-MiniLM-L6-v2`, stores them in ChromaDB, and builds an LCEL retrieval-augmented QA chain.

5. **Interactive Chat** — Users can ask natural-language questions; answers are strictly grounded in the transcript context.

### API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze` | Start analysis job (returns `job_id`) |
| `GET` | `/api/status/{job_id}` | Poll pipeline step progress |
| `GET` | `/api/result/{job_id}` | Fetch completed results |
| `POST` | `/api/chat/{job_id}` | Ask a question about the transcript |
| `DELETE` | `/api/session/{job_id}` | Free memory for a completed job |

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Speech-to-Text** | OpenAI Whisper, Sarvam AI |
| **LLM** | Mistral AI (`mistral-small-latest`) |
| **Orchestration** | LangChain (LCEL) |
| **Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2`) |
| **Vector Store** | ChromaDB |
| **Backend API** | FastAPI + Uvicorn |
| **Frontend** | React 18 + Vite + Lucide Icons |
| **Dashboard** | Streamlit |
| **Audio** | yt-dlp, pydub, FFmpeg |

---

## 📝 License

This project is for educational and personal use.
