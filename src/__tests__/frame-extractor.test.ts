import { describe, it, expect } from 'vitest';
import { clampDimensions, estimateFrameCount, formatFileSize } from '../lib/frame-extractor';

describe('clampDimensions', () => {
  it('does not upscale when source is smaller than maxWidth', () => {
    const result = clampDimensions(640, 480, 1280);
    expect(result.width).toBe(640);
    expect(result.height).toBe(480);
  });

  it('scales down proportionally', () => {
    const result = clampDimensions(1920, 1080, 960);
    expect(result.width).toBe(960);
    expect(result.height).toBe(540);
  });

  it('maintains aspect ratio on odd-dimension sources', () => {
    const result = clampDimensions(1280, 720, 640);
    expect(result.width).toBe(640);
    expect(result.height).toBe(360);
  });

  it('handles non-standard aspect ratios', () => {
    const result = clampDimensions(1000, 300, 500);
    expect(result.width).toBe(500);
    expect(result.height).toBe(150);
  });
});

describe('estimateFrameCount', () => {
  it('calculates correct frame count for 1 second at 10fps', () => {
    expect(estimateFrameCount(0, 1, 10)).toBe(10);
  });

  it('calculates for 2.5 seconds at 24fps', () => {
    expect(estimateFrameCount(0, 2.5, 24)).toBe(60);
  });

  it('returns at least 1 frame', () => {
    expect(estimateFrameCount(0, 0.001, 10)).toBeGreaterThanOrEqual(1);
  });

  it('works with non-zero start time', () => {
    expect(estimateFrameCount(5, 10, 10)).toBe(50);
  });

  it('handles float fps values', () => {
    // 1 second at 29.97 fps
    const count = estimateFrameCount(0, 1, 29.97);
    expect(count).toBeGreaterThan(25);
    expect(count).toBeLessThan(35);
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.50 MB');
  });

  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});
