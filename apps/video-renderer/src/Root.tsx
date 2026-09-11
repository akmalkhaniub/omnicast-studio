import React from 'react';
import { Composition } from 'remotion';
import { WidescreenPodcast } from './compositions/WidescreenPodcast';
import { VerticalShort } from './compositions/VerticalShort';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Widescreen (1920x1080) for YouTube */}
      <Composition
        id="WidescreenPodcast"
        component={WidescreenPodcast}
        durationInFrames={30 * 60} // 60 seconds at 30 FPS
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'OmniCast Deep-Dive: Graph RAG & Real-Time Voice',
          activeSpeaker: 'Alex (Curious Analyst)',
          currentCaption: 'The architectural shift toward Graph RAG combined with full-duplex voice completely changes how we interact with dense documentation.',
          citationSource: 'System Architecture Specification (Page 1, Sec 2.4)',
        }}
      />

      {/* 9:16 Vertical (1080x1920) for Shorts / Reels / TikTok */}
      <Composition
        id="VerticalShort"
        component={VerticalShort}
        durationInFrames={30 * 30} // 30 seconds at 30 FPS
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          hookText: 'The Death of Naive Vector RAG?',
          speakerName: 'Alex (OmniCast)',
          captionText: 'Graph RAG allows multi-hop reasoning across 20 papers in seconds.',
        }}
      />
    </>
  );
};
