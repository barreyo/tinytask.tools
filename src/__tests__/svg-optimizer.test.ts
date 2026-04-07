import { describe, expect, it } from 'vitest';
import { optimizeSvg, formatBytes, DEFAULT_PLUGINS, type SvgPlugin } from '../lib/svg-optimizer';

const SIMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <!-- a circle -->
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>`;

const SVG_WITH_METADATA = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:dc="http://purl.org/dc/elements/1.1/" width="100" height="100">
  <metadata>
    <dc:title>My Icon</dc:title>
    <dc:creator>Inkscape</dc:creator>
  </metadata>
  <!-- just a rect -->
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>`;

describe('DEFAULT_PLUGINS', () => {
  it('has at least 20 plugins', () => {
    expect(DEFAULT_PLUGINS.length).toBeGreaterThanOrEqual(20);
  });

  it('all plugins have required fields', () => {
    for (const p of DEFAULT_PLUGINS) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.name).toBe('string');
      expect(typeof p.description).toBe('string');
      expect(typeof p.enabled).toBe('boolean');
    }
  });

  it('has unique plugin ids', () => {
    const ids = DEFAULT_PLUGINS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('most plugins are enabled by default', () => {
    const enabled = DEFAULT_PLUGINS.filter((p) => p.enabled);
    expect(enabled.length).toBeGreaterThan(DEFAULT_PLUGINS.length / 2);
  });
});

describe('optimizeSvg', () => {
  it('returns a result with the expected shape', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(typeof result.data).toBe('string');
    expect(typeof result.originalSize).toBe('number');
    expect(typeof result.optimizedSize).toBe('number');
    expect(typeof result.savings).toBe('number');
    expect(typeof result.savingsPercent).toBe('number');
  });

  it('produces valid SVG output (starts with <svg)', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.data.trim()).toMatch(/^<svg/);
  });

  it('strips comments with removeComments enabled', () => {
    const plugins = DEFAULT_PLUGINS.map((p) => ({ ...p }));
    const result = optimizeSvg(SIMPLE_SVG, plugins);
    expect(result.data).not.toContain('<!-- a circle -->');
  });

  it('strips metadata with removeMetadata enabled', () => {
    const plugins = DEFAULT_PLUGINS.map((p) => ({ ...p }));
    const result = optimizeSvg(SVG_WITH_METADATA, plugins);
    expect(result.data).not.toContain('<metadata>');
  });

  it('optimized size is positive', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.optimizedSize).toBeGreaterThan(0);
  });

  it('originalSize equals byte length of input', () => {
    const encoder = new TextEncoder();
    const expectedSize = encoder.encode(SIMPLE_SVG).byteLength;
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.originalSize).toBe(expectedSize);
  });

  it('savings = originalSize - optimizedSize', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.savings).toBe(result.originalSize - result.optimizedSize);
  });

  it('savingsPercent is between -100 and 100', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.savingsPercent).toBeLessThanOrEqual(100);
    expect(result.savingsPercent).toBeGreaterThan(-100);
  });

  it('produces a smaller file than the input for the simple SVG', () => {
    const result = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(result.optimizedSize).toBeLessThan(result.originalSize);
  });

  it('works with all plugins disabled', () => {
    const plugins: SvgPlugin[] = DEFAULT_PLUGINS.map((p) => ({ ...p, enabled: false }));
    const result = optimizeSvg(SIMPLE_SVG, plugins);
    expect(result.data).toBeTruthy();
    expect(result.data.trim()).toMatch(/^<svg/);
  });

  it('produces identical-ish output when run twice on the same input', () => {
    const r1 = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    const r2 = optimizeSvg(SIMPLE_SVG, DEFAULT_PLUGINS);
    expect(r1.data).toBe(r2.data);
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
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 100)).toBe('100.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.50 MB');
  });
});
