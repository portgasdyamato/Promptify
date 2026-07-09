import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, History, Mic, Play, ArrowRight, Activity, Cpu } from 'lucide-react';
const electron = window.require ? window.require('electron') : null;

export default function Home() {
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  useEffect(() => {
    if (electron) {
      electron.ipcRenderer.invoke('get-history').then(setHistory).catch(console.error);
    } else {
      // Mock data for web preview
      setHistory([
        { id: 1, original_prompt: 'Write an email to my boss about the meeting', optimized_prompt: 'Act as a professional communication expert. Draft an email to my manager summarizing the key points of our recent meeting...', timestamp: new Date().toISOString() },
        { id: 2, original_prompt: 'Explain quantum computing', optimized_prompt: 'You are an expert physicist. Explain the fundamentals of quantum computing in simple terms suitable for a high school student...', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ]);
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white flex overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col p-4 gap-2 pt-8 drag-region">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Mic className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-semibold text-lg tracking-wide">Promptify</span>
        </div>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all non-drag-region ${activeTab === 'history' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all non-drag-region ${activeTab === 'settings' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Settings</span>
        </button>

        <div className="mt-auto">
          <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl">
            <h4 className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Background Active</h4>
            <p className="text-[10px] text-zinc-400 leading-tight">Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded mx-0.5 text-zinc-300">Ctrl+Shift+V</kbd> anywhere to open the widget.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-zinc-950 relative">
        {/* Titlebar for dragging */}
        <div className="h-8 absolute top-0 left-0 w-full drag-region z-50"></div>

        <div className="flex-1 overflow-y-auto p-8 pt-12">
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><History className="text-zinc-500 w-6 h-6"/> Prompt History</h2>
              
              <div className="flex flex-col gap-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <Mic className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No history yet. Press Ctrl+Shift+V to start dictating.</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      key={item.id} 
                      className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-zinc-800 text-xs rounded text-zinc-300">Voice Command</span>
                          <span className="text-xs text-zinc-500">{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-lg font-medium text-white">"{item.original_prompt}"</p>
                      </div>
                      <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                        <p className="text-sm text-zinc-300 leading-relaxed font-mono">{item.optimized_prompt}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><Settings className="text-zinc-500 w-6 h-6"/> Settings</h2>
              
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-400"/> API Configuration</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-400">Groq API Key</label>
                  <input 
                    type="password" 
                    value="************************"
                    readOnly
                    className="bg-black border border-zinc-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">To change this, update your .env file and restart the application.</p>
                </div>
                
                <div className="h-px bg-zinc-800 my-6"></div>

                <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Play className="w-5 h-5 text-blue-400"/> Shortcuts</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">Toggle Widget</p>
                      <p className="text-xs text-zinc-500">Show or hide the floating dictation widget</p>
                    </div>
                    <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 font-mono shadow-sm">Ctrl + Shift + V</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* CSS for drag regions */}
      <style>{`
        .drag-region { -webkit-app-region: drag; }
        .non-drag-region { -webkit-app-region: no-drag; }
      `}</style>
    </div>
  );
}
