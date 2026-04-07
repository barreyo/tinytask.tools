import { describe, expect, it } from 'vitest';
import { calcOutputDimensions, formatBytes, MAX_DIMENSION_OPTIONS } from '../lib/image-optimizer';

// NOTE: optimizeImage itself relies on browser-only Canvas/FileReader APIs and is tested
// through Playwright e2e tests rather than here.

describe('calcOutputDimensions', () => {
  it('returns original dimensions when maxDimension is null', () => {
    expect(calcOutputDimensions(1920, 1080, null)).toEqual({ width: 1920, height: 1080 });
    expect(calcOutputDimensions(100, 200, null)).toEqual({ width: 100, height: 200 });
  });

  it('returns original dimensions when image is smaller than maxDimension', () => {
    expect(calcOutputDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    expect(calcOutputDimensions(400, 400, 1024)).toEqual({ width: 400, height: 400 });
  });

  it('scales down a landscape image correctly', () => {
    const result = calcOutputDimensions(3840, 2160, 1920);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  it('scales down a portrait image correctly', () => {
    const result = calcOutputDimensions(1080, 1920, 1920);
    expect(result.width).toBe(1080);
    expect(result.height).toBe(1920);
  });

  it('scales down a portrait image when constrained', () => {
    const result = calcOutputDimensions(1000, 2000, 1000);
    expect(result.width).toBe(500);
    expect(result.height).toBe(1000);
  });

  it('scales down a square image', () => {
    const result = calcOutputDimensions(2000, 2000, 1000);
    expect(result.width).toBe(1000);
    expect(result.height).toBe(1000);
  });

  it('preserves aspect ratio for non-standard ratios', () => {
    const result = calcOutputDimensions(1600, 900, 800);
    expect(result.width).toBe(800);
    expect(result.height).toBe(450);
  });

  it('output dimensions are always integers', () => {
    const { width, height } = calcOutputDimensions(1920, 1080, 1280);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });

  it('handles exact boundary (dimension equals maxDimension)', () => {
    const result = calcOutputDimensions(1920, 1080, 1920);
    expect(result).toEqual({ width: 1920, height: 1080 });
  });

  it('handles very small images', () => {
    expect(calcOutputDimensions(10, 10, 1920)).toEqual({ width: 10, height: 10 });
  });
});

describe('formatBytes', () => {
  it('formats bytes below 1 KB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1)).toBe('1 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 3.5)).toBe('3.50 MB');
  });
});

describe('MAX_DIMENSION_OPTIONS', () => {
  it('contains at least one null (original) option', () => {
    const nullOption = MAX_DIMENSION_OPTIONS.find((o) => o.value === null);
    expect(nullOption).toBeDefined();
  });

  it('all entries have a label and value field', () => {
    for (const opt of MAX_DIMENSION_OPTIONS) {
      expect(typeof opt.label).toBe('string');
      expect(opt.label.length).toBeGreaterThan(0);
      expect(opt.value === null || typeof opt.value === 'number').toBe(true);
    }
  });

  it('numeric values are positive integers', () => {
    for (const opt of MAX_DIMENSION_OPTIONS) {
      if (opt.value !== null) {
        expect(opt.value).toBeGreaterThan(0);
        expect(Number.isInteger(opt.value)).toBe(true);
      }
    }
  });
});
