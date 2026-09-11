'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, Radio, Sparkles, MessageSquare } from 'lucide-react';

interface DialogueLine {
  id: string;
  speaker: 'HOST_A' | 'HOST_B';
  speakerName: string;
  avatarColor: string;
  text: string;
  startMs: number;
  endMs: number;
}

const mockDialogue: DialogueLine[] = [
  {
    id: '1',
    speaker: 'HOST_A',
    speakerName: 'Alex (Curious Analyst)',
    avatarColor: 'from-blue-500 to-indigo-600',
    text: "Welcome back to OmniCast Deep-Dives! Today we are looking at the new Graph RAG and voice streaming architecture.",
    startMs: 0,
    endMs: 3200,
  },
  {
    id: '2',
    speaker: 'HOST_B',
    speakerName: 'Jordan (Technical Skeptic)',
    avatarColor: 'from-emerald-500 to-teal-600',
    text: "And what stands out immediately is the sub-300ms roundtrip voice latency. They moved audio processing off the React main thread entirely.",
    startMs: 3450,
    endMs: 7550,
  },
  {
    id: '3',
    speaker: 'HOST_A',
    speakerName: 'Alex (Curious Analyst)',
    avatarColor: 'from-blue-500 to-indigo-600',
    text: "Exactly. By streaming 16kHz linear PCM via an AudioWorklet, you can literally interrupt with your microphone without frame drops.",
    startMs: 7800,
    endMs: 12600,
  },
  {
    id: '4',
    speaker: 'HOST_B',
    speakerName: 'Jordan (Technical Skeptic)',
    avatarColor: 'from-emerald-500 to-teal-600',
    text: "Plus, the knowledge graph connects concepts across papers using multi-hop reasoning, so citations are mathematically grounded.",
    startMs: 12850,
    endMs: 17350,
  },
];

export function WaveformPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(4200);

  const activeTurn = mockDialogue.find(
    (turn) => currentMs >= turn.startMs && currentMs <= turn.endMs
  ) || mockDialogue[1];

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 rounded-lg border border-zinc-800 p-4 justify-between">
      {/* Active Speaker Banter HUD */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${activeTurn.avatarColor} flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-indigo-500/50`}>
            {activeTurn.speaker === 'HOST_A' ? 'A' : 'J'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-200">{activeTurn.speakerName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                SPEAKING
              </span>
            </div>
            <span className="text-xs text-zinc-400">Mastered: -16 LUFS (Stereo Panned)</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Kokoro-82M Neural Synthesis</span>
        </div>
      </div>

      {/* Synchronized Transcript View */}
      <div className="my-4 space-y-2 overflow-y-auto max-h-[160px] pr-2">
        {mockDialogue.map((turn) => {
          const isActive = currentMs >= turn.startMs && currentMs <= turn.endMs;
          return (
            <div
              key={turn.id}
              className={`p-2.5 rounded-lg text-xs transition ${
                isActive
                  ? 'bg-zinc-800/90 border border-indigo-500/40 text-zinc-100 shadow'
                  : 'bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800/40'
              }`}
            >
              <div className="font-semibold text-zinc-300 mb-0.5">{turn.speakerName.split(' ')[0]}:</div>
              <p>{turn.text}</p>
            </div>
          );
        })}
      </div>

      {/* Audio Controls & Timeline Scrubber */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        {/* Scrubber Bar */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <span>00:04</span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer">
            <div className="absolute top-0 bottom-0 left-0 w-1/4 bg-indigo-500 rounded-full" />
          </div>
          <span>05:00</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="p-2 text-zinc-400 hover:text-zinc-200 transition">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="p-2 text-zinc-400 hover:text-zinc-200 transition">
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              1.0x
            </span>
            <Volume2 className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
