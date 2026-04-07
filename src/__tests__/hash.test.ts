import { describe, expect, it } from 'vitest';
import {
  computeMD5,
  computeAllHashes,
  pruneHistory,
  mergeHistory,
  formatAge,
  truncate,
  HISTORY_MAX,
} from '../lib/hash';
import type { HashResults, HistoryEntry } from '../lib/hash';

// ── MD5 ──────────────────────────────────────────────────────────────────────

describe('computeMD5', () => {
  it('hashes the empty string', () => {
    expect(computeMD5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('hashes "hello"', () => {
    expect(computeMD5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('hashes "Hello, World!"', () => {
    expect(computeMD5('Hello, World!')).toBe('65a8e27d8879283831b664bd8b7f0ad4');
  });

  it('hashes the quick brown fox', () => {
    expect(computeMD5('The quick brown fox jumps over the lazy dog')).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    );
  });

  it('returns lowercase hex', () => {
    expect(computeMD5('hello')).toMatch(/^[0-9a-f]+$/);
  });

  it('returns a 32-character string', () => {
    expect(computeMD5('test')).toHaveLength(32);
  });
});

// ── computeAllHashes ─────────────────────────────────────────────────────────

describe('computeAllHashes', () => {
  it('returns results for all 5 algorithms', async () => {
    const results = await computeAllHashes('hello');
    expect(Object.keys(results)).toEqual(['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);
  });

  it('MD5 result matches known value', async () => {
    const results = await computeAllHashes('hello');
    expect(results['MD5']).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('SHA-1 result matches known value', async () => {
    const results = await computeAllHashes('hello');
    expect(results['SHA-1']).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  it('SHA-256 result matches known value', async () => {
    const results = await computeAllHashes('hello');
    expect(results['SHA-256']).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('SHA-384 result matches known value', async () => {
    const results = await computeAllHashes('hello');
    expect(results['SHA-384']).toBe(
      '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f',
    );
  });

  it('SHA-512 result matches known value', async () => {
    const results = await computeAllHashes('hello');
    expect(results['SHA-512']).toBe(
      '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043',
    );
  });

  it('all values are lowercase hex', async () => {
    const results = await computeAllHashes('test');
    for (const value of Object.values(results)) {
      expect(value).toMatch(/^[0-9a-f]+$/);
    }
  });

  it('returns correct lengths for each algorithm', async () => {
    const results = await computeAllHashes('test');
    expect(results['MD5']).toHaveLength(32);
    expect(results['SHA-1']).toHaveLength(40);
    expect(results['SHA-256']).toHaveLength(64);
    expect(results['SHA-384']).toHaveLength(96);
    expect(results['SHA-512']).toHaveLength(128);
  });

  it('hashes the empty string', async () => {
    const results = await computeAllHashes('');
    expect(results['MD5']).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(results['SHA-1']).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(results['SHA-256']).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('hashes "Hello, World!"', async () => {
    const results = await computeAllHashes('Hello, World!');
    expect(results['MD5']).toBe('65a8e27d8879283831b664bd8b7f0ad4');
    expect(results['SHA-256']).toBe(
      'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
    );
  });

  it('different inputs produce different hashes', async () => {
    const a = await computeAllHashes('foo');
    const b = await computeAllHashes('bar');
    expect(a['SHA-256']).not.toBe(b['SHA-256']);
  });

  it('same input always produces the same hash', async () => {
    const a = await computeAllHashes('deterministic');
    const b = await computeAllHashes('deterministic');
    expect(a['SHA-256']).toBe(b['SHA-256']);
    expect(a['MD5']).toBe(b['MD5']);
  });
});

// ── History helpers ───────────────────────────────────────────────────────────

function makeEntry(input: string): HistoryEntry {
  return {
    input,
    hashes: {
      MD5: 'a'.repeat(32),
      'SHA-1': 'b'.repeat(40),
      'SHA-256': 'c'.repeat(64),
      'SHA-384': 'd'.repeat(96),
      'SHA-512': 'e'.repeat(128),
    } as HashResults,
    timestamp: Date.now(),
  };
}

describe('pruneHistory', () => {
  it('returns the same array when under the limit', () => {
    const entries = [makeEntry('a'), makeEntry('b')];
    expect(pruneHistory(entries)).toHaveLength(2);
  });

  it(`truncates to ${HISTORY_MAX} entries`, () => {
    const entries = Array.from({ length: HISTORY_MAX + 5 }, (_, i) => makeEntry(`item${i}`));
    expect(pruneHistory(entries)).toHaveLength(HISTORY_MAX);
  });

  it('keeps the most recent entries (first in array)', () => {
    const entries = Array.from({ length: HISTORY_MAX + 2 }, (_, i) => makeEntry(`item${i}`));
    const pruned = pruneHistory(entries);
    expect(pruned[0].input).toBe('item0');
    expect(pruned[HISTORY_MAX - 1].input).toBe(`item${HISTORY_MAX - 1}`);
  });
});

describe('mergeHistory', () => {
  it('prepends incoming entries before existing ones', () => {
    const incoming = [makeEntry('new')];
    const existing = [makeEntry('old')];
    const merged = mergeHistory(incoming, existing);
    expect(merged[0].input).toBe('new');
    expect(merged[1].input).toBe('old');
  });

  it('prunes to HISTORY_MAX total', () => {
    const incoming = Array.from({ length: 20 }, (_, i) => makeEntry(`new${i}`));
    const existing = Array.from({ length: 20 }, (_, i) => makeEntry(`old${i}`));
    expect(mergeHistory(incoming, existing)).toHaveLength(HISTORY_MAX);
  });
});

// ── formatAge ─────────────────────────────────────────────────────────────────

describe('formatAge', () => {
  it('returns "just now" for recent timestamps', () => {
    expect(formatAge(Date.now() - 5_000)).toBe('just now');
  });

  it('returns minutes for timestamps 1-59 minutes old', () => {
    expect(formatAge(Date.now() - 5 * 60_000)).toBe('5m ago');
  });

  it('returns hours for timestamps 1-23 hours old', () => {
    expect(formatAge(Date.now() - 3 * 3_600_000)).toBe('3h ago');
  });

  it('returns days for timestamps 24+ hours old', () => {
    expect(formatAge(Date.now() - 2 * 86_400_000)).toBe('2d ago');
  });

  it('accepts a custom "now" reference', () => {
    const base = 1_000_000;
    expect(formatAge(base - 30_000, base)).toBe('just now');
    expect(formatAge(base - 120_000, base)).toBe('2m ago');
  });
});

// ── truncate ──────────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('returns the string unchanged when at or below the limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('appends ellipsis when over the limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('uses default max of 48', () => {
    const long = 'a'.repeat(50);
    expect(truncate(long)).toBe('a'.repeat(48) + '…');
  });
});
