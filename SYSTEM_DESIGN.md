# 🏛️ System Design & C4 Architecture Blueprint (SYSTEM_DESIGN.md)
## Project: OmniCast Studio
**Document Version:** 1.0.0  
**Design Standard:** C4 Model (Context, Container, Component, Code)  
**Author:** Systems Architect & Engineering Lead  

---

## 1. C4 Level 1: System Context Diagram

The System Context diagram illustrates how OmniCast Studio fits within the broader ecosystem of users, foundation models, and external distribution networks.

```mermaid
graph TD
    User["👤 Researcher / Creator / Executive"]
    
    subgraph OmniCastEcosystem ["OmniCast Studio Platform"]
        OmniCast["🎙️ OmniCast Studio<br/>(Multimodal Synthesis Engine)"]
    end
    
    subgraph ExternalAI ["External AI Foundation APIs"]
        GeminiFlash["Google GenAI: Gemini 3.8 Flash<br/>(Structured Dialogue & Planning)"]
        GeminiLive["Google GenAI: Gemini Multimodal Live API<br/>(Bidirectional Audio WebSocket)"]
        CartesiaCloud["Cartesia Sonic Cloud TTS<br/>(High-Fidelity Backup Audio)"]
    end
    
    subgraph SyndicationPlatforms ["Distribution & Publishing Channels"]
        AppleSpotify["Apple Podcasts & Spotify<br/>(RSS 2.0 Enclosures)"]
        YouTube["YouTube Data API v3<br/>(16:9 Video & 9:16 Shorts)"]
        NotionExport["Notion API / Markdown<br/>(Knowledge Base Sync)"]
    end

    User -->|1. Uploads PDFs, URLs, Video, Audio| OmniCast
    User -->|2. Interacts with Mind Map & Voice Mic| OmniCast
    OmniCast -->|GraphQL, Traces, Telemetry| User
    
    OmniCast <-->|Agentic Planning & Dialogue Gen| GeminiFlash
    OmniCast <-->|16kHz PCM Bidirectional Audio Stream| GeminiLive
    OmniCast -->|Speech Synthesis Fallback| CartesiaCloud
    
    OmniCast -->|Publishes RSS Feed| AppleSpotify
    OmniCast -->|Uploads Remotion MP4| YouTube
    OmniCast -->|Exports Mind Map & Notes| NotionExport
```

---

## 2. C4 Level 2: Container Diagram

The Container diagram decomposes the platform into independently deployable software containers, storage systems, and protocol boundaries.

```mermaid
graph TD
    subgraph ClientContainer ["Client Tier (Browser / Desktop)"]
        WebApp["Next.js 16 Client (React 19 + Tailwind v4)<br/>• Dockview Multi-Pane Layout<br/>• @xyflow/react Mind Map<br/>• Decoupled AudioWorklet Engine"]
    end

    subgraph APITier ["API & Gateway Tier"]
        CoreAPI["FastAPI Application Server (Python 3.14 / uv)<br/>• Strawberry GraphQL Router<br/>• Raw Binary Voice WebSocket<br/>• RSS 2.0 Syndication Handler"]
    end

    subgraph WorkerTier ["Asynchronous Synthesis & Render Tier"]
        LangGraphWorker["Agentic RAG Engine<br/>• Gemini 3.8 Flash Planner<br/>• Self-Correction Grader"]
        TTSWorker["Audio Synthesis Engine<br/>• Kokoro-82M ONNX Local Engine<br/>• Rust SIMD DSP Normalizer"]
        RemotionWorker["Video Render Studio<br/>• Remotion 4.x Composition Engine<br/>• Hardware-Accelerated FFmpeg (NVENC)"]
    end

    subgraph DataTier ["Persistence & Observability Tier"]
        MongoDB[("MongoDB 7.0 / 8.0<br/>• Documents, Episodes, Transcripts")]
        GraphDB[("GraphDB (Memgraph / Kùzu)<br/>• Knowledge Graph Nodes & Edges")]
        VectorStore[("Vector Store (pgvector / Qdrant)<br/>• 1536-dim HNSW Chunks")]
        Langfuse[("Langfuse v3 & OTel<br/>• Spans, Prompts, Token Costs")]
    end

    WebApp <-->|GraphQL Queries, Mutations, Subscriptions| CoreAPI
    WebApp <-->|16kHz Linear PCM Audio Stream| CoreAPI
    
    CoreAPI <--> LangGraphWorker
    CoreAPI <--> TTSWorker
    CoreAPI <--> RemotionWorker
    
    CoreAPI <-->|Motor / Beanie ODM| MongoDB
    CoreAPI <-->|Cypher Bolt / C-ABI| GraphDB
    CoreAPI <-->|Vector Cosine Similarity| VectorStore
    CoreAPI -->|OTLP Traces & Token Metrics| Langfuse
```

---

