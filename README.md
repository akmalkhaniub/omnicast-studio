# 🎙️ OmniCast Studio
### The Open-Source Autonomous Multimodal Research, Graph RAG, & Broadcast Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3%20(React%2019)-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.14%20%2B%20uv-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.14">
  <img src="https://img.shields.io/badge/GraphQL-Strawberry-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL">
  <img src="https://img.shields.io/badge/Storage-MongoDB%20%2B%20GraphDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB + GraphDB">
  <img src="https://img.shields.io/badge/AI-Gemini%203.8%20%2B%20Live%20API-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini 3.8">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT">
</p>

> **Transform dense documents, research publications, and codebase specs into interactive concept mind maps, multi-speaker conversational podcasts, broadcast-ready videos, and real-time voice conversations.**

OmniCast Studio is an enterprise-grade, spec-driven alternative to Google NotebookLM. Designed for researchers, engineering architects, and content creators, it turns static documentation into dynamic, cross-linked multimodal media with verifiable citations.

---

## 🌟 Key Capabilities

1. **🧠 Interactive Concept Mind Maps (`@xyflow/react` + GraphDB):**
   - Ingests PDFs, articles, and repos to automatically extract an interconnected entity-relationship graph (`Concept`, `Methodology`, `Person`, `Metric`).
   - Click any node on the zoomable canvas to instantly jump to the exact source page and paragraph.
2. **🎙️ Dual-Host Deep-Dive Podcasts ("Audio Overviews"):**
   - Powered by **Gemini 3.8 Flash** with natural conversational banter, realistic interruptions, laughter, and microsecond-level timing.
   - Dual-voice neural synthesis (**Kokoro-82M ONNX** local zero-cost / Cartesia Sonic) mastered to **EBU R128 (-16 LUFS)** standards with stereo panning.
3. **🎬 Programmatic Video Studio (Remotion 4.x):**
   - Automatically renders 16:9 widescreen YouTube presentations with concept slide cards and 9:16 vertical Shorts with audio-reactive waveforms and kinetic subtitles.
4. **🗣️ Full-Duplex Voice Chat with "Interrupt & Ask" (Gemini Multimodal Live):**
   - Sub-300ms roundtrip voice conversation via WebSockets and native `AudioWorklet`.
   - While listening to a podcast or watching a video overview, speak aloud—playback pauses instantly (<20ms barge-in cutoff), answers your question conversationally, and resumes playback.
5. **🚀 One-Click Multi-Platform Syndication:**
   - Automated generation of iTunes & Spotify compliant **RSS 2.0 Podcast Feeds**.
   - Direct export to YouTube, LinkedIn slide carousels, and Notion knowledge bases.

---

## 🏛️ Comprehensive Engineering Documentation Suite

OmniCast Studio follows strict **Spec-Driven Development (SDD)** with formal contracts:

* 📄 [**Product Requirements Document (PRD.md)**](./PRD.md): Target personas, MoSCoW functional requirements, and success KPIs.
* 🏛️ [**System Design & C4 Blueprint (SYSTEM_DESIGN.md)**](./SYSTEM_DESIGN.md): Context, Container, and Component diagrams with full sequence lifecycles.
* 📋 [**Architecture Decision Records (ADR.md)**](./SPEC.md): Formal architectural justifications (ADRs 001–008).
* 🛡️ [**Security & Threat Model (SECURITY.md)**](./SECURITY.md): OWASP Top 10 for LLM Applications, prompt injection defense, and audio privacy.
* 🧪 [**Continuous Evaluation Rubric (EVALUATION_RUBRIC.md)**](./EVALUATION_RUBRIC.md): DeepEval / Ragas RAG Triad benchmarks and Faithfulness ($\ge 0.90$) gates.
* 📊 [**SRE & SLO Framework (SLO_FRAMEWORK.md)**](./SLO_FRAMEWORK.md): Latency budgets, error budget burn rates, and incident playbooks.
* 🤖 [**Agent Guidelines (AGENTS.md)**](./AGENTS.md): Binding architectural invariants and coding rules for AI assistants.
* 🔌 [**Contract-First GraphQL Schema (contracts/schema.graphql)**](./contracts/schema.graphql): The single source of truth for all API contracts.

---

## 🛠️ Complete State-of-the-Art Tech Stack

```
Frontend:            Next.js 16 (React 19, Turbopack, App Router)
Styling:             Tailwind CSS v4 + Radix UI + Lucide
Audio Hardware:      Web Audio API AudioWorklet (16kHz linear PCM zero-copy)
Mind Map Canvas:     @xyflow/react (React Flow) + ELKjs layout engine
Video Rendering:     Remotion 4.x + Hardware-Accelerated FFmpeg (NVENC)
Backend Gateway:     FastAPI 0.115+ (Python 3.14 managed via uv)
API Protocol:        Strawberry GraphQL (Contract-First) + Binary WebSockets
Document Store:      MongoDB 7.0 / 8.0 (Async Motor / Beanie ODM)
Knowledge Graph:     GraphDB (Embedded Kùzu or containerized Memgraph/Neo4j)
Reasoning Models:    Google GenAI SDK (Gemini 3.8 Flash & Gemini 3.1 Pro)
Live Voice Mode:     Gemini Multimodal Live API (Bidirectional WebSockets)
Speech Synthesis:    Kokoro-82M (Local ONNX) + Cartesia Sonic (Cloud)
Audio DSP Engine:    Rust SIMD DSP (audio-dsp-rs) for EBU R128 loudness mastering
Observability:       Langfuse v3 (LLM Tracing & Prompts) + OpenTelemetry (OTel)
Quality Gates:       DeepEval / Ragas Continuous Evals + Gitleaks
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
* **Python 3.13+** with **`uv`** package manager installed.
* **Node.js 20+** with **`pnpm`** installed.
* **Docker & Docker Compose** (for MongoDB and Memgraph).

### 2. Clone & Configure
```bash
git clone https://github.com/akmalkhaniub/omnicast-studio.git
cd omnicast-studio

# Copy environment variables
cp .env.example .env
```

### 3. Start Storage Infrastructure
```bash
docker compose up -d mongodb memgraph
```

### 4. Start Core API Backend
```bash
cd services/core-api
uv sync
uv run uvicorn omnicast.main:app --reload --port 8000
```
* Interactive GraphQL Playground (GraphiQL): `http://localhost:8000/graphql`
* Health Probe: `http://localhost:8000/healthz`

### 5. Start Web Client Studio
```bash
cd ../../apps/web
pnpm install
pnpm dev
```
* Studio Dashboard: `http://localhost:3000`

---

## 📄 License
OmniCast Studio is open-source software licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
