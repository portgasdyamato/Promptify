import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const electron = window.require ? window.require('electron') : null;

function extractJSON(raw: string): any {
  if (!raw) throw new Error('Empty response');
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try { return JSON.parse(stripped); } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Cannot parse JSON: ' + raw);
  }
}

type Phase = 'idle' | 'listening' | 'processing' | 'done';

export default function Widget() {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [statusLabel, setStatusLabel] = useState('');

  const isListeningRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (electron) {
      const h = () => setTimeout(() => startListening(), 150);
      electron.ipcRenderer.on('auto-start-listening', h);
      return () => { electron.ipcRenderer.removeListener('auto-start-listening', h); stopListening(); };
    }
    return () => stopListening();
  }, []);

  const speak = (text: string) => {
    setStatusLabel(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        await processAudio(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
      };
      audioContextRef.current = new AudioContext();
      const src = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.minDecibels = -65;
      analyserRef.current.smoothingTimeConstant = 0.85;
      src.connect(analyserRef.current);
      const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
      let silence = Date.now(), heard = false;
      const check = () => {
        if (!isListeningRef.current || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
        if (avg > 12) { silence = Date.now(); heard = true; }
        else if (heard && Date.now() - silence > 3000) { stopListening(); return; }
        else if (!heard && Date.now() - silence > 8000) { stopListening(); return; }
        requestAnimationFrame(check);
      };
      setPhase('listening'); isListeningRef.current = true;
      speak("I'm listening."); mr.start(100);
      setTimeout(() => requestAnimationFrame(check), 300);
    } catch { speak('Could not access microphone.'); setPhase('idle'); isListeningRef.current = false; }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    audioContextRef.current?.close().catch(() => {}); audioContextRef.current = null;
    setPhase('idle');
  };

  const processAudio = async (blob: Blob) => {
    setPhase('processing'); setStatusLabel('Transcribing…');
    try {
      const key = import.meta.env.VITE_GROQ_API_KEY;
      if (!key) { speak('Missing VITE_GROQ_API_KEY'); return; }
      const form = new FormData();
      form.append('file', blob, 'audio.webm'); form.append('model', 'whisper-large-v3-turbo');
      const wr = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
      });
      if (!wr.ok) { speak('Transcription failed.'); return; }
      const { text } = await wr.json();
      if (!text?.trim()) { speak("Didn't catch that."); return; }
      setInput(text); setStatusLabel('Generating prompt…');
      const lr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: `Return ONLY JSON: {"action":"inject_prompt","optimized_text":"..."}` },
            { role: 'user', content: text },
          ],
          response_format: { type: 'json_object' }, temperature: 0.3, max_tokens: 2048,
        }),
      });
      if (!lr.ok) { speak('Prompt generation failed.'); return; }
      const data = await lr.json();
      await executeIntent(extractJSON(data.choices?.[0]?.message?.content || ''));
    } catch { speak('Something went wrong.'); } finally { if (phase === 'processing') setPhase('idle'); }
  };

  const executeIntent = async (intent: any) => {
    if (!intent?.action) { speak('Could not understand.'); return; }
    if (intent.action === 'inject_prompt') {
      const t = intent.optimized_text?.trim();
      if (!t) { speak('No prompt.'); return; }
      setInput(t); setPhase('done'); speak('Done');
      if (electron) {
        electron.ipcRenderer.invoke('save-history', 'Voice Command', t).catch(console.error);
        setTimeout(() => electron.ipcRenderer.send('inject-text', t), 1000);
      } else { navigator.clipboard.writeText(t).catch(console.error); }
      setTimeout(() => { setPhase('idle'); setStatusLabel(''); setInput(''); }, 4000);
    }
  };

  const dotColor = phase === 'done' ? '#34C759' : phase === 'processing' ? '#007AFF' : phase === 'listening' ? '#34C759' : '#AEAEB2';
  const borderColor = phase === 'listening' ? 'rgba(52,199,89,0.4)' : phase === 'processing' ? 'rgba(0,122,255,0.25)' : 'rgba(255,255,255,0.65)';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'transparent' }}>
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* Main widget */}
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 18,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: `1px solid ${borderColor}`,
            boxShadow: phase === 'listening'
              ? '0 0 0 3px rgba(52,199,89,0.12), 0 8px 40px rgba(0,0,0,0.1)'
              : '0 2px 12px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.05)',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* macOS traffic lights */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0, paddingLeft: 2 }}>
            {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
            ))}
          </div>

          {/* Status icon */}
          <div
            style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'rgba(120,120,128,0.08)',
              border: '1px solid rgba(60,60,67,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {phase === 'idle' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            )}
            {phase === 'listening' && (
              <div className="blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759' }} />
            )}
            {phase === 'processing' && (
              <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity={0.15} />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            )}
            {phase === 'done' && (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </div>

          {/* Input */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: dotColor, marginBottom: 1, lineHeight: 1.2 }}>
              {phase === 'done' ? 'Injected' : phase === 'processing' ? (statusLabel || 'Processing…') : phase === 'listening' ? 'Listening' : 'Ready'}
            </p>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={phase === 'idle' ? 'Press mic and speak…' : phase === 'listening' ? 'Say your request…' : ''}
              className="no-drag"
              disabled={phase === 'processing' || phase === 'done'}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13.5, color: '#1C1C1E', fontFamily: 'Inter, sans-serif',
                caretColor: dotColor,
              }}
            />
          </div>

          {/* Mic button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => phase === 'listening' ? stopListening() : phase === 'idle' ? startListening() : null}
            disabled={phase === 'processing' || phase === 'done'}
            className="no-drag"
            style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0, border: 'none', cursor: 'pointer',
              background: phase === 'listening' ? 'rgba(52,199,89,0.12)' : 'rgba(120,120,128,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: phase === 'listening' ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={phase === 'listening' ? '#34C759' : '#AEAEB2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {phase === 'listening'
                ? <><rect x="6" y="4" width="4" height="16" rx="1" fill="#34C759" stroke="none" /><rect x="14" y="4" width="4" height="16" rx="1" fill="#34C759" stroke="none" /></>
                : <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></>
              }
            </svg>
          </motion.button>

          {/* Close */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => electron?.ipcRenderer.send('hide-widget')}
            className="no-drag"
            title="Remove widget"
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'rgba(120,120,128,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#AEAEB2" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1L7 7M7 1L1 7" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {statusLabel && phase === 'processing' && (
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', fontSize: 11, color: '#6E6E73', fontWeight: 500, letterSpacing: '0.02em' }}
            >
              {statusLabel}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
