import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const electron = (window as any).require ? (window as any).require('electron') : null;

function extractJSON(raw: string) {
  const s = raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/i,'').trim();
  try { return JSON.parse(s); } catch {
    const m = s.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]);
    throw new Error('Parse failed');
  }
}

type Phase = 'idle' | 'listening' | 'processing' | 'done';

const G = {
  bg:          'rgba(16, 18, 22, 0.45)',
  border:      'rgba(255, 255, 255, 0.07)',
  borderLit:   'rgba(0, 255, 153, 0.3)',
  borderError: 'rgba(255, 95, 87, 0.3)',
  neon:        '#00FF99',
  label3:      'rgba(255, 255, 255, 0.44)',
  label4:      'rgba(255, 255, 255, 0.24)',
  shadow:      'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 30px 80px -15px rgba(0, 0, 0, 0.8)',
};

export default function Widget() {
  const [input, setInput]   = useState('');
  const [phase, setPhase]   = useState<Phase>('idle');
  const [status, setStatus] = useState('');

  const listeningRef = useRef(false);
  const mrRef        = useRef<MediaRecorder|null>(null);
  const chunksRef    = useRef<BlobPart[]>([]);
  const acRef        = useRef<AudioContext|null>(null);
  const analyserRef  = useRef<AnalyserNode|null>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (electron) {
      const h = () => setTimeout(() => startListening(), 150);
      electron.ipcRenderer.on('auto-start-listening', h);
      return () => { electron.ipcRenderer.removeListener('auto-start-listening', h); stopListening(); };
    }
    return () => stopListening();
  }, []);

  const say = (t: string) => {
    setStatus(t);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t); u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mrRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        await processAudio(new Blob(chunksRef.current, { type: 'audio/webm' }));
      };
      acRef.current = new AudioContext();
      const src = acRef.current.createMediaStreamSource(stream);
      analyserRef.current = acRef.current.createAnalyser();
      analyserRef.current.minDecibels = -65; analyserRef.current.smoothingTimeConstant = 0.85;
      src.connect(analyserRef.current);
      const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
      let silence = Date.now(), heard = false;
      const check = () => {
        if (!listeningRef.current || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        const avg = buf.reduce((s,v)=>s+v,0)/buf.length;
        if (avg > 12) { silence = Date.now(); heard = true; }
        else if (heard && Date.now()-silence > 3000) { stopListening(); return; }
        else if (!heard && Date.now()-silence > 8000) { stopListening(); return; }
        requestAnimationFrame(check);
      };
      setPhase('listening'); listeningRef.current = true;
      say("I'm listening."); mr.start(100);
      setTimeout(() => requestAnimationFrame(check), 300);
    } catch { say('Mic error.'); setPhase('idle'); listeningRef.current = false; }
  };

  const stopListening = () => {
    listeningRef.current = false;
    if (mrRef.current?.state === 'recording') mrRef.current.stop();
    acRef.current?.close().catch(()=>{}); acRef.current = null;
    setPhase('idle');
  };

  const processAudio = async (blob: Blob) => {
    setPhase('processing'); setStatus('Transcribing…');
    try {
      const key = import.meta.env.VITE_GROQ_API_KEY;
      if (!key) { say('Missing API key'); return; }
      const form = new FormData();
      form.append('file', blob, 'audio.webm'); form.append('model','whisper-large-v3-turbo');
      const wr = await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});
      if (!wr.ok) { say('Transcription failed'); return; }
      const {text} = await wr.json();
      if (!text?.trim()) { say("Didn't catch that"); return; }
      setInput(text); setStatus('Generating prompt…');
      const lr = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:'Return ONLY JSON: {"action":"inject_prompt","optimized_text":"..."}'},{role:'user',content:text}],response_format:{type:'json_object'},temperature:0.3,max_tokens:2048}),
      });
      if (!lr.ok) { say('Generation failed'); return; }
      const data = await lr.json();
      const intent = extractJSON(data.choices?.[0]?.message?.content||'');
      if (intent?.action === 'inject_prompt' && intent.optimized_text) {
        const t = intent.optimized_text.trim();
        setInput(t); setPhase('done'); say('Done');
        if (electron) {
          electron.ipcRenderer.invoke('save-history', 'Voice Command', t).catch(console.error);
          setTimeout(() => electron.ipcRenderer.send('inject-text', t), 1000);
        } else { navigator.clipboard.writeText(t).catch(()=>{}); }
        setTimeout(() => { setPhase('idle'); setStatus(''); setInput(''); }, 4000);
      } else { say('No prompt returned'); }
    } catch { say('Something went wrong'); } finally { if (phase==='processing') setPhase('idle'); }
  };

  const isLit      = phase === 'listening';
  const isDone     = phase === 'done';
  const isProc     = phase === 'processing';
  const borderC    = isLit ? G.borderLit : isDone ? 'rgba(0,255,153,0.22)' : G.border;
  const glowBox    = isLit ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 0 0 1.5px rgba(0,255,153,0.18), 0 35px 80px rgba(0,0,0,0.85), 0 0 40px rgba(0,255,153,0.05)' : isDone ? 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(0,255,153,0.1), 0 35px 80px rgba(0,0,0,0.8)' : G.shadow;
  const statusColor = isLit || isDone ? G.neon : isProc ? '#a78bfa' : G.label4;

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', alignItems:'center', justifyItems:'center', justifyContent:'center', padding:16, background:'transparent' }}>
      <div style={{ width:'100%', maxWidth:540, display:'flex', flexDirection:'column', gap:8 }}>

        {/* Main widget glass wrapper */}
        <motion.div
          initial={{ opacity:0, y:8, scale:0.98 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:0.32, ease:[0.16, 1, 0.3, 1] }}
          style={{ overflow:'hidden', borderRadius:20, background:G.bg, backdropFilter:'blur(36px) saturate(200%)', WebkitBackdropFilter:'blur(36px) saturate(200%)', border:`1px solid ${borderC}`, boxShadow:glowBox, transition:'border-color 0.35s, box-shadow 0.35s' }}
        >
          {/* Windows / macOS header chrome bar */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)' }}>
            <div style={{ display:'flex', gap:6 }}>
              {(['#FF5F57','#FFBD2E','#28C840'] as const).map(c=>(
                <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:0.85 }} />
              ))}
            </div>
            <div style={{ flex:1, textAlign:'center' }}>
              <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.24)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Promptify Widget</span>
            </div>
            <div style={{ width:42 }} />
          </div>

          {/* Action Row */}
          <div style={{ display:'flex', alignItems:'center', gap:11, padding:'12px 14px' }}>
            {/* Status node */}
            <div style={{ width:38, height:38, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: isLit ? 'rgba(0,255,153,0.07)' : 'rgba(255,255,255,0.04)', border:`1px solid ${isLit ? 'rgba(0,255,153,0.25)' : 'rgba(255,255,255,0.07)'}`, transition:'all 0.3s' }}>
              {phase==='idle'       && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>}
              {phase==='listening'  && <div className="anim-blink" style={{ width:7, height:7, borderRadius:'50%', background:G.neon, boxShadow:'0 0 12px #00FF99' }} />}
              {phase==='processing' && <svg className="anim-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" strokeOpacity={0.15}/><path d="M12 2a10 10 0 0 1 10 10"/></svg>}
              {phase==='done'       && (
                <motion.svg initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:400}}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.neon} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </motion.svg>
              )}
            </div>

            {/* Input fields */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', lineHeight:1, marginBottom:3, color: statusColor }}>
                {phase==='idle' ? 'Ready' : phase==='listening' ? 'Listening…' : phase==='processing' ? (status||'Processing…') : 'Injected ✓'}
              </p>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                placeholder={phase==='idle' ? 'Hold hotkey and speak your thoughts…' : phase==='listening' ? 'Dictating prompt…' : ''}
                disabled={isProc||isDone}
                className="no-drag"
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:13.5, color:'rgba(255,255,255,0.76)', fontFamily:'Inter, system-ui, sans-serif', caretColor:G.neon }}
              />
            </div>

            {/* Mic control */}
            <motion.button whileTap={{scale:0.88}} onClick={()=>{if(isLit)stopListening(); else if(phase==='idle')startListening();}}
              disabled={isProc||isDone} className="no-drag"
              style={{ width:36, height:36, borderRadius:11, border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: isLit ? 'rgba(0,255,153,0.1)' : 'rgba(255,255,255,0.04)', transition:'all 0.25s', opacity:isProc||isDone ? 0.35 : 1 }}>
              {isLit
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill={G.neon}/><rect x="14" y="4" width="4" height="16" rx="1" fill={G.neon}/></svg>
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              }
            </motion.button>

            {/* Remove widget */}
            <motion.button whileTap={{scale:0.88}} onClick={()=>electron?.ipcRenderer.send('hide-widget')}
              className="no-drag" title="Remove widget"
              style={{ width:28, height:28, borderRadius:8, border:'none', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.035)' }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" strokeLinecap="round"><path d="M1 1L7 7M7 1L1 7"/></svg>
            </motion.button>
          </div>
        </motion.div>

        {/* AI feedback indicator status */}
        <AnimatePresence mode="wait">
          {status && isProc && (
            <motion.p key={status} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.28)', fontWeight:500, letterSpacing:'0.04em' }}>
              {status}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
