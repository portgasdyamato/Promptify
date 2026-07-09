"use client";
import { useEffect, useState } from "react";

const RELEASE_URL = "https://github.com/portgasdyamato/Promptify/releases/latest";
const GITHUB_URL = "https://github.com/portgasdyamato/Promptify";

/* Helper delay */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/* macOS Traffic lights */
function TrafficLights() {
  return (
    <div className="flex gap-2.5 items-center">
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/80" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]/80" />
    </div>
  );
}

/* ─── Premium OS Top Menu Bar ────────────────────────────── */
function TopMenuBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 h-10 px-8 flex items-center justify-between border-b border-white/[0.03] bg-white/[0.01] backdrop-filter backdrop-blur-md z-50 select-none">
      {/* OS Menu Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <div className="w-4.5 h-4.5 rounded bg-[#00FF99] flex items-center justify-center shadow-[0_0_10px_rgba(0,255,153,0.3)]">
            <svg width="8" height="8" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3.5" fill="#000" />
            </svg>
          </div>
          <span>Promptify OS</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[12.5px] font-medium text-white/40">
          <a href="#about" className="hover:text-white transition-colors duration-300">Overview</a>
          <a href="#system" className="hover:text-white transition-colors duration-300">System Specs</a>
          <a href="#licensing" className="hover:text-white transition-colors duration-300">License</a>
        </div>
      </div>

      {/* OS Menu Right */}
      <div className="flex items-center gap-6 text-[12.5px] font-medium text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF99]" />
          <span className="text-white/60">AI Node Connected</span>
        </div>
        <span className="text-white/60 font-mono">{time || "12:00"}</span>
      </div>
    </div>
  );
}

