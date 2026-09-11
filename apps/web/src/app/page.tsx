'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Radio,
  FileText,
  UploadCloud,
  Share2,
  ExternalLink,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { MindMapCanvas } from '@/features/mind-map/MindMapCanvas';
import { WaveformPlayer } from '@/features/audio-studio/WaveformPlayer';
import { AudioWorkletController } from '@/features/voice-live/AudioWorkletController';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'documents'>('mindmap');

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Global Studio Header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-bold text-white shadow-lg">
            🎙️
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100">OmniCast Studio</h1>
            <p className="text-[11px] text-zinc-400">Autonomous Multimodal Research & Broadcast Platform</p>
          </div>
        </div>

        {/* Model & Architecture Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini 3.8 Flash + Live API</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Graph RAG Active</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition shadow">
            <Share2 className="w-3.5 h-3.5" />
            <span>1-Click Publish (RSS/YT)</span>
          </button>
        </div>
      </header>

      {/* Main Multi-Pane Workspace */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left / Center 8 Columns: Concept Mind Map & Source Documents */}
        <section className="col-span-8 flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'mindmap'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Interactive Concept Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'documents'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ingested Sources (3 Docs)</span>
              </button>
            </div>

            <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md transition">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Add Source (PDF / URL / YT)</span>
            </button>
          </div>

          <div className="flex-1 w-full h-full min-h-0">
            {activeTab === 'mindmap' ? (
              <MindMapCanvas />
            ) : (
              <div className="w-full h-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-y-auto">
                <h3 className="font-semibold text-zinc-200 mb-2">Ingested Research Corpus</h3>
                <ul className="space-y-2">
                  <li className="p-3 bg-zinc-950/80 rounded border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-indigo-400">1. FlashAttention-3 Architecture.pdf</span>
                      <p className="text-zinc-400 text-[11px]">42,100 tokens · 18 concepts extracted · Grounded</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">100% Verified</span>
                  </li>
                  <li className="p-3 bg-zinc-950/80 rounded border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-indigo-400">2. Graph RAG vs Baseline Retrieval.pdf</span>
                      <p className="text-zinc-400 text-[11px]">28,400 tokens · 12 concepts extracted · Grounded</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono">100% Verified</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Right 4 Columns: Dual-Host Audio Studio & Full-Duplex Voice Controller */}
        <section className="col-span-4 flex flex-col h-full gap-4">
          <div className="h-3/5 min-h-0">
            <WaveformPlayer />
          </div>
          <div className="h-2/5 min-h-0">
            <AudioWorkletController />
          </div>
        </section>
      </main>

      {/* Footer Status & Syndication Bar */}
      <footer className="h-9 border-t border-zinc-800 bg-zinc-900/80 px-6 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>FastAPI Core: Ready</span>
          </span>
          <span>Feed: http://localhost:8000/feed/default/podcast.xml</span>
        </div>
        <div className="flex items-center gap-3">
          <span>EBU R128: -16.1 LUFS</span>
          <span>AudioWorklet: 16kHz PCM</span>
        </div>
      </footer>
    </div>
  );
}
