"""Storage Models for OmniCast Studio (Pydantic v2 & MongoDB compatible)."""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import uuid4
from pydantic import BaseModel, Field


class SourceType(str, Enum):
    PDF = "PDF"
    URL = "URL"
    YOUTUBE = "YOUTUBE"
    CODE = "CODE"
    MARKDOWN = "MARKDOWN"


class SpeakerIdentity(str, Enum):
    HOST_A = "HOST_A"
    HOST_B = "HOST_B"
    USER = "USER"


class SynthesisStatus(str, Enum):
    PENDING = "PENDING"
    ANALYZING_GRAPH = "ANALYZING_GRAPH"
    SCRIPTING_DIALOGUE = "SCRIPTING_DIALOGUE"
    SYNTHESIZING_AUDIO = "SYNTHESIZING_AUDIO"
    RENDERING_VIDEO = "RENDERING_VIDEO"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class SourceCitation(BaseModel):
    source_id: str
    source_title: str
    page_number: Optional[int] = None
    timestamp_sec: Optional[float] = None
    snippet: str


class DialogueTurn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    speaker: SpeakerIdentity
    text: str
    start_ms: int = 0
    end_ms: int = 0
    citations: List[SourceCitation] = []
    entity_ids: List[str] = Field(default_factory=list)


class HostClarification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    episode_id: str
    question: str
    answer_text: str
    speaker: SpeakerIdentity
    audio_url: Optional[str] = None
    citations: List[SourceCitation] = []
    resume_time_ms: int = 0


class VideoComposition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    widescreen_url: Optional[str] = None
    vertical_short_url: Optional[str] = None
    fps: int = 30
    duration_frames: int = 0
    render_status: str = "PENDING"


class SourceDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    workspace_id: str
    title: str
    source_type: SourceType
    content: str
    token_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Episode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    workspace_id: str
    title: str
    summary: str = ""
    audio_url: Optional[str] = None
    duration_ms: int = 0
    status: SynthesisStatus = SynthesisStatus.PENDING
    dialogue: List[DialogueTurn] = []
    video_composition: Optional[VideoComposition] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Workspace(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
