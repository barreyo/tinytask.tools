import { describe, it, expect } from 'vitest';
import {
  trimBuffer,
  encodeWav,
  computePeaks,
  formatTime,
  getAudioInfo,
} from '../lib/audio-trimmer';

// Minimal AudioBuffer stub for unit tests (no Web Audio API in Node)
function makeBuffer(samples: number, sampleRate: number, channels: number): AudioBuffer {
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < channels; ch++) {
    const data = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      data[i] = Math.sin((i / sampleRate) * 2 * Math.PI * 440);
    }
    channelData.push(data);
  }

  return {
    sampleRate,
    length: samples,
    duration: samples / sampleRate,
    numberOfChannels: channels,
    getChannelData: (ch: number) => channelData[ch],
    copyToChannel: (src: Float32Array, ch: number, offset: number) => {
      channelData[ch].set(src, offset);
    },
  } as unknown as AudioBuffer;
}

global.AudioBuffer = class {
  sampleRate: number;
  length: number;
  duration: number;
  numberOfChannels: number;
  private channels: Float32Array[];

  constructor(opts: { length: number; sampleRate: number; numberOfChannels: number }) {
    this.sampleRate = opts.sampleRate;
    this.length = opts.length;
    this.duration = opts.length / opts.sampleRate;
    this.numberOfChannels = opts.numberOfChannels;
    this.channels = Array.from(
      { length: opts.numberOfChannels },
      () => new Float32Array(opts.length),
    );
  }

  getChannelData(ch: number): Float32Array {
    return this.channels[ch];
  }

  copyToChannel(src: Float32Array, ch: number, offset: number) {
    this.channels[ch].set(src, offset);
  }
} as unknown as typeof AudioBuffer;

describe('trimBuffer', () => {
  it('trims to the correct sample range', () => {
    const buffer = makeBuffer(44100, 44100, 1); // 1 second
    const trimmed = trimBuffer(buffer, 0.25, 0.75);
    expect(trimmed.length).toBe(22050); // 0.5 seconds
    expect(trimmed.sampleRate).toBe(44100);
    expect(trimmed.numberOfChannels).toBe(1);
  });

  it('clamps start/end to buffer bounds', () => {
    const buffer = makeBuffer(44100, 44100, 1);
    const trimmed = trimBuffer(buffer, -1, 5); // beyond bounds
    expect(trimmed.length).toBe(44100);
  });

  it('preserves all channels', () => {
    const buffer = makeBuffer(44100, 44100, 2);
    const trimmed = trimBuffer(buffer, 0, 0.5);
    expect(trimmed.numberOfChannels).toBe(2);
  });
});

describe('encodeWav', () => {
  it('produces a Blob with the correct MIME type', () => {
    const buffer = makeBuffer(4410, 44100, 1);
    const blob = encodeWav(buffer);
    expect(blob.type).toBe('audio/wav');
  });

  it('produces correct file size (44 header + data)', () => {
    const samples = 1000;
    const channels = 2;
    const buffer = makeBuffer(samples, 44100, channels);
    const blob = encodeWav(buffer);
    // 44 header + samples * channels * 2 bytes per sample
    const expected = 44 + samples * channels * 2;
    expect(blob.size).toBe(expected);
  });

  it('encodes stereo correctly', () => {
    const buffer = makeBuffer(4410, 44100, 2);
    const blob = encodeWav(buffer);
    expect(blob.size).toBeGreaterThan(44);
  });
});

describe('computePeaks', () => {
  it('returns correct bin count', () => {
    const buffer = makeBuffer(44100, 44100, 1);
    const peaks = computePeaks(buffer, 100);
    expect(peaks.bins).toBe(100);
    expect(peaks.min.length).toBe(100);
    expect(peaks.max.length).toBe(100);
  });

  it('max >= min for all bins', () => {
    const buffer = makeBuffer(44100, 44100, 1);
    const peaks = computePeaks(buffer, 200);
    for (let i = 0; i < peaks.bins; i++) {
      expect(peaks.max[i]).toBeGreaterThanOrEqual(peaks.min[i]);
    }
  });

  it('values are within [-1, 1]', () => {
    const buffer = makeBuffer(44100, 44100, 2);
    const peaks = computePeaks(buffer, 50);
    for (let i = 0; i < peaks.bins; i++) {
      expect(peaks.min[i]).toBeGreaterThanOrEqual(-1);
      expect(peaks.max[i]).toBeLessThanOrEqual(1);
    }
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss.cc', () => {
    expect(formatTime(0)).toBe('0:00.00');
    expect(formatTime(65.5)).toBe('1:05.50');
    expect(formatTime(3.14)).toBe('0:03.14');
  });

  it('handles long durations', () => {
    expect(formatTime(3600)).toBe('60:00.00');
  });
});

describe('getAudioInfo', () => {
  it('returns correct info from AudioBuffer', () => {
    const buffer = makeBuffer(44100, 44100, 2);
    const info = getAudioInfo(buffer, 1234567, 'test.wav');
    expect(info.duration).toBeCloseTo(1);
    expect(info.sampleRate).toBe(44100);
    expect(info.numberOfChannels).toBe(2);
    expect(info.numberOfSamples).toBe(44100);
    expect(info.fileSize).toBe(1234567);
    expect(info.fileName).toBe('test.wav');
  });
});
