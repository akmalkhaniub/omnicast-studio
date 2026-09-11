# 📊 Reliability Engineering: SLO & Error Budget Framework (SLO_FRAMEWORK.md)
## Project: OmniCast Studio
**Document Version:** 1.0.0  
**Methodology:** Google Site Reliability Engineering (SRE) Handbooks  
**Status:** Approved  

---

## 1. Service Level Indicators (SLIs) & Objectives (SLOs)

| Service Area | Service Level Indicator (SLI) | Target SLO (Rolling 30-Day) | Measurement Methodology |
| :--- | :--- | :--- | :--- |
| **Real-Time Voice Chat** | **Voice Roundtrip Latency:** Proportion of spoken voice turns where roundtrip response arrives in $\le 350\text{ms}$. | **$\ge 95.0\%$ of turns** ($p95 \le 350\text{ms}$) | OpenTelemetry span from client speech end event to first inbound audio packet. |
| **Podcast Synthesis** | **Synthesis Success Rate:** Proportion of podcast generation requests completing without errors within $60\text{s}$. | **$\ge 99.0\%$ of episodes** | FastAPI endpoint metrics: $\frac{\text{HTTP 200 Completions}}{\text{Total Synthesis Invocations}}$. |
| **API Availability** | **GraphQL & WebSocket Gateway Uptime:** Proportion of successful HTTP/WS handshakes returning $< 500$ status codes. | **$\ge 99.9\%$ availability** | Synthetic uptime canary probes executed every 60 seconds from 3 regions. |
| **Mind Map Latency** | **Graph Subgraph Retrieval:** Time required to traverse GraphDB and serialize up to 200 nodes & edges. | **$p99 \le 500\text{ms}$** | Prometheus histogram on GraphQL resolver `knowledgeGraph`. |
| **Audio Loudness Drift** | **EBU R128 Compliance:** Proportion of synthesized podcasts measuring within target loudness window. | **$100\%$ within $-16 \pm 1\text{ LUFS}$** | Post-synthesis audio validator script before S3/CDN upload. |

---

## 2. Error Budget Policy & Burn Rate Alerting

An error budget represents the acceptable margin of unreliability over a 30-day window ($100\% - \text{SLO}$).

### Error Budget Allocation (30-Day Period):
* **API Availability (99.9% SLO):** Maximum allowed downtime = **43 minutes, 12 seconds**.
* **Synthesis Reliability (99.0% SLO):** Maximum allowed failures = **1 out of 100 synthesis jobs**.

### Multi-Window Multi-Burn-Rate Alerting Strategy:

```mermaid
flowchart TD
    Burn["Error Budget Burn Rate"]
    
    Burn -->|14.4x Burn (2% consumed in 1 hour)| P1["🚨 Page SRE On-Call (P1 Critical Alert)"]
    Burn -->|6x Burn (5% consumed in 6 hours)| P2["⚠️ PagerDuty Ticket (P2 Urgent Alert)"]
    Burn -->|1x Burn (10% consumed in 3 days)| P3["📋 Jira Engineering Ticket (P3 Review)"]
    
    P1 --> Action1["Halt new feature deployments; enable API fallbacks"]
    P2 --> Action2["Investigate model quotas or worker node memory pressure"]
```

---

## 3. Incident Response Playbooks

### Incident 1: Voice Roundtrip Latency Spikes ($> 500\text{ms}$)
1. **Symptom:** Client telemetry reports voice latency degradations in OpenTelemetry dashboard.
2. **Immediate Mitigation:**
   - Verify Gemini Multimodal Live API status on Google Cloud Status Dashboard.
   - If upstream latency exceeds $200\text{ms}$, trigger automated fallback in `config.py` to local **Groq Llama 3.3 70B** for inference + **Cartesia Sonic** for streaming TTS.
   - Check WebSocket server CPU utilization on worker nodes.

### Incident 2: Synthesis Jobs Stalling in `SYNTHESIZING_AUDIO` State
1. **Symptom:** Synthesis jobs exceed 60s timeout without advancing to `COMPLETED`.
2. **Immediate Mitigation:**
   - Inspect Kokoro-82M ONNX worker queue: check for GPU VRAM or CPU core saturation.
   - Restart stalled worker processes using `docker compose restart core-api`.
   - Purge corrupted audio cache files in `./data/audio_cache/`.
