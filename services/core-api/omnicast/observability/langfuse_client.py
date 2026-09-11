"""Langfuse v3 Observability & OpenTelemetry Integration."""

import logging
from typing import Optional, Dict, Any
from omnicast.config import settings

logger = logging.getLogger("omnicast.observability")


class ObservabilityClient:
    """Enterprise tracing, prompt governance, and cost tracking."""

    def __init__(self):
        self.enabled = bool(settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY)
        self.client = None
        if self.enabled:
            try:
                from langfuse import Langfuse
                self.client = Langfuse(
                    public_key=settings.LANGFUSE_PUBLIC_KEY,
                    secret_key=settings.LANGFUSE_SECRET_KEY,
                    host=settings.LANGFUSE_HOST,
                )
                logger.info("Langfuse v3 tracing client connected.")
            except Exception as e:
                logger.warning(f"Failed to initialize live Langfuse ({e}). Running in mock mode.")
        else:
            logger.info("Langfuse credentials not configured; local tracing mock active.")

    def trace_generation(
        self,
        name: str,
        input_data: Any,
        output_data: Any,
        model_name: str,
        token_usage: Optional[Dict[str, int]] = None,
        latency_ms: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Record an LLM generation span."""
        if not self.enabled or not self.client:
            logger.debug(f"[Mock Trace] {name} | Model: {model_name} | Latency: {latency_ms:.1f}ms")
            return

        try:
            self.client.trace(
                name=name,
                metadata={
                    "model": model_name,
                    "latency_ms": latency_ms,
                    **(metadata or {})
                }
            ).generation(
                name=name,
                model=model_name,
                input=input_data,
                output=output_data,
                usage=token_usage
            )
        except Exception as e:
            logger.error(f"Error logging span to Langfuse: {e}")


obs_client = ObservabilityClient()
