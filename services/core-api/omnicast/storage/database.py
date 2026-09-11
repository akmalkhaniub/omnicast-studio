"""MongoDB & Beanie Client Initialization with Resilient Fallback."""

import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from omnicast.config import settings
from omnicast.storage.models import Workspace, SourceDocument, Episode

logger = logging.getLogger("omnicast.storage")


async def init_db(mock_mode: bool = False) -> bool:
    """Initialize MongoDB connection with Beanie ODM."""
    if mock_mode:
        logger.info("Initializing in mock storage mode (no external MongoDB required).")
        return True

    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Verify connection
        await client.admin.command('ping')
        await init_beanie(
            database=client[settings.MONGODB_DB_NAME],
            document_models=[Workspace, SourceDocument, Episode]
        )
        logger.info("MongoDB & Beanie initialized successfully.")
        return True
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to local memory mode.")
        return False
