# 📜 OmniCast Studio — System Specification & Contract Guide (SPEC.md)

**System Name:** OmniCast Studio  
**Version:** 1.0.0-PROPOSED  
**Architecture:** Spec-Driven Multimodal Research, Graph RAG, Real-Time Voice & Broadcast Synthesis Engine  
**Standards Compliance:** GraphQL 2021, W3C TraceContext (OpenTelemetry), RSS 2.0 Enclosures, EBU R128 (-16 LUFS)  

---

## 1. System Objectives & Capabilities

OmniCast Studio enables users to ingest multimodal documents (PDFs, research publications, YouTube videos, web URLs, and codebases) and autonomously generates:
1. **Interactive Concept Mind Maps:** GraphDB-backed knowledge graphs rendered via `@xyflow/react`.
2. **Dual-Host Deep-Dive Podcasts ("Audio Overviews"):** Multi-speaker synthesized audio with natural conversational banter, laughter, and EBU R128 loudness normalization.
3. **Programmatic Video Overviews:** 16:9 widescreen YouTube walkthroughs and 9:16 vertical Shorts with audio-reactive waveforms and synchronized slide visuals via Remotion.
4. **Full-Duplex Conversational Voice ("Interrupt & Converse"):** Sub-300ms bidirectional voice chat powered by Gemini Multimodal Live API / WebSockets with instant barge-in.
5. **1-Click Multi-Platform Syndication:** Automated Apple Podcasts & Spotify RSS 2.0 generation, YouTube direct OAuth upload, LinkedIn carousel export, and Notion workspace sync.

---

## 2. Service-Level Objectives (SLOs) & Performance Budgets

| Metric | Target SLO | Enforcement Gate |
| :--- | :--- | :--- |
| **Voice Roundtrip Latency** | $\le 300\text{ms}$ ($p95 \le 400\text{ms}$) | OpenTelemetry waterfall span alert; automated test assertion |
| **VAD Cutoff Time (Barge-In)** | $\le 20\text{ms}$ from speech start | Silero VAD v5 ONNX audio worklet test |
| **Podcast Synthesis Throughput** | $\le 45\text{s}$ for a 5-minute episode | Async worker pool with batch Kokoro-82M ONNX synthesis |
| **Mind Map Generation Time** | $\le 5\text{s}$ for up to 50 entities | GraphDB bulk node/edge ingestion batch |
| **Grounding & Faithfulness Score** | $\ge 0.90$ (Zero hallucination tolerance) | DeepEval / Ragas test suite in CI |
| **Speaker Balance Ratio** | $40\% \le \text{Host A Speaking Time} \le 60\%$ | Automated dialogue scripter unit test |
| **Audio Loudness Target** | $-16.0 \pm 1.0\text{ LUFS}$ | Rust DSP / FFmpeg EBU R128 filter verification |

---

## 3. Data Contracts & Persistence Schemas

### 3.1 Document Store (MongoDB / Motor)
- **`sources` Collection:**
  - `id: UUID`, `workspace_id: UUID`, `title: String`, `source_type: Enum(PDF, URL, YOUTUBE, CODE)`, `raw_content: String`, `token_count: Int`, `metadata: Object`.
- **`episodes` Collection:**
  - `id: UUID`, `workspace_id: UUID`, `title: String`, `audio_url: String`, `duration_ms: Int`, `dialogue: Array[DialogueTurn]`, `video_timeline: Object`, `created_at: DateTime`.
  - `DialogueTurn`: `{ speaker: Enum(HOST_A, HOST_B), text: String, start_ms: Int, end_ms: Int, citations: Array[Citation] }`.
  - `Citation`: `{ source_id: UUID, page_number: Int?, timestamp_sec: Float?, snippet: String }`.

### 3.2 Knowledge Graph (GraphDB: Kùzu / Memgraph)
- **Node Labels:** `Concept`, `Methodology`, `Person`, `Organization`, `Metric`, `Vulnerability`, `Finding`.
- **Relationship Types:** `EXTENDS`, `CONTRADICTS`, `DEPENDS_ON`, `OUTPERFORMS`, `AUTHORED_BY`, `CITED_IN`.

---

## 4. API & Protocol Specifications

- **GraphQL Endpoint:** `POST /graphql` (Strawberry GraphQL on FastAPI)
- **GraphQL WebSocket Subscription:** `WS /graphql` (Subscriptions for live synthesis progress & mind map streaming)
- **Voice WebSocket Endpoint:** `WS /api/v1/voice/live` (16kHz 16-bit linear PCM streaming for Gemini Live API & full-duplex voice)
- **Syndication Endpoints:** `GET /feed/:workspaceId/podcast.xml` (RSS 2.0 with iTunes & Spotify audio enclosures)

---

## 5. Automated Quality Gates in CI/CD

1. **Static Analysis & Types:**
   - Python: `ruff check .`, `mypy --strict`
   - TypeScript: `eslint .`, `tsc --noEmit`
2. **Schema Drift Detection:**
   - `graphql-inspector diff contracts/schema.graphql` to catch breaking API changes.
3. **Continuous Evals:**
   - DeepEval / Ragas evaluation verifying Faithfulness $\ge 0.90$ across golden document benchmark.
