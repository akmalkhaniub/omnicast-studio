'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface GeminiLiveState {
  isConnected: boolean;
  isListening: boolean;
  isAgentSpeaking: boolean;
  audioRMS: number;
  lastTranscription: string;
  latencyMs: number;
}

export function useGeminiLive(wsUrl = 'ws://localhost:8000/api/v1/voice/live') {
  const [state, setState] = useState<GeminiLiveState>({
    isConnected: false,
    isListening: false,
    isAgentSpeaking: false,
    audioRMS: 0,
    lastTranscription: '',
    latencyMs: 240,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startVoiceSession = useCallback(async () => {
    try {
      // 1. Initialize Web Audio Context at 16kHz
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // 2. Load AudioWorklet module
      await audioContext.audioWorklet.addModule('/worklets/audio-processor.js');

      // 3. Capture microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'omnicast-audio-processor');
      workletNodeRef.current = workletNode;

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // 4. Connect WebSocket
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({ ...prev, isConnected: true, isListening: true }));
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.type === 'audio_telemetry') {
            setState((prev) => ({ ...prev, audioRMS: data.rms }));
          } else if (data.type === 'agent_answer') {
            setState((prev) => ({
              ...prev,
              lastTranscription: data.text,
              isAgentSpeaking: true,
            }));
          } else if (data.type === 'playback_stopped') {
            // Barge-in: immediately clear hardware playback buffer
            workletNode.port.postMessage({ command: 'CLEAR_PLAYBACK_BUFFER' });
            setState((prev) => ({ ...prev, isAgentSpeaking: false }));
          }
        }
      };

      // 5. Pipe PCM chunks from AudioWorklet to WebSocket
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio_frame' && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data.pcmBuffer);
        }
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, isConnected: false, isListening: false }));
      };
    } catch (err) {
      console.error('Failed to start Gemini Live voice session:', err);
    }
  }, [wsUrl]);

  const stopVoiceSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isListening: false,
      isAgentSpeaking: false,
    }));
  }, []);

  const triggerBargeIn = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ command: 'CLEAR_PLAYBACK_BUFFER' });
    }
    setState((prev) => ({ ...prev, isAgentSpeaking: false }));
  }, []);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  return {
    ...state,
    startVoiceSession,
    stopVoiceSession,
    triggerBargeIn,
  };
}
