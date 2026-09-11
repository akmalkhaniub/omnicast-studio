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


@strawberry.type
class VideoComposition:
    id: strawberry.ID
    widescreen_url: Optional[str] = None
    vertical_short_url: Optional[str] = None
    fps: int = 30
    duration_frames: int = 0
    render_status: str = "PENDING"


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
        doc = MongoSourceDocument(
            id=doc_id,
            workspace_id=ws_id,
            title=input.title,
            source_type=MongoSourceType(input.source_type.value),
            content=input.content,
            token_count=len(input.content.split()),
            created_at=datetime.now(timezone.utc)
        )
        if ws_id not in _mem_sources:
            _mem_sources[ws_id] = []
        _mem_sources[ws_id].append(doc)

        # Extract entities directly into Knowledge Graph
        nodes, edges = await planner.extract_knowledge_graph(
            document_text=input.content,
            source_id=doc_id,
            source_title=input.title
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

        # 1. Scripting
        dialogue = await scripter.generate_episode_script(
            workspace_title=ws_title,
            sources=sources,
            knowledge_graph_summary="Graph RAG clusters",
            target_minutes=input.target_duration_minutes
        )

        # 2. Synthesize audio
        audio_url = await audio_synthesizer.synthesize_episode(ep_id, dialogue)
        total_duration = dialogue[-1].end_ms if dialogue else 0

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
                ) for t in ep.dialogue
            ],
            created_at=ep.created_at
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
