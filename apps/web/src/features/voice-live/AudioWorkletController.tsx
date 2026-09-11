'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Zap, ShieldCheck, Activity } from 'lucide-react';

export function AudioWorkletController() {
  const [isLiveVoiceActive, setIsLiveVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [latencyMs, setLatencyMs] = useState(245);

  const toggleVoiceMode = () => {
    setIsLiveVoiceActive(!isLiveVoiceActive);
    if (!isLiveVoiceActive) {
      // Simulate live connection & barge-in listener
      setTimeout(() => setIsSpeaking(true), 1200);
      setTimeout(() => setIsSpeaking(false), 3800);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900/80 rounded-lg border border-zinc-800 p-4 justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-zinc-200">Gemini Live Voice Mode</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
          AudioWorklet 16kHz
        </span>
      </div>

      {/* Reactive Voice Orb Visualizer */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings when active */}
          {isLiveVoiceActive && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-indigo-500/30 animate-pulse" />
            </>
          )}

          {/* Center Mic Button */}
          <button
            onClick={toggleVoiceMode}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${
              isLiveVoiceActive
                ? 'bg-gradient-to-tr from-indigo-600 to-rose-600 ring-4 ring-indigo-400/40 scale-105'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {isLiveVoiceActive ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-medium text-zinc-200">
            {isLiveVoiceActive
              ? isSpeaking
                ? 'User Speaking (Barge-In Active)...'
                : 'Listening... (Speak to Interrupt)'
              : 'Click to Start Full-Duplex Voice'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Instant &lt;20ms audio cutoff upon speech detection
          </p>
        </div>
      </div>

      {/* Latency & Telemetry Waterfall HUD */}
      <div className="pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
        <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">VAD Cutoff</span>
          <span className="text-emerald-400 font-semibold">12 ms</span>
        </div>
        <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">TTFT (Gemini)</span>
          <span className="text-indigo-400 font-semibold">88 ms</span>
        </div>
        <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
          <span className="text-zinc-500 block text-[10px]">Total Latency</span>
          <span className="text-amber-400 font-semibold">{latencyMs} ms</span>
        </div>
      </div>
    </div>
  );
}
