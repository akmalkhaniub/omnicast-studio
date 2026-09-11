import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface VerticalShortProps {
  hookText: string;
  speakerName: string;
  captionText: string;
}

export const VerticalShort: React.FC<VerticalShortProps> = ({
  hookText = 'The Death of Naive Vector RAG?',
  speakerName = 'Alex (OmniCast)',
  captionText = 'Graph RAG allows multi-hop reasoning across 20 papers in seconds.',
}) => {
  const frame = useCurrentFrame();
  const bounce = interpolate(Math.sin(frame / 6), [-1, 1], [0.97, 1.03]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px 50px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Hook Banner */}
      <div
        style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '16px',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '32px',
          textTransform: 'uppercase',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
        }}
      >
        {hookText}
      </div>

      {/* Center Waveform Pulsing Orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        <div
          style={{
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #6366f1 0%, #4338ca 50%, #1e1b4b 100%)',
            transform: `scale(${bounce})`,
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px',
          }}
        >
          🎙️
        </div>
        <span style={{ fontSize: '28px', fontWeight: 700, color: '#a5b4fc' }}>{speakerName}</span>
      </div>

      {/* Kinetic Big Captions */}
      <div
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          border: '2px solid #3f3f46',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.3, margin: 0, color: '#facc15' }}>
          "{captionText}"
        </p>
      </div>
    </div>
  );
};
