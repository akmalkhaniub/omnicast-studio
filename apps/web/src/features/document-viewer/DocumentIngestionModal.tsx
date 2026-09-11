'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, Link2, X, CheckCircle2, Loader2 } from 'lucide-react';
import { graphqlClient, GRAPHQL_QUERIES } from '@/shared/graphql/client';

interface DocumentIngestionModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
}

export function DocumentIngestionModal({
  workspaceId,
  isOpen,
  onClose,
  onIngestSuccess,
}: DocumentIngestionModalProps) {
  const [sourceType, setSourceType] = useState<'PDF' | 'URL' | 'MARKDOWN'>('MARKDOWN');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await graphqlClient.mutation(GRAPHQL_QUERIES.INGEST_DOCUMENT, {
        input: {
          workspaceId,
          title,
          sourceType,
          content,
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        onIngestSuccess();
        onClose();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 text-zinc-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">Ingest Research Source</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Type Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(['MARKDOWN', 'URL', 'PDF'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSourceType(type)}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${
                sourceType === type
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750'
              }`}
            >
              {type === 'MARKDOWN' && '📝 Text / Doc'}
              {type === 'URL' && '🔗 Web Article'}
              {type === 'PDF' && '📑 Research PDF'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Source Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FlashAttention-3 Architecture & Benchmarks"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              {sourceType === 'URL' ? 'Source URL' : 'Document Content (Markdown / Text)'}
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                sourceType === 'URL'
                  ? 'https://arxiv.org/abs/2407.08608...'
                  : 'Paste abstract, methodology, results, or notes here...'
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Graph...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ingest & Index</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
