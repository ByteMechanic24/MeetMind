import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  FileText,
  Tag,
  ClipboardList,
  Search,
  Brain,
  Send,
  Trash2,
  Loader2,
  MessageCircle,
  CheckCircle2,
  KeyRound,
  HelpCircle,
  Zap,
  Youtube,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   "Playful Geometric" design tokens — matched exactly to the design brief
   ──────────────────────────────────────────────────────────────────────── */
const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  :root {
    --background: #FFFDF5;
    --foreground: #1E293B;
    --muted: #F1F5F9;
    --muted-foreground: #64748B;
    --accent: #8B5CF6;
    --accent-foreground: #FFFFFF;
    --secondary: #F472B6;
    --tertiary: #FBBF24;
    --quaternary: #34D399;
    --border: #E2E8F0;
    --input: #FFFFFF;
    --card: #FFFFFF;
    --ring: #8B5CF6;

    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-full: 9999px;
    --bw: 2px;

    --shadow-pop: 4px 4px 0px 0px var(--foreground);
    --shadow-pop-lg: 8px 8px 0px 0px var(--border);
    --shadow-hover: 6px 6px 0px 0px var(--foreground);
    --shadow-active: 2px 2px 0px 0px var(--foreground);
    --bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .ava-root * { box-sizing: border-box; }

  .ava-root {
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    color: var(--foreground);
    background: var(--background);
    background-image: radial-gradient(var(--border) 1.6px, transparent 1.6px);
    background-size: 26px 26px;
    min-height: 100%;
    position: relative;
    overflow-x: hidden;
  }

  .ava-blob {
    position: absolute;
    border-radius: 9999px;
    pointer-events: none;
    z-index: 0;
  }

  .ava-root h1, .ava-root h2, .ava-root h3, .ava-root h4 {
    font-family: "Outfit", system-ui, sans-serif;
    font-weight: 800;
    margin: 0;
    color: var(--foreground);
  }

  .ava-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: var(--radius-full);
    border: var(--bw) solid var(--foreground);
    box-shadow: 2px 2px 0px 0px var(--foreground);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ava-btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--accent);
    color: #fff;
    border: var(--bw) solid var(--foreground);
    border-radius: var(--radius-full);
    font-family: "Outfit", sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    padding: 0.75rem 1.6rem;
    box-shadow: var(--shadow-pop);
    cursor: pointer;
    transition: transform 0.25s var(--bounce), box-shadow 0.25s var(--bounce);
  }
  .ava-btn-primary:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-hover);
  }
  .ava-btn-primary:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-active);
  }
  .ava-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .ava-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    color: var(--foreground);
    border: var(--bw) solid var(--foreground);
    border-radius: var(--radius-full);
    font-family: "Outfit", sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
    padding: 0.55rem 1.2rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s var(--bounce), box-shadow 0.2s var(--bounce);
  }
  .ava-btn-secondary:hover {
    background: var(--tertiary);
    box-shadow: var(--shadow-active);
  }

  .ava-input, .ava-select {
    width: 100%;
    background: var(--input);
    border: var(--bw) solid #CBD5E1;
    border-radius: var(--radius-sm);
    color: var(--foreground);
    font-family: "Plus Jakarta Sans", sans-serif;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 0.7rem 0.9rem;
    outline: none;
    transition: box-shadow 0.2s, border-color 0.2s;
  }
  .ava-input:focus, .ava-select:focus {
    border-color: var(--accent);
    box-shadow: 4px 4px 0px 0px var(--accent);
  }
  .ava-label {
    display: block;
    font-family: "Outfit", sans-serif;
    font-weight: 700;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--foreground);
    margin-bottom: 0.4rem;
  }

  .ava-card {
    position: relative;
    background: var(--card);
    border: var(--bw) solid var(--foreground);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-pop-lg);
    padding: 1.6rem 1.5rem 1.5rem;
    transition: transform 0.3s var(--bounce);
  }
  .ava-card:hover { transform: rotate(-0.5deg) scale(1.012); }

  .ava-card-icon {
    position: absolute;
    top: -20px;
    left: 22px;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: var(--bw) solid var(--foreground);
    box-shadow: 3px 3px 0px 0px var(--foreground);
    color: var(--foreground);
  }

  .ava-card-title {
    font-family: "Outfit", sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin: 0.35rem 0 0.75rem;
  }

  .ava-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 0.3rem 0.8rem;
    border-radius: var(--radius-full);
    border: var(--bw) solid var(--foreground);
    box-shadow: 2px 2px 0px 0px var(--foreground);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ava-status-row {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 0.85rem;
    background: var(--muted);
    border: var(--bw) solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .ava-dot {
    width: 10px; height: 10px; border-radius: 50%;
    border: 1.5px solid var(--foreground);
    flex-shrink: 0;
  }
  .ava-dot-pending { background: #fff; }
  .ava-dot-active  { background: var(--accent); animation: ava-pulse 1.2s infinite; }
  .ava-dot-done    { background: var(--quaternary); }

  @keyframes ava-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }

  .ava-chat-bubble {
    display: inline-block;
    max-width: 82%;
    padding: 0.65rem 1rem;
    font-size: 0.87rem;
    font-weight: 500;
    line-height: 1.55;
    border: var(--bw) solid var(--foreground);
    box-shadow: 3px 3px 0px 0px var(--foreground);
  }
  .ava-bubble-user {
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius-md) var(--radius-md) 0 var(--radius-md);
  }
  .ava-bubble-bot {
    background: #fff;
    color: var(--foreground);
    border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0;
  }

  .ava-scroll::-webkit-scrollbar { width: 6px; }
  .ava-scroll::-webkit-scrollbar-track { background: var(--muted); }
  .ava-scroll::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

  @media (prefers-reduced-motion: reduce) {
    .ava-root * { animation: none !important; transition: none !important; }
  }

  @media (max-width: 900px) {
    .ava-shell { grid-template-columns: 1fr !important; }
    .ava-sidebar { order: -1; }
  }
