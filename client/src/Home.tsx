import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const electron = window.require ? window.require('electron') : null;

type View = 'history' | 'settings';

interface HistoryItem {
  id: number;
  original_prompt: string;
  optimized_prompt: string;
  timestamp: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: 1, original_prompt: 'Write a cold email to a potential investor', optimized_prompt: 'Act as an expert fundraising consultant and serial entrepreneur with 15+ years of experience. Draft a compelling cold outreach email to a potential seed-stage investor...', timestamp: new Date().toISOString() },
  { id: 2, original_prompt: 'Explain how transformers work', optimized_prompt: 'You are a world-class AI researcher and educator. Provide a comprehensive yet accessible explanation of the Transformer architecture as introduced in "Attention Is All You Need"...', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, original_prompt: 'Create a Python web scraper', optimized_prompt: 'Act as a senior Python developer specializing in data engineering and web automation. Write a production-ready web scraper with the following specifications...', timestamp: new Date(Date.now() - 172800000).toISOString() },
];

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="no-drag flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
      style={{
        background: active ? 'rgba(57,255,137,0.08)' : 'transparent',
        border: active ? '1px solid rgba(57,255,137,0.2)' : '1px solid transparent',
        color: active ? '#39ff89' : '#6b7280',
      }}
    >
      <span style={{ color: active ? '#39ff89' : '#4b5563' }}>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#39ff89', boxShadow: '0 0 8px #39ff89' }} />}
    </button>
  );
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<View>('history');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (electron) {
      electron.ipcRenderer.invoke('get-history').then(setHistory).catch(console.error);
    } else {
      setHistory(MOCK_HISTORY);
    }
  }, []);

  return (
    <div
      className="w-screen h-screen flex overflow-hidden"
      style={{ background: '#030804', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(57,255,137,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,137,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(57,255,137,0.04) 0%, transparent 65%)' }} />

      {/* ── Sidebar ── */}
      <div
        className="relative z-10 w-60 flex-shrink-0 flex flex-col py-5 px-3"
        style={{
          background: 'rgba(255,255,255,0.015)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(57,255,137,0.08)',
        }}
      >
        {/* Title bar drag region */}
        <div className="drag-region h-6 absolute top-0 left-0 right-0" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8 mt-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(57,255,137,0.1)', border: '1px solid rgba(57,255,137,0.25)', boxShadow: '0 0 16px rgba(57,255,137,0.15)' }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="#39ff89" />
              <path d="M8 1 L8 5 M8 11 L8 15 M1 8 L5 8 M11 8 L15 8" stroke="#39ff89" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Promptify</p>
            <p className="text-[10px] leading-tight" style={{ color: '#39ff89', fontFamily: "'JetBrains Mono', monospace" }}>v1.0.0</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-widest px-3 mb-2" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>Main</p>
          <NavItem
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            label="History"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <NavItem
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="Settings"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            }
          />
        </div>

        {/* Bottom status */}
        <div className="mt-auto">
          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(57,255,137,0.05)', border: '1px solid rgba(57,255,137,0.12)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full blink-dot" style={{ background: '#39ff89' }} />
              <p className="text-xs font-semibold" style={{ color: '#39ff89' }}>Background Active</p>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
              Ctrl+Shift+V to open widget
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Titlebar drag region */}
        <div className="drag-region h-8 flex-shrink-0 flex items-center px-6"
          style={{ borderBottom: '1px solid rgba(57,255,137,0.05)' }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
            {activeTab === 'history' ? '// prompt_history' : '// settings'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Prompt History</h1>
                    <p className="text-sm" style={{ color: '#4b5563' }}>{history.length} prompts generated</p>
                  </div>
                  {history.length > 0 && (
                    <div
                      className="px-3 py-1.5 rounded-full text-xs"
                      style={{ background: 'rgba(57,255,137,0.08)', border: '1px solid rgba(57,255,137,0.2)', color: '#39ff89', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {history.length} entries
                    </div>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-20">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(57,255,137,0.05)', border: '1px solid rgba(57,255,137,0.1)' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      </svg>
                    </div>
                    <p className="text-zinc-500 font-medium mb-1">No prompts yet</p>
                    <p className="text-zinc-600 text-sm">Press Ctrl+Shift+V to start dictating</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {history.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-2xl overflow-hidden cursor-pointer transition-all no-drag"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: expanded === item.id ? '1px solid rgba(57,255,137,0.25)' : '1px solid rgba(255,255,255,0.05)',
                          boxShadow: expanded === item.id ? '0 0 30px rgba(57,255,137,0.06)' : 'none',
                        }}
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        <div className="p-4 flex items-start gap-3">
                          {/* Left accent bar */}
                          <div className="w-0.5 h-full min-h-8 rounded-full flex-shrink-0 self-stretch" style={{ background: 'rgba(57,255,137,0.3)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
                                style={{ background: 'rgba(57,255,137,0.08)', color: '#39ff89', fontFamily: "'JetBrains Mono', monospace" }}
                              >
                                Voice
                              </span>
                              <span className="text-[10px]" style={{ color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-white font-medium text-sm truncate">"{item.original_prompt}"</p>
                          </div>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round"
                            style={{ transform: expanded === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>

                        <AnimatePresence>
                          {expanded === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div
                                className="px-4 pb-4 pt-2 mx-4 mb-4 rounded-xl text-sm leading-relaxed"
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(57,255,137,0.08)', color: '#9ca3af', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}
                              >
                                {item.optimized_prompt}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
                  <p className="text-sm" style={{ color: '#4b5563' }}>Configure your Promptify instance</p>
                </div>

                {/* API Config card */}
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(57,255,137,0.1)' }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(57,255,137,0.08)', border: '1px solid rgba(57,255,137,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">API Configuration</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest" style={{ color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>Groq API Key</label>
                    <input
                      type="password"
                      value="gsk_••••••••••••••••••••••••••••••••••••••••••••••"
                      readOnly
                      className="no-drag rounded-xl px-4 py-2.5 text-sm outline-none w-full"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(57,255,137,0.1)', color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <p className="text-[11px]" style={{ color: '#374151' }}>
                      To change, update your <code className="text-xs" style={{ color: '#39ff89' }}>.env</code> file and restart the app.
                    </p>
                  </div>
                </div>

                {/* Shortcuts card */}
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(57,255,137,0.1)' }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(57,255,137,0.08)', border: '1px solid rgba(57,255,137,0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39ff89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Keyboard Shortcuts</h3>
                  </div>
                  {[
                    { action: 'Toggle Widget', keys: ['Ctrl', 'Shift', 'V'], desc: 'Show or hide the floating widget' },
                  ].map(({ action, keys, desc }) => (
                    <div key={action} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(57,255,137,0.05)' }}>
                      <div>
                        <p className="text-white text-sm font-medium">{action}</p>
                        <p className="text-[11px]" style={{ color: '#4b5563' }}>{desc}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {keys.map((key, i) => (
                          <span key={i}>
                            <kbd
                              className="px-2 py-1 rounded-lg text-xs"
                              style={{ background: 'rgba(57,255,137,0.08)', border: '1px solid rgba(57,255,137,0.2)', color: '#39ff89', fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {key}
                            </kbd>
                            {i < keys.length - 1 && <span className="text-zinc-600 text-xs mx-0.5">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* About card */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(57,255,137,0.1)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Promptify</p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#4b5563', fontFamily: "'JetBrains Mono', monospace" }}>
                        v1.0.0 · Electron · Whisper + Llama 3.3
                      </p>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest"
                      style={{ background: 'rgba(57,255,137,0.08)', border: '1px solid rgba(57,255,137,0.2)', color: '#39ff89', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      MIT License
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
