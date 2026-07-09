import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const electron = window.require ? window.require('electron') : null;

function extractJSON(raw: string): any {
  if (!raw) throw new Error('Empty response');
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
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
      const handler = () => setTimeout(() => startListening(), 150);
      electron.ipcRenderer.on('auto-start-listening', handler);
      return () => {
        electron.ipcRenderer.removeListener('auto-start-listening', handler);
        stopListening();
      };
    }
    return () => stopListening();
  }, []);

  const speak = (text: string) => {
    setStatusLabel(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await processAudioCommand(audioBlob);
      };

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.minDecibels = -65;
      analyserRef.current.smoothingTimeConstant = 0.85;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let silenceStart = Date.now();
      let hasSpeech = false;

      const checkSilence = () => {
        if (!isListeningRef.current || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((s, v) => s + v, 0) / bufferLength;
        if (avg > 12) { silenceStart = Date.now(); hasSpeech = true; }
        else if (hasSpeech && Date.now() - silenceStart > 3000) { stopListening(); return; }
        else if (!hasSpeech && Date.now() - silenceStart > 8000) { stopListening(); return; }
        requestAnimationFrame(checkSilence);
      };

      setPhase('listening');
      isListeningRef.current = true;
      speak("I'm listening.");
      mediaRecorder.start(100);
      setTimeout(() => requestAnimationFrame(checkSilence), 300);
    } catch {
      speak('Could not access microphone.');
      setPhase('idle');
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    setPhase('idle');
  };

  const toggleListening = () => {
    if (phase === 'listening') stopListening();
    else if (phase === 'idle') startListening();
  };

  const processAudioCommand = async (audioBlob: Blob) => {
    setPhase('processing');
    setStatusLabel('Transcribing...');
    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!groqKey) { speak('Missing VITE_GROQ_API_KEY'); return; }

      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3-turbo');
      const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: `Bearer ${groqKey}` }, body: formData,
      });
      if (!whisperRes.ok) { speak('Transcription failed.'); return; }
      const { text: transcript } = await whisperRes.json();
      if (!transcript?.trim()) { speak("Didn't catch that."); return; }

      setInput(transcript);
      setStatusLabel('Generating prompt...');

      const systemPrompt = `You are VoXa, an AI voice assistant that generates highly detailed prompts.
Return ONLY JSON:
{"action":"inject_prompt","optimized_text":"A comprehensive expert prompt..."}
OR {"action":"create_task","title":"...","priority":"Low|Medium|High"}
OR {"action":"navigate_ui","view":"history|tasks|assistant|settings"}`;

      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: transcript }],
          response_format: { type: 'json_object' },
          temperature: 0.3, max_tokens: 2048,
        }),
      });
      if (!llmRes.ok) { speak('Prompt generation failed.'); return; }
      const llmData = await llmRes.json();
      const intent = extractJSON(llmData.choices?.[0]?.message?.content || '');
      await executeIntent(intent);
    } catch {
      speak('Something went wrong.');
    } finally {
      if (phase === 'processing') setPhase('idle');
    }
  };

  const executeIntent = async (intent: any) => {
    if (!intent?.action) { speak('Could not understand.'); return; }
    switch (intent.action) {
      case 'inject_prompt': {
        const text = intent.optimized_text?.trim();
        if (!text) { speak('No prompt generated.'); return; }
        setInput(text);
        setPhase('done');
        speak('Done');
        if (electron) {
          electron.ipcRenderer.invoke('save-history', 'Voice Command', text).catch(console.error);
          setTimeout(() => electron.ipcRenderer.send('inject-text', text), 1000);
        } else {
          navigator.clipboard.writeText(text).catch(console.error);
        }
        setTimeout(() => { setPhase('idle'); setStatusLabel(''); setInput(''); }, 4000);
        break;
      }
      case 'create_task': {
        speak(`Task created: ${intent.title}`);
        setStatusLabel(`✓ ${intent.title}`);
        setPhase('done');
        setTimeout(() => { setPhase('idle'); setStatusLabel(''); }, 3000);
        break;
      }
      case 'navigate_ui': {
        speak(`Opening ${intent.view}`);
        setStatusLabel(`Opening ${intent.view}...`);
        setTimeout(() => setStatusLabel(''), 2000);
        break;
      }
      default: speak('Action not recognized.');
    }
  };

  // Colors by phase
  const neonColor = phase === 'done' ? '#34d399' : '#39ff89';
  const accentColor = phase === 'processing' ? '#a78bfa' : neonColor;

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4" style={{ background: 'transparent' }}>
      <div className="w-full max-w-2xl flex flex-col gap-3">

        {/* Main widget */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            border: `1px solid ${phase === 'listening' ? 'rgba(57,255,137,0.35)' : 'rgba(57,255,137,0.12)'}`,
            boxShadow: phase === 'listening'
              ? '0 0 40px rgba(57,255,137,0.2), inset 0 0 40px rgba(57,255,137,0.03)'
              : '0 8px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Listening ambient glow */}
          <AnimatePresence>
            {phase === 'listening' && (
              <motion.div
                key="glow"
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(57,255,137,0.06) 0%, transparent 60%)' }}
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center z-10"
            style={{
              background: `rgba(${phase === 'processing' ? '167,139,250' : '57,255,137'},0.1)`,
              border: `1px solid rgba(${phase === 'processing' ? '167,139,250' : '57,255,137'},0.25)`,
            }}
          >
            {phase === 'idle' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            )}
            {phase === 'listening' && (
              <div className="w-3 h-3 rounded-full blink-dot" style={{ background: '#39ff89', boxShadow: '0 0 10px #39ff89' }} />
            )}
            {phase === 'processing' && (
              <svg className="spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            )}
            {phase === 'done' && (
              <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </div>

          {/* Input text area */}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              phase === 'done' ? 'Prompt injected ✓' :
              phase === 'processing' ? (statusLabel || 'Processing…') :
              phase === 'listening' ? 'Listening… speak now' :
              'Press mic and speak your request'
            }
            className="flex-1 bg-transparent border-none outline-none text-base py-3 z-10"
            style={{
              color: phase === 'done' ? '#34d399' : phase === 'listening' ? '#e5e7eb' : '#d1d5db',
              fontFamily: "'Space Grotesk', sans-serif",
              caretColor: accentColor,
            }}
            disabled={phase === 'processing' || phase === 'done'}
          />

          {/* Right buttons */}
          <div className="flex items-center gap-2 z-10 no-drag">
            {/* Mic */}
            <motion.button
              onClick={toggleListening}
              disabled={phase === 'processing' || phase === 'done'}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
              style={{
                background: phase === 'listening' ? 'rgba(57,255,137,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${phase === 'listening' ? 'rgba(57,255,137,0.4)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: phase === 'listening' ? '0 0 20px rgba(57,255,137,0.35)' : 'none',
              }}
            >
              {phase === 'listening' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="#39ff89" stroke="none" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="#39ff89" stroke="none" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              )}
            </motion.button>

            {/* Close / Remove widget */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { if (electron) electron.ipcRenderer.send('hide-widget'); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              title="Remove widget"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1 L9 9 M9 1 L1 9" />
              </svg>
            </motion.button>
          </div>
        </motion.div>

        {/* Status label */}
        <AnimatePresence mode="wait">
          {statusLabel && (
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs tracking-widest"
              style={{ color: accentColor, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {statusLabel}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
