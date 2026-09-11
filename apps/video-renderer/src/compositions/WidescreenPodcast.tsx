import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface WidescreenPodcastProps {
  title: string;
  activeSpeaker: string;
  currentCaption: string;
  citationSource: string;
}

export const WidescreenPodcast: React.FC<WidescreenPodcastProps> = ({
  title = 'OmniCast Deep-Dive: Graph RAG & Real-Time Voice',
  activeSpeaker = 'Alex (Curious Analyst)',
  currentCaption = 'The architectural shift toward Graph RAG combined with full-duplex voice completely changes how we interact with dense documentation.',
  citationSource = 'System Architecture Specification (Page 1, Sec 2.4)',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle pulsing animation for audio reactive orb
  const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.95, 1.05]);
  const orbGlow = interpolate(Math.sin(frame / 8), [-1, 1], [20, 45]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        color: '#f4f4f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            }}
          >
            🎙️
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>{title}</h1>
            <p style={{ fontSize: '16px', color: '#a1a1aa', margin: '4px 0 0 0' }}>OmniCast Research Overviews</p>
          </div>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: '999px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            fontSize: '14px',
            color: '#34d399',
            fontFamily: 'monospace',
          }}
        >
          ● MASTERED: -16 LUFS
        </div>
      </div>

      {/* Center Stage: Reactive Audio Orb & Active Slide */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
        {/* Left: Animated Audio Orb */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #6366f1 0%, #312e81 60%, #09090b 100%)',
              transform: `scale(${pulse})`,
              boxShadow: `0 0 ${orbGlow}px rgba(99, 102, 241, 0.6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(165, 180, 252, 0.3)',
            }}
          >
            <div style={{ fontSize: '54px' }}>⚡</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#e0e7ff' }}>{activeSpeaker}</span>
            <p style={{ fontSize: '14px', color: '#818cf8', margin: '4px 0 0 0' }}>Speaking via Kokoro-82M Neural Audio</p>
          </div>
        </div>

        {/* Right: Grounded Citation Slide Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', letterSpacing: '0.05em' }}>
              VERIFIED SOURCE CITATION
            </span>
          </div>
          <p style={{ fontSize: '18px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            "{citationSource}"
          </p>
        </div>
      </div>

      {/* Subtitle / Caption Bar */}
      <div
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '24px 32px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '24px', fontWeight: 500, color: '#f8fafc', lineHeight: 1.4, margin: 0 }}>
          {currentCaption}
        </p>
      </div>
    </div>
  );
};
