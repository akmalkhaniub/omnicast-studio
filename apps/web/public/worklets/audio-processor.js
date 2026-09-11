/**
 * OmniCast Studio AudioWorkletProcessor
 * Runs on dedicated OS Audio Rendering Thread.
 * Delivers zero-latency 16kHz Linear PCM capture and playback.
 */

class OmniCastAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048; // ~128ms chunks at 16kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.isMuted = false;

    this.port.onmessage = (event) => {
      const { command } = event.data;
      if (command === 'CLEAR_PLAYBACK_BUFFER') {
        // Barge-in: immediately zero out playback buffer
        this.bufferIndex = 0;
        this.buffer.fill(0);
      } else if (command === 'MUTE') {
        this.isMuted = true;
      } else if (command === 'UNMUTE') {
        this.isMuted = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0] || this.isMuted) {
      return true;
    }

    const channelData = input[0];
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];
      if (this.bufferIndex >= this.bufferSize) {
        // Convert Float32 (-1.0 to 1.0) to 16-bit signed Linear PCM (Int16)
        const pcm16 = new Int16Array(this.bufferSize);
        for (let j = 0; j < this.bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]));
          pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Transfer raw PCM buffer to worker thread without copying
        this.port.postMessage({
          type: 'audio_frame',
          pcmBuffer: pcm16.buffer
        }, [pcm16.buffer]);

        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('omnicast-audio-processor', OmniCastAudioProcessor);
