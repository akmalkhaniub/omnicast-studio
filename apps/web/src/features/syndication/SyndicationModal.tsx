'use client';

import React, { useState } from 'react';
import { Share2, Rss, Video, FileDown, Copy, Check, X, ExternalLink } from 'lucide-react';

interface SyndicationModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SyndicationModal({ workspaceId, isOpen, onClose }: SyndicationModalProps) {
  const [copied, setCopied] = useState(false);
  const rssUrl = `http://localhost:8000/feed/${workspaceId}/podcast.xml`;

  if (!isOpen) return null;

  const handleCopyRss = () => {
    navigator.clipboard.writeText(rssUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-zinc-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">1-Click Multi-Platform Syndication</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channels */}
        <div className="space-y-3">
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-medium transition">
              <FileDown className="w-3.5 h-3.5" />
              <span>Render MP4</span>
            </button>
          </div>

          {/* 9:16 Shorts / Reels Export */}
          <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                📱
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">TikTok & Shorts Vertical Video</span>
                <span className="text-[11px] text-zinc-400">9:16 Vertical with kinetic subtitles</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition">
              <FileDown className="w-3.5 h-3.5" />
              <span>Render Short</span>
            </button>
          </div>

          {/* Notion Knowledge Base Sync */}
          <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                📓
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Notion Knowledge Base</span>
                <span className="text-[11px] text-zinc-400">Export concept mind map & summary as a page</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition">
              <span>Export Page</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
