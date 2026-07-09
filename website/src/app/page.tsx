"use client";
import { useEffect, useState } from "react";

const RELEASE_URL = "https://github.com/portgasdyamato/Promptify/releases/latest";
const GITHUB_URL = "https://github.com/portgasdyamato/Promptify";

/* ─── Micro Helper for delay ────────────────────────────── */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/* ─── Traffic Light window controls ─────────────────────── */
function TrafficLights() {
  return (
    <div className="flex gap-1.5 items-center">
      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] opacity-80" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] opacity-80" />
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────── */
function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out"
      style={{
        background: hasScrolled ? "rgba(10, 12, 14, 0.45)" : "transparent",
        backdropFilter: hasScrolled ? "blur(30px) saturate(180%)" : "none",
        WebkitBackdropFilter: hasScrolled ? "blur(30px) saturate(180%)" : "none",
        borderBottom: hasScrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#00FF99] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,153,0.35)]">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3.5" fill="#000" />
              <path d="M10 2.5V5M10 15V17.5M2.5 10H5M15 10H17.5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white select-none">
            Promptify
          </span>
        </div>

        {/* Quiet Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            ["Features", "#features"],
            ["How it works", "#how-it-works"],
            ["Integrations", "#integrations"]
          ].map(([label, target]) => (
            <a
              key={label}
              href={target}
              className="text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-300"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Action button */}
        <a
          href={RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-emerald text-[13px] px-5 py-2.5 font-semibold"
        >
          Download Widget
        </a>
      </div>
    </header>
  );
}

/* ─── Interactive macOS Widget Preview ───────────────────── */
function WidgetMockup() {
  const [phase, setPhase] = useState<"idle" | "listening" | "converting" | "finished">("idle");
  const [promptContent, setPromptContent] = useState("");
  const targetPrompt = "Create a robust design system in TailwindCSS with deep graphite primary palettes and optical glass variables…";

  useEffect(() => {
    let active = true;
    const cycle = async () => {
      while (active) {
        await delay(1500);
        if (!active) break;
        setPhase("listening");
        
        await delay(2200);
        if (!active) break;
        setPhase("converting");
        setPromptContent("");
        
        for (let i = 0; i <= targetPrompt.length; i++) {
          if (!active) break;
          setPromptContent(targetPrompt.slice(0, i));
          await delay(20);
        }
        
        await delay(2500);
        if (!active) break;
        setPhase("finished");
        
        await delay(3000);
        if (!active) break;
        setPhase("idle");
        setPromptContent("");
      }
    };
    cycle();
    return () => { active = false; };
  }, []);

  const phaseDetails = {
    idle: { label: "Ready", color: "rgba(255,255,255,0.3)" },
    listening: { label: "Listening", color: "#00FF99" },
    converting: { label: "Formulating", color: "#a78bfa" },
    finished: { label: "Injected", color: "#00FF99" }
  }[phase];

  return (
    <div className="w-full max-w-lg mx-auto relative group">
      {/* Light refraction backlight glow */}
      <div 
        className="absolute -inset-1.5 rounded-[22px] opacity-20 blur-xl transition-all duration-1000"
        style={{
          background: phase === "listening" ? "radial-gradient(circle, rgba(0,255,153,0.3) 0%, transparent 80%)" : "transparent"
        }}
      />

      <div className="promptify-glass relative overflow-hidden transition-all duration-500">
        {/* Subtle top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* macOS Style Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.015]">
          <TrafficLights />
          <span className="text-[11.5px] font-medium text-white/30 tracking-wider uppercase select-none">
            Promptify Desktop Widget
          </span>
          <div className="w-9" />
        </div>

        {/* Main Interface Content */}
        <div className="p-4 flex items-center gap-3.5">
          {/* Status visual node */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] transition-all duration-300"
            style={{
              borderColor: phase === "listening" ? "rgba(0, 255, 153, 0.25)" : "rgba(255, 255, 255, 0.06)",
              boxShadow: phase === "listening" ? "0 0 20px rgba(0, 255, 153, 0.15)" : "none"
            }}
          >
            {phase === "idle" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            )}
            {phase === "listening" && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF99] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF99]"></span>
              </span>
            )}
            {phase === "converting" && (
              <svg className="anim-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity={0.15} />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            )}
            {phase === "finished" && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          {/* Action text */}
          <div className="flex-1 min-w-0">
            <p 
              className="text-[9.5px] font-bold tracking-widest uppercase mb-1 transition-colors duration-300"
              style={{ color: phaseDetails.color }}
            >
              {phaseDetails.label}
            </p>
            <p className="text-[13px] text-white/80 font-medium truncate select-none">
              {promptContent || (phase === "idle" ? "Hold hotkey and speak your thoughts…" : phase === "listening" ? "Dictating ideas…" : "")}
              {phase === "converting" && <span className="inline-block w-1.5 h-3 ml-0.5 align-middle bg-[#a78bfa] animate-pulse" />}
            </p>
          </div>

          {/* Micro interaction buttons */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.02] border border-white/[0.05]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </div>
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-white/[0.02] border border-white/[0.05]">
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1 L9 9 M9 1 L1 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Elegant Feature Grid Card ────────────────────────── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="promptify-glass promptify-glass-interactive p-7 flex flex-col justify-between h-full">
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-2.5 tracking-tight">{title}</h3>
        <p className="text-[13px] text-white/50 leading-relaxed font-normal">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Elegant Step Card ────────────────────────────────── */
function WorkflowStep({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="promptify-glass p-7 flex gap-5 items-start">
      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] text-white text-[12.5px] font-semibold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="text-[14.5px] font-semibold text-white mb-1.5 tracking-tight">{title}</h4>
        <p className="text-[13px] text-white/40 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── main application ──────────────────────────────────── */
export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060708]">
      {/* Backlight Canvas */}
      <div className="backlight-canvas">
        <div className="backlight-spotlight" />
        <div className="graphite-grid" />
      </div>

      <Header />

      {/* ── Hero Section ── */}
      <section className="relative pt-44 pb-32 px-8 flex flex-col items-center justify-center text-center">
        {/* Status Indicator */}
        <div className="promptify-glass px-4.5 py-1.5 rounded-full inline-flex items-center gap-2.5 mb-10 border-white/[0.08] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF99] shadow-[0_0_8px_#00FF99]" />
          <span className="text-[11.5px] font-medium text-white/60 tracking-wider uppercase">
            Promptify Desktop Version 1.0
          </span>
        </div>

        {/* Large Clean Typography */}
        <h1 className="text-5xl md:text-7xl lg:text-[84px] font-extrabold text-white leading-[0.96] tracking-[-0.045em] max-w-4xl mb-8">
          Voice to prompt.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF99] to-[#02C373]">
            Without friction.
          </span>
        </h1>

        <p className="text-[16.5px] md:text-[18px] text-white/50 max-w-xl mx-auto leading-relaxed mb-12 font-normal">
          A native float widget engineered to interpret your ideas, structure them into detailed AI prompts, and write them directly into active text area.
        </p>

        {/* Clean minimal CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-28">
          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-emerald px-8 py-4 text-[14.5px] font-bold inline-flex items-center gap-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Installer
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-8 py-4 text-[14px] inline-flex items-center gap-2.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>

        {/* Animated Window Mockup */}
        <WidgetMockup />
      </section>

      {/* ── Stats Layout ── */}
      <section className="max-w-5xl mx-auto px-8 mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["< 2s", "Prompt Generation"],
            ["99%", "Voice Accuracy"],
            ["Any", "Active Window Input"],
            ["Zero", "Flow Disruption"]
          ].map(([val, label]) => (
            <div key={label} className="promptify-glass p-6 text-center select-none">
              <p className="text-3xl font-extrabold text-white tracking-tight mb-1">{val}</p>
              <p className="text-[11.5px] font-semibold text-white/30 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="max-w-5xl mx-auto px-8 mb-32">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#00FF99] mb-3">Capabilities</p>
          <h2 className="text-3xl md:text-[40px] font-bold text-white tracking-tight leading-tight max-w-md mx-auto">
            Design crafted for focus
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
            title="Always-On Widget"
            desc="Sits elegantly on top of all windows. Close the main application pane, and the widget continues running silently in the background."
          />
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 8l2 2-2 2M13 10h3" /></svg>}
            title="Global Keyboard Shortcut"
            desc="Press Ctrl+Shift+V anywhere. The widget activates immediately without stealing focus from your currently active workspace."
          />
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
            title="Active Text Injection"
            desc="Pastes generated expert prompts directly into the cursor location in whichever browser or editor is currently active."
          />
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
            title="Smart Silence Detection"
            desc="Starts analyzing as soon as you stop speaking. Pausing for three seconds automatically signals the AI to generate the output."
          />
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
            title="Local Cache Database"
            desc="Maintains a record of all dictation history in a secure, local SQLite instance. Reuse your templates whenever you need."
          />
          <FeatureCard
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            title="System Tray Integration"
            desc="Closes gracefully to your system notification tray. Promptify stays ready and instantly accessible."
          />
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="how-it-works" className="max-w-3xl mx-auto px-8 mb-32">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#00FF99] mb-3">Workflow</p>
          <h2 className="text-3xl md:text-[40px] font-bold text-white tracking-tight leading-tight max-w-md mx-auto">
            Engineered for speeds
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <WorkflowStep number={1} title="Activate Widget" desc="Press Ctrl+Shift+V. The subtle frosted layout floats on-screen instantly without taking active window focus." />
          <WorkflowStep number={2} title="Dictate Thoughts" desc="Explain your goal. Real-time Whisper engine transcribes your concept dynamically." />
          <WorkflowStep number={3} title="AI Refinement" desc="Llama 3.3 refines raw transcripts into structural, contextual, and clear prompts." />
          <WorkflowStep number={4} title="Injected Input" desc="The structured prompt is pasted directly into your active text editor or web form." />
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section id="download" className="max-w-4xl mx-auto px-8 mb-32">
        <div className="promptify-glass p-16 text-center bg-white/[0.01] border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#00FF99]/[0.02] filter blur-[60px]" />
          
          <div className="w-12 h-12 rounded-2xl bg-[#00FF99] flex items-center justify-center mx-auto mb-8 shadow-[0_0_32px_rgba(0,255,153,0.3)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-[42px] font-bold text-white tracking-tight mb-4">
            Get Promptify
          </h2>
          <p className="text-[15px] text-white/40 max-w-sm mx-auto leading-relaxed mb-10">
            Open-source and privacy-focused. Download the latest installer package for Windows.
          </p>

          <a
            href={RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-emerald px-10 py-4.5 text-[15px] font-bold inline-flex items-center gap-2.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for Windows
          </a>

          <p className="text-[11.5px] text-white/20 mt-6 tracking-wide">
            Windows 10 / 11 · x64 · Requires API Configuration
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-12 px-8 bg-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#00FF99] flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" fill="#000" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold text-white/50">Promptify</span>
            <span className="text-[12px] text-white/25">· MIT License</span>
          </div>

          <div className="flex gap-8">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-white/30 hover:text-white transition-colors duration-300">
              GitHub Repository
            </a>
            <a href={RELEASE_URL} target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-white/30 hover:text-white transition-colors duration-300">
              Latest Release
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
