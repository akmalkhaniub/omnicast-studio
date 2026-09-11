"""Document ingestion and multimodal extraction package."""
from omnicast.ingestion.extractors import (
    DocumentExtract,
    DocumentChunk,
    UniversalIngestionService,
    universal_ingestion,
)

__all__ = [
    "DocumentExtract",
    "DocumentChunk",
    "UniversalIngestionService",
    "universal_ingestion",
]
