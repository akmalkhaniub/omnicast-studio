'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Zap,
  FileCheck2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface VerifiedClaim {
  id: string;
  claim: string;
  source: string;
  confidence: number;
  snippet: string;
  verified: boolean;
}

const mockClaims: VerifiedClaim[] = [
  {
    id: 'c1',
    claim: 'Traditional vector search yields isolated snippets without structural relational context.',
    source: 'Graph RAG vs Baseline Retrieval (p. 2)',
    confidence: 0.98,
    snippet: 'Vector search retrieves localized embeddings but lacks global graph topology...',
    verified: true,
  },
  {
    id: 'c2',
    claim: 'Decoupling the 16kHz PCM AudioWorklet from the React UI thread achieves sub-300ms latency.',
    source: 'System Architecture Specification (SPEC.md - ADR-003)',
    confidence: 0.95,
    snippet: 'Zero-copy ring buffer offloads continuous audio ingestion onto the browser Web Audio thread.',
    verified: true,
  },
  {
    id: 'c3',
    claim: 'Embedding Kùzu directly into local process space eliminates distributed network hops.',
    source: 'SPEC.md (ADR-005: Polyglot Graph Storage)',
    confidence: 0.96,
    snippet: 'Kùzu runs embedded via C-extensions, executing sub-millisecond Cypher traversals in-memory.',
    verified: true,
  },
  {
    id: 'c4',
    claim: 'Dual-host dialogue adheres strictly to EBU R128 broadcast loudness normalization at -16 LUFS.',
    source: 'Audio Synthesis Specification (ADR-004)',
    confidence: 0.99,
    snippet: 'Post-processing applies multi-band compression and true-peak limiter conforming to -16 LUFS.',
    verified: true,
  },
];

export interface EvaluationDashboardProps {
  episodeId?: string;
}

export function EvaluationDashboard({ episodeId }: EvaluationDashboardProps = {}) {
  return (
    <div className="w-full h-full bg-zinc-950 rounded-lg border border-zinc-800 p-5 overflow-y-auto space-y-5 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
              DeepEval RAG Triad & Studio Observability
            </h2>
            <p className="text-[11px] text-zinc-400">
              Automated Fact-Checking, Hallucination Audits, and SRE Telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RAG Triad Gate: PASSED</span>
          </span>
        </div>
      </div>

      {/* RAG Triad Gauges */}
      <div className="grid grid-cols-3 gap-4">
        {/* Faithfulness */}
        <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Faithfulness Score</span>
            <span className="font-mono text-emerald-400 font-bold">Goal ≥ 0.90</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">0.94</span>
            <span className="text-xs text-emerald-500 font-semibold">Verified Grounded</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
          </div>
        </div>

        {/* Answer Relevance */}
        <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Answer Relevance</span>
            <span className="font-mono text-indigo-400 font-bold">Goal ≥ 0.85</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-400 font-mono">0.96</span>
            <span className="text-xs text-indigo-400 font-semibold">High Thematic Fidelity</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full w-[96%]" />
          </div>
        </div>

        {/* Hallucination Rate */}
        <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Hallucination Rate</span>
            <span className="font-mono text-rose-400 font-bold">Limit ≤ 0.10</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-400 font-mono">0.04</span>
            <span className="text-xs text-teal-400 font-semibold">Strict Guardrail Pass</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full w-[4%]" />
          </div>
        </div>
      </div>

      {/* Claim-by-Claim Citation Verification Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Claim-by-Claim Citation Verification Matrix</span>
          </h3>
          <span className="text-[11px] text-zinc-400">4 / 4 Claims Grounded in Knowledge Graph</span>
        </div>

        <div className="space-y-2">
          {mockClaims.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-zinc-200">{item.claim}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-900">
                  {Math.round(item.confidence * 100)}% Confidence
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pl-6">
                <span>Source: <strong className="text-indigo-400">{item.source}</strong></span>
                <span className="italic text-zinc-500 truncate max-w-sm">"{item.snippet}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time SRE SLO & Latency Telemetry */}
      <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
        <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real-time SRE SLO Telemetry</span>
        </h3>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">Gemini 3.8 TTFT</span>
            <span className="font-mono text-zinc-200 font-bold">142 ms</span>
          </div>
          <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">AudioWorklet Latency</span>
            <span className="font-mono text-emerald-400 font-bold">238 ms (p95)</span>
          </div>
          <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">Kokoro-82M RTF</span>
            <span className="font-mono text-indigo-400 font-bold">0.18x Real-Time</span>
          </div>
          <div className="p-2.5 bg-zinc-950 rounded border border-zinc-800/60">
            <span className="text-zinc-500 block text-[10px]">Total Session Tokens</span>
            <span className="font-mono text-amber-400 font-bold">12,480 Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
}
