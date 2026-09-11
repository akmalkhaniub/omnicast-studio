'use client';

import React, { useState } from 'react';
import { Radio, Sparkles, X, CheckCircle2, Loader2, Play } from 'lucide-react';
import { graphqlClient, GRAPHQL_QUERIES } from '@/shared/graphql/client';

interface PodcastGenerationModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onEpisodeGenerated: (episodeId: string) => void;
}

export function PodcastGenerationModal({
  workspaceId,
  isOpen,
  onClose,
  onEpisodeGenerated,
}: PodcastGenerationModalProps) {
  const [topic, setTopic] = useState('Deep-Tech Architecture & Trade-Offs');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [hostAPersonality, setHostAPersonality] = useState('Curious Technical Analyst');
  const [hostBPersonality, setHostBPersonality] = useState('Domain Expert & Practical Skeptic');
  const [debateMode, setDebateMode] = useState<'DEVILS_ADVOCATE' | 'ACADEMIC_VS_FOUNDER' | 'INVESTIGATIVE_DEBATE'>('DEVILS_ADVOCATE');
  const [tensionLevel, setTensionLevel] = useState(0.7);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    setError(null);
    setProgressStep('Analyzing Knowledge Graph & Communities...');

    try {
      setTimeout(() => setProgressStep('Scripting Dual-Host Dialogue (Gemini 3.8)...'), 1000);
      setTimeout(() => setProgressStep('Synthesizing Kokoro-82M Neural Audio...'), 2500);

      const result = await graphqlClient.mutation(GRAPHQL_QUERIES.TRIGGER_PODCAST_SYNTHESIS, {
        input: {
          workspaceId,
          topic,
          targetDurationMinutes: durationMinutes,
          hostAPersonality,
          hostBPersonality,
          debateMode,
          tensionLevel,
        },
      });

      if (result.error) {
        setError(result.error.message);
        setIsSynthesizing(false);
      } else {
        const episode = result.data?.triggerPodcastSynthesis;
        setProgressStep('Episode Mastered to -16 LUFS!');
        setTimeout(() => {
          onEpisodeGenerated(episode?.id || 'new_ep');
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(String(err));
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-zinc-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">Synthesize Dual-Host Deep-Dive</h2>
          </div>
          <button onClick={onClose} disabled={isSynthesizing} className="p-1 text-zinc-400 hover:text-zinc-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Episode Focus / Topic</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Graph RAG vs Baseline Retrieval"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Host A (Analyst)</label>
              <input
                type="text"
                value={hostAPersonality}
                onChange={(e) => setHostAPersonality(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Host B (Skeptic / Expert)</label>
              <input
                type="text"
                value={hostBPersonality}
                onChange={(e) => setHostBPersonality(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Debate Mode & Tension Slider */}
          <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Debate & Conversational Dynamics</label>
              <select
                value={debateMode}
                onChange={(e) => setDebateMode(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="DEVILS_ADVOCATE">Devil's Advocate (Rigorous Critical Scrutiny)</option>
                <option value="ACADEMIC_VS_FOUNDER">Academic vs. Tech Founder (Theory vs. Shipping Speed)</option>
                <option value="INVESTIGATIVE_DEBATE">Investigative Journalism (Skepticism & Auditing)</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Debate Tension Level</span>
                <span className="font-mono text-indigo-400">{Math.round(tensionLevel * 100)}% Sparring</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.1}
                value={tensionLevel}
                onChange={(e) => setTensionLevel(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Target Duration: {durationMinutes} Minutes</label>
            <input
              type="range"
              min={2}
              max={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {isSynthesizing && (
            <div className="p-3 bg-zinc-950/80 rounded-lg border border-indigo-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{progressStep}</span>
                </span>
                <span className="font-mono text-zinc-500">Autonomous</span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 animate-pulse w-3/4 rounded-full" />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSynthesizing}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSynthesizing}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Podcast Episode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
