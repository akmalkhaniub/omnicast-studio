import pytest
from omnicast.api.graphql.schema import schema
from omnicast.knowledge_graph.engine import KnowledgeGraphEngine, GraphNodeData, GraphEdgeData
from omnicast.agentic_rag.scripter import PodcastDialogueScripter
from omnicast.storage.models import SpeakerIdentity, Workspace, SourceDocument, Episode
from omnicast.syndication.rss_generator import generate_podcast_rss


@pytest.mark.asyncio
async def test_graphql_create_workspace():
    """Verify createWorkspace mutation and listWorkspaces query."""
    query_str = """
        mutation {
            createWorkspace(input: { title: "Test AI Lab", description: "Benchmarking research" }) {
                id
                title
                description
            }
        }
    """
    result = await schema.execute(query_str)
    assert result.errors is None
    assert result.data is not None
    ws_data = result.data["createWorkspace"]
    assert ws_data["title"] == "Test AI Lab"
    assert ws_data["id"] is not None


@pytest.mark.asyncio
async def test_knowledge_graph_ingest_and_query():
    """Verify Knowledge Graph entity and edge ingestion."""
    engine = KnowledgeGraphEngine()
    ws_id = "test_ws_001"

    nodes = [
        GraphNodeData(id="n1", label="FlashAttention-3", category="Algorithm"),
        GraphNodeData(id="n2", label="H100 GPU", category="Hardware"),
    ]
    edges = [
        GraphEdgeData(id="e1", source="n1", target="n2", relationship="BENCHMARKED_ON", weight=1.0)
    ]

    await engine.ingest_entities(ws_id, nodes, edges)
    graph = await engine.get_workspace_graph(ws_id)

    assert graph.total_nodes == 2
    assert graph.total_edges == 1
    assert graph.nodes[0].label == "FlashAttention-3"
    assert graph.edges[0].relationship == "BENCHMARKED_ON"


@pytest.mark.asyncio
async def test_podcast_dialogue_scripter():
    """Verify dual-host dialogue turn-taking, speaker balance, and citation links."""
    scripter = PodcastDialogueScripter()
    sources = [{"id": "src_42", "title": "Gemini 3.8 Architecture"}]

    dialogue = await scripter.generate_episode_script(
        workspace_title="AI Frontiers",
        sources=sources,
        knowledge_graph_summary="Graph RAG clusters",
        target_minutes=5
    )

    assert len(dialogue) >= 4
    # Verify speaker identities are present
    speakers = set(turn.speaker for turn in dialogue)
    assert SpeakerIdentity.HOST_A in speakers
    assert SpeakerIdentity.HOST_B in speakers

    # Verify timing monotonicity
    for i in range(len(dialogue) - 1):
        assert dialogue[i].start_ms < dialogue[i].end_ms
        assert dialogue[i].end_ms <= dialogue[i+1].start_ms

    # Verify citation grounding
    for turn in dialogue:
        assert len(turn.citations) > 0
        assert turn.citations[0].source_id == "src_42"


@pytest.mark.asyncio
async def test_rss_podcast_feed_generation():
    """Verify RSS 2.0 XML compliance and enclosure generation."""
    ws = Workspace(id="ws_99", title="Deep-Tech Audits", description="Automated research podcast")
    eps = [
        Episode(
            id="ep_1",
            workspace_id="ws_99",
            title="Episode 1: The Graph RAG Paradigm",
            audio_url="/audio/ep_1.mp3",
            duration_ms=180000
        )
    ]

    rss_xml = generate_podcast_rss(ws, eps)
    assert "<rss" in rss_xml
    assert "<title>OmniCast: Deep-Tech Audits</title>" in rss_xml
    assert 'url="http://localhost:8000/audio/ep_1.mp3"' in rss_xml
    assert 'type="audio/mpeg"' in rss_xml


@pytest.mark.asyncio
async def test_universal_document_ingestion():
    """Verify markdown chunking and YouTube video ID extraction."""
    from omnicast.ingestion.extractors import universal_ingestion, YouTubeTranscriptExtractor

    # 1. Test Markdown extraction & semantic chunking
    sample_md = """# OmniCast Studio Architecture

## Audio Engine
The audio engine runs full-duplex with sub-300ms latency.

## Graph RAG
The Graph RAG pipeline discovers latent relational bridges across scientific research papers.
"""
    doc = await universal_ingestion.ingest_file(sample_md.encode("utf-8"), "architecture.md")
    assert doc.title == "OmniCast Studio Architecture"
    assert doc.source_type == "MARKDOWN"
    assert len(doc.chunks) >= 1
    assert "Graph RAG" in doc.content

    # 2. Test YouTube URL parser
    yt_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    vid_id = YouTubeTranscriptExtractor.parse_video_id(yt_url)
    assert vid_id == "dQw4w9WgXcQ"


@pytest.mark.asyncio
async def test_graph_community_detection():
    """Verify community detection clustering and degree calculation."""
    engine = KnowledgeGraphEngine()
    ws_id = "test_cluster_ws"

    # Cluster 1: Machine Learning
    nodes = [
        GraphNodeData(id="n1", label="Transformers", category="Model"),
        GraphNodeData(id="n2", label="Self-Attention", category="Mechanism"),
        # Cluster 2: Infrastructure
        GraphNodeData(id="n3", label="Kubernetes", category="Infra"),
        GraphNodeData(id="n4", label="Docker", category="Container"),
    ]
    edges = [
        GraphEdgeData(id="e1", source="n1", target="n2", relationship="USES"),
        GraphEdgeData(id="e2", source="n3", target="n4", relationship="ORCHESTRATES"),
    ]

    await engine.ingest_entities(ws_id, nodes, edges)
    graph = await engine.get_workspace_graph(ws_id)

    # Check degrees
    node_map = {n.id: n for n in graph.nodes}
    assert node_map["n1"].degree == 1
    assert node_map["n2"].degree == 1

    # Check distinct communities were identified
    comm_1 = node_map["n1"].community_id
    comm_2 = node_map["n2"].community_id
    comm_3 = node_map["n3"].community_id
    assert comm_1 == comm_2
    assert comm_1 != comm_3

    summary = await engine.get_community_summary(ws_id)
    assert "Cluster #1" in summary
    assert "Cluster #2" in summary


@pytest.mark.asyncio
async def test_remotion_video_renderer():
    """Verify Remotion composition props creation and render output."""
    from omnicast.video.renderer import video_renderer, VideoCompositionType
    from omnicast.storage.models import DialogueTurn, SpeakerIdentity

    dialogue = [
        DialogueTurn(
            id="turn_1",
            speaker=SpeakerIdentity.HOST_A,
            text="Welcome to OmniCast Studio.",
            start_ms=0,
            end_ms=2500,
        ),
        DialogueTurn(
            id="turn_2",
            speaker=SpeakerIdentity.HOST_B,
            text="Today we explore the Graph RAG engine.",
            start_ms=2500,
            end_ms=5000,
        ),
    ]

    result = await video_renderer.render_composition(
        episode_id="ep_test_vid",
        title="OmniCast Deep Dive",
        dialogue=dialogue,
        audio_url="/audio/ep_test_vid.mp3",
        composition=VideoCompositionType.WIDESCREEN_PODCAST,
    )

    assert result.status == "READY"
    assert "ep_test_vid_widescreenpodcast" in result.render_id
    assert result.video_url.endswith(".mp4")
    assert result.duration_frames > 0
    assert result.metadata["resolution"] == "1920x1080"
    assert result.metadata["total_subtitles"] == 2
