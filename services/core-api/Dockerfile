# Multi-Stage Production Dockerfile for OmniCast Core API
FROM python:3.13-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential libpq-dev ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Astral uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY pyproject.toml .
RUN uv venv /opt/venv && uv pip install --no-cache -r pyproject.toml

FROM python:3.13-slim as runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY omnicast ./omnicast

EXPOSE 8000

CMD ["uvicorn", "omnicast.main:app", "--host", "0.0.0.0", "--port", "8000"]
