import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface KaraokeWordData {
  word: string;
  start_ms: number;
  end_ms: number;
}

export interface VerticalShortProps {
  hookText: string;
  speakerName: string;
  captionText: string;
  karaokeWords?: KaraokeWordData[];
}

export const VerticalShort: React.FC<VerticalShortProps> = ({
  hookText = 'The Death of Naive Vector RAG?',
  speakerName = 'Alex (OmniCast)',
  captionText = 'Graph RAG allows multi-hop reasoning across 20 papers in seconds.',
  karaokeWords,
}) => {
  const frame = useCurrentFrame();
  const bounce = interpolate(Math.sin(frame / 6), [-1, 1], [0.97, 1.03]);

  // Derive current timestamp in ms based on 30 FPS
  const currentMs = (frame / 30) * 1000;

  // Split words if not explicitly passed
  const wordsList: KaraokeWordData[] =
    karaokeWords && karaokeWords.length > 0
      ? karaokeWords
      : captionText.split(' ').map((w, idx) => ({
          word: w,
          start_ms: idx * 400,
          end_ms: (idx + 1) * 400,
        }));

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

      {/* Kinetic Karaoke Big Captions */}
      <div
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.95)',
          border: '2px solid #3f3f46',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: 1.4,
          }}
        >
          {wordsList.map((item, idx) => {
            const isWordActive = currentMs >= item.start_ms && currentMs <= item.end_ms;
            return (
              <span
                key={idx}
                style={{
                  color: isWordActive ? '#facc15' : '#e4e4e7',
                  transform: isWordActive ? 'scale(1.15)' : 'scale(1)',
                  textShadow: isWordActive ? '0 0 20px rgba(250, 204, 21, 0.8)' : 'none',
                  display: 'inline-block',
                  transition: 'all 0.1s ease-out',
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