## 3. C4 Level 3: Sequence Diagrams (Core Workflows)

### 3.1 Real-Time Conversational Voice & Barge-In Lifecycle
Demonstrates sub-300ms latency and instant speech cutoff when a user interrupts the active playback.

```mermaid
sequenceDiagram
    autonumber
    participant Mic as Hardware Mic
    participant Worklet as AudioWorklet (Audio Thread)
    participant Worker as Web Worker (Transport Thread)
    participant Server as FastAPI Voice WebSocket
    participant GeminiLive as Gemini Multimodal Live API
    participant Speaker as Hardware Output

    Note over Mic,Speaker: User is listening to synthesized audio playback
    Server-->>Worker: Streaming binary PCM audio chunks
    Worker-->>Worklet: Push chunks to Playback RingBuffer
    Worklet-->>Speaker: Playing host dialogue audio

    Note over Mic,Speaker: User speaks: "Wait, clarify the second benchmark!"
    Mic->>Worklet: 16kHz PCM Float32 Frames
    Worklet->>Worker: postMessage(SharedArrayBuffer)
    Worker->>Worker: Silero VAD v5 ONNX detects speech (1.07ms)
    
    rect rgb(255, 230, 230)
    Note over Worker,Worklet: INSTANT BARGE-IN TRIGGER (<20ms)
    Worker->>Worklet: CLEAR_PLAYBACK_BUFFER command
    Worklet->>Speaker: Instant Audio Silence (Cutoff)
    Worker->>Server: Send Control Message: {"type": "interrupt"}
    Server->>GeminiLive: Cancel pending generation queue
    end

    Worker->>Server: Stream user spoken audio bytes
    Server->>GeminiLive: Stream PCM bytes over WebSocket
    GeminiLive-->>Server: Stream synthesized answer audio bytes (TTFT < 100ms)
    Server-->>Worker: Stream response audio packets
    Worker-->>Worklet: Push to Playback RingBuffer
    Worklet-->>Speaker: Agent speaks answer grounded in source documents
```

---

### 3.2 Dual-Host Podcast Synthesis Pipeline
Illustrates the end-to-end transformation from ingested documents to mastered MP3 and interactive mind map nodes.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web App (GraphQL)
    participant API as FastAPI Gateway
    participant Planner as Agentic RAG Planner
    participant Graph as GraphDB (Memgraph/Kùzu)
    participant Scripter as Dialogue Scripter (Gemini 3.8)
    participant TTS as Kokoro-82M Synthesis Engine
    participant DSP as Rust SIMD DSP Normalizer
    participant Mongo as MongoDB Storage

    Client->>API: mutation { triggerPodcastSynthesis(workspaceId: "...") }
    API->>Planner: Plan episode themes & key concepts
    Planner->>Graph: Query community clusters & relationships (PageRank/Leiden)
    Graph-->>Planner: Return interconnected entity subgraphs
    
    API-->>Client: subscription: "ANALYZING_GRAPH" (20%)
    
    Planner->>Scripter: Generate 2-Host Script (Alex & Jordan) with citation links
    Scripter-->>Planner: Return structured JSON dialogue turns with millisecond timing
    
    API-->>Client: subscription: "SCRIPTING_DIALOGUE" (50%)
    
    Planner->>TTS: Batch synthesize Host A and Host B audio stems
    TTS-->>DSP: Raw PCM audio chunks
    DSP->>DSP: Apply stereo panning & EBU R128 loudness normalization (-16 LUFS)
    DSP-->>API: Mastered episode_UUID.mp3
    
    API->>Mongo: Persist Episode record, Dialogue turns, and Audio URL
    API-->>Client: subscription: "COMPLETED" (100%)
    Client->>Client: Hydrate Audio Player & animate Mind Map nodes
```

---

## 4. Data Flow & Network Protocols

| Communication Path | Protocol | Format | Payload Size / Characteristics |
| :--- | :--- | :--- | :--- |
| **Web Client $\to$ Core API** | HTTPS / GraphQL | JSON / Typed AST | Single-request dashboard hydration ($< 50\text{KB}$) |
| **Web Client $\leftrightarrow$ Voice Gateway** | WSS (Secure WebSocket) | Binary (16kHz linear PCM) | 64ms chunk buffers ($2,048\text{ bytes}$ per frame) |
| **Core API $\leftrightarrow$ Gemini Live** | WSS (Bidirectional) | BSON / Binary PCM | Direct audio-to-audio streaming |
| **Core API $\leftrightarrow$ GraphDB** | Bolt Protocol / C-ABI | Cypher Query Strings | Sub-millisecond graph traversals |
| **Core API $\leftrightarrow$ MongoDB** | MongoDB Wire Protocol | BSON Documents | Async connection pool via Motor |
| **Core API $\to$ RSS Clients** | HTTP GET | XML (RSS 2.0) | Standard podcast syndication with audio enclosures |