`;

/* ── Backend wiring ────────────────────────────────────────────────────
   Talks to the FastAPI app in api.py. In dev, vite.config.js proxies
   /api/* to http://localhost:8000, so these can stay relative paths.
   Set VITE_API_BASE at build time if you deploy the frontend separately
   from the backend (e.g. VITE_API_BASE=https://api.yourdomain.com).
   ──────────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE || "";
const POLL_INTERVAL_MS = 1500;

const STEP_DEFS = [
  { key: "audio", label: "Audio Processing", icon: Mic },
  { key: "transcript", label: "Transcription", icon: FileText },
  { key: "title", label: "Title Generation", icon: Tag },
  { key: "summary", label: "Summarisation", icon: ClipboardList },
  { key: "extract", label: "Extraction", icon: Search },
  { key: "rag", label: "RAG Engine", icon: Brain },
];

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

function inlineFormat(str) {
  return str.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length) {
      elements.push(
        <ul key={`ul-${key}`} style={{ margin: "0.4rem 0 0.8rem", paddingLeft: "1.2rem" }}>
          {listBuffer.map((item, i) => <li key={i} style={{ marginBottom: "0.3rem" }}>{inlineFormat(item)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { flushList(i); return; }
    if (t.startsWith("#### ")) { flushList(i); elements.push(<h4 key={i} style={{ fontFamily: "Outfit, sans-serif", fontSize: "0.95rem", fontWeight: 700, margin: "0.9rem 0 0.3rem" }}>{inlineFormat(t.slice(5))}</h4>); }
    else if (t.startsWith("### ")) { flushList(i); elements.push(<h3 key={i} style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: "1rem 0 0.4rem" }}>{inlineFormat(t.slice(4))}</h3>); }
    else if (t.startsWith("- ") || t.startsWith("• ")) { listBuffer.push(t.slice(2)); }
    else { flushList(i); elements.push(<p key={i} style={{ margin: "0 0 0.6rem", lineHeight: 1.7 }}>{inlineFormat(t)}</p>); }
  });
  flushList("end");
  return elements;
}

export default function MeetMind() {
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState("english");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [jobId, setJobId] = useState(null);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, thinking]);

  // Stop any in-flight polling if the component unmounts mid-analysis.
  useEffect(() => () => clearTimeout(pollRef.current), []);

  const pollStatus = (id) => {
    pollRef.current = setTimeout(async () => {
      try {
        const data = await apiGet(`/api/status/${id}`);
        setSteps(data.steps || {});

        if (data.status === "error") {
          setError(data.error || "Something went wrong while analysing that source.");
          setRunning(false);
          return;
        }

        if (data.status === "done") {
          const r = await apiGet(`/api/result/${id}`);
          setResult({
            title: r.title,
            summary: r.summary,
            actionItems: r.action_items,
            decisions: r.key_decisions,
            questions: r.open_questions,
            transcript: r.transcript,
          });
          setRunning(false);
          return;
        }

        // still pending / running — keep polling
        pollStatus(id);
      } catch (e) {
        setError(e.message || "Lost connection to the backend.");
        setRunning(false);
      }
    }, POLL_INTERVAL_MS);
  };

  const runPipeline = async () => {
    if (!source.trim()) {
      setError("Please enter a YouTube URL or file path.");
      return;
    }
    clearTimeout(pollRef.current);
    setError("");
    setResult(null);
    setChat([]);
    setSteps({});
    setRunning(true);

    try {
      const { job_id } = await apiPost("/api/analyze", {
        source: source.trim(),
        language,
      });
      setJobId(job_id);
      pollStatus(job_id);
    } catch (e) {
      setError(e.message || "Couldn't reach the backend. Is api.py running?");
      setRunning(false);
    }
  };

  const sendChat = async () => {
    const q = chatInput.trim();
    if (!q || !jobId) return;
    setChat((c) => [...c, { role: "user", content: q }]);
    setChatInput("");
    setThinking(true);
    try {
      const { answer } = await apiPost(`/api/chat/${jobId}`, { question: q });
      setChat((c) => [...c, { role: "assistant", content: answer }]);
    } catch (e) {
      setChat((c) => [
        ...c,
        { role: "assistant", content: `Couldn't get an answer: ${e.message}` },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const stepClass = (key) => {
    const s = steps[key];
    if (s === "active") return "ava-dot ava-dot-active";
    if (s === "done") return "ava-dot ava-dot-done";
    return "ava-dot ava-dot-pending";
  };

  return (
    <div className="ava-root">
      <style>{TOKENS}</style>

      {/* decorative blobs */}
      <div
        className="ava-blob"
        style={{
          top: -110,
          right: -110,
          width: 320,
          height: 320,
          background: "var(--tertiary)",
          opacity: 0.35,
        }}
      />
      <div
        className="ava-blob"
        style={{
          bottom: -140,
          left: -120,
          width: 280,
          height: 280,
          background: "var(--quaternary)",
          opacity: 0.25,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-full)",
                background: "var(--accent)",
                border: "var(--bw) solid var(--foreground)",
                boxShadow: "var(--shadow-pop)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Brain size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.15rem" }}>
                Meet<span style={{ color: "var(--accent)" }}>Mind</span>
              </h1>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
                Your meetings, remembered
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <span className="ava-badge" style={{ background: "var(--accent)", color: "#fff" }}>Transcription</span>
            <span className="ava-badge" style={{ background: "var(--quaternary)", color: "var(--foreground)" }}>Summaries</span>
            <span className="ava-badge" style={{ background: "var(--secondary)", color: "#fff" }}>RAG Chat</span>
          </div>
        </div>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "2.5rem" }}>
          <span className="ava-eyebrow" style={{ background: "var(--tertiary)" }}>
            <Zap size={13} strokeWidth={2.5} /> Drop a link, let MeetMind do the remembering
          </span>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.7rem)", marginTop: "0.9rem", lineHeight: 1.08 }}>
            Never take meeting notes{" "}
            <span style={{ color: "var(--secondary)" }}>again</span>. Get the{" "}
            <span style={{ color: "var(--accent)" }}>transcript</span>, the{" "}
            <span style={{ color: "var(--quaternary)", WebkitTextStroke: "0.4px var(--foreground)" }}>summary</span>, and a buddy to ask.
          </h2>
        </div>

        {/* ── Shell: sidebar + content ────────────────────────────── */}
        <div className="ava-shell" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.75rem", alignItems: "start" }}>
          {/* Sidebar */}
          <div className="ava-sidebar" style={{ position: "sticky", top: "1.5rem" }}>
            <div className="ava-card">
              <div className="ava-card-icon icon-violet" style={{ background: "var(--accent)", color: "#fff" }}>
                <Youtube size={18} strokeWidth={2.5} />
              </div>
              <div className="ava-card-title">Input</div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="ava-label">YouTube URL or file path</label>
                <input
                  className="ava-input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "1.2rem" }}>
                <label className="ava-label">Language</label>
                <select className="ava-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="english">English</option>
                  <option value="hinglish">Hinglish</option>
                </select>
              </div>

              {error && (
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#B91C1C", marginBottom: "0.8rem" }}>
                  {error}
                </div>
              )}

              <button className="ava-btn-primary" style={{ width: "100%" }} onClick={runPipeline} disabled={running}>
                {running ? <Loader2 size={16} className="ava-spin" style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={16} strokeWidth={2.5} />}
                {running ? "Analysing…" : "Analyse"}
              </button>
            </div>

            {(running || result) && (
              <div className="ava-card" style={{ marginTop: "1.6rem" }}>
                <div className="ava-card-icon" style={{ background: "var(--quaternary)" }}>
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                </div>
                <div className="ava-card-title">Pipeline status</div>
                {STEP_DEFS.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="ava-status-row">
                    <span className={stepClass(key)} />
                    <Icon size={14} strokeWidth={2.5} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main content */}
          <div>
            {!result && !running && (
              <div
                className="ava-card"
                style={{
                  textAlign: "center",
                  padding: "3.5rem 2rem",
                  borderStyle: "dashed",
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    margin: "0 auto 1.4rem",
                    borderRadius: "var(--radius-full)",
                    background: "var(--tertiary)",
                    border: "var(--bw) solid var(--foreground)",
                    boxShadow: "var(--shadow-pop)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Brain size={34} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: "1.35rem" }}>MeetMind is ready when you are</h3>
                <p style={{ color: "var(--muted-foreground)", fontWeight: 500, maxWidth: 380, margin: "0.6rem auto 0", lineHeight: 1.7 }}>
                  Paste a link or file path on the left, pick a language, and hit Analyse — your transcript, summary, and chat buddy show up here.
                </p>
              </div>
            )}

            {running && !result && (
              <div className="ava-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <h3 style={{ fontSize: "1.2rem", marginTop: "1rem" }}>Working through the recording…</h3>
                <p style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>Watch the pipeline status in the sidebar.</p>
              </div>
            )}

            {result && (
              <>
                {/* Title banner */}
                <div className="ava-card" style={{ marginBottom: "1.4rem" }}>
                  <div className="ava-card-icon" style={{ background: "var(--accent)", color: "#fff" }}>
                    <Tag size={18} strokeWidth={2.5} />
                  </div>
                  <div className="ava-card-title">Session title</div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>{result.title}</div>
                </div>

                {/* Summary + transcript */}
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.4rem", marginBottom: "1.4rem", alignItems: "stretch" }}>
                  <div className="ava-card" style={{ display: "flex", flexDirection: "column", maxHeight: 380 }}>
                    <div className="ava-card-icon" style={{ background: "var(--tertiary)" }}>
                      <ClipboardList size={18} strokeWidth={2.5} />
                    </div>
                    <div className="ava-card-title">Summary</div>
                    <div className="ava-scroll" style={{ fontSize: "0.92rem", fontWeight: 500, overflowY: "auto", paddingRight: "0.3rem" }}>
                      {renderMarkdown(result.summary)}
                    </div>
                  </div>

                  <div className="ava-card" style={{ maxHeight: 380, display: "flex", flexDirection: "column" }}>
                    <div className="ava-card-icon" style={{ background: "var(--secondary)", color: "#fff" }}>
                      <FileText size={18} strokeWidth={2.5} />
                    </div>
                    <div className="ava-card-title">Full transcript</div>
                    <div
                      className="ava-scroll"
                      style={{
                        background: "var(--muted)",
                        border: "var(--bw) solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "1rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.8,
                        fontWeight: 500,
                        overflowY: "auto",
                        color: "var(--foreground)",
                      }}
                    >
                      {result.transcript}
                    </div>
                  </div>
                </div>

                {/* Action items / decisions / questions */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.4rem", marginBottom: "1.4rem", alignItems: "stretch" }}>
                  <div className="ava-card">
                    <div className="ava-card-icon" style={{ background: "var(--quaternary)" }}>
                      <CheckCircle2 size={18} strokeWidth={2.5} />
                    </div>
                    <div className="ava-card-title">Action items</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{renderMarkdown(result.actionItems)}</div>
                  </div>
                  <div className="ava-card">
                    <div className="ava-card-icon" style={{ background: "var(--secondary)", color: "#fff" }}>
                      <KeyRound size={18} strokeWidth={2.5} />
                    </div>
                    <div className="ava-card-title">Key decisions</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{renderMarkdown(result.decisions)}</div>
                  </div>
                  <div className="ava-card">
                    <div className="ava-card-icon" style={{ background: "var(--accent)", color: "#fff" }}>
                      <HelpCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="ava-card-title">Open questions</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{renderMarkdown(result.questions)}</div>
                  </div>
                </div>

                {/* Chat */}
                <div className="ava-card">
                  <div className="ava-card-icon" style={{ background: "var(--tertiary)" }}>
                    <MessageCircle size={18} strokeWidth={2.5} />
                  </div>
                  <div className="ava-card-title">Chat with your meeting</div>

                  <div
                    className="ava-scroll"
                    style={{
                      background: "var(--muted)",
                      border: "var(--bw) solid var(--foreground)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.1rem",
                      minHeight: 140,
                      maxHeight: 340,
                      overflowY: "auto",
                      marginBottom: "1rem",
                    }}
                  >
                    {chat.length === 0 && !thinking && (
                      <div style={{ textAlign: "center", color: "var(--muted-foreground)", fontWeight: 600, fontSize: "0.85rem", padding: "1.5rem 0" }}>
                        Ask anything about your meeting transcript
                      </div>
                    )}
                    {chat.map((m, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: m.role === "user" ? "flex-end" : "flex-start",
                          marginBottom: "0.9rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: m.role === "user" ? "var(--accent)" : "#0F766E",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {m.role === "user" ? "You" : "Assistant"}
                        </span>
                        <div className={`ava-chat-bubble ${m.role === "user" ? "ava-bubble-user" : "ava-bubble-bot"}`}>{m.content}</div>
                      </div>
                    ))}
                    {thinking && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", fontSize: "0.82rem", fontWeight: 600 }}>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> thinking…
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div style={{ display: "flex", gap: "0.7rem" }}>
                    <input
                      className="ava-input"
                      placeholder="What were the main decisions made?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChat()}
                    />
                    <button className="ava-btn-primary" style={{ padding: "0.7rem 1.2rem" }} onClick={sendChat}>
                      <Send size={16} strokeWidth={2.5} />
                    </button>
                  </div>

                  {chat.length > 0 && (
                    <div style={{ marginTop: "0.9rem" }}>
                      <button className="ava-btn-secondary" onClick={() => setChat([])}>
                        <Trash2 size={13} strokeWidth={2.5} /> Clear chat
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
