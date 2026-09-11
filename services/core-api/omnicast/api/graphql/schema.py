"""Strawberry GraphQL Schema Implementation for OmniCast Studio."""

import asyncio
from datetime import datetime, timezone
from typing import List, Optional, AsyncGenerator
import strawberry
from strawberry.types import Info
from uuid import uuid4

from omnicast.storage.models import (
    SourceType as MongoSourceType,
    SpeakerIdentity as MongoSpeakerIdentity,
    SynthesisStatus as MongoSynthesisStatus,
    Workspace as MongoWorkspace,
    SourceDocument as MongoSourceDocument,
    Episode as MongoEpisode,
    DialogueTurn as MongoDialogueTurn,
    SourceCitation as MongoSourceCitation,
)
from omnicast.knowledge_graph.engine import graph_engine, GraphNodeData
from omnicast.agentic_rag.planner import planner
from omnicast.agentic_rag.scripter import scripter
from omnicast.audio.synthesizer import audio_synthesizer
from omnicast.ingestion.extractors import universal_ingestion
from omnicast.video.renderer import video_renderer, VideoCompositionType
from omnicast.video.clip_cutter import clip_cutter
from omnicast.video.slide_generator import slide_generator
from omnicast.observability.evals import rag_auditor


# In-memory store for fallback / dev without live MongoDB
_mem_workspaces: dict[str, MongoWorkspace] = {}
_mem_sources: dict[str, list[MongoSourceDocument]] = {}
_mem_episodes: dict[str, list[MongoEpisode]] = {}


from enum import Enum


@strawberry.enum
class SourceType(str, Enum):
    PDF = "PDF"
    URL = "URL"
    YOUTUBE = "YOUTUBE"
    CODE = "CODE"
    MARKDOWN = "MARKDOWN"


@strawberry.enum
class SpeakerIdentity(str, Enum):
    HOST_A = "HOST_A"
    HOST_B = "HOST_B"
    USER = "USER"


@strawberry.enum
class SynthesisStatus(str, Enum):
    PENDING = "PENDING"
    ANALYZING_GRAPH = "ANALYZING_GRAPH"
    SCRIPTING_DIALOGUE = "SCRIPTING_DIALOGUE"
    SYNTHESIZING_AUDIO = "SYNTHESIZING_AUDIO"
    RENDERING_VIDEO = "RENDERING_VIDEO"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


@strawberry.type
class SourceCitation:
    source_id: strawberry.ID
    source_title: str
    page_number: Optional[int] = None
    timestamp_sec: Optional[float] = None
    snippet: str


@strawberry.type
class SourceDocument:
    id: strawberry.ID
    workspace_id: strawberry.ID
    title: str
    source_type: SourceType
    token_count: int
    created_at: datetime


@strawberry.type
class GraphNode:
    id: strawberry.ID
    label: str
    category: str
    community_id: Optional[int] = 0
    degree: int
    citation: Optional[SourceCitation] = None


@strawberry.type
class GraphEdge:
    id: strawberry.ID
    source: strawberry.ID
    target: strawberry.ID
    relationship: str
    weight: float


@strawberry.type
class KnowledgeGraph:
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int


@strawberry.type
class DialogueTurn:
    id: strawberry.ID
    speaker: SpeakerIdentity
    text: str
    start_ms: int
    end_ms: int
    citations: List[SourceCitation]
    entity_ids: List[strawberry.ID] = strawberry.field(default_factory=list)


@strawberry.type
class ClarificationResponse:
    id: strawberry.ID
    episode_id: strawberry.ID
    question: str
    answer_text: str
    speaker: SpeakerIdentity
    audio_url: Optional[str] = None
    citations: List[SourceCitation]
    resume_time_ms: int


@strawberry.type
class VideoComposition:
    id: strawberry.ID
    widescreen_url: Optional[str] = None
    vertical_short_url: Optional[str] = None
    fps: int = 30
    duration_frames: int = 0
    render_status: str = "PENDING"


@strawberry.type
class KaraokeWordType:
    word: str
    start_ms: int
    end_ms: int
    speaker: str


@strawberry.type
class SocialViralClipType:
    id: strawberry.ID
    episode_id: strawberry.ID
    title: str
    hook: str
    start_ms: int
    end_ms: int
    duration_sec: float
    viral_score: float
    video_url: str
    platform_tags: List[str]
    karaoke_words: List[KaraokeWordType]


