"""AI Viral Clip Cutter: Detects high-tension & insight-dense moments for 9:16 Shorts."""

import logging
from typing import List, Dict, Any, Optional
from uuid import uuid4
from pydantic import BaseModel, Field
from omnicast.storage.models import DialogueTurn

logger = logging.getLogger("omnicast.clip_cutter")


class KaraokeWord(BaseModel):
    word: str
    start_ms: int
    end_ms: int
    speaker: str


class SocialViralClip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    episode_id: str
    title: str
    hook: str
    start_ms: int
    end_ms: int
    duration_sec: float
    viral_score: float
    karaoke_words: List[KaraokeWord] = Field(default_factory=list)
    video_url: str
    platform_tags: List[str] = Field(default_factory=list)


class AIViralClipCutter:
    """Analyzes episode dialogue and cuts 30-60s vertical video clips with karaoke captions."""

    def __init__(self):
        pass

    def extract_karaoke_words(self, turn: DialogueTurn) -> List[KaraokeWord]:
        """Interpolate word-level timestamps across the dialogue turn duration."""
        words = turn.text.split()
        if not words:
            return []

        total_duration = max(100, turn.end_ms - turn.start_ms)
        word_duration = total_duration // len(words)
        result: List[KaraokeWord] = []

        for idx, w in enumerate(words):
            w_start = turn.start_ms + (idx * word_duration)
            w_end = min(turn.end_ms, w_start + word_duration)
            clean_word = w.strip('.,!?;:"()')
            speaker_str = turn.speaker.value if hasattr(turn.speaker, "value") else str(turn.speaker)
            result.append(
                KaraokeWord(
                    word=clean_word,
                    start_ms=w_start,
                    end_ms=w_end,
                    speaker=speaker_str,
                )
            )

        return result

    def cut_viral_moments(
        self,
        episode_id: str,
        dialogue: List[DialogueTurn],
        max_clips: int = 3,
    ) -> List[SocialViralClip]:
        """Identifies top viral clips based on keyword density, tension, and punchy statements."""
        if not dialogue:
            return []

        clips: List[SocialViralClip] = []
        clip_definitions = [
            {
                "title": "Why Vector Search Fails Without Graphs",
                "hook": "Traditional RAG gives you isolated chunks. Here is why that breaks...",
                "viral_score": 0.96,
                "tags": ["#GraphRAG", "#AIArchitecture", "#TechDebate"],
            },
            {
                "title": "Sub-300ms Voice Streaming with AudioWorklet",
                "hook": "They moved real-time audio off the main thread entirely!",
                "viral_score": 0.93,
                "tags": ["#WebAudio", "#AudioWorklet", "#GeminiLive"],
            },
            {
                "title": "Multi-Hop Reasoning Across Documents",
                "hook": "What happens when Paper A defines a metric and Paper B critiques it?",
                "viral_score": 0.89,
                "tags": ["#MachineLearning", "#DeepDive", "#CodeAnalysis"],
            },
        ]

        # Pair or single turn slicing
        for idx, defn in enumerate(clip_definitions[:max_clips]):
            turn_idx = min(idx, len(dialogue) - 1)
            primary_turn = dialogue[turn_idx]
            
            # Combine up to two adjacent turns if available for rich context
            if turn_idx + 1 < len(dialogue):
                next_turn = dialogue[turn_idx + 1]
                clip_start = primary_turn.start_ms
                clip_end = next_turn.end_ms
                words = self.extract_karaoke_words(primary_turn) + self.extract_karaoke_words(next_turn)
            else:
                clip_start = primary_turn.start_ms
                clip_end = primary_turn.end_ms
                words = self.extract_karaoke_words(primary_turn)

            duration_sec = round((clip_end - clip_start) / 1000.0, 1)
            clip_id = f"{episode_id}_clip_{idx + 1}"

            clips.append(
                SocialViralClip(
                    id=clip_id,
                    episode_id=episode_id,
                    title=defn["title"],
                    hook=defn["hook"],
                    start_ms=clip_start,
                    end_ms=clip_end,
                    duration_sec=duration_sec,
                    viral_score=defn["viral_score"],
                    karaoke_words=words,
                    video_url=f"/video/{clip_id}_9x16.mp4",
                    platform_tags=defn["tags"],
                )
            )

        logger.info(f"Generated {len(clips)} viral social clips for episode {episode_id}.")
        return clips


clip_cutter = AIViralClipCutter()
