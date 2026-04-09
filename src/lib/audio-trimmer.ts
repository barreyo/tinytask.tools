export interface AudioInfo {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  numberOfSamples: number;
  fileSize: number;
  fileName: string;
}

export interface WaveformOpts {
  primaryColor?: string;
  dimColor?: string;
  selectionColor?: string;
  peakBarWidth?: number;
}

export function getAudioInfo(buffer: AudioBuffer, fileSize: number, fileName: string): AudioInfo {
  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    numberOfChannels: buffer.numberOfChannels,
    numberOfSamples: buffer.length,
    fileSize,
    fileName,
  };
}

export function trimBuffer(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const sr = buffer.sampleRate;
  const startSample = Math.max(0, Math.floor(startSec * sr));
  const endSample = Math.min(buffer.length, Math.ceil(endSec * sr));
  const newLength = endSample - startSample;

  const trimmed = new AudioBuffer({
    length: newLength,
    sampleRate: sr,
    numberOfChannels: buffer.numberOfChannels,
  });

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch).subarray(startSample, endSample);
    trimmed.copyToChannel(src, ch, 0);
  }

  return trimmed;
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const fileSize = 44 + dataSize;

  const ab = new ArrayBuffer(fileSize);
  const view = new DataView(ab);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and convert float32 → int16
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export interface WaveformPeaks {
  min: Float32Array;
  max: Float32Array;
  bins: number;
}

export function computePeaks(buffer: AudioBuffer, bins: number): WaveformPeaks {
  // Mix all channels down to mono for display
  const length = buffer.length;
  const channels = buffer.numberOfChannels;
  const samplesPerBin = Math.floor(length / bins);

  const min = new Float32Array(bins);
  const max = new Float32Array(bins);

  for (let bin = 0; bin < bins; bin++) {
    let lo = 1;
    let hi = -1;
    const start = bin * samplesPerBin;
    const end = Math.min(start + samplesPerBin, length);

    for (let ch = 0; ch < channels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = start; i < end; i++) {
        const v = data[i];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }

    min[bin] = lo;
    max[bin] = hi;
  }

  return { min, max, bins };
}

export function drawWaveform(
  peaks: WaveformPeaks,
  canvas: HTMLCanvasElement,
  startSec: number,
  endSec: number,
  duration: number,
  opts: WaveformOpts = {},
) {
  const {
    primaryColor = '#555',
    dimColor = '#2a2a2a',
    selectionColor = 'rgba(122,171,204,0.18)',
    peakBarWidth = 2,
  } = opts;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const { bins, min, max } = peaks;
  const mid = h / 2;

  // Draw selection background
  if (duration > 0) {
    const sx = (startSec / duration) * w;
    const ex = (endSec / duration) * w;
    ctx.fillStyle = selectionColor;
    ctx.fillRect(sx, 0, ex - sx, h);
  }

  // Draw waveform bars
  for (let i = 0; i < bins; i++) {
    const x = (i / bins) * w;
    const timeSec = (i / bins) * duration;
    const inSelection = timeSec >= startSec && timeSec <= endSec;

    ctx.fillStyle = inSelection ? '#7aabcc' : primaryColor;

    const lo = min[i] * mid;
    const hi = max[i] * mid;
    const barH = Math.max(1, hi - lo);
    ctx.fillRect(x, mid - hi, peakBarWidth, barH);
  }

  // Draw center line (faint)
  ctx.fillStyle = dimColor;
  ctx.fillRect(0, mid - 0.5, w, 1);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2).padStart(5, '0');
  return `${m}:${s}`;
}
