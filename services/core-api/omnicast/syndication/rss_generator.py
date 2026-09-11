"""Podcast Syndication: Standard RSS 2.0 Feed Generator with iTunes & Spotify Enclosures."""

import logging
from datetime import datetime
from typing import List
from feedgen.feed import FeedGenerator
from omnicast.config import settings
from omnicast.storage.models import Workspace, Episode

logger = logging.getLogger("omnicast.syndication")


def generate_podcast_rss(workspace: Workspace, episodes: List[Episode]) -> str:
    """Generate an RSS 2.0 XML podcast feed with audio enclosures."""
    fg = FeedGenerator()
    fg.load_extension('podcast')

    base_url = settings.PUBLIC_BASE_URL
    feed_url = f"{base_url}/feed/{workspace.id}/podcast.xml"

    fg.id(feed_url)
    fg.title(f"OmniCast: {workspace.title}")
    fg.author({'name': 'OmniCast Studio', 'email': 'studio@omnicast.ai'})
    fg.link(href=feed_url, rel='self')
    fg.description(workspace.description or f"AI-Synthesized Research & Tech Deep-Dives for {workspace.title}")
    fg.language('en')

    # iTunes / Spotify Podcast Metadata
    fg.podcast.itunes_category('Technology', 'Software')
    fg.podcast.itunes_author('OmniCast Studio')
    fg.podcast.itunes_explicit('no')
    fg.podcast.itunes_image(f"{base_url}/static/cover_art.png")

    for ep in episodes:
        if not ep.audio_url:
            continue

        fe = fg.add_entry()
        ep_url = f"{base_url}{ep.audio_url}"
        fe.id(ep_url)
        fe.title(ep.title)
        fe.description(ep.summary or f"Deep-Dive episode covering {workspace.title}")
        fe.enclosure(ep_url, 0, 'audio/mpeg')
        fe.podcast.itunes_duration(ep.duration_ms // 1000)
        fe.pubDate(ep.created_at.strftime('%a, %d %b %Y %H:%M:%S +0000'))

    return fg.rss_str(pretty=True).decode('utf-8')
