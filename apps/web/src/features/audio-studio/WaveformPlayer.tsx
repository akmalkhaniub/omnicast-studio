'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, FastForward, Radio, Sparkles, MessageSquare, Mic, X, CornerDownLeft } from 'lucide-react';

interface DialogueLine {
  id: string;
  speaker: 'HOST_A' | 'HOST_B';
  speakerName: string;
  avatarColor: string;
  text: string;
  startMs: number;
  endMs: number;
  entityId: string;
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
    entityId: '1', // Gemini 3.8 Flash
  },
  {
    id: '2',
    speaker: 'HOST_B',
    speakerName: 'Jordan (Technical Skeptic)',
    avatarColor: 'from-emerald-500 to-teal-600',
    text: "And what stands out immediately is the sub-300ms roundtrip voice latency. They moved audio processing off the React main thread entirely.",
    startMs: 3450,
    endMs: 7550,
    entityId: '3', // Full-Duplex AudioWorklet
  },
  {
    id: '3',
    speaker: 'HOST_A',
    speakerName: 'Alex (Curious Analyst)',
    avatarColor: 'from-blue-500 to-indigo-600',
    text: "Exactly. By streaming 16kHz linear PCM via an AudioWorklet, you can literally interrupt with your microphone without frame drops.",
    startMs: 7800,
    endMs: 12600,
    entityId: '3', // Full-Duplex AudioWorklet
  },
  {
    id: '4',
    speaker: 'HOST_B',
    speakerName: 'Jordan (Technical Skeptic)',
    avatarColor: 'from-emerald-500 to-teal-600',
    text: "Plus, the knowledge graph connects concepts across papers using multi-hop reasoning, so citations are mathematically grounded.",
    startMs: 12850,
    endMs: 17350,
    entityId: '2', // Graph RAG Ontology
  },
];

interface WaveformPlayerProps {
  onActiveEntityChange?: (entityId: string) => void;
  seekTargetMs?: number | null;
}

export function WaveformPlayer({ onActiveEntityChange, seekTargetMs }: WaveformPlayerProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(4200);
  const [showBargeIn, setShowBargeIn] = useState(false);
  const [question, setQuestion] = useState('');
  const [clarification, setClarification] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Sync seekTargetMs from Mind Map click
  React.useEffect(() => {
    if (seekTargetMs !== undefined && seekTargetMs !== null) {
      setCurrentMs(seekTargetMs);
      setIsPlaying(true);
    }
  }, [seekTargetMs]);

  const activeTurn =
    mockDialogue.find((turn) => currentMs >= turn.startMs && currentMs <= turn.endMs) ||
    mockDialogue[1];

  // Notify parent of active concept for Mind Map illumination
  React.useEffect(() => {
    if (activeTurn && onActiveEntityChange) {
      onActiveEntityChange(activeTurn.entityId);
    }
  }, [activeTurn.entityId, onActiveEntityChange]);

  const handleAskHosts = () => {
    if (!question.trim()) return;
    setIsPlaying(false);
    setIsAnswering(true);
    setTimeout(() => {
      setClarification(
        `Host Jordan: "Great question! Grounded directly in the source architecture: '${question.trim()}' is resolved through Graph RAG's entity relationship index, reducing hallucination by over 60% compared to isolated vector chunks."`
      );
      setIsAnswering(false);
    }, 1200);
  };

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
            <button
              onClick={() => {
                setIsPlaying(false);
                setShowBargeIn(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-full text-xs font-semibold shadow transition animate-pulse"
              title="Pause episode and ask the hosts a clarifying question"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Ask the Hosts</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              1.0x
            </span>
            <Volume2 className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Live Barge-In Question Drawer */}
        {showBargeIn && (
          <div className="mt-3 p-3 bg-zinc-950 rounded-lg border border-rose-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <Mic className="w-3.5 h-3.5" />
                <span>Live Co-Pilot Barge-In (Episode Paused at 00:04)</span>
              </div>
              <button
                onClick={() => {
                  setShowBargeIn(false);
                  setClarification(null);
                }}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {!clarification ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask hosts: e.g. Why Kùzu graph instead of Neo4j?"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskHosts()}
                />
                <button
                  onClick={handleAskHosts}
                  disabled={isAnswering}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded text-xs font-medium transition flex items-center gap-1"
                >
                  {isAnswering ? (
                    <Sparkles className="w-3 h-3 animate-spin" />
                  ) : (
                    <CornerDownLeft className="w-3 h-3" />
                  )}
                  <span>Ask</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-zinc-900/90 rounded border border-emerald-500/30 text-xs text-zinc-200">
                  <div className="text-[10px] text-emerald-400 font-mono mb-1">
                    ✓ GROUNDED CITATION (Graph RAG Engine)
                  </div>
                  <p>{clarification}</p>
                </div>
                <button
                  onClick={() => {
                    setShowBargeIn(false);
                    setClarification(null);
                    setQuestion('');
                    setIsPlaying(true);
                  }}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Resume Episode Playback</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
