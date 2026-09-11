# 🤖 Agent Guidelines & Architectural Invariants (AGENTS.md)
## Project: OmniCast Studio
**Document Version:** 1.0.0  
**Scope:** Binding developer rules for AI coding assistants (Antigravity, Claude Code, Cursor, Copilot)  

---

## 1. Architectural Invariants (NON-NEGOTIABLE)

When working on `omnicast-studio`, every AI coding agent must strictly adhere to the following 6 core invariants:

1. **Contract-First GraphQL Integrity:**
   - **NEVER** modify backend resolver signatures or frontend GraphQL queries without first updating `contracts/schema.graphql`.
   - All client types must be derived from the schema via `@graphql-codegen/cli`.
2. **AudioWorklet Isolation (No React Audio Processing):**
   - **NEVER** process raw audio PCM chunks, Silero VAD, or WebSockets inside React components or standard React hooks.
   - All audio capture must execute in `apps/web/public/worklets/audio-processor.js` (AudioWorklet thread) and pass to a Web Worker. React components may only observe throttled telemetry via Zustand stores.
3. **Zero Secret & Database Commits:**
   - **NEVER** commit `.env`, `.env.local`, `*.sqlite`, `*.db`, or binary executables (`*.exe`, `*.tar.gz`).
   - Any new environment variable must have a corresponding sanitized placeholder added to `.env.example`.
4. **Grounded Citation Enforcement:**
   - **NEVER** write podcast dialogue synthesis prompts that output ungrounded assertions. Every statement must include an explicit `SourceCitation` pointing to a valid source ID, page, or timestamp.
5. **Feature-Sliced Design (FSD) Boundaries:**
   - Code inside `apps/web/src/features/<feature-name>` must be completely modular. A feature may **never** directly import private components from another feature; cross-feature communication must happen via `shared/` stores or GraphQL queries.
6. **Python 3.13+ Modernity:**
   - Use `uv` for package management. Never use legacy `setup.py` or manual `pip` invocations.
   - Use Pydantic v2 syntax (`model_validate`, `model_dump`), native type annotations (`list[str]`, `dict[str, Any]`), and modern `async/await` patterns.

---

## 2. Verification Commands (Run Before Merging)

Before proposing or finalizing any code edits, agents must verify that the codebase compiles and passes test quality gates:

```bash
# 1. Backend Linting & Static Typing
cd services/core-api
uv run ruff check .
uv run mypy omnicast

# 2. Backend Automated Test Suite
uv run pytest -v

# 3. Frontend Typecheck & Lint
cd ../../apps/web
pnpm typecheck
pnpm lint
```

---

## 3. Commit Message Standards (Conventional Commits)

All commits must follow the **Conventional Commits** specification:
* `feat(graph): add Leiden community detection for Graph RAG`
* `fix(voice): eliminate buffer jitter on AudioWorklet disconnect`
* `spec(contracts): add verticalShortUrl to VideoComposition schema`
* `test(evals): add DeepEval golden benchmark for legal contracts`
* `chore(deps): bump google-genai to latest 0.1.1`
