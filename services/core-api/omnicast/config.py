"""OmniCast Studio Configuration Settings."""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "OmniCast Studio Core API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000", "*"]

    # Foundation Models (Google GenAI SDK)
    GEMINI_API_KEY: str = ""
    DEFAULT_MODEL: str = "gemini-3.8-flash"
    REASONING_MODEL: str = "gemini-3.1-pro"

    # Observability & Tracing (Langfuse v3)
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"

    # OpenTelemetry
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://localhost:4318"
    OTEL_SERVICE_NAME: str = "omnicast-core-api"

    # Persistence: MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017/omnicast"
    MONGODB_DB_NAME: str = "omnicast"

    # Knowledge Graph Persistence
    USE_EMBEDDED_GRAPH: bool = True
    KUZU_DATABASE_PATH: str = "./data/kuzu_omnicast"
    MEMGRAPH_HOST: str = "localhost"
    MEMGRAPH_PORT: int = 7687
    MEMGRAPH_USER: str = ""
    MEMGRAPH_PASSWORD: str = ""

    # Audio & Voice Settings
    TTS_ENGINE: str = "kokoro"  # 'kokoro' or 'cartesia'
    CARTESIA_API_KEY: str = ""
    AUDIO_SAMPLE_RATE: int = 16000

    # Syndication & Public URL
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
