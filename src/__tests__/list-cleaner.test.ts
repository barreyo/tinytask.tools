import { describe, it, expect } from 'vitest';
import { parseList, cleanList, joinList } from '../lib/listCleaner';
import type { CleanOptions } from '../lib/listCleaner';

// ── parseList ─────────────────────────────────────────────────────────────────

describe('parseList', () => {
  it('splits on newlines in newline mode', () => {
    expect(parseList('a\nb\nc', 'newline')).toEqual(['a', 'b', 'c']);
  });

  it('handles CRLF line endings', () => {
    expect(parseList('a\r\nb\r\nc', 'newline')).toEqual(['a', 'b', 'c']);
  });

  it('splits on commas in comma mode', () => {
    expect(parseList('a,b,c', 'comma')).toEqual(['a', 'b', 'c']);
  });

  it('splits on tabs in tab mode', () => {
    expect(parseList('a\tb\tc', 'tab')).toEqual(['a', 'b', 'c']);
  });

  it('splits on pipes in pipe mode', () => {
    expect(parseList('a|b|c', 'pipe')).toEqual(['a', 'b', 'c']);
  });

  it('splits on semicolons in semicolon mode', () => {
    expect(parseList('a;b;c', 'semicolon')).toEqual(['a', 'b', 'c']);
  });

  it('splits on whitespace in space mode', () => {
    expect(parseList('a b  c', 'space')).toEqual(['a', 'b', 'c']);
  });

  it('returns empty array for blank input', () => {
    expect(parseList('   ', 'newline')).toEqual([]);
    expect(parseList('', 'comma')).toEqual([]);
  });

  describe('auto-detection', () => {
    it('detects newline separator (highest priority)', () => {
      expect(parseList('a\nb,c', 'auto')).toEqual(['a', 'b,c']);
    });

    it('detects comma separator when no newlines', () => {
      expect(parseList('a,b,c', 'auto')).toEqual(['a', 'b', 'c']);
    });

    it('detects semicolon over pipe', () => {
      expect(parseList('a;b|c', 'auto')).toEqual(['a', 'b|c']);
    });

    it('detects pipe when only pipes', () => {
      expect(parseList('a|b|c', 'auto')).toEqual(['a', 'b', 'c']);
    });

    it('detects tab when only tabs', () => {
      expect(parseList('a\tb\tc', 'auto')).toEqual(['a', 'b', 'c']);
    });

    it('falls back to space when no other separator found', () => {
      expect(parseList('hello world foo', 'auto')).toEqual(['hello', 'world', 'foo']);
    });
  });
});

// ── cleanList ─────────────────────────────────────────────────────────────────

const noOp: CleanOptions = {
  removeDuplicates: false,
  sortAlpha: false,
  sortNumeric: false,
  reverse: false,
  trimWhitespace: false,
  removeEmpty: false,
  lowercase: false,
  uppercase: false,
};

describe('cleanList', () => {
  it('returns a copy unchanged when all options off', () => {
    const input = ['b', 'a', 'c'];
    expect(cleanList(input, noOp)).toEqual(['b', 'a', 'c']);
  });

  it('trims leading/trailing whitespace', () => {
    expect(cleanList(['  hello  ', ' world '], { ...noOp, trimWhitespace: true })).toEqual([
      'hello',
      'world',
    ]);
  });

  it('removes empty strings', () => {
    expect(cleanList(['a', '', 'b', '   '], { ...noOp, removeEmpty: true })).toEqual([
      'a',
      'b',
      '   ',
    ]);
  });

  it('removes empty after trimming when both options on', () => {
    expect(
      cleanList(['a', '  ', 'b'], { ...noOp, trimWhitespace: true, removeEmpty: true }),
    ).toEqual(['a', 'b']);
  });

  it('lowercases items', () => {
    expect(cleanList(['Hello', 'WORLD'], { ...noOp, lowercase: true })).toEqual(['hello', 'world']);
  });

  it('uppercases items', () => {
    expect(cleanList(['hello', 'world'], { ...noOp, uppercase: true })).toEqual(['HELLO', 'WORLD']);
  });

  it('lowercase takes precedence over uppercase when both are true', () => {
    expect(cleanList(['Hello'], { ...noOp, lowercase: true, uppercase: true })).toEqual(['hello']);
  });

  it('removes duplicates preserving first occurrence order', () => {
    const result = cleanList(['a', 'b', 'a', 'c', 'b'], { ...noOp, removeDuplicates: true });
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('sorts alphabetically', () => {
    expect(cleanList(['banana', 'apple', 'cherry'], { ...noOp, sortAlpha: true })).toEqual([
      'apple',
      'banana',
      'cherry',
    ]);
  });

  it('sorts case-insensitively', () => {
    expect(cleanList(['Banana', 'apple', 'Cherry'], { ...noOp, sortAlpha: true })).toEqual([
      'apple',
      'Banana',
      'Cherry',
    ]);
  });

  it('sorts numerically', () => {
    expect(cleanList(['10', '2', '30', '1'], { ...noOp, sortNumeric: true })).toEqual([
      '1',
      '2',
      '10',
      '30',
    ]);
  });

  it('numeric sort falls back to localeCompare for non-numbers', () => {
    const result = cleanList(['b', 'a', 'c'], { ...noOp, sortNumeric: true });
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('sortAlpha is skipped when sortNumeric is true', () => {
    const result = cleanList(['10', '2', '1'], { ...noOp, sortNumeric: true, sortAlpha: true });
    // sortNumeric wins because of the if/else if order
    expect(result).toEqual(['1', '2', '10']);
  });

  it('reverses the list', () => {
    expect(cleanList(['a', 'b', 'c'], { ...noOp, reverse: true })).toEqual(['c', 'b', 'a']);
  });

  it('applies reverse after sorting', () => {
    expect(cleanList(['b', 'a', 'c'], { ...noOp, sortAlpha: true, reverse: true })).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it('does not mutate the original array', () => {
    const original = ['c', 'a', 'b'];
    cleanList(original, { ...noOp, sortAlpha: true });
    expect(original).toEqual(['c', 'a', 'b']);
  });
});

// ── joinList ──────────────────────────────────────────────────────────────────

describe('joinList', () => {
  it('joins with newline', () => {
    expect(joinList(['a', 'b', 'c'], 'newline')).toBe('a\nb\nc');
  });

  it('joins with comma (no space)', () => {
    expect(joinList(['a', 'b', 'c'], 'comma')).toBe('a,b,c');
  });

  it('joins with comma-space', () => {
    expect(joinList(['a', 'b', 'c'], 'comma-space')).toBe('a, b, c');
  });

  it('joins with tab', () => {
    expect(joinList(['a', 'b', 'c'], 'tab')).toBe('a\tb\tc');
  });

  it('joins with pipe (with surrounding spaces)', () => {
    expect(joinList(['a', 'b', 'c'], 'pipe')).toBe('a | b | c');
  });

  it('joins with semicolon (with trailing space)', () => {
    expect(joinList(['a', 'b', 'c'], 'semicolon')).toBe('a; b; c');
  });

  it('joins with space', () => {
    expect(joinList(['a', 'b', 'c'], 'space')).toBe('a b c');
  });

  it('returns empty string for empty array', () => {
    expect(joinList([], 'comma')).toBe('');
  });

  it('returns single item unchanged for single-element array', () => {
    expect(joinList(['only'], 'newline')).toBe('only');
  });
});