/* ─── Center Desktop Widget Mockup ──────────────────────── */
function CenterWidget() {
  const [phase, setPhase] = useState<"ready" | "listening" | "formulating" | "injected">("ready");
  const [typedText, setTypedText] = useState("");
  const promptValue = "Design a sleek layout leveraging architecture-grade glass elements and asymmetric margins…";

  useEffect(() => {
    let alive = true;
    const loop = async () => {
      while (alive) {
        await delay(1800);
        if (!alive) break;
        setPhase("listening");

        await delay(2500);
        if (!alive) break;
        setPhase("formulating");
        setTypedText("");

        for (let i = 0; i <= promptValue.length; i++) {
          if (!alive) break;
          setTypedText(promptValue.slice(0, i));
          await delay(22);
        }

        await delay(2200);
        if (!alive) break;
        setPhase("injected");

        await delay(2500);
        if (!alive) break;
        setPhase("ready");
        setTypedText("");
      }
    };
    loop();
    return () => { alive = false; };
  }, []);

  const themeMeta = {
    ready: { label: "Idle", accent: "rgba(255,255,255,0.25)" },
    listening: { label: "Listening", accent: "#00FF99" },
    formulating: { label: "Optimizing Prompt", accent: "#a78bfa" },
    injected: { label: "Copied to Clipboard", accent: "#00FF99" }
  }[phase];

  return (
    <div className="w-full max-w-xl mx-auto relative">
      {/* Translucent depth shadow below the widget */}
      <div className="absolute -bottom-8 inset-x-12 h-6 bg-black/50 blur-2xl rounded-full pointer-events-none" />

      <div className="obsidian-glass" style={{ border: "1px solid rgba(255,255,255,0.065)" }}>
        {/* macOS Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
          <TrafficLights />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Promptify Dictator
          </span>
          <div className="w-8" />
        </div>

        {/* Content Section */}
        <div className="p-4 flex items-center gap-4">
          {/* Status Indicator Panel */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.07] transition-all duration-500"
            style={{
              borderColor: phase === "listening" || phase === "injected" ? "rgba(0, 255, 153, 0.25)" : "rgba(255, 255, 255, 0.07)",
              boxShadow: phase === "listening" ? "0 0 20px rgba(0, 255, 153, 0.15)" : "none"
            }}
          >
            {phase === "ready" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            )}
            {phase === "listening" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF99] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF99]"></span>
              </span>
            )}
            {phase === "formulating" && (
              <svg className="spin-quiet" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity={0.15} />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            )}
            {phase === "injected" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Prompt details */}
          <div className="flex-1 min-w-0">
            <p 
              className="text-[9px] font-bold tracking-widest uppercase mb-1 transition-colors duration-300"
              style={{ color: themeMeta.accent }}
            >
              {themeMeta.label}
            </p>
            <p className="text-[13.5px] text-white/80 font-medium truncate select-none leading-none">
              {typedText || (phase === "ready" ? "Press Ctrl+Shift+V and speak…" : phase === "listening" ? "Say your requirements…" : "")}
              {phase === "formulating" && <span className="inline-block w-1 h-3 ml-0.5 align-middle bg-[#a78bfa] animate-pulse" />}
            </p>
          </div>

          {/* Microbuttons */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </div>
            <div className="w-7 h-7 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                <path d="M1 1 L9 9 M9 1 L1 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating Sidebar Widget ───────────────────────────── */
function FloatingSidebar() {
  return (
    <div className="obsidian-glass w-[230px] p-5 flex flex-col gap-5 select-none" style={{ background: "rgba(10, 11, 13, 0.55)" }}>
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.04]">
        <div className="w-5 h-5 rounded-md bg-[#00FF99] flex items-center justify-center shadow-[0_0_10px_rgba(0,255,153,0.3)]">
          <svg width="8" height="8" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3" fill="#000" />
          </svg>
        </div>
        <span className="text-[12px] font-bold text-white/80">Promptify Library</span>
      </div>

      {/* Navigation list */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#00FF99] text-[13px] font-semibold">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span>History</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/40 text-[13px] font-medium hover:text-white/60 transition-colors duration-200">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
          <span>Preferences</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="mt-auto pt-3 border-t border-white/[0.04] text-[11px] text-white/30 leading-normal">
        Active Node Status: Ready
      </div>
    </div>
  );
}

/* ─── Floating History Preview Panel ─────────────────────── */
function HistoryPanel() {
  return (
    <div className="obsidian-glass p-6 w-[340px] flex flex-col gap-4 select-none" style={{ background: "rgba(10, 11, 13, 0.55)" }}>
      <div className="flex justify-between items-baseline mb-1">
        <h4 className="text-[13.5px] font-semibold text-white/80 uppercase tracking-wider">History Logs</h4>
        <span className="text-[11px] text-white/30">2 items</span>
      </div>

      {[
        { org: "Cold outreach setup", opt: "Act as an elite venture consultant. Structure a compelling B2B sequence..." },
        { org: "Explain transformers", opt: "Act as a Lead NLP Researcher. Break down self-attention computations..." }
      ].map((item, idx) => (
        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-left">
          <p className="text-[12px] font-semibold text-white/70 truncate mb-1">"{item.org}"</p>
          <p className="text-[11.5px] text-white/30 truncate">{item.opt}</p>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040506] pb-32">
      {/* Cinematic Backdrop & Ambient Lighting */}
      <div className="cinematic-backdrop">
        <div className="ambient-hardware-glow drift-quiet" />
      </div>

      <TopMenuBar />

      {/* ── Center Stage Desktop Environment (Hero) ── */}
      <section className="relative pt-36 pb-32 px-8 flex flex-col items-center justify-center">
        {/* Soft centered layout header */}
        <div className="text-center max-w-xl mb-14">
          <h2 className="text-[16px] font-medium text-white/50 tracking-tight leading-none mb-6">
            The Desktop AI Dictation Widget
          </h2>
          <h1 className="text-3xl md:text-[44px] font-bold text-white tracking-tight leading-[1.08] mb-5 select-none">
            Speak your ideas. Get formatted prompts.
          </h1>
          <p className="text-[14px] text-white/30 leading-relaxed max-w-md mx-auto">
            A native interface focused on extreme restraint and material realism.
          </p>
        </div>

        {/* Central Asymmetric Desktop Composition */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 justify-center items-stretch mt-8 mb-20 px-4">
          {/* Left Asymmetric floating macOS panel */}
          <div className="hidden lg:flex flex-col justify-between items-start">
            <FloatingSidebar />
          </div>

          {/* Center Stage Widget */}
          <div className="flex-1 flex flex-col justify-center">
            <CenterWidget />
            
            {/* Elegant whitespace & micro CTA block */}
            <div className="text-center mt-12 flex gap-4 justify-center">
              <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="btn-fingerprint text-[14px] px-8 py-3.5">
                Download for Windows
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost text-[14px] px-6 py-3.5">
                Source Code
              </a>
            </div>
          </div>

          {/* Right Asymmetric floating widget */}
          <div className="hidden lg:flex flex-col justify-between items-end">
            <HistoryPanel />
          </div>
        </div>
      </section>

      {/* ── Dynamic Layout Grid: Spaced & Asymmetric ── */}
      <section id="features" className="max-w-6xl mx-auto px-8 mb-40">
        <div className="text-left max-w-lg mb-20">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#00FF99] mb-4">// craftsmanship</p>
          <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug">
            Engineered for calm, precision, and absolute utility.
          </h3>
        </div>

        {/* Asymmetric composition layout */}
        <div className="grid md:grid-cols-5 gap-6 items-stretch">
          {/* Card 1 - Double Wide */}
          <div className="md:col-span-3 promptify-glass p-8 flex flex-col justify-between min-h-[220px]">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Floating Dictation Layout</h4>
              <p className="text-[13px] text-white/40 leading-relaxed font-normal">
                Promptify hovers on top of your windows. Toggle it instantly, dictate your thought, and the widget automatically vanishes after injection.
              </p>
            </div>
          </div>

          {/* Card 2 - Simple */}
          <div className="md:col-span-2 promptify-glass p-8 flex flex-col justify-between min-h-[220px]">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Active Window Insertion</h4>
              <p className="text-[13px] text-white/40 leading-relaxed font-normal">
                Structured prompts are injected directly into whichever code editor, browser input, or terminal is currently in focus.
              </p>
            </div>
          </div>

          {/* Card 3 - Simple */}
          <div className="md:col-span-2 promptify-glass p-8 flex flex-col justify-between min-h-[220px]">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Intelligence Waveform</h4>
              <p className="text-[13px] text-white/40 leading-relaxed font-normal">
                Automatic stop-triggers listen for pauses in your dictation, ending transcription without requiring clicks.
              </p>
            </div>
          </div>

          {/* Card 4 - Double Wide */}
          <div className="md:col-span-3 promptify-glass p-8 flex flex-col justify-between min-h-[220px]">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-white mb-2 tracking-tight">Structured SQLite Database</h4>
              <p className="text-[13px] text-white/40 leading-relaxed font-normal">
                Everything is cached securely on your local storage. Search past transcripts, view formulations, and save templates directly within the panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Elegant Workflow Section ── */}
      <section id="how-it-works" className="max-w-3xl mx-auto px-8 mb-40">
        <div className="text-center mb-20">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#00FF99] mb-4">// sequence</p>
          <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-snug">
            Dictation workflow in seconds
          </h3>
        </div>

        <div className="flex flex-col gap-5">
          {[
            { n: 1, title: "Summon Widget", desc: "Press Ctrl+Shift+V anywhere. A quiet glass window floats overlaying your current desktop." },
            { n: 2, title: "Dictate", desc: "Explain your requirements naturally. Promptify streams dictation directly into memory." },
            { n: 3, title: "Formulate", desc: "LLM parses raw transcripts to expand goals, formatting, and structural constraints." },
            { n: 4, title: "Inject", desc: "Promptify copies the result to clipboard and triggers system-paste in place." }
          ].map((step) => (
            <div key={step.n} className="promptify-glass p-6.5 flex gap-6 items-start bg-white/[0.015] border-white/[0.05]">
              <div className="w-8 h-8 rounded-full bg-[#00FF99]/[0.05] border border-[#00FF99]/[0.2] text-[#00FF99] text-[13px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,255,153,0.15)]">
                {step.n}
              </div>
              <div>
                <h4 className="text-[14.5px] font-semibold text-white mb-1 tracking-tight">{step.title}</h4>
                <p className="text-[13px] text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── System Status & Specs ── */}
      <section id="system" className="max-w-5xl mx-auto px-8 mb-40">
        <div className="promptify-glass p-12 text-center bg-white/[0.005] border-white/[0.04]">
          <h3 className="text-[14px] font-bold text-white/50 uppercase tracking-widest mb-10">Application Specifications</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              ["Architecture", "x64 Native / Windows 10 & 11"],
              ["Dependencies", "Groq Inference Engine"],
              ["Transcription", "Whisper Large-v3-turbo"],
              ["Expansion Model", "Llama 3.3 70B Versatile"]
            ].map(([spec, detail]) => (
              <div key={spec} className="border-l border-white/[0.06] pl-4">
                <p className="text-[11px] font-bold text-[#00FF99] tracking-wider uppercase mb-1.5">{spec}</p>
                <p className="text-[13.5px] text-white/60 font-medium leading-normal">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Minimal Footer ── */}
      <footer className="border-t border-white/[0.04] pt-16 pb-12 px-8 bg-black/[0.15]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#00FF99] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" fill="#000" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-white/50">Promptify Workspace</span>
            <span className="text-[11.5px] text-white/20">· MIT License</span>
          </div>

          <div className="flex gap-8">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-white/30 hover:text-white transition-colors duration-300">
              Source Code
            </a>
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-white/30 hover:text-white transition-colors duration-300">
              System Installer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
