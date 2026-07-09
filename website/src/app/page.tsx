"use client";
import { useEffect, useState, useRef } from "react";

/* ─── constants ──────────────────────────────────────────── */
const RELEASE = "https://github.com/portgasdyamato/Promptify/releases/latest";
const GITHUB  = "https://github.com/portgasdyamato/Promptify";

/* ─── helpers ────────────────────────────────────────────── */
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* ─── TrafficLights ──────────────────────────────────────── */
function TrafficLights() {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {(["#FF5F57","#FFBD2E","#28C840"] as const).map(c => (
        <div key={c} style={{ width:12, height:12, borderRadius:"50%", background:c, boxShadow:`0 0 8px ${c}66` }} />
      ))}
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const [blur, setBlur] = useState(false);
  useEffect(() => {
    const fn = () => setBlur(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      transition:"all 0.35s ease",
      background: blur ? "rgba(9,9,9,0.88)" : "transparent",
      backdropFilter: blur ? "blur(32px) saturate(200%)" : "none",
      WebkitBackdropFilter: blur ? "blur(32px) saturate(200%)" : "none",
      borderBottom: blur ? "1px solid rgba(255,255,255,0.06)" : "none",
    }}>
      <nav style={{ maxWidth:1160, margin:"0 auto", padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:"#00FF99", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 20px rgba(0,255,153,0.5), 0 0 40px rgba(0,255,153,0.15)" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3.5" fill="#000"/>
              <path d="M10 2.5V5M10 15V17.5M2.5 10H5M15 10H17.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:"#fff", letterSpacing:"-0.03em" }}>Promptify</span>
        </div>

        {/* Links */}
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          {([["Features","#features"],["How it works","#how-it-works"],["Download","#download"]] as const).map(([label,href])=>(
            <a key={label} href={href} style={{ fontSize:13.5, fontWeight:500, color:"rgba(255,255,255,0.44)", textDecoration:"none", letterSpacing:"-0.01em", transition:"color 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color="#fff"}}
              onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.44)"}}>
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href={RELEASE} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding:"9px 22px", fontSize:13.5 }}>
          Download
        </a>
      </nav>
    </header>
  );
}

/* ─── WidgetPreview ──────────────────────────────────────── */
function WidgetPreview() {
  const [phase, setPhase] = useState<"idle"|"listening"|"typing"|"done">("idle");
  const [typed, setTyped]  = useState("");
  const full = "Write a concise follow-up email to the product team covering Q3 launch milestones, current blockers, and clear action items for next week…";

  useEffect(() => {
    let alive = true;
    (async () => {
      while (alive) {
        await sleep(1400);                if (!alive) break;
        setPhase("listening");
        await sleep(2200);                if (!alive) break;
        setPhase("typing"); setTyped("");
        for (let i = 0; i <= full.length; i++) {
          if (!alive) break;
          setTyped(full.slice(0, i));
          await sleep(18);
        }
        await sleep(2200);                if (!alive) break;
        setPhase("done");
        await sleep(2600);                if (!alive) break;
        setPhase("idle"); setTyped("");
        await sleep(1200);
      }
    })();
    return () => { alive = false; };
  }, []);

  const isActive    = phase === "listening";
  const isTyping    = phase === "typing";
  const isDone      = phase === "done";

  const borderColor = isActive ? "rgba(0,255,153,0.35)"
                    : isTyping ? "rgba(255,255,255,0.14)"
                    : isDone   ? "rgba(0,255,153,0.3)"
                    : "rgba(255,255,255,0.08)";
  const glowStyle   = isActive ? "0 0 0 1px rgba(0,255,153,0.12), 0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(0,255,153,0.08)"
                    : isDone   ? "0 0 0 1px rgba(0,255,153,0.1),  0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,255,153,0.06)"
                    : "0 40px 80px rgba(0,0,0,0.7)";

  return (
    <div style={{ width:"100%", maxWidth:560, filter:"drop-shadow(0 60px 100px rgba(0,0,0,0.7))" }}>
      {/* macOS window */}
      <div style={{ borderRadius:20, overflow:"hidden", background:"rgba(255,255,255,0.055)", backdropFilter:"blur(48px) saturate(200%)", WebkitBackdropFilter:"blur(48px) saturate(200%)", border:`1px solid ${borderColor}`, boxShadow:glowStyle, transition:"border-color 0.4s ease, box-shadow 0.4s ease" }}>
        
        {/* Title bar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)" }}>
          <TrafficLights />
          <div style={{ flex:1, textAlign:"center" }}>
            <span style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.35)", letterSpacing:"0.01em" }}>Promptify</span>
          </div>
          <div style={{ width:42 }} />
        </div>

        {/* Widget body */}
        <div style={{ padding:"14px 14px", display:"flex", alignItems:"center", gap:10 }}>
          {/* State icon */}
          <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: isActive ? "rgba(0,255,153,0.1)" : "rgba(255,255,255,0.05)", border:`1px solid ${isActive ? "rgba(0,255,153,0.3)" : "rgba(255,255,255,0.08)"}`, transition:"all 0.35s", boxShadow: isActive ? "0 0 24px rgba(0,255,153,0.25)" : "none" }}>
            {phase==="idle"      && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>}
            {phase==="listening" && <div className="anim-blink" style={{ width:8, height:8, borderRadius:"50%", background:"#00FF99", boxShadow:"0 0 16px #00FF99" }} />}
            {phase==="typing"    && <svg className="anim-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" strokeOpacity={0.1}/><path d="M12 2a10 10 0 0 1 10 10"/></svg>}
            {phase==="done"      && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>

          {/* Text area */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", color: isActive ? "#00FF99" : isDone ? "#00FF99" : isTyping ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.28)", marginBottom:3, lineHeight:1 }}>
              {phase==="idle" ? "Ready" : phase==="listening" ? "Listening…" : phase==="typing" ? "Generating prompt" : "Injected ✓"}
            </p>
            <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.65)", lineHeight:1.4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {typed || (phase==="idle" ? "Press Ctrl+Shift+V to activate…" : phase==="listening" ? "Say your request…" : "")}
              {isTyping && <span style={{ display:"inline-block", width:1.5, height:12, marginLeft:1, verticalAlign:"middle", background:"#fff", animation:"blink 0.7s step-end infinite" }}/>}
            </p>
          </div>

          {/* Mic */}
          <button style={{ width:38, height:38, borderRadius:11, flexShrink:0, border:"none", cursor:"default", display:"flex", alignItems:"center", justifyContent:"center", background: isActive ? "rgba(0,255,153,0.1)" : "rgba(255,255,255,0.05)", boxShadow: isActive ? "0 0 24px rgba(0,255,153,0.25)" : "none", transition:"all 0.3s" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#00FF99" : "rgba(255,255,255,0.28)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
          </button>

          {/* Close */}
          <button style={{ width:30, height:30, borderRadius:8, border:"none", cursor:"default", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.04)", flexShrink:0 }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1L8 8M8 1L1 8"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── FeatureCard ────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay=0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:"26px 22px", borderRadius:20, cursor:"default",
        background: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
        backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
        border:`1px solid ${hov ? "rgba(0,255,153,0.2)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hov ? "0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,255,153,0.04)" : "0 4px 20px rgba(0,0,0,0.4)",
        transform: hov ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        transition:"all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        animationDelay:`${delay}ms`,
      }}>
      <div style={{ width:44, height:44, borderRadius:13, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center", background: hov ? "rgba(0,255,153,0.1)" : "rgba(255,255,255,0.06)", border:`1px solid ${hov ? "rgba(0,255,153,0.2)" : "rgba(255,255,255,0.07)"}`, transition:"all 0.28s ease" }}>
        {icon}
      </div>
      <p style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>{title}</p>
      <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.44)", lineHeight:1.7 }}>{desc}</p>
    </div>
  );
}

/* ─── StepItem ───────────────────────────────────────────── */
function StepItem({ n, title, desc }: { n: number; title: string; desc: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"flex", gap:20, padding:"22px 26px", borderRadius:18, alignItems:"flex-start", background: hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.035)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:`1px solid ${hov ? "rgba(0,255,153,0.18)" : "rgba(255,255,255,0.07)"}`, transition:"all 0.25s ease", boxShadow: hov ? "0 8px 32px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,0,0,0.4)" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, background:"#00FF99", color:"#000", fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", boxShadow: hov ? "0 0 32px rgba(0,255,153,0.6)" : "0 0 20px rgba(0,255,153,0.4)", transition:"box-shadow 0.25s" }}>{n}</div>
      <div>
        <p style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:6, letterSpacing:"-0.02em" }}>{title}</p>
        <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.44)", lineHeight:1.7 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── StatCard ───────────────────────────────────────────── */
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ padding:"28px 24px", borderRadius:20, textAlign:"center", background:"rgba(255,255,255,0.04)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
      <p style={{ fontSize:42, fontWeight:800, color:"#00FF99", letterSpacing:"-0.05em", lineHeight:1, textShadow:"0 0 40px rgba(0,255,153,0.5)" }}>{value}</p>
      <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.32)", marginTop:8, fontWeight:500, letterSpacing:"0.02em" }}>{label}</p>
    </div>
  );
}

/* ─── Icon helpers ───────────────────────────────────────── */
const Ic = ({ d, size=18, viewBox="0 0 24 24" }: { d: string; size?: number; viewBox?: string }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/* ─── Page ───────────────────────────────────────────────── */
export default function Page() {
  return (
    <div style={{ minHeight:"100vh", background:"#050505", fontFamily:"'Inter', system-ui, sans-serif" }}>
      <Navbar />

      {/* ── Ambient background ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        {/* Radial blobs */}
        <div className="anim-ambient" style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)", width:900, height:900, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,255,153,0.055) 0%, transparent 65%)" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,255,153,0.03) 0%, transparent 65%)" }} />
        {/* Grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize:"70px 70px" }} />
        {/* Vignette */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 50% at 50% 0%, transparent 60%, #050505 100%)" }} />
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══════════ HERO ══════════ */}
        <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 32px 100px", textAlign:"center" }}>

          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 16px", borderRadius:100, marginBottom:40, background:"rgba(255,255,255,0.045)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.09)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
            <div className="anim-blink" style={{ width:6, height:6, borderRadius:"50%", background:"#00FF99", boxShadow:"0 0 10px #00FF99" }} />
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", letterSpacing:"0.06em" }}>AVAILABLE FOR WINDOWS 10 · 11</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:"clamp(52px,9vw,108px)", fontWeight:800, letterSpacing:"-0.055em", lineHeight:0.94, color:"#fff", maxWidth:900, marginBottom:20 }}>
            Voice to prompt.
          </h1>
          <h1 style={{ fontSize:"clamp(52px,9vw,108px)", fontWeight:800, letterSpacing:"-0.055em", lineHeight:0.94, marginBottom:36, background:"linear-gradient(135deg, #00FF99 0%, #00E676 50%, #00FFB3 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 40px rgba(0,255,153,0.4))" }}>
            Instantly.
          </h1>

          {/* Subtext */}
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.44)", maxWidth:520, lineHeight:1.75, marginBottom:52, fontWeight:400 }}>
            A floating desktop widget that listens to your voice and injects
            expert-level AI prompts into any window — without breaking your flow.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:90 }}>
            <a href={RELEASE} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding:"15px 34px", fontSize:15 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download for Windows
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding:"15px 28px", fontSize:15 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </div>

          {/* Widget floating demo */}
          <div className="anim-float" style={{ width:"100%", maxWidth:580 }}>
            <WidgetPreview />
          </div>
        </section>

        {/* ══════════ POWERED BY ══════════ */}
        <div style={{ textAlign:"center", padding:"0 32px 80px" }}>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", marginBottom:16 }}>Powered by</p>
          <div style={{ display:"flex", gap:32, justifyContent:"center", alignItems:"center", flexWrap:"wrap" }}>
            {["OpenAI Whisper","Llama 3.3 70B","Groq Inference","Electron"].map(t => (
              <span key={t} style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.28)", letterSpacing:"-0.01em" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ══════════ STATS ══════════ */}
        <section style={{ padding:"0 32px 100px" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:10 }}>
            <StatCard value="< 2s" label="Voice to prompt" />
            <StatCard value="99%" label="Transcription accuracy" />
            <StatCard value="Any" label="Works in every app" />
            <StatCard value="0" label="Context switches" />
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" style={{ padding:"80px 32px 100px" }}>
          <div style={{ maxWidth:1060, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#00FF99", marginBottom:14 }}>Capabilities</p>
              <h2 style={{ fontSize:"clamp(32px,4vw,52px)", fontWeight:800, letterSpacing:"-0.04em", color:"#fff", maxWidth:480, margin:"0 auto", lineHeight:1.08 }}>
                Built for people who think fast
              </h2>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:10 }} className="stagger-children">
              {[
                { title:"Always-on widget",    desc:"Floats on your screen 24/7. Close the main window — it stays. Dismiss with × when done.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
                { title:"Global shortcut",     desc:"Ctrl+Shift+V anywhere on Windows. Widget appears without stealing focus from your current app.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 8l2 2-2 2M13 10h3"/></svg> },
                { title:"Direct injection",    desc:"Generated prompt is typed directly into whichever window had focus. Zero extra steps.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                { title:"Silence detection",   desc:"3 seconds of silence post-speech triggers auto-stop. Just speak, then pause.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { title:"Prompt history",      desc:"Every prompt stored in local SQLite. Browse, copy, and reuse your best ones from the app.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { title:"System tray",         desc:"Closes to tray and keeps running silently. One shortcut away no matter what you're doing.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              ].map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 55} />)}
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="how-it-works" style={{ padding:"80px 32px 100px" }}>
          <div style={{ maxWidth:660, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#00FF99", marginBottom:14 }}>Workflow</p>
              <h2 style={{ fontSize:"clamp(30px,4vw,48px)", fontWeight:800, letterSpacing:"-0.04em", color:"#fff", lineHeight:1.08 }}>
                From thought to prompt<br/>in 3 seconds
              </h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <StepItem n={1} title="Press Ctrl+Shift+V" desc="The floating widget appears on-screen instantly. Your current app stays in focus — nothing is disrupted." />
              <StepItem n={2} title="Speak naturally" desc="Say what you need in plain language. Whisper large-v3-turbo transcribes your voice in real-time." />
              <StepItem n={3} title="AI expands your intent" desc="Llama 3.3 70B rewrites your rough thought into a comprehensive, expert-level prompt with full context." />
              <StepItem n={4} title="Prompt appears in your app" desc="Pasted directly into the active text field. Cursor stays in place. You're back to work immediately." />
            </div>
          </div>
        </section>

        {/* ══════════ DOWNLOAD CTA ══════════ */}
        <section id="download" style={{ padding:"80px 32px 120px" }}>
          <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center", padding:"72px 48px", borderRadius:28, background:"rgba(0,255,153,0.03)", backdropFilter:"blur(48px)", WebkitBackdropFilter:"blur(48px)", border:"1px solid rgba(0,255,153,0.18)", boxShadow:"0 0 0 1px rgba(0,255,153,0.06), 0 40px 80px rgba(0,0,0,0.7), 0 0 120px rgba(0,255,153,0.06)", position:"relative", overflow:"hidden" }}>
            {/* glow orb inside */}
            <div style={{ position:"absolute", top:"-40%", left:"50%", transform:"translateX(-50%)", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,255,153,0.06) 0%, transparent 60%)", pointerEvents:"none" }} />

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ width:56, height:56, borderRadius:17, background:"#00FF99", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", boxShadow:"0 0 40px rgba(0,255,153,0.55), 0 0 80px rgba(0,255,153,0.2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>

              <h2 style={{ fontSize:"clamp(30px,4vw,46px)", fontWeight:800, letterSpacing:"-0.04em", color:"#fff", marginBottom:16, lineHeight:1.05 }}>
                Download Promptify
              </h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.44)", lineHeight:1.7, marginBottom:40, maxWidth:420, margin:"0 auto 40px" }}>
                Free and open-source. Install the Windows package and your AI prompt co-pilot is live in seconds.
              </p>

              <a href={RELEASE} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding:"17px 42px", fontSize:16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Promptify.exe
              </a>

              <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:20, letterSpacing:"0.02em" }}>
                Windows 10 / 11 · 64-bit · Requires Groq API key
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{ padding:"32px 32px 40px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:1160, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:26, height:26, borderRadius:8, background:"#00FF99", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 14px rgba(0,255,153,0.4)" }}>
                <svg width="11" height="11" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3.5" fill="#000"/><path d="M10 2.5V5M10 15V17.5M2.5 10H5M15 10H17.5" stroke="#000" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontWeight:700, fontSize:14, color:"rgba(255,255,255,0.5)", letterSpacing:"-0.02em" }}>Promptify</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.2)" }}>· MIT License · Open Source</span>
            </div>
            <div style={{ display:"flex", gap:24 }}>
              {[["GitHub", GITHUB],["Releases", RELEASE]].map(([l,h])=>(
                <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:13, color:"rgba(255,255,255,0.28)", textDecoration:"none", transition:"color 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color="rgba(255,255,255,0.7)"}}
                  onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.28)"}}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
