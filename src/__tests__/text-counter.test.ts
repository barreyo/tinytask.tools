import { describe, it, expect } from 'vitest';
import { countStats, topKeywords, formatTime } from '../lib/text-counter';

// ── countStats ────────────────────────────────────────────────────────────────

describe('countStats – empty / blank input', () => {
  it('returns zeros for empty string', () => {
    const s = countStats('');
    expect(s.characters).toBe(0);
    expect(s.charactersNoSpaces).toBe(0);
    expect(s.words).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.paragraphs).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.bytes).toBe(0);
    expect(s.smsEncoding).toBe('empty');
    expect(s.smsSegments).toBe(0);
  });

  it('returns zeros for whitespace-only string', () => {
    const s = countStats('   \n  ');
    expect(s.words).toBe(0);
    expect(s.sentences).toBe(0);
    expect(s.paragraphs).toBe(0);
  });
});

describe('countStats – character counts', () => {
  it('counts characters including spaces', () => {
    expect(countStats('hello world').characters).toBe(11);
  });

  it('counts characters without spaces', () => {
    expect(countStats('hello world').charactersNoSpaces).toBe(10);
  });

  it('counts bytes correctly for ASCII', () => {
    expect(countStats('abc').bytes).toBe(3);
  });

  it('counts bytes correctly for multibyte characters', () => {
    // "é" is 2 bytes in UTF-8
    expect(countStats('é').bytes).toBe(2);
  });
});

describe('countStats – word count', () => {
  it('counts single word', () => {
    expect(countStats('hello').words).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countStats('one two three').words).toBe(3);
  });

  it('handles multiple spaces between words', () => {
    expect(countStats('one  two   three').words).toBe(3);
  });
});

describe('countStats – sentence count', () => {
  it('counts sentences ending with period', () => {
    expect(countStats('Hello world. How are you.').sentences).toBe(2);
  });

  it('counts sentences ending with exclamation', () => {
    expect(countStats('Hello! Goodbye!').sentences).toBe(2);
  });

  it('counts sentences ending with question mark', () => {
    expect(countStats('What? Why?').sentences).toBe(2);
  });

  it('treats text without terminator as 1 sentence', () => {
    expect(countStats('hello world').sentences).toBe(1);
  });

  it('handles multiple terminators', () => {
    expect(countStats('Wait...').sentences).toBe(1);
  });
});

describe('countStats – paragraph count', () => {
  it('counts a single paragraph', () => {
    expect(countStats('One paragraph here.').paragraphs).toBe(1);
  });

  it('counts paragraphs separated by blank line', () => {
    expect(countStats('First paragraph.\n\nSecond paragraph.').paragraphs).toBe(2);
  });

  it('ignores extra blank lines between paragraphs', () => {
    expect(countStats('First.\n\n\nSecond.').paragraphs).toBe(2);
  });
});

describe('countStats – line count', () => {
  it('returns 1 for single line', () => {
    expect(countStats('hello').lines).toBe(1);
  });

  it('counts newline-separated lines', () => {
    expect(countStats('a\nb\nc').lines).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(countStats('').lines).toBe(0);
  });
});

describe('countStats – reading/speaking time', () => {
  it('returns 0 seconds for empty string', () => {
    expect(countStats('').readingTimeSec).toBe(0);
    expect(countStats('').speakingTimeSec).toBe(0);
  });

  it('reading time grows with word count', () => {
    const few = countStats('word word word');
    const many = countStats(Array(300).fill('word').join(' '));
    expect(many.readingTimeSec).toBeGreaterThan(few.readingTimeSec);
  });

  it('speaking time is slower than reading time', () => {
    const s = countStats(Array(100).fill('word').join(' '));
    expect(s.speakingTimeSec).toBeGreaterThan(s.readingTimeSec);
  });
});

describe('countStats – SMS segments', () => {
  it('single short GSM-7 message is 1 segment', () => {
    const s = countStats('Hello, world!');
    expect(s.smsSegments).toBe(1);
    expect(s.smsEncoding).toBe('GSM-7');
  });

  it('long GSM-7 message splits at 153-char boundary', () => {
    const s = countStats('A'.repeat(161));
    expect(s.smsSegments).toBe(2);
    expect(s.smsEncoding).toBe('GSM-7');
  });

  it('unicode text uses UCS-2 encoding', () => {
    const s = countStats('Hello 🌍');
    expect(s.smsEncoding).toBe('UCS-2');
  });

  it('UCS-2 message ≤70 chars is 1 segment', () => {
    const s = countStats('🌍'.repeat(10));
    expect(s.smsSegments).toBe(1);
    expect(s.smsEncoding).toBe('UCS-2');
  });

  it('UCS-2 message >70 chars splits at 67-char boundary', () => {
    // Each emoji counts as 1 code point in the implementation's length check,
    // so we need > 70 to exceed the single-segment limit.
    const s = countStats('🌍'.repeat(71));
    expect(s.smsSegments).toBe(2);
    expect(s.smsEncoding).toBe('UCS-2');
  });
});

// ── topKeywords ───────────────────────────────────────────────────────────────

describe('topKeywords', () => {
  it('returns empty array for blank input', () => {
    expect(topKeywords('')).toEqual([]);
    expect(topKeywords('   ')).toEqual([]);
  });

  it('counts word frequency correctly', () => {
    const result = topKeywords('cat cat dog cat dog bird');
    expect(result[0]).toEqual({ word: 'cat', count: 3 });
    expect(result[1]).toEqual({ word: 'dog', count: 2 });
  });

  it('excludes common stop words', () => {
    const result = topKeywords('the quick brown fox the fox');
    const words = result.map((k) => k.word);
    expect(words).not.toContain('the');
    expect(words).toContain('fox');
    expect(words).toContain('quick');
  });

  it('excludes words shorter than 3 characters', () => {
    const result = topKeywords('an ox the cat');
    const words = result.map((k) => k.word);
    expect(words).not.toContain('an');
    expect(words).not.toContain('ox');
  });

  it('is case-insensitive', () => {
    const result = topKeywords('Banana banana BANANA');
    expect(result[0]).toEqual({ word: 'banana', count: 3 });
  });

  it('respects the limit parameter', () => {
    const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda';
    const result = topKeywords(text, 3);
    expect(result).toHaveLength(3);
  });

  it('defaults to top 10', () => {
    const words = Array.from({ length: 15 }, (_, i) => `word${i}`).join(' ');
    const result = topKeywords(words);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('sorts by frequency descending', () => {
    const result = topKeywords('fish fish fish cat cat dog');
    expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    expect(result[1].count).toBeGreaterThanOrEqual(result[2].count);
  });
});

// ── formatTime ────────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('returns "< 1s" for sub-second values', () => {
    expect(formatTime(0)).toBe('< 1s');
    expect(formatTime(0.5)).toBe('< 1s');
    expect(formatTime(0.99)).toBe('< 1s');
  });

  it('formats seconds only', () => {
    expect(formatTime(1)).toBe('1s');
    expect(formatTime(45)).toBe('45s');
    expect(formatTime(59)).toBe('59s');
  });

  it('formats minutes only (when seconds round to 0)', () => {
    expect(formatTime(60)).toBe('1m');
    expect(formatTime(120)).toBe('2m');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(90)).toBe('1m 30s');
    expect(formatTime(125)).toBe('2m 5s');
  });

  it('rounds seconds correctly', () => {
    expect(formatTime(61.4)).toBe('1m 1s');
    expect(formatTime(61.6)).toBe('1m 2s');
  });
});