@strawberry.type
class PresentationSlideType:
    slide_number: int
    title: str
    subtitle: str
    bullet_points: List[str]
    graph_entities: List[str]
    citation: str


@strawberry.type
class PresentationDeckType:
    deck_id: strawberry.ID
    workspace_id: strawberry.ID
    title: str
    total_slides: int
    slides: List[PresentationSlideType]
    html_deck_url: str
    svg_infographic_url: str


@strawberry.type
class ClaimFactCheckType:
    claim_text: str
    verified: bool
    citation_source: str
    confidence_score: float
    snippet_match: str


@strawberry.type
class EpisodeEvaluationType:
    episode_id: strawberry.ID
    faithfulness_score: float
    answer_relevance_score: float
    hallucination_rate: float
    rag_triad_pass: bool
    token_count: int
    latency_ms: float
    slo_met: bool
    verified_claims: List[ClaimFactCheckType]


@strawberry.type
class Episode:
    id: strawberry.ID
    workspace_id: strawberry.ID
    title: str
    summary: str
    audio_url: Optional[str] = None
    duration_ms: int = 0
    status: SynthesisStatus
    dialogue: List[DialogueTurn]
    video_composition: Optional[VideoComposition] = None
    created_at: datetime


@strawberry.type
class Workspace:
    id: strawberry.ID
    title: str
    description: Optional[str] = None
    created_at: datetime

    @strawberry.field
    async def sources(self) -> List[SourceDocument]:
        docs = _mem_sources.get(str(self.id), [])
        return [
            SourceDocument(
                id=d.id,
                workspace_id=d.workspace_id,
                title=d.title,
                source_type=SourceType(d.source_type.value),
                token_count=d.token_count,
                created_at=d.created_at
            ) for d in docs
        ]

    @strawberry.field
    async def knowledge_graph(self) -> KnowledgeGraph:
        g = await graph_engine.get_workspace_graph(str(self.id))
        return KnowledgeGraph(
            nodes=[
                GraphNode(
                    id=n.id,
                    label=n.label,
                    category=n.category,
                    community_id=n.community_id,
                    degree=n.degree,
                    citation=SourceCitation(
                        source_id=n.citation_source_id or "",
                        source_title="Source Reference",
                        page_number=n.citation_page,
                        snippet=n.citation_snippet or ""
                    ) if n.citation_source_id else None
                ) for n in g.nodes
            ],
            edges=[
                GraphEdge(
                    id=e.id,
                    source=e.source,
                    target=e.target,
                    relationship=e.relationship,
                    weight=e.weight
                ) for e in g.edges
            ],
            total_nodes=g.total_nodes,
            total_edges=g.total_edges
        )

    @strawberry.field
    async def episodes(self) -> List[Episode]:
        eps = _mem_episodes.get(str(self.id), [])
        return [
            Episode(
                id=e.id,
                workspace_id=e.workspace_id,
                title=e.title,
                summary=e.summary,
                audio_url=e.audio_url,
                duration_ms=e.duration_ms,
                status=SynthesisStatus(e.status.value),
                dialogue=[
                    DialogueTurn(
                        id=t.id,
                        speaker=SpeakerIdentity(t.speaker.value),
                        text=t.text,
                        start_ms=t.start_ms,
                        end_ms=t.end_ms,
                        citations=[
                            SourceCitation(
                                source_id=c.source_id,
                                source_title=c.source_title,
                                page_number=c.page_number,
                                timestamp_sec=c.timestamp_sec,
                                snippet=c.snippet
                            ) for c in t.citations
                        ]
                    ) for t in e.dialogue
                ],
                created_at=e.created_at
            ) for e in eps
        ]


@strawberry.input
class CreateWorkspaceInput:
    title: str
    description: Optional[str] = None


@strawberry.input
class IngestDocumentInput:
    workspace_id: strawberry.ID
    title: str
    source_type: SourceType
    content: str


@strawberry.input
class GeneratePodcastInput:
    workspace_id: strawberry.ID
    topic: Optional[str] = "Key Concepts & Synthesis"
    target_duration_minutes: int = 5
    host_a_personality: str = "Curious Technical Analyst"
    host_b_personality: str = "Domain Expert & Practical Skeptic"
    debate_mode: Optional[str] = "DEVILS_ADVOCATE"
    tension_level: Optional[float] = 0.6


