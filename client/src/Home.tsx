import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const electron = window.require ? window.require('electron') : null;

type View = 'history' | 'settings';
interface HistoryItem { id: number; original_prompt: string; optimized_prompt: string; timestamp: string; }

const MOCK: HistoryItem[] = [
  { id: 1, original_prompt: 'Write a cold email to a VC', optimized_prompt: 'Act as an expert startup advisor and fundraising coach with 15+ years experience. Draft a concise, compelling cold email to a seed-stage investor introducing our product and traction...', timestamp: new Date().toISOString() },
  { id: 2, original_prompt: 'Explain transformer architecture', optimized_prompt: 'You are a world-class AI researcher and educator. Provide a comprehensive explanation of the Transformer architecture, covering attention mechanisms, positional encoding, and multi-head attention...', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

function NavItem({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="no-drag"
      style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%',
        padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(0,122,255,0.08)' : 'transparent',
        color: active ? '#007AFF' : '#6E6E73',
        fontWeight: active ? 600 : 500, fontSize: 13.5,
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{ color: active ? '#007AFF' : '#AEAEB2', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<View>('history');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (electron) electron.ipcRenderer.invoke('get-history').then(setHistory).catch(console.error);
    else setHistory(MOCK);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#F2F2F7', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
          padding: '0 10px 16px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(60,60,67,0.1)',
        }}
      >
        {/* Drag region + title */}
        <div className="drag" style={{ height: 52, display: 'flex', alignItems: 'flex-end', paddingBottom: 12, paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="9" height="9" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="4" fill="white" />
                <path d="M10 2v3M10 15v3M2 10h3M15 10h3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.01em' }}>Promptify</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#AEAEB2', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>Library</p>
          <NavItem active={tab === 'history'} onClick={() => setTab('history')} label="History"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
          <NavItem active={tab === 'settings'} onClick={() => setTab('settings')} label="Settings"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>} />
        </div>

        {/* Status pill */}
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(52,199,89,0.07)',
              border: '1px solid rgba(52,199,89,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759', flexShrink: 0 }} />
              <p style={{ fontSize: 11.5, fontWeight: 600, color: '#1C7A3A' }}>Running in background</p>
            </div>
            <p style={{ fontSize: 11, color: '#6E6E73', lineHeight: 1.5 }}>Ctrl+Shift+V to open widget</p>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Titlebar */}
        <div className="drag"
          style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: 12, paddingLeft: 20, borderBottom: '1px solid rgba(60,60,67,0.08)', background: 'rgba(242,242,247,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#AEAEB2', letterSpacing: '0.01em' }}>
            {tab === 'history' ? 'Prompt History' : 'Settings'}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <AnimatePresence mode="wait">

            {/* ── History ── */}
            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1C1E' }}>History</h1>
                  <span style={{ fontSize: 12, color: '#AEAEB2', fontWeight: 500 }}>{history.length} prompts</span>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(120,120,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      </svg>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#3A3A3C', marginBottom: 4 }}>No prompts yet</p>
                    <p style={{ fontSize: 13, color: '#AEAEB2' }}>Press Ctrl+Shift+V to start</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {history.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="no-drag"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                        style={{
                          borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.75)',
                          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                          border: expanded === item.id ? '1px solid rgba(0,122,255,0.25)' : '1px solid rgba(60,60,67,0.08)',
                          boxShadow: expanded === item.id ? '0 0 0 3px rgba(0,122,255,0.06)' : '0 1px 4px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#007AFF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Voice</span>
                              <span style={{ fontSize: 11, color: '#AEAEB2' }}>{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                            <p style={{ fontSize: 13.5, fontWeight: 500, color: '#1C1C1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{item.original_prompt}"
                            </p>
                          </div>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round"
                            style={{ transform: expanded === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        <AnimatePresence>
                          {expanded === item.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                              <div style={{ margin: '0 14px 14px', padding: '12px 14px', borderRadius: 10, background: 'rgba(120,120,128,0.05)', border: '1px solid rgba(60,60,67,0.07)', fontSize: 12.5, color: '#3A3A3C', lineHeight: 1.7, fontFamily: 'ui-monospace, monospace' }}>
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

            {/* ── Settings ── */}
            {tab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#1C1C1E', marginBottom: 20 }}>Settings</h1>

                {[
                  {
                    title: 'API', subtitle: 'AI model configuration',
                    rows: [
                      { label: 'Groq API Key', value: <input type="password" value="gsk_••••••••••••••••••••••••" readOnly className="no-drag" style={{ background: 'rgba(120,120,128,0.06)', border: '1px solid rgba(60,60,67,0.08)', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#6E6E73', fontFamily: 'monospace', width: 220, outline: 'none' }} /> },
                      { label: 'Transcription', value: <span style={{ fontSize: 12.5, color: '#3A3A3C', fontWeight: 500 }}>Whisper large-v3-turbo</span> },
                      { label: 'LLM', value: <span style={{ fontSize: 12.5, color: '#3A3A3C', fontWeight: 500 }}>Llama 3.3 70B Versatile</span> },
                    ]
                  },
                  {
                    title: 'Shortcuts', subtitle: 'Global keyboard shortcuts',
                    rows: [
                      { label: 'Toggle Widget', value: <div style={{ display: 'flex', gap: 4 }}>{['Ctrl', 'Shift', 'V'].map((k, i) => (<span key={i}><kbd style={{ fontSize: 11, padding: '3px 7px', borderRadius: 6, background: 'rgba(120,120,128,0.08)', border: '1px solid rgba(60,60,67,0.1)', color: '#3A3A3C', fontFamily: 'inherit' }}>{k}</kbd>{i < 2 && <span style={{ color: '#AEAEB2', fontSize: 11 }}> + </span>}</span>))}</div> },
                    ]
                  },
                ].map(group => (
                  <div key={group.title} style={{ marginBottom: 16, borderRadius: 14, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(60,60,67,0.08)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px 0', borderBottom: '1px solid rgba(60,60,67,0.06)', paddingBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.01em' }}>{group.title}</p>
                      <p style={{ fontSize: 11.5, color: '#AEAEB2' }}>{group.subtitle}</p>
                    </div>
                    {group.rows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < group.rows.length - 1 ? '1px solid rgba(60,60,67,0.06)' : 'none' }}>
                        <p style={{ fontSize: 13, color: '#3A3A3C', fontWeight: 500 }}>{row.label}</p>
                        {row.value}
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ borderRadius: 14, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(60,60,67,0.08)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Promptify</p>
                    <p style={{ fontSize: 11.5, color: '#AEAEB2', marginTop: 2 }}>Version 1.0.0 · MIT License</p>
                  </div>
                  <a href="https://github.com/portgasdyamato/Promptify" target="_blank" rel="noreferrer" className="no-drag"
                    style={{ fontSize: 12, fontWeight: 600, color: '#007AFF', textDecoration: 'none' }}>
                    View on GitHub →
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
