import { describe, expect, it } from 'vitest';
import {
  generate,
  THEMES,
  FORMAT_DEFAULTS,
  FORMAT_LIMITS,
  type Theme,
  type Format,
} from '../lib/dummy-text';

const ALL_THEMES: Theme[] = THEMES.map((t) => t.id);
const ALL_FORMATS: Format[] = ['paragraphs', 'sentences', 'words', 'headlines'];

describe('THEMES', () => {
  it('has exactly 8 themes', () => {
    expect(THEMES.length).toBe(8);
  });

  it('includes expected theme ids', () => {
    const ids = THEMES.map((t) => t.id);
    expect(ids).toContain('lorem');
    expect(ids).toContain('fintech');
    expect(ids).toContain('startup');
    expect(ids).toContain('corporate');
    expect(ids).toContain('developer');
    expect(ids).toContain('design');
    expect(ids).toContain('legal');
    expect(ids).toContain('hipster');
  });

  it('all themes have id, label, and description', () => {
    for (const t of THEMES) {
      expect(typeof t.id).toBe('string');
      expect(typeof t.label).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe('FORMAT_DEFAULTS', () => {
  it('has a default for every format', () => {
    for (const f of ALL_FORMATS) {
      expect(typeof FORMAT_DEFAULTS[f]).toBe('number');
      expect(FORMAT_DEFAULTS[f]).toBeGreaterThan(0);
    }
  });
});

describe('FORMAT_LIMITS', () => {
  it('has min and max for every format', () => {
    for (const f of ALL_FORMATS) {
      expect(FORMAT_LIMITS[f].min).toBeGreaterThanOrEqual(1);
      expect(FORMAT_LIMITS[f].max).toBeGreaterThan(FORMAT_LIMITS[f].min);
    }
  });
});

describe('generate — paragraphs', () => {
  it('returns a non-empty string', () => {
    const text = generate({ theme: 'lorem', format: 'paragraphs', count: 1 });
    expect(text.trim().length).toBeGreaterThan(0);
  });

  it('returns multiple paragraphs separated by double newlines', () => {
    const text = generate({ theme: 'lorem', format: 'paragraphs', count: 3 });
    const paras = text.split('\n\n');
    expect(paras.length).toBe(3);
  });

  it('each paragraph is a non-trivial string', () => {
    const text = generate({ theme: 'lorem', format: 'paragraphs', count: 2 });
    for (const para of text.split('\n\n')) {
      expect(para.trim().length).toBeGreaterThan(20);
    }
  });

  it('is deterministic given the same seed', () => {
    const opts = { theme: 'fintech' as Theme, format: 'paragraphs' as Format, count: 2, seed: 42 };
    expect(generate(opts)).toBe(generate(opts));
  });

  it('produces different output with a different seed', () => {
    const base = { theme: 'startup' as Theme, format: 'paragraphs' as Format, count: 3 };
    expect(generate({ ...base, seed: 1 })).not.toBe(generate({ ...base, seed: 2 }));
  });
});

describe('generate — sentences', () => {
  it('returns a non-empty string', () => {
    const text = generate({ theme: 'corporate', format: 'sentences', count: 3 });
    expect(text.trim().length).toBeGreaterThan(0);
  });

  it('returns text that ends with a period (for most themes)', () => {
    const text = generate({ theme: 'corporate', format: 'sentences', count: 5, seed: 1 });
    expect(text.trim()).toMatch(/\.$/);
  });
});

describe('generate — words', () => {
  it('returns the requested number of words', () => {
    const text = generate({ theme: 'lorem', format: 'words', count: 20, seed: 99 });
    const words = text.trim().split(/\s+/);
    expect(words.length).toBe(20);
  });

  it('returns domain-specific words for developer theme', () => {
    const text = generate({ theme: 'developer', format: 'words', count: 100, seed: 7 });
    const devTerms = ['microservices', 'CI/CD', 'Kubernetes', 'serverless', 'pipeline'];
    const hasDevTerms = devTerms.some((term) => text.includes(term));
    expect(hasDevTerms).toBe(true);
  });

  it('returns domain-specific words for fintech theme', () => {
    const text = generate({ theme: 'fintech', format: 'words', count: 100, seed: 7 });
    const fintechTerms = ['blockchain', 'liquidity', 'payments', 'yield', 'KYC'];
    const hasFintechTerms = fintechTerms.some((term) => text.includes(term));
    expect(hasFintechTerms).toBe(true);
  });
});

describe('generate — headlines', () => {
  it('returns one headline per line', () => {
    const text = generate({ theme: 'design', format: 'headlines', count: 5, seed: 3 });
    const lines = text.split('\n');
    expect(lines.length).toBe(5);
    for (const line of lines) {
      expect(line.trim().length).toBeGreaterThan(0);
    }
  });

  it('headlines are capitalized', () => {
    const text = generate({ theme: 'startup', format: 'headlines', count: 10, seed: 5 });
    for (const line of text.split('\n')) {
      expect(line[0]).toBe(line[0].toUpperCase());
    }
  });
});

describe('generate — all themes × formats', () => {
  for (const theme of ALL_THEMES) {
    for (const format of ALL_FORMATS) {
      it(`${theme} × ${format} produces non-empty output`, () => {
        const count = FORMAT_DEFAULTS[format];
        const text = generate({ theme, format, count, seed: 123 });
        expect(text.trim().length).toBeGreaterThan(0);
      });
    }
  }
});

describe('generate — count clamping', () => {
  it('clamps count to 1 when 0 is passed', () => {
    const text = generate({ theme: 'lorem', format: 'paragraphs', count: 0, seed: 1 });
    expect(text.split('\n\n').length).toBe(1);
  });

  it('clamps count to max for paragraphs (20)', () => {
    const text = generate({ theme: 'lorem', format: 'paragraphs', count: 999, seed: 1 });
    expect(text.split('\n\n').length).toBeLessThanOrEqual(20);
  });

  it('clamps count to max for words (500)', () => {
    const text = generate({ theme: 'lorem', format: 'words', count: 9999, seed: 1 });
    expect(text.trim().split(/\s+/).length).toBeLessThanOrEqual(500);
  });
});
