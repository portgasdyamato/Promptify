"use client";
import { useEffect, useState } from "react";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


const RELEASE_URL = "https://github.com/portgasdyamato/Promptify/releases/latest";
const GITHUB_URL = "https://github.com/portgasdyamato/Promptify";

/* ─── Volumetric Light Beam & Ambient Canvas ──────────────── */
function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark graphite base */}
      <div className="absolute inset-0 bg-[#050608]" />

      {/* Volumetric spotlight cone coming from top-right */}
      <div 
        className="absolute top-0 right-[-10%] w-[80vw] h-[100vh] opacity-[0.25]"
        style={{
          background: "conic-gradient(from 210deg at 80% 0%, rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.01) 40deg, transparent 120deg)",
          filter: "blur(60px)",
        }}
      />

      {/* Subtlest background radial ambient light */}
      <div 
        className="absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.4]"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 153, 0.015) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />
    </div>
  );
}

/* ─── Brand Compass/Star Logo Icon ───────────────────────── */
function LogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#00FF99]">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" fill="currentColor" opacity="0.15" />
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}

/* ─── Navbar ────────────────────────────────────────────── */
function Navbar() {
  return (
    <header className="absolute top-0 inset-x-0 z-50 select-none">
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <LogoIcon />
          <span className="font-bold text-[17px] tracking-tight text-white">Promptify</span>
        </div>

        {/* Quiet Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Integrations", "Pricing", "Docs"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] font-medium text-white/50 hover:text-white transition-colors duration-300"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <a
          href={RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 text-[13px] font-medium text-white bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
        >
          <span>Download Widget</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </header>
  );
}

/* ─── Premium Live Floating Desktop Widget ────────────────── */
function DesktopWidgetMockup() {
  const [phase, setPhase] = useState<"idle" | "listening" | "formulating" | "ready">("idle");
  
  useEffect(() => {
    let active = true;
    const cycle = async () => {
      while (active) {
        await delay(2000);
        if (!active) break;
        setPhase("listening");
        
        await delay(3500);
        if (!active) break;
        setPhase("formulating");
        
        await delay(3000);
        if (!active) break;
        setPhase("ready");
        
        await delay(2500);
        if (!active) break;
        setPhase("idle");
      }
    };
    cycle();
    return () => { active = false; };
  }, []);

  const stateDetails = {
    idle: { label: "Idle Mode", helper: "Press hotkey to trigger", active: false },
    listening: { label: "Listening...", helper: "Hold hotkey and speak your thoughts", active: true },
    formulating: { label: "Formulating...", helper: "Converting speech to prompt", active: false },
    ready: { label: "Ready to Inject", helper: "Release hotkey to paste", active: false }
  }[phase];

  return (
    <div className="w-full max-w-[480px] mx-auto relative select-none">
      {/* Environment Ambient Shadow underneath */}
      <div className="absolute -bottom-10 inset-x-8 h-8 bg-black/60 blur-3xl rounded-full pointer-events-none" />

      {/* Main Glass Widget Window */}
      <div 
        className="obsidian-glass transition-all duration-500"
        style={{
          border: phase === "listening" ? "1px solid rgba(0, 255, 153, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: phase === "listening" 
            ? "inset 0 1px 0 0 rgba(255,255,255,0.12), 0 35px 80px rgba(0,0,0,0.85), 0 0 50px rgba(0,255,153,0.06)" 
            : "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 35px 80px rgba(0,0,0,0.85)"
        }}
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.015]">
          <div className="flex items-center gap-1.5">
            <LogoIcon />
            <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase ml-1">Promptify</span>
          </div>
          
          {/* Action dots / min-max */}
          <div className="flex items-center gap-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2">
              <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2">
              <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" />
            </svg>
            {/* Windows Window Controls */}
            <div className="flex gap-2 items-center ml-2 border-l border-white/10 pl-3">
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <div className="w-2 h-2 bg-white/20 rounded-full" />
              <div className="w-2.5 h-2.5 bg-white/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="py-14 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {/* Ambient Waveform Vectors */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-24 flex items-center justify-center pointer-events-none opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 400 100" fill="none" className="text-white/40">
              <path d="M0,50 Q40,30 80,65 T160,40 T240,70 T320,35 T400,50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <path d="M0,50 Q50,70 100,35 T200,60 T300,30 T400,50" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Central Microphone Ring */}
          <div className="relative mb-6 z-10">
            {/* Outer rings */}
            <div 
              className="absolute -inset-4 rounded-full border border-white/[0.04] transition-all duration-700 scale-110"
              style={{ borderColor: stateDetails.active ? "rgba(0, 255, 153, 0.15)" : "rgba(255,255,255,0.04)" }}
            />
            <div 
              className="absolute -inset-2.5 rounded-full border border-white/[0.06] transition-all duration-500 scale-105"
              style={{ borderColor: stateDetails.active ? "rgba(0, 255, 153, 0.25)" : "rgba(255,255,255,0.06)" }}
            />
            {/* Core Circle */}
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/10 transition-all duration-300"
              style={{
                borderColor: stateDetails.active ? "#00FF99" : "rgba(255,255,255,0.1)",
                boxShadow: stateDetails.active ? "0 0 30px rgba(0, 255, 153, 0.3)" : "none"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stateDetails.active ? "#00FF99" : "white"} strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </div>
          </div>

          {/* Status Label */}
          <div className="z-10 mb-6">
            <h3 className="text-[17px] font-semibold text-white/90 tracking-tight mb-1">{stateDetails.label}</h3>
            <p className="text-[12.5px] text-white/40">{stateDetails.helper}</p>
          </div>

          {/* Badge indicator */}
          <div className="promptify-glass px-3.5 py-1 rounded-full border-white/[0.08] inline-flex items-center gap-2 bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF99] shadow-[0_0_8px_#00FF99]" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/50">Ready</span>
          </div>
        </div>

        {/* Lower dock inside widget */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-white/[0.04] bg-white/[0.015]">
          <div className="flex items-center gap-4 text-white/30">
            {/* Keyboard */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hover:text-white transition-colors cursor-pointer">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M10 12h8" />
            </svg>
            {/* Star */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hover:text-white transition-colors cursor-pointer">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {/* Clock */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="hover:text-white transition-colors cursor-pointer">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          {/* Action key icon */}
          <div className="w-10 h-8 rounded-lg bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-white/30">
            <span className="text-[15px] font-light leading-none">↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Metric Col Item ────────────────────────────────────── */
function MetricCol({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 md:px-8">
      <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-[#00FF99]">
        {icon}
      </div>
      <div>
        <p className="text-[17px] font-bold text-white tracking-tight leading-none mb-1.5">{value}</p>
        <p className="text-[11.5px] font-semibold text-white/30 uppercase tracking-widest leading-none">{label}</p>
      </div>
    </div>
  );
}

/* ─── Grid Feature Card ──────────────────────────────────── */
function FeatureCard({ number, icon, title, desc }: { number: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="promptify-glass promptify-glass-interactive p-7 flex flex-col justify-between min-h-[250px] relative select-none">
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div className="w-9.5 h-9.5 rounded-xl bg-white/[0.02] border border-white/[0.07] flex items-center justify-center text-[#00FF99]">
          {icon}
        </div>
        <span className="text-[11.5px] font-bold font-mono text-white/20">{number}</span>
      </div>

      {/* Bottom copy */}
      <div>
        <h4 className="text-[14.5px] font-semibold text-white tracking-tight mb-2">{title}</h4>
        <p className="text-[13px] text-white/40 leading-relaxed font-normal">{desc}</p>
      </div>

      {/* Down-right arrow icon bottom right */}
      <div className="absolute bottom-5 right-5 w-6 h-6 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer">
        <span className="text-[11.5px] font-light leading-none">→</span>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function Page() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050608] pb-32">
      <BackgroundOrbs />

      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative pt-44 pb-20 px-8 max-w-6xl mx-auto z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left copy */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Pill badge */}
            <div className="promptify-glass px-4.5 py-1.5 rounded-full inline-flex items-center gap-2 mb-8 border-white/[0.08] bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF99] shadow-[0_0_8px_#00FF99]" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
                Desktop AI Assistant, Reimagined
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-[62px] font-extrabold text-white leading-[1.04] tracking-[-0.04em] mb-6">
              Voice to prompt.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF99] to-[#02C373] drop-shadow-[0_0_30px_rgba(0,255,153,0.2)]">
                Without friction.
              </span>
            </h1>

            {/* Description */}
            <p className="text-[14.5px] text-white/50 leading-relaxed font-normal max-w-md mb-10">
              Promptify lives on your desktop. Speak, capture, and transform your thoughts into powerful AI prompts—instantly and seamlessly.
            </p>

            {/* Action buttons */}
            <div className="flex gap-4 items-center mb-6">
              <a
                href={RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-emerald px-8 py-3.5 text-[14px] font-bold inline-flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.45H0V3.45zM0 12.45h9.75v9.45L0 20.551v-8.1zM11.25 1.899L24 .15v11.4H11.25V1.9zM11.25 12.45H24v11.4l-12.75-1.749v-9.651z"/>
                </svg>
                Download for Windows
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-6 py-3.5 text-[14px] inline-flex items-center gap-2.5"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </a>
            </div>

            <p className="text-[12px] text-white/30 font-medium pl-1">
              Free to use • No credit card required
            </p>
          </div>

          {/* Right Floating Widget Demo */}
          <div className="lg:col-span-6 z-10">
            <DesktopWidgetMockup />
          </div>

        </div>
      </section>

      {/* ── Horizontal Metrics Row ── */}
      <section className="max-w-6xl mx-auto px-8 mb-40 relative z-10">
        <div className="promptify-glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
          <MetricCol 
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
            value="&lt; 2s"
            label="Prompt Generation"
          />
          <MetricCol 
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
            value="99%"
            label="Voice Accuracy"
          />
          <MetricCol 
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M10 12h8" /></svg>}
            value="Any"
            label="Active Window Input"
          />
          <MetricCol 
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            value="Zero"
            label="Flow Disruption"
          />
        </div>
      </section>

      {/* ── Features Section: 4 Asymmetric Grid Cards ── */}
      <section id="features" className="max-w-6xl mx-auto px-8 mb-40 relative z-10">
        <div className="text-center mb-20">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#00FF99] mb-4">Built for focus</p>
          <h2 className="text-3xl md:text-[40px] font-bold text-white tracking-tight mb-4">
            Powerful by design. Invisible by default.
          </h2>
          <p className="text-[14px] text-white/40 max-w-md mx-auto leading-relaxed">
            Promptify integrates into your workflow so effortlessly, you'll forget it's even there—until you need it.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard 
            number="01"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>}
            title="Always-On Widget"
            desc="Sits elegantly on top of all windows. Close the main app, the widget stays quietly in the background."
          />
          <FeatureCard 
            number="02"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 8l2 2-2 2M13 10h3" /></svg>}
            title="Global Shortcut"
            desc="Press Ctrl + Shift + V anywhere. Instantly activate Promptify without breaking your flow."
          />
          <FeatureCard 
            number="03"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>}
            title="Active Text Injection"
            desc="Paste AI-generated prompts directly into any field—you stay in the zone."
          />
          <FeatureCard 
            number="04"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
            title="Local & Private"
            desc="Your data stays on your device. No tracking. No cloud. Just speed and security."
          />
        </div>
      </section>

      {/* ── Footer Ribbon ── */}
      <section className="max-w-6xl mx-auto px-8 relative z-10">
        <div className="promptify-glass rounded-2xl py-6 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase select-none">
            Trusted. Private. Compatible.
          </p>

          <div className="flex flex-wrap gap-8 justify-center">
            {/* Windows 10+ */}
            <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.45H0V3.45zM0 12.45h9.75v9.45L0 20.551v-8.1zM11.25 1.99L24 .15v11.4H11.25V1.9zM11.25 12.45H24v11.4l-12.75-1.749v-9.651z"/>
              </svg>
              <span>Windows 10+</span>
            </div>
            {/* Works Offline */}
            <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 20v-8M17 20v-4M7 20v-4M2 20v-2" />
              </svg>
              <span>Works Offline</span>
            </div>
            {/* Privacy First */}
            <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Privacy First</span>
            </div>
            {/* Lightweight */}
            <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8.5C18.6 17.5 16 20 11 20z" />
              </svg>
              <span>Lightweight</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mini Footer Links ── */}
      <footer className="mt-20 pt-8 border-t border-white/[0.04] text-center select-none relative z-10">
        <p className="text-[11.5px] text-white/20">© 2026 Promptify · Open Source · MIT License</p>
      </footer>
    </div>
  );
}