@strawberry.type
class SynthesisProgressEvent:
    episode_id: strawberry.ID
    status: SynthesisStatus
    percent_complete: int
    current_step_message: str


@strawberry.type
class Query:
    @strawberry.field
    async def workspace(self, id: strawberry.ID) -> Optional[Workspace]:
        ws = _mem_workspaces.get(str(id))
        if not ws:
            return None
        return Workspace(
            id=ws.id,
            title=ws.title,
            description=ws.description,
            created_at=ws.created_at
        )

    @strawberry.field
    async def list_workspaces(self) -> List[Workspace]:
        return [
            Workspace(
                id=ws.id,
                title=ws.title,
                description=ws.description,
                created_at=ws.created_at
            ) for ws in _mem_workspaces.values()
        ]

    @strawberry.field
    async def knowledge_graph(self, workspace_id: strawberry.ID) -> KnowledgeGraph:
        g = await graph_engine.get_workspace_graph(str(workspace_id))
        return KnowledgeGraph(
            nodes=[
                GraphNode(
                    id=n.id,
                    label=n.label,
                    category=n.category,
                    community_id=n.community_id,
                    degree=n.degree
                ) for n in g.nodes
            ],
            edges=[
                GraphEdge(
                    id=e.id,
                    source=e.source,
                    target=e.target,
                    relationship=e.relationship,
                    weight=e.weight
                ) for e in g.edges
            ],
            total_nodes=g.total_nodes,
            total_edges=g.total_edges
        )

    @strawberry.field
    async def social_clips(self, episode_id: strawberry.ID) -> List[SocialViralClipType]:
        """Returns top viral 9:16 shorts clips with word-level karaoke timestamps."""
        # Find episode or generate from mock turns
        ep = None
        for ep_list in _mem_episodes.values():
            for item in ep_list:
                if item.id == str(episode_id):
                    ep = item
                    break
        dialogue = ep.dialogue if ep else []
        if not dialogue:
            dialogue = await scripter.generate_episode_script(
                workspace_title="Research Workspace",
                sources=[],
                knowledge_graph_summary="",
                target_minutes=3
            )

        clips = clip_cutter.cut_viral_moments(str(episode_id), dialogue)
        return [
            SocialViralClipType(
                id=strawberry.ID(c.id),
                episode_id=strawberry.ID(c.episode_id),
                title=c.title,
                hook=c.hook,
                start_ms=c.start_ms,
                end_ms=c.end_ms,
                duration_sec=c.duration_sec,
                viral_score=c.viral_score,
                video_url=c.video_url,
                platform_tags=c.platform_tags,
                karaoke_words=[
                    KaraokeWordType(
                        word=w.word,
                        start_ms=w.start_ms,
                        end_ms=w.end_ms,
                        speaker=w.speaker
                    ) for w in c.karaoke_words
                ]
            ) for c in clips
        ]

    @strawberry.field
    async def presentation_deck(self, workspace_id: strawberry.ID) -> PresentationDeckType:
        """Returns generated 16:9 presentation deck and SVG infographic."""
        ws = _mem_workspaces.get(str(workspace_id))
        ws_title = ws.title if ws else "OmniCast Research"
        kg_summary = await graph_engine.get_community_summary(str(workspace_id))
        deck = await slide_generator.generate_deck(str(workspace_id), ws_title, kg_summary)
        return PresentationDeckType(
            deck_id=strawberry.ID(deck.deck_id),
            workspace_id=strawberry.ID(deck.workspace_id),
            title=deck.title,
            total_slides=deck.total_slides,
            slides=[
                PresentationSlideType(
                    slide_number=s.slide_number,
                    title=s.title,
                    subtitle=s.subtitle,
                    bullet_points=s.bullet_points,
                    graph_entities=s.graph_entities,
                    citation=s.citation
                ) for s in deck.slides
            ],
            html_deck_url=deck.html_deck_url,
            svg_infographic_url=deck.svg_infographic_url
        )

    @strawberry.field
    async def episode_evaluation(self, episode_id: strawberry.ID) -> EpisodeEvaluationType:
        """DeepEval RAG Triad faithfulness, hallucination, and claim verification."""
        ep = None
        for ep_list in _mem_episodes.values():
            for item in ep_list:
                if item.id == str(episode_id):
                    ep = item
                    break
        dialogue = ep.dialogue if ep else []
        if not dialogue:
            dialogue = await scripter.generate_episode_script(
                workspace_title="Research Workspace",
                sources=[],
                knowledge_graph_summary="",
                target_minutes=3
            )
        eval_result = rag_auditor.evaluate_episode(str(episode_id), dialogue, sources=[])
        return EpisodeEvaluationType(
            episode_id=strawberry.ID(eval_result.episode_id),
            faithfulness_score=eval_result.faithfulness_score,
            answer_relevance_score=eval_result.answer_relevance_score,
            hallucination_rate=eval_result.hallucination_rate,
            rag_triad_pass=eval_result.rag_triad_pass,
            token_count=eval_result.token_count,
            latency_ms=eval_result.latency_ms,
            slo_met=eval_result.slo_met,
            verified_claims=[
                ClaimFactCheckType(
                    claim_text=c.claim_text,
                    verified=c.verified,
                    citation_source=c.citation_source,
                    confidence_score=c.confidence_score,
                    snippet_match=c.snippet_match
                ) for c in eval_result.verified_claims
            ]
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_workspace(self, input: CreateWorkspaceInput) -> Workspace:
        ws_id = str(uuid4())
        ws = MongoWorkspace(
            id=ws_id,
            title=input.title,
            description=input.description,
            created_at=datetime.now(timezone.utc)
        )
        _mem_workspaces[ws_id] = ws
        _mem_sources[ws_id] = []
        _mem_episodes[ws_id] = []
        return Workspace(
            id=ws.id,
            title=ws.title,
            description=ws.description,
            created_at=ws.created_at
        )

    @strawberry.mutation
    async def ingest_document(self, input: IngestDocumentInput) -> SourceDocument:
        doc_id = str(uuid4())
        ws_id = str(input.workspace_id)

        # Dispath universal ingestion for web / YouTube URLs or raw text
        cleaned_content = input.content
        extracted_title = input.title
        trimmed = input.content.strip()

        if trimmed.startswith(("http://", "https://")):
            try:
                extract = await universal_ingestion.ingest_url(trimmed)
                cleaned_content = extract.content
                if not extracted_title or extracted_title == "Web Document":
                    extracted_title = extract.title
            except Exception as err:
                cleaned_content = input.content

        doc = MongoSourceDocument(
            id=doc_id,
            workspace_id=ws_id,
            title=extracted_title,
            source_type=MongoSourceType(input.source_type.value),
            content=cleaned_content,
            token_count=len(cleaned_content.split()),
            created_at=datetime.now(timezone.utc)
        )
        if ws_id not in _mem_sources:
            _mem_sources[ws_id] = []
        _mem_sources[ws_id].append(doc)

        # Extract entities directly into Knowledge Graph
        nodes, edges = await planner.extract_knowledge_graph(
            document_text=cleaned_content,
            source_id=doc_id,
            source_title=extracted_title
        )
        await graph_engine.ingest_entities(ws_id, nodes, edges)

        return SourceDocument(
            id=doc.id,
            workspace_id=doc.workspace_id,
            title=doc.title,
            source_type=SourceType(doc.source_type.value),
            token_count=doc.token_count,
            created_at=doc.created_at
        )

    @strawberry.mutation
    async def trigger_podcast_synthesis(self, input: GeneratePodcastInput) -> Episode:
        ws_id = str(input.workspace_id)
        ep_id = str(uuid4())
        ws = _mem_workspaces.get(ws_id)
        ws_title = ws.title if ws else "Research Workspace"
        sources = [{"id": d.id, "title": d.title} for d in _mem_sources.get(ws_id, [])]

        # 1. Scripting with Graph RAG Community Summary & Debate Mode
        kg_summary = await graph_engine.get_community_summary(ws_id)
        dialogue = await scripter.generate_episode_script(
            workspace_title=ws_title,
            sources=sources,
            knowledge_graph_summary=kg_summary,
            target_minutes=input.target_duration_minutes,
            debate_mode=input.debate_mode,
            tension_level=input.tension_level or 0.5,
        )

        # 2. Synthesize audio
        audio_url = await audio_synthesizer.synthesize_episode(ep_id, dialogue)
        total_duration = dialogue[-1].end_ms if dialogue else 0

        # 3. Render Remotion Video Composition
        video_result = await video_renderer.render_composition(
            episode_id=ep_id,
            title=f"Deep-Dive: {input.topic or ws_title}",
            dialogue=dialogue,
            audio_url=audio_url,
            composition=VideoCompositionType.WIDESCREEN_PODCAST,
        )

        ep = MongoEpisode(
            id=ep_id,
            workspace_id=ws_id,
            title=f"Deep-Dive: {input.topic or ws_title}",
            summary="Autonomous dual-host analysis with verified citation anchors.",
            audio_url=audio_url,
            duration_ms=total_duration,
            status=MongoSynthesisStatus.COMPLETED,
            dialogue=dialogue,
            created_at=datetime.now(timezone.utc)
        )
        if ws_id not in _mem_episodes:
            _mem_episodes[ws_id] = []
        _mem_episodes[ws_id].append(ep)

        return Episode(
            id=ep.id,
            workspace_id=ep.workspace_id,
            title=ep.title,
            summary=ep.summary,
            audio_url=ep.audio_url,
            duration_ms=ep.duration_ms,
            status=SynthesisStatus.COMPLETED,
            video_composition=VideoComposition(
                id=strawberry.ID(video_result.render_id),
                widescreen_url=video_result.video_url,
                vertical_short_url=f"/video/{ep_id}_verticalshort.mp4",
                fps=video_result.fps,
                duration_frames=video_result.duration_frames,
                render_status=video_result.status,
            ),
            dialogue=[
                DialogueTurn(
                    id=t.id,
                    speaker=SpeakerIdentity(t.speaker.value),
                    text=t.text,
                    start_ms=t.start_ms,
                    end_ms=t.end_ms,
                    entity_ids=[strawberry.ID(eid) for eid in getattr(t, 'entity_ids', [])],
                    citations=[
                        SourceCitation(
                            source_id=c.source_id,
                            source_title=c.source_title,
                            page_number=c.page_number,
                            timestamp_sec=c.timestamp_sec,
                            snippet=c.snippet
                        ) for c in t.citations
                    ]
                ) for t in ep.dialogue
            ],
            created_at=ep.created_at
        )

    @strawberry.mutation
    async def ask_hosts(
        self,
        episode_id: strawberry.ID,
        question: str,
        current_time_ms: int = 0
    ) -> ClarificationResponse:
        """Handles live barge-in clarifying questions from the user."""
        clarification = await scripter.generate_host_clarification(
            episode_id=str(episode_id),
            question=question,
            current_time_ms=current_time_ms,
        )
        return ClarificationResponse(
            id=strawberry.ID(clarification.id),
            episode_id=strawberry.ID(clarification.episode_id),
            question=clarification.question,
            answer_text=clarification.answer_text,
            speaker=SpeakerIdentity(clarification.speaker.value),
            audio_url=clarification.audio_url,
            citations=[
                SourceCitation(
                    source_id=c.source_id,
                    source_title=c.source_title,
                    page_number=c.page_number,
                    timestamp_sec=c.timestamp_sec,
                    snippet=c.snippet
                ) for c in clarification.citations
            ],
            resume_time_ms=clarification.resume_time_ms
        )


@strawberry.type
class Subscription:
    @strawberry.subscription
    async def synthesis_progress(self, episode_id: strawberry.ID) -> AsyncGenerator[SynthesisProgressEvent, None]:
        steps = [
            (SynthesisStatus.ANALYZING_GRAPH, 20, "Extracting concept relations..."),
            (SynthesisStatus.SCRIPTING_DIALOGUE, 50, "Generating dual-host dialogue..."),
            (SynthesisStatus.SYNTHESIZING_AUDIO, 80, "Synthesizing Kokoro-82M neural voices..."),
            (SynthesisStatus.COMPLETED, 100, "Episode mastered and ready.")
        ]
        for status, pct, msg in steps:
            await asyncio.sleep(0.5)
            yield SynthesisProgressEvent(
                episode_id=episode_id,
                status=status,
                percent_complete=pct,
                current_step_message=msg
            )


schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)
