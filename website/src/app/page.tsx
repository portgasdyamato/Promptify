"use client";

import { useEffect, useRef, useState } from "react";

const GITHUB_RELEASE_URL = "https://github.com/portgasdyamato/Promptify/releases/latest";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(3,8,4,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(57,255,137,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(57,255,137,0.1)",
              border: "1px solid rgba(57,255,137,0.3)",
              boxShadow: "0 0 16px rgba(57,255,137,0.2)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#39ff89" />
              <path d="M8 2 L8 5" stroke="#39ff89" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 11 L8 14" stroke="#39ff89" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 8 L5 8" stroke="#39ff89" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M11 8 L14 8" stroke="#39ff89" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-wide" style={{ fontFamily: "var(--font-space)" }}>
            Promptify
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {["Features", "How It Works", "Download"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="hover:text-white transition-colors duration-200 tracking-wide uppercase text-xs"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href={GITHUB_RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-btn px-5 py-2 rounded-full text-sm font-semibold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ↓ Download
        </a>
      </div>
    </nav>
  );
}

function WidgetMockup() {
  const [phase, setPhase] = useState<"idle" | "listening" | "processing" | "done">("idle");
  const [text, setText] = useState("");
  const fullText = "Write a detailed email about the product launch strategy...";

  useEffect(() => {
    const cycle = async () => {
      await new Promise((r) => setTimeout(r, 1200));
      setPhase("listening");
      await new Promise((r) => setTimeout(r, 2000));
      setPhase("processing");
      let i = 0;
      const interval = setInterval(() => {
        setText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setPhase("done");
          setTimeout(() => {
            setPhase("idle");
            setText("");
            cycle();
          }, 3000);
        }
      }, 30);
    };
    cycle();
  }, []);

  const phaseColor = phase === "listening" ? "#39ff89" : phase === "processing" ? "#a78bfa" : phase === "done" ? "#34d399" : "#6b7280";
  const phaseLabel = phase === "listening" ? "Listening…" : phase === "processing" ? "Generating…" : phase === "done" ? "Injected ✓" : "Press mic to speak";

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Glow under widget */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(57,255,137,0.25) 0%, transparent 70%)", filter: "blur(12px)" }}
      />

      {/* Widget */}
      <div
        className="relative flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(32px) saturate(200%)",
          border: "1px solid rgba(57,255,137,0.2)",
          boxShadow:
            phase === "listening"
              ? "0 0 40px rgba(57,255,137,0.25), inset 0 0 40px rgba(57,255,137,0.04)"
              : "0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Status dot */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `rgba(${phase === "listening" ? "57,255,137" : phase === "processing" ? "167,139,250" : "57,255,137"},0.1)`, border: `1px solid rgba(${phase === "listening" ? "57,255,137" : "167,139,250"},0.2)` }}>
          {phase === "listening" && (
            <div className="w-3 h-3 rounded-full blink-dot" style={{ background: "#39ff89" }} />
          )}
          {phase === "processing" && (
            <svg className="animate-spin w-4 h-4" style={{ color: "#a78bfa" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {(phase === "idle" || phase === "done") && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 overflow-hidden">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: phaseColor, fontFamily: "var(--font-mono)" }}>
            {phaseLabel}
          </p>
          <p className="text-sm text-zinc-200 truncate" style={{ minHeight: "1.25rem" }}>
            {text || (phase === "idle" ? "Ready for your command…" : "")}
            {(phase === "processing") && <span className="inline-block w-1 h-3 ml-0.5 align-middle bg-violet-400 animate-pulse" />}
          </p>
        </div>

        {/* Mic button */}
        <button
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: phase === "listening" ? "rgba(57,255,137,0.2)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${phase === "listening" ? "rgba(57,255,137,0.5)" : "rgba(255,255,255,0.08)"}`,
            boxShadow: phase === "listening" ? "0 0 20px rgba(57,255,137,0.4)" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={phase === "listening" ? "#39ff89" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </button>

        {/* Close button */}
        <button
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 1 L9 9 M9 1 L1 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="glass glass-hover p-6 flex flex-col gap-1"
      style={{ fontFamily: "var(--font-space)" }}
    >
      <p className="text-4xl font-bold neon-text">{value}</p>
      <p className="text-zinc-400 text-sm">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      className="glass glass-hover p-6 flex flex-col gap-4"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(57,255,137,0.08)", border: "1px solid rgba(57,255,137,0.2)" }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: "rgba(57,255,137,0.1)", border: "1px solid rgba(57,255,137,0.3)", color: "#39ff89", fontFamily: "var(--font-mono)" }}
    >
      {n}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen grid-bg" style={{ fontFamily: "var(--font-space)" }}>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 pb-16 overflow-hidden">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(57,255,137,0.07) 0%, transparent 65%)" }} />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-30"
          style={{ background: "radial-gradient(circle, rgba(57,255,137,0.05) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, rgba(57,255,137,0.06) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-medium tracking-widest uppercase"
          style={{ background: "rgba(57,255,137,0.06)", border: "1px solid rgba(57,255,137,0.2)", color: "#39ff89", fontFamily: "var(--font-mono)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full blink-dot inline-block" style={{ background: "#39ff89" }} />
          Now available for Windows
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 leading-tight tracking-tight max-w-5xl">
          Speak your mind.
          <br />
          <span className="neon-text">Generate expert</span>
          <br />
          AI prompts.
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl text-center max-w-2xl mb-12 leading-relaxed">
          Promptify is a floating desktop widget that listens to your voice and
          instantly injects highly-optimized AI prompts into any active window.
          Like Wispr Flow — built for prompt engineers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <a
            href={GITHUB_RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="download-btn"
            className="neon-btn px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base text-zinc-300 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Widget preview */}
        <div className="float-animation w-full max-w-2xl">
          <WidgetMockup />
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="< 2s" label="Avg. response time" />
          <StatCard value="99%" label="Transcription accuracy" />
          <StatCard value="∞" label="Supported apps" />
          <StatCard value="0" label="Focus disruption" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#39ff89", fontFamily: "var(--font-mono)" }}>
              // capabilities
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for power users</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Every feature designed to keep you in flow state.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
              title="Persistent Floating Widget"
              desc="The widget lives on your screen at all times. Close the app window — it stays. It only leaves when you dismiss it."
            />
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>}
              title="Global Shortcut"
              desc="Press Ctrl+Shift+V anywhere on Windows. The widget appears instantly without interrupting your current workflow."
            />
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
              title="Direct Text Injection"
              desc="Generated prompts are pasted directly into your active window via clipboard automation. Zero extra steps."
            />
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
              title="3-Second Silence Detection"
              desc="Smart auto-stop kicks in after 3 seconds of silence post-speech. No button needed — just talk and pause."
            />
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}
              title="Prompt History"
              desc="Every generated prompt is stored locally in SQLite. Review and reuse your best prompts from the full app window."
            />
            <FeatureCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              title="Runs in Background"
              desc="The app stays alive in your system tray even when the window is closed. Always ready, never in the way."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#39ff89", fontFamily: "var(--font-mono)" }}>
              // workflow
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From thought to prompt</h2>
            <p className="text-zinc-400 text-lg">In under 3 seconds.</p>
          </div>

          <div className="flex flex-col gap-5">
            {[
              { n: 1, title: "Press the shortcut", desc: "Hit Ctrl+Shift+V anywhere. The Promptify widget appears floating on your screen without stealing focus from your current app." },
              { n: 2, title: "Speak your request", desc: 'Say what you need in plain language. "Write an email about the Q3 results" or "Generate a system prompt for a coding assistant."' },
              { n: 3, title: "AI expands your intent", desc: "Whisper transcribes your voice. Llama 3.3 70B rewrites it into a comprehensive, expert-level prompt with full context and constraints." },
              { n: 4, title: "Prompt injected instantly", desc: "The optimized prompt is pasted directly into whatever window had focus. Your cursor is in the right place. Done." },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="glass glass-hover p-6 flex items-start gap-5"
              >
                <StepBadge n={n} />
                <div>
                  <h3 className="text-white font-semibold text-base mb-1">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Download CTA ─────────────────────────────── */}
      <section id="download" className="py-24 px-6">
        <div
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl relative overflow-hidden"
          style={{
            background: "rgba(57,255,137,0.03)",
            border: "1px solid rgba(57,255,137,0.15)",
            boxShadow: "0 0 80px rgba(57,255,137,0.05)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(57,255,137,0.08) 0%, transparent 60%)" }} />

          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#39ff89", fontFamily: "var(--font-mono)" }}>
            // free & open source
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to try it?</h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Download the Windows installer. Unzip, run setup, done. Your AI prompt co-pilot is always one shortcut away.
          </p>

          <a
            href={GITHUB_RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base"
            style={{ fontFamily: "var(--font-mono)", fontSize: "1rem" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Promptify.exe
          </a>

          <p className="text-zinc-600 text-xs mt-6" style={{ fontFamily: "var(--font-mono)" }}>
            Windows 10 / 11 · x64 · Requires Groq API key
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        className="py-10 px-6 text-center"
        style={{ borderTop: "1px solid rgba(57,255,137,0.06)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(57,255,137,0.1)", border: "1px solid rgba(57,255,137,0.2)" }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#39ff89" />
            </svg>
          </div>
          <span className="text-zinc-400 text-sm font-medium">Promptify</span>
        </div>
        <p className="text-zinc-600 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          © 2026 Promptify · Open Source · MIT License
        </p>
        <div className="flex items-center justify-center gap-6 mt-4">
          <a href="https://github.com/portgasdyamato/Promptify" target="_blank" rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs tracking-wide uppercase">
            GitHub
          </a>
          <a href={GITHUB_RELEASE_URL} target="_blank" rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs tracking-wide uppercase">
            Releases
          </a>
        </div>
      </footer>
    </div>
  );
}
