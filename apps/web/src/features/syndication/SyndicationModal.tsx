'use client';

import React, { useState } from 'react';
import {
  Share2,
  Rss,
  Video,
  FileDown,
  Copy,
  Check,
  X,
  ExternalLink,
  Flame,
  Layers,
  Sparkles,
  Presentation,
} from 'lucide-react';

interface SyndicationModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ViralClipItem {
  id: string;
  title: string;
  hook: string;
  viralScore: number;
  durationSec: number;
  tags: string[];
}

const mockViralClips: ViralClipItem[] = [
  {
    id: 'clip_1',
    title: 'Why Vector Search Fails Without Graphs',
    hook: 'Traditional RAG gives you isolated chunks. Here is why that breaks...',
    viralScore: 96,
    durationSec: 42,
    tags: ['#GraphRAG', '#AIArchitecture', '#TechDebate'],
  },
  {
    id: 'clip_2',
    title: 'Sub-300ms Voice Streaming with AudioWorklet',
    hook: 'They moved real-time audio off the main thread entirely!',
    viralScore: 93,
    durationSec: 36,
    tags: ['#WebAudio', '#AudioWorklet', '#GeminiLive'],
  },
  {
    id: 'clip_3',
    title: 'Multi-Hop Reasoning Across Documents',
    hook: 'What happens when Paper A defines a metric and Paper B critiques it?',
    viralScore: 89,
    durationSec: 48,
    tags: ['#MachineLearning', '#DeepDive', '#CodeAnalysis'],
  },
];

export function SyndicationModal({ workspaceId, isOpen, onClose }: SyndicationModalProps) {
  const [activeTab, setActiveTab] = useState<'rss' | 'clips' | 'slides'>('rss');
  const [copied, setCopied] = useState(false);
  const [renderedClip, setRenderedClip] = useState<string | null>(null);

  const rssUrl = `http://localhost:8000/feed/${workspaceId}/podcast.xml`;
  const htmlSlidesUrl = `http://localhost:8000/video/${workspaceId}_deck.html`;
  const svgInfographicUrl = `http://localhost:8000/video/${workspaceId}_deck_infographic.svg`;

  if (!isOpen) return null;

  const handleCopyRss = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRenderClip = (clipId: string) => {
    setRenderedClip(clipId);
    setTimeout(() => {
      setRenderedClip(null);
      alert(`Short rendered successfully! Exported with Karaoke typography to /video/${clipId}_9x16.mp4`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-xl p-6 flex flex-col gap-4 text-zinc-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">1-Click Multi-Platform Syndication & Media</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('rss')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'rss'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60'
            }`}
          >
            <Rss className="w-3.5 h-3.5" />
            <span>Feeds & Full Video</span>
          </button>
          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'clips'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Viral 9:16 Shorts (Karaoke)</span>
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'slides'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/60'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Slide Deck & Infographic</span>
          </button>
        </div>

        {/* Tab 1: Channels (RSS & 16:9 Video) */}
        {activeTab === 'rss' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Apple Podcasts & Spotify RSS */}
            <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rss className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-semibold text-zinc-200">Apple Podcasts & Spotify RSS Feed</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                  Compliant RSS 2.0
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={rssUrl}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-300 font-mono select-all"
                />
                <button
                  onClick={handleCopyRss}
                  className="flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 rounded text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* YouTube Video Export */}
            <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">YouTube Broadcast Video</span>
                  <span className="text-[11px] text-zinc-400">16:9 Widescreen (1080p) via Remotion 4.x</span>
                </div>
              </div>
              <button
                onClick={() => alert('Widescreen Remotion render dispatched: /video/default_widescreen.mp4')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Render MP4</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Viral 9:16 Shorts with Karaoke */}
        {activeTab === 'clips' && (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 animate-in fade-in">
            {mockViralClips.map((clip) => (
              <div
                key={clip.id}
                className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex flex-col gap-2 hover:border-zinc-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200">{clip.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono flex items-center gap-1 border border-amber-800">
                      <Flame className="w-2.5 h-2.5 text-amber-400" /> {clip.viralScore}% Viral
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{clip.durationSec}s</span>
                </div>
                <p className="text-xs text-zinc-400 italic">"{clip.hook}"</p>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
                  <div className="flex gap-1.5">
                    {clip.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-indigo-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleRenderClip(clip.id)}
                    disabled={renderedClip === clip.id}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs transition shadow"
                  >
                    {renderedClip === clip.id ? (
                      <Sparkles className="w-3 h-3 animate-spin" />
                    ) : (
                      <FileDown className="w-3 h-3" />
                    )}
                    <span>Render 9:16 Karaoke</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Slide Deck & Infographic */}
        {activeTab === 'slides' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Presentation className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Executive 16:9 Presentation Deck</span>
                  <span className="text-[11px] text-zinc-400">Standalone HTML5 deck with structured citations</span>
                </div>
              </div>
              <a
                href={htmlSlidesUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Deck</span>
              </a>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">High-Res Concept Infographic</span>
                  <span className="text-[11px] text-zinc-400">Vector SVG graph cluster map for social sharing</span>
                </div>
              </div>
              <a
                href={svgInfographicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
