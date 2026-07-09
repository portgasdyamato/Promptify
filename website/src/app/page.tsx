"use client";

import { motion } from 'framer-motion';
import { Mic, Download, ArrowRight, Zap, Keyboard, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Mic className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-semibold text-lg tracking-wide">Promptify</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
            Download
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now available for Windows
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
          >
            Dictate thoughts. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Generate magic.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto"
          >
            A persistent desktop widget that listens to your voice and instantly generates highly-optimized AI prompts directly into your active window.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
              Download for Windows
            </button>
            <button className="flex items-center gap-2 bg-zinc-900 text-white border border-zinc-800 px-8 py-4 rounded-full font-semibold text-lg hover:bg-zinc-800 transition-colors">
              View Documentation <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Floating Widget Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-4xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 h-full" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative p-4 flex justify-center">
            
            <div className="w-[600px] bg-black/80 backdrop-blur-3xl border border-white/10 p-2 rounded-3xl shadow-2xl flex items-center gap-3 relative z-20 mt-12 mb-32">
              <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-pulse" />
              <div className="flex-shrink-0 pl-3 z-10">
                <Mic className="w-6 h-6 text-blue-400" />
              </div>
              <input
                readOnly
                value="Write an email to my team about the launch..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 text-xl py-4 z-10"
              />
              <div className="flex items-center gap-2 pr-2 z-10">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Always there when you need it</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Promptify runs quietly in the background. Press a shortcut, speak your mind, and watch the optimized prompt appear in any application.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Keyboard className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Shortcut</h3>
              <p className="text-zinc-400 leading-relaxed">
                Press <kbd className="bg-zinc-800 px-2 py-1 rounded text-sm text-zinc-300">Ctrl+Shift+V</kbd> anywhere in Windows to instantly summon the dictation widget.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Injection</h3>
              <p className="text-zinc-400 leading-relaxed">
                Promptify directly types the generated output into your active window. No copying or pasting required.
              </p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">LLM Powered</h3>
              <p className="text-zinc-400 leading-relaxed">
                Powered by Whisper for transcription and Llama 3.3 for generating the most comprehensive prompts imaginable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-zinc-500">
        <p>© 2026 Promptify. All rights reserved.</p>
      </footer>
    </div>
  );
}
