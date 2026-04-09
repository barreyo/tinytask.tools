import { describe, it, expect } from 'vitest';
import { getDebounceMs, truncationBanner, OUTPUT_LINE_CAP } from '../lib/worker-utils';
import { formatBytes } from '../lib/compression-tester';

// ── OUTPUT_LINE_CAP ───────────────────────────────────────────────────────────

describe('OUTPUT_LINE_CAP', () => {
  it('is 5000', () => {
    expect(OUTPUT_LINE_CAP).toBe(5_000);
  });
});

// ── getDebounceMs ─────────────────────────────────────────────────────────────

describe('getDebounceMs', () => {
  it('returns 150ms for short inputs (< 50k chars)', () => {
    expect(getDebounceMs(0)).toBe(150);
    expect(getDebounceMs(1000)).toBe(150);
    expect(getDebounceMs(49_999)).toBe(150);
  });

  it('returns 400ms for medium inputs (50k–499k chars)', () => {
    expect(getDebounceMs(50_000)).toBe(400);
    expect(getDebounceMs(250_000)).toBe(400);
    expect(getDebounceMs(499_999)).toBe(400);
  });

  it('returns 800ms for large inputs (500k–1.99M chars)', () => {
    expect(getDebounceMs(500_000)).toBe(800);
    expect(getDebounceMs(1_000_000)).toBe(800);
    expect(getDebounceMs(1_999_999)).toBe(800);
  });

  it('returns 1500ms for very large inputs (≥ 2M chars)', () => {
    expect(getDebounceMs(2_000_000)).toBe(1_500);
    expect(getDebounceMs(10_000_000)).toBe(1_500);
  });

  it('debounce increases monotonically with size', () => {
    const sizes = [0, 50_000, 500_000, 2_000_000];
    const delays = sizes.map(getDebounceMs);
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThan(delays[i - 1]);
    }
  });
});

// ── truncationBanner ──────────────────────────────────────────────────────────

describe('truncationBanner', () => {
  it('contains the shown count', () => {
    const banner = truncationBanner(5_000, 12_000);
    expect(banner).toContain('5,000');
  });

  it('contains the total count', () => {
    const banner = truncationBanner(5_000, 12_000);
    expect(banner).toContain('12,000');
  });

  it('is an HTML div element', () => {
    const banner = truncationBanner(100, 200);
    expect(banner).toMatch(/^<div/);
    expect(banner).toContain('</div>');
  });

  it('mentions downloading for the full output', () => {
    const banner = truncationBanner(100, 200);
    expect(banner).toContain('download');
  });
});

// ── formatBytes (compression-tester) ─────────────────────────────────────────

describe('formatBytes', () => {
  it('formats bytes under 1 KB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1)).toBe('1 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(2048)).toBe('2.00 KB');
    expect(formatBytes(1536)).toBe('1.50 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.50 MB');
  });

  it('uses 2 decimal places for KB and MB', () => {
    expect(formatBytes(1025)).toBe('1.00 KB'); // 1025/1024 ≈ 1.001
    expect(formatBytes(1536)).toBe('1.50 KB'); // 1.5 KB exactly
  });
});
