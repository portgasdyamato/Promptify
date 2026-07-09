import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const electron = (window as any).require ? (window as any).require('electron') : null;

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
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(0,255,153,0.08)' : 'transparent',
        border: active ? '1px solid rgba(0,255,153,0.2)' : '1px solid transparent',
        color: active ? '#00FF99' : 'rgba(255,255,255,0.44)',
        fontWeight: active ? 600 : 500, fontSize: 13.5,
        boxShadow: active ? '0 0 16px rgba(0,255,153,0.05)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ color: active ? '#00FF99' : 'rgba(255,255,255,0.24)', display: 'flex', transition: 'color 0.2s' }}>{icon}</span>
      {label}
      {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#00FF99', boxShadow: '0 0 8px #00FF99' }} />}
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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#050505', color: '#fff', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      
      {/* ── Background decoration ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,153,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Sidebar ── */}
      <div
        className="glass"
        style={{
          width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', zIndex: 10,
          padding: '0 12px 18px',
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Drag region + title */}
        <div className="drag" style={{ height: 60, display: 'flex', alignItems: 'flex-end', paddingBottom: 14, paddingLeft: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: '#00FF99', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(0,255,153,0.4)' }}>
              <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3.5" fill="#000" />
                <path d="M10 2.5V5M10 15V17.5M2.5 10H5M15 10H17.5" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Promptify</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 12 }}>
          <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 6px' }}>Library</p>
          <NavItem active={tab === 'history'} onClick={() => setTab('history')} label="History"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
          <NavItem active={tab === 'settings'} onClick={() => setTab('settings')} label="Settings"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>} />
        </div>

        {/* Status pill */}
        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              padding: '12px 14px', borderRadius: 14,
              background: 'rgba(0,255,153,0.04)',
              border: '1px solid rgba(0,255,153,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF99', boxShadow: '0 0 8px #00FF99' }} />
              <p style={{ fontSize: 11.5, fontWeight: 600, color: '#00FF99', letterSpacing: '-0.01em' }}>Running in background</p>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>Ctrl+Shift+V to open widget</p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>
        {/* Titlebar */}
        <div className="drag"
          style={{ height: 60, flexShrink: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: 14, paddingLeft: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.01em' }}>
            {tab === 'history' ? 'Prompt History' : 'Settings'}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <AnimatePresence mode="wait">

            {/* ── History ── */}
            {tab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>History</h1>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{history.length} prompts</span>
                </div>

                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      </svg>
                    </div>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: '#fff', marginBottom: 4 }}>No prompts yet</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>Press Ctrl+Shift+V to start dictating</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {history.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="no-drag"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                        style={{
                          borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                          background: expanded === item.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                          border: expanded === item.id ? '1px solid rgba(0,255,153,0.25)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: expanded === item.id ? '0 0 30px rgba(0,255,153,0.04), 0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.3)',
                          transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <div style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#00FF99', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Voice</span>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{item.original_prompt}"
                            </p>
                          </div>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.2" strokeLinecap="round"
                            style={{ transform: expanded === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        <AnimatePresence>
                          {expanded === item.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                              <div style={{ margin: '0 18px 18px', padding: '14px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, fontFamily: 'ui-monospace, monospace' }}>
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
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: 24 }}>Settings</h1>

                {[
                  {
                    title: 'API', subtitle: 'AI model configuration',
                    rows: [
                      { label: 'Groq API Key', value: <input type="password" value="gsk_••••••••••••••••••••••••" readOnly className="no-drag" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '6px 12px', fontSize: 12, color: 'rgba(255,255,255,0.44)', fontFamily: 'monospace', width: 240, outline: 'none' }} /> },
                      { label: 'Transcription', value: <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Whisper large-v3-turbo</span> },
                      { label: 'LLM Preset', value: <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>Llama 3.3 70B Versatile</span> },
                    ]
                  },
                  {
                    title: 'Keyboard Shortcuts', subtitle: 'System-wide hotkeys',
                    rows: [
                      { label: 'Toggle Widget', value: <div style={{ display: 'flex', gap: 4 }}>{['Ctrl', 'Shift', 'V'].map((k, i) => (<span key={i}><kbd style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#00FF99', fontFamily: 'inherit', fontWeight: 600, boxShadow: '0 0 10px rgba(0,255,153,0.05)' }}>{k}</kbd>{i < 2 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}> + </span>}</span>))}</div> },
                    ]
                  },
                ].map(group => (
                  <div key={group.title} style={{ marginBottom: 18, borderRadius: 16, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{group.title}</p>
                      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)' }}>{group.subtitle}</p>
                    </div>
                    {group.rows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < group.rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>{row.label}</p>
                        {row.value}
                      </div>
                    ))}
                  </div>
                ))}

                <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Promptify Desktop</p>
                    <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>Version 1.0.0 · MIT License</p>
                  </div>
                  <a href={GITHUB} target="_blank" rel="noreferrer" className="no-drag"
                    style={{ fontSize: 12.5, fontWeight: 600, color: '#00FF99', textDecoration: 'none', transition: 'all 0.2s', textShadow: '0 0 10px rgba(0,255,153,0.2)' }}
                    onMouseEnter={e=>e.currentTarget.style.color='#fff'}
                    onMouseLeave={e=>e.currentTarget.style.color='#00FF99'}>
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
