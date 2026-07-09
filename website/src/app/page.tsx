"use client";

import { useEffect, useState } from "react";

const RELEASE_URL = "https://github.com/portgasdyamato/Promptify/releases/latest";

/* ─── Navbar ──────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(242,242,247,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(32px) saturate(200%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(32px) saturate(200%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(60,60,67,0.1)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1C1C1E" }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="4" fill="white" />
              <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
            Promptify
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {[["Features", "#features"], ["How it works", "#how-it-works"], ["Download", "#download"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{ fontSize: 14, fontWeight: 500, color: "#6E6E73", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1C1C1E")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6E6E73")}
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href={RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: "8px 18px", fontSize: 13 }}
        >
          Download
        </a>
      </div>
    </header>
  );
}

/* ─── Widget Demo ──────────────────────────────────────────────────────── */
function WidgetDemo() {
  const [phase, setPhase] = useState<"idle" | "listening" | "typing" | "done">("idle");
  const [text, setText] = useState("");
  const full = "Write a follow-up email to the design team about the Q3 product launch timeline and next steps…";

  useEffect(() => {
    let alive = true;
    const run = async () => {
      while (alive) {
        await wait(1000);
        if (!alive) break; setPhase("listening");
        await wait(2200);
        if (!alive) break; setPhase("typing"); setText("");
        for (let i = 0; i <= full.length; i++) {
          if (!alive) break;
          setText(full.slice(0, i));
          await wait(22);
        }
        await wait(2000);
        if (!alive) break; setPhase("done");
        await wait(2200);
        if (!alive) break; setPhase("idle"); setText("");
        await wait(1400);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  const phaseLabel = { idle: "Ready", listening: "Listening…", typing: "Generating prompt", done: "Injected ✓" }[phase];
  const dotColor = { idle: "#AEAEB2", listening: "#34C759", typing: "#007AFF", done: "#34C759" }[phase];

  return (
    <div className="float" style={{ width: "100%", maxWidth: 560, margin: "0 auto", filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.14))" }}>
      {/* macOS window chrome */}
      <div
        className="glass-thick"
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        {/* Titlebar */}
        <div
          style={{
            padding: "12px 16px 12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(60,60,67,0.08)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#6E6E73" }}>Promptify</span>
          </div>
          <div style={{ width: 42 }} />
        </div>

        {/* Content */}
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Status dot */}
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(120,120,128,0.08)",
              border: "1px solid rgba(60,60,67,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            {phase === "idle" && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            )}
            {phase === "listening" && (
              <div className="blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#34C759" }} />
            )}
            {phase === "typing" && (
              <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity={0.2} />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            )}
            {phase === "done" && (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dotColor, marginBottom: 3 }}>
              {phaseLabel}
            </p>
            <p style={{ fontSize: 13, color: "#3A3A3C", lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {text || (phase === "idle" ? "Press Ctrl+Shift+V to activate…" : phase === "listening" ? "Say your request…" : "")}
              {phase === "typing" && <span style={{ display: "inline-block", width: 1.5, height: 12, background: "#007AFF", marginLeft: 1, verticalAlign: "middle", animation: "blink 0.8s step-end infinite" }} />}
            </p>
          </div>

          {/* Mic button */}
          <button
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, border: "none",
              background: phase === "listening" ? "rgba(52,199,89,0.12)" : "rgba(120,120,128,0.08)",
              cursor: "default", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={phase === "listening" ? "#34C759" : "#AEAEB2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </button>

          {/* Close */}
          <button
            style={{
              width: 28, height: 28, borderRadius: 7, border: "none",
              background: "rgba(120,120,128,0.08)",
              cursor: "default", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#AEAEB2" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1L8 8M8 1L1 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Card ─────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="glass"
      style={{
        borderRadius: 20, padding: "28px 24px",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 8px 40px rgba(0,0,0,0.1)" : undefined,
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 18,
          background: "rgba(120,120,128,0.08)",
          border: "1px solid rgba(60,60,67,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</p>
      <p style={{ fontSize: 13.5, color: "#6E6E73", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="glass" style={{ borderRadius: 20, padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "#1C1C1E", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
        }}
      >
        {n}
      </div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 6, letterSpacing: "-0.01em" }}>{title}</p>
        <p style={{ fontSize: 13.5, color: "#6E6E73", lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Stat ─────────────────────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass" style={{ borderRadius: 20, padding: "24px 20px", textAlign: "center" }}>
      <p style={{ fontSize: 36, fontWeight: 800, color: "#1C1C1E", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12.5, color: "#AEAEB2", marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "120px 24px 80px",
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,122,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(52,199,89,0.04) 0%, transparent 70%), #F2F2F7",
        }}
      >
        {/* Eyebrow */}
        <div
          className="glass"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 100, marginBottom: 36,
          }}
        >
          <div className="blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#3A3A3C", letterSpacing: "0.02em" }}>
            Available for Windows 10 / 11
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(42px, 8vw, 88px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            textAlign: "center",
            color: "#1C1C1E",
            maxWidth: 780,
            marginBottom: 24,
          }}
        >
          Voice to prompt.
          <br />
          <span style={{ color: "#007AFF" }}>Instantly.</span>
        </h1>

        <p
          style={{
            fontSize: 18, fontWeight: 400, color: "#6E6E73",
            textAlign: "center", maxWidth: 520,
            lineHeight: 1.65, marginBottom: 48,
          }}
        >
          Promptify floats on your desktop. You speak — it generates a
          comprehensive AI prompt and types it directly into any window.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 80 }}>
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "14px 32px", fontSize: 15, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for Windows
          </a>
          <a
            href="https://github.com/portgasdyamato/Promptify"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: "14px 28px", fontSize: 15, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Widget demo */}
        <WidgetDemo />
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "0 24px 80px" }}>
        <div
          style={{
            maxWidth: 900, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12,
          }}
        >
          <Stat value="< 2s" label="Average response time" />
          <Stat value="99%" label="Transcription accuracy" />
          <Stat value="Any" label="Works in any app" />
          <Stat value="0" label="Focus interruptions" />
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              Capabilities
            </p>
            <h2 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#1C1C1E", maxWidth: 480, margin: "0 auto" }}>
              Built for people who think fast
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 12 }}>
            {[
              {
                title: "Always-on widget",
                desc: "The widget hovers on your screen 24/7. Close the main window — it stays. Dismiss it with the × when you're done.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>,
              },
              {
                title: "Global shortcut",
                desc: "Ctrl+Shift+V summons the widget instantly, without stealing focus from your current app. Never disrupt your flow.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M8 8l2 2-2 2M13 10h3" /></svg>,
              },
              {
                title: "Direct text injection",
                desc: "The generated prompt is pasted directly into whatever window has focus. No copy-paste gymnastics needed.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
              },
              {
                title: "Smart silence detection",
                desc: "After 3 seconds of silence post-speech, Promptify stops recording automatically. Just pause — no button needed.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
              },
              {
                title: "Prompt history",
                desc: "Every prompt is stored locally in SQLite. Open the app window to browse, copy, and reuse your best prompts.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
              },
              {
                title: "Runs in background",
                desc: "Closes to system tray. The app is always alive, always ready. One shortcut press away no matter what you're doing.",
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
              },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        style={{ padding: "80px 24px", background: "rgba(255,255,255,0.5)" }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#007AFF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              Workflow
            </p>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#1C1C1E" }}>
              From thought to prompt in 3 seconds
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Step n={1} title="Press Ctrl+Shift+V" desc="The floating widget appears on-screen without stealing focus. Your current app stays active." />
            <Step n={2} title="Speak naturally" desc="Say what you need — a prompt idea, a task, a topic. Whisper large-v3 transcribes you in real-time." />
            <Step n={3} title="AI expands your idea" desc="Llama 3.3 70B rewrites your rough thought into a comprehensive, expert-level prompt with full context." />
            <Step n={4} title="Prompt appears in your app" desc="The optimized prompt is pasted directly into whichever text field had focus. Done. Back to work." />
          </div>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="download" style={{ padding: "80px 24px 100px" }}>
        <div
          className="glass-thick"
          style={{
            maxWidth: 680, margin: "0 auto", borderRadius: 28,
            padding: "64px 40px", textAlign: "center",
            background: "rgba(255,255,255,0.88)",
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 16, background: "#1C1C1E",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>

          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#1C1C1E", marginBottom: 16 }}>
            Download Promptify
          </h2>
          <p style={{ fontSize: 16, color: "#6E6E73", marginBottom: 36, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 36px" }}>
            Free and open-source. Download the Windows installer, run setup,
            and your AI prompt co-pilot is live in seconds.
          </p>

          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "16px 40px", fontSize: 16, textDecoration: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for Windows
          </a>

          <p style={{ fontSize: 12, color: "#AEAEB2", marginTop: 20 }}>
            Windows 10 / 11 · 64-bit · Requires Groq API key
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "28px 24px", textAlign: "center",
          borderTop: "1px solid rgba(60,60,67,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: "#1C1C1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="4" fill="white" />
              <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#3A3A3C" }}>Promptify</span>
        </div>
        <p style={{ fontSize: 12, color: "#AEAEB2" }}>© 2026 Promptify · MIT License · Open Source</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 14 }}>
          {[["GitHub", "https://github.com/portgasdyamato/Promptify"], ["Releases", RELEASE_URL]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#AEAEB2", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#3A3A3C")}
              onMouseLeave={e => (e.currentTarget.style.color = "#AEAEB2")}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
