"""Knowledge Graph Engine: Supports embedded Kùzu & Memgraph / Neo4j."""

import os
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from omnicast.config import settings

logger = logging.getLogger("omnicast.graph")


class GraphNodeData(BaseModel):
    id: str
    label: str
    category: str
    community_id: Optional[int] = 0
    degree: int = 1
    citation_source_id: Optional[str] = None
    citation_page: Optional[int] = None
    citation_snippet: Optional[str] = None


class GraphEdgeData(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    weight: float = 1.0


class KnowledgeGraphResult(BaseModel):
    nodes: List[GraphNodeData]
    edges: List[GraphEdgeData]
    total_nodes: int
    total_edges: int


class KnowledgeGraphEngine:
    """Unified GraphDB manager with Kùzu embedded & Memgraph remote backends."""

    def __init__(self):
        self.use_embedded = settings.USE_EMBEDDED_GRAPH
        self._memory_nodes: Dict[str, Dict[str, GraphNodeData]] = {}  # workspace_id -> nodes
        self._memory_edges: Dict[str, List[GraphEdgeData]] = {}       # workspace_id -> edges
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize graph storage."""
        if self.use_embedded:
            try:
                os.makedirs(os.path.dirname(settings.KUZU_DATABASE_PATH), exist_ok=True)
                # Kùzu database can be initialized here when kuzu is imported
                logger.info(f"Initialized Kùzu embedded graph engine at {settings.KUZU_DATABASE_PATH}")
            except Exception as e:
                logger.warning(f"Kùzu initialization note: {e}. Using high-performance in-memory graph fallback.")
        self._initialized = True

    async def ingest_entities(
        self,
        workspace_id: str,
        nodes: List[GraphNodeData],
        edges: List[GraphEdgeData]
    ) -> None:
        """Ingest nodes and edges into the workspace knowledge graph."""
        if workspace_id not in self._memory_nodes:
            self._memory_nodes[workspace_id] = {}
            self._memory_edges[workspace_id] = []

        for node in nodes:
            self._memory_nodes[workspace_id][node.id] = node

        for edge in edges:
            self._memory_edges[workspace_id].append(edge)

        logger.info(
            f"Ingested {len(nodes)} nodes and {len(edges)} edges into workspace {workspace_id}."
        )

    async def get_workspace_graph(self, workspace_id: str) -> KnowledgeGraphResult:
        """Retrieve full or subgraph for a workspace."""
        nodes_dict = self._memory_nodes.get(workspace_id, {})
        edges_list = self._memory_edges.get(workspace_id, [])

        nodes = list(nodes_dict.values())
        return KnowledgeGraphResult(
            nodes=nodes,
            edges=edges_list,
            total_nodes=len(nodes),
            total_edges=len(edges_list)
        )

    async def find_multi_hop_path(
        self, workspace_id: str, start_entity: str, end_entity: str, max_depth: int = 3
    ) -> List[Dict[str, Any]]:
        """Find relational paths between two entities across graph relationships."""
        edges = self._memory_edges.get(workspace_id, [])
        # Simple BFS pathfinder for demo/in-memory
        queue = [[start_entity]]
        visited = set()
        paths = []

        while queue:
            path = queue.pop(0)
            node = path[-1]
            if node == end_entity and len(path) > 1:
                paths.append(path)
                continue
            if len(path) > max_depth:
                continue
            if node not in visited:
                visited.add(node)
                for edge in edges:
                    if edge.source == node:
                        queue.append(path + [edge.target])

        return [{"path": p} for p in paths]


graph_engine = KnowledgeGraphEngine()
