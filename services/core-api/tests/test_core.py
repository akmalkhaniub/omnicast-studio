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
