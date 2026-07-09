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

  const isLit = phase === 'listening';
  const isDone = phase === 'done';
  const isProc = phase === 'processing';
  const borderC = isLit ? 'rgba(0, 255, 153, 0.3)' : isDone ? 'rgba(0, 255, 153, 0.22)' : 'rgba(255, 255, 255, 0.075)';
  const glowBox = isLit ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 0 0 1.5px rgba(0,255,153,0.18), 0 35px 80px rgba(0,0,0,0.85), 0 0 40px rgba(0,255,153,0.05)' : isDone ? 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(0,255,153,0.1), 0 35px 80px rgba(0,0,0,0.8)' : 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.4), 0 32px 64px -16px rgba(0, 0, 0, 0.7)';

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'transparent' }}>
      <div style={{ width:'100%', maxWidth:440, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '-20px', left: '20px', right: '20px', height: '14px', background: 'rgba(0, 0, 0, 0.65)', filter: 'blur(16px)', borderRadius: '50%', pointerEvents: 'none' }} />
          
          {/* Main Widget Glass Panel */}
          <motion.div
            initial={{ opacity:0, y:8, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ duration:0.32, ease:[0.16, 1, 0.3, 1] }}
            style={{ overflow:'hidden', borderRadius:20, background:'rgba(10, 11, 13, 0.55)', backdropFilter:'blur(36px) saturate(200%)', WebkitBackdropFilter:'blur(36px) saturate(200%)', border:`1px solid ${borderC}`, boxShadow:glowBox, transition:'border-color 0.35s, box-shadow 0.35s' }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
              {/* Traffic Lights */}
              <div style={{ display:'flex', gap:6.5 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#FF5F57', opacity:0.85 }} />
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#FFBD2E', opacity:0.85 }} />
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#28C840', opacity:0.85 }} />
              </div>
              {/* Logo + Title */}
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
                </svg>
                <span>Promptify</span>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', gap:10, color:'rgba(255,255,255,0.28)' }}>
                <svg style={{ cursor:'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <svg style={{ cursor:'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <svg style={{ cursor:'pointer' }} onClick={() => electron?.ipcRenderer.send('hide-widget')} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <svg style={{ cursor:'pointer' }} onClick={() => electron?.ipcRenderer.send('hide-widget')} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <div style={{ width:120, height:120, borderRadius:'50%', border:'1px solid rgba(0, 255, 153, 0.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, position:'relative' }}>
                <div style={{ width:84, height:84, borderRadius:'50%', border:'1px solid rgba(0, 255, 153, 0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <motion.div whileTap={{ scale: 0.92 }} onClick={() => isLit ? stopListening() : startListening()}
                    style={{ width:56, height:56, borderRadius:'50%', background: isLit ? 'rgba(0, 255, 153, 0.12)' : 'rgba(0, 255, 153, 0.06)', border:'1px solid rgba(0, 255, 153, 0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#00FF99', boxShadow:'0 0 20px rgba(0, 255, 153, 0.15)', cursor:'pointer', transition:'all 0.3s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    </svg>
                  </motion.div>
                </div>
                {/* Floating Wave Rings */}
                {isLit && (
                  <>
                    <div className="wave-line-1" style={{ position:'absolute', borderRadius:'50%', border:'1.2px solid rgba(0, 255, 153, 0.12)', width:136, height:136, pointerEvents:'none', animation:'wavePulse 3s ease-in-out infinite' }}></div>
                    <div className="wave-line-2" style={{ position:'absolute', borderRadius:'50%', border:'1.2px solid rgba(0, 255, 153, 0.12)', width:152, height:152, pointerEvents:'none', animation:'wavePulse 3s ease-in-out infinite 1.5s' }}></div>
                  </>
                )}
              </div>

              {/* Listening Status */}
              <div style={{ marginBottom:18 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:4 }}>
                  {phase==='idle' ? 'Ready to Dictate' : phase==='listening' ? 'Listening...' : phase==='processing' ? (status||'Processing…') : 'Injected Successfully'}
                </h3>
                <p style={{ fontSize:12.5, color:'rgba(255, 255, 255, 0.35)' }}>
                  {phase==='listening' ? 'Hold hotkey and speak your thoughts' : 'Press microphone or shortcut to speak'}
                </p>
              </div>

              {/* Ready Badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:100, background:'rgba(0, 255, 153, 0.04)', border:'1px solid rgba(0, 255, 153, 0.15)' }}>
                <span className="anim-blink" style={{ width:4, height:4, borderRadius:'50%', background:'#00FF99', boxShadow:'0 0 6px #00FF99' }}></span>
                <span style={{ fontSize:9, fontWeight:700, color:'#00FF99', letterSpacing:'0.08em' }}>READY</span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ display:'flex', alignItems:'center', justifyItems:'center', justifyContent:'space-between', padding:'14px 18px', borderTop:'1px solid rgba(255, 255, 255, 0.04)', background:'rgba(255, 255, 255, 0.015)' }}>
              <div style={{ display:'flex', gap:12 }}>
                <button className="no-drag" style={{ background:'transparent', border:'none', color:'rgba(255, 255, 255, 0.28)', cursor:'pointer', display:'flex' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg></button>
                <button className="no-drag" style={{ background:'transparent', border:'none', color:'rgba(255, 255, 255, 0.28)', cursor:'pointer', display:'flex' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
                <button className="no-drag" style={{ background:'transparent', border:'none', color:'rgba(255, 255, 255, 0.28)', cursor:'pointer', display:'flex' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></button>
              </div>
              <button className="no-drag" style={{ background:'rgba(255, 255, 255, 0.03)', border:'1px solid rgba(255, 255, 255, 0.07)', padding:'8px 14px', borderRadius:100, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', boxShadow:'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)', transition:'all 0.2s' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
