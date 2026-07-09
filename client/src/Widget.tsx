import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Bot, CheckCircle2 } from 'lucide-react';
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

import { X } from 'lucide-react';

export default function Widget() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const [isDone, setIsDone] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    inputRef.current?.focus();

    // Auto-start listening when global shortcut fires (IPC from main.js)
    if (electron) {
      const handler = () => {
        // Small delay so the window is fully visible
        setTimeout(() => startListening(), 150);
      };
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await processAudioCommand(audioBlob);
      };

      // Silence detection — 3 seconds of silence to auto-stop
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

        if (avg > 12) {
          silenceStart = Date.now();
          hasSpeech = true;
        } else if (hasSpeech && Date.now() - silenceStart > 3000) {
          // 3s silence AFTER speech detected → stop
          stopListening();
          return;
        } else if (!hasSpeech && Date.now() - silenceStart > 8000) {
          // 8s timeout if no speech at all (mic open but silent)
          stopListening();
          return;
        }
        requestAnimationFrame(checkSilence);
      };

      setIsListening(true);
      isListeningRef.current = true;
      speak("I'm listening.");
      mediaRecorder.start(100);
      setTimeout(() => requestAnimationFrame(checkSilence), 300);

    } catch (error) {
      console.error('Mic error:', error);
      speak('Could not access microphone.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const processAudioCommand = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatusLabel('Transcribing...');

    try {
      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!groqKey) {
        speak('Missing VITE_GROQ_API_KEY in .env — please restart the app after adding it.');
        return;
      }

      // ── 1. Whisper transcription ─────────────────────────────────────────
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-large-v3-turbo');

      const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${groqKey}` },
        body: formData,
      });

      if (!whisperRes.ok) {
        const err = await whisperRes.text();
        console.error('Whisper error:', err);
        speak('Transcription failed.');
        return;
      }

      const { text: transcript } = await whisperRes.json();
      if (!transcript?.trim()) {
        speak("Didn't catch that — try again.");
        return;
      }

      console.log('[VoXa] Transcript:', transcript);
      setInput(transcript);
      setStatusLabel('Generating prompt...');

      // ── 2. Llama 3.3 70B intent + prompt generation ──────────────────────
      const systemPrompt = `You are VoXa, an AI voice assistant that generates highly detailed prompts.
The user has spoken a voice command. Your ONLY job is to analyze it and return a JSON object.

CRITICAL RULES:
1. If the user wants to WRITE, CREATE, GENERATE, DRAFT, or PRODUCE any content → use action "inject_prompt"
2. If the user explicitly says ADD TASK, REMIND ME, CREATE TODO → use action "create_task"  
3. Only use "navigate_ui" if the user says EXACT words like "open history", "show tasks", "go to settings"
4. DEFAULT to "inject_prompt" if you're unsure. Never guess "navigate_ui" from ambiguous speech.

Return ONLY this JSON, no markdown:
{
  "action": "inject_prompt",
  "optimized_text": "A comprehensive, expert-level, multi-paragraph prompt that fully expands on the user's request with role definition, context, requirements, constraints, output format, and examples."
}

OR for task:
{"action": "create_task", "title": "...", "priority": "Low|Medium|High"}

OR for navigation:
{"action": "navigate_ui", "view": "history|tasks|assistant|settings"}`;

      const llmRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcript },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 2048,
        }),
      });

      if (!llmRes.ok) {
        const err = await llmRes.text();
        console.error('Groq LLM error:', err);
        speak('Prompt generation failed.');
        return;
      }

      const llmData = await llmRes.json();
      const rawContent = llmData.choices?.[0]?.message?.content || '';
      console.log('[VoXa] LLM raw:', rawContent);

      const intent = extractJSON(rawContent);
      console.log('[VoXa] Intent:', intent);

      await executeIntent(intent);

    } catch (err) {
      console.error('[VoXa] Pipeline error:', err);
      speak('Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeIntent = async (intent: any) => {
    if (!intent?.action) {
      speak('Could not understand the command.');
      return;
    }

    switch (intent.action) {
      case 'inject_prompt': {
        const text = intent.optimized_text?.trim();
        if (!text) { speak('No prompt was generated.'); return; }

        setInput(text);
        setIsDone(true);
        speak('Done');

        if (electron) {
          electron.ipcRenderer.invoke('save-history', 'Voice Command', text).catch(console.error);
          // Give user 1s to see "Done" state, then inject (main.js handles hide + paste)
          setTimeout(() => {
            electron.ipcRenderer.send('inject-text', text);
          }, 1000);
        } else {
          navigator.clipboard.writeText(text).catch(console.error);
        }

        // Reset state after 4s (window will already be hidden by then)
        setTimeout(() => {
          setIsDone(false);
          setStatusLabel('');
          setInput('');
        }, 4000);
        break;
      }

      case 'create_task': {
        const { title = 'Untitled Task', priority = 'Medium' } = intent;
        speak(`Task created: ${title}`);
        setStatusLabel(`✓ Task added: ${title}`);
        setIsDone(true);
        setTimeout(() => {
          setIsDone(false);
          setStatusLabel('');
        }, 3000);
        break;
      }

      case 'navigate_ui': {
        // Don't hide — just show the view name in UI
        speak(`Opening ${intent.view}`);
        setStatusLabel(`Opening ${intent.view}...`);
        setTimeout(() => setStatusLabel(''), 2000);
        break;
      }

      default:
        speak('Action not recognized.');
    }
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
      {/* Main widget */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-black/80 backdrop-blur-3xl border border-white/10 p-2 rounded-3xl shadow-2xl flex items-center gap-3 w-full relative overflow-hidden"
      >
        {/* Listening glow */}
        <AnimatePresence>
          {isListening && !isProcessing && (
            <motion.div
              key="glow"
              className="absolute inset-0 bg-blue-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </AnimatePresence>

        {/* State icon */}
        <div className="flex-shrink-0 pl-3 z-10">
          {isDone ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </motion.div>
          ) : isProcessing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
              <Bot className="w-6 h-6 text-purple-400" />
            </motion.div>
          ) : isListening ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Mic className="w-6 h-6 text-blue-400" />
            </motion.div>
          ) : (
            <Bot className="w-6 h-6 text-zinc-500" />
          )}
        </div>

        {/* Text display */}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isDone ? 'Done! Prompt injected.' :
            isProcessing ? 'Processing...' :
            isListening ? 'Listening... speak now' :
            'Press mic and speak your request'
          }
          className={`flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-xl py-4 z-10 ${isDone ? 'text-green-400 font-medium' : ''}`}
          disabled={isProcessing || isDone}
        />

        {/* Mic button */}
        <div className="flex items-center gap-2 pr-2 z-10">
          <button
            onClick={toggleListening}
            disabled={isProcessing || isDone}
            className={`p-3 rounded-full transition-all disabled:opacity-40 ${
              isListening
                ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              if (electron) electron.ipcRenderer.send('hide-widget');
            }}
            className="p-3 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/20 transition-all ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        {statusLabel && (
          <motion.p
            key={statusLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-zinc-400 text-sm font-medium tracking-wide"
          >
            {statusLabel}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
