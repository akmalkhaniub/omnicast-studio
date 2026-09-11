"""OmniCast Studio Core API: FastAPI Application Entrypoint."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from strawberry.fastapi import GraphQLRouter

from omnicast.config import settings
from omnicast.storage.database import init_db
from omnicast.knowledge_graph.engine import graph_engine
from omnicast.api.graphql.schema import schema
from omnicast.api.live_ws import voice_websocket_handler
from omnicast.syndication.rss_generator import generate_podcast_rss


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan context."""
    # Initialize persistence
    await init_db(mock_mode=False)
    # Initialize Knowledge Graph
    await graph_engine.initialize()
    # Ensure audio and video cache directories exist
    os.makedirs("./data/audio_cache", exist_ok=True)
    os.makedirs("./data/video_cache", exist_ok=True)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Strawberry GraphQL Router (supports GraphiQL in browser at /graphql)
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# Mount Voice Streaming WebSocket
app.add_api_websocket_route("/api/v1/voice/live", voice_websocket_handler)

# Mount Static Audio and Video Media Files
os.makedirs("./data/audio_cache", exist_ok=True)
os.makedirs("./data/video_cache", exist_ok=True)
app.mount("/audio", StaticFiles(directory="./data/audio_cache"), name="audio")
app.mount("/video", StaticFiles(directory="./data/video_cache"), name="video")


@app.get("/healthz")
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model": settings.DEFAULT_MODEL
    }


@app.get("/readyz")
async def readiness_probe():
    """Readiness probe."""
    return {
        "status": "ready",
        "embedded_graph": settings.USE_EMBEDDED_GRAPH,
        "tts_engine": settings.TTS_ENGINE
    }


@app.get("/feed/{workspace_id}/podcast.xml")
async def get_podcast_rss(workspace_id: str):
    """Apple Podcasts & Spotify RSS 2.0 feed generator."""
    from omnicast.storage.models import Workspace, Episode
    # Look up in memory or DB
    ws = await Workspace.get(workspace_id) if hasattr(Workspace, 'get') else None
    if not ws:
        ws = Workspace(id=workspace_id, title="Research Workspace", description="OmniCast RSS Feed")
    
    episodes = await Episode.find(Episode.workspace_id == workspace_id).to_list() if hasattr(Episode, 'find') else []
    rss_xml = generate_podcast_rss(ws, episodes)
    return Response(content=rss_xml, media_type="application/xml")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("omnicast.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
