import { describe, expect, it } from 'vitest';
import {
  isMilliseconds,
  normalizeTimestamp,
  timestampToDate,
  dateToTimestamp,
  formatUTC,
  formatISO,
  formatRelative,
  validateTimestamp,
  formatAge,
  truncate,
  prependHistory,
  HISTORY_MAX,
  MAX_TIMESTAMP_S,
  MIN_TIMESTAMP_S,
} from '../lib/timestamp';

import type { HistoryEntry } from '../lib/timestamp';

// ── isMilliseconds ────────────────────────────────────────────────────────────

describe('isMilliseconds', () => {
  it('returns false for a typical seconds timestamp', () => {
    expect(isMilliseconds(1700000000)).toBe(false);
  });

  it('returns true for a millisecond timestamp', () => {
    expect(isMilliseconds(1700000000000)).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isMilliseconds(0)).toBe(false);
  });

  it('returns false for a value exactly at the threshold (1e10)', () => {
    expect(isMilliseconds(1e10)).toBe(false);
  });

  it('returns true for a value just above the threshold', () => {
    expect(isMilliseconds(1e10 + 1)).toBe(true);
  });

  it('returns true for large negative millisecond values', () => {
    expect(isMilliseconds(-1700000000000)).toBe(true);
  });

  it('returns false for small negative second values', () => {
    expect(isMilliseconds(-1700000000)).toBe(false);
  });
});

// ── normalizeTimestamp ────────────────────────────────────────────────────────

describe('normalizeTimestamp', () => {
  it('returns seconds unchanged when already in seconds', () => {
    expect(normalizeTimestamp(1700000000)).toBe(1700000000);
  });

  it('divides milliseconds by 1000', () => {
    expect(normalizeTimestamp(1700000000000)).toBe(1700000000);
  });

  it('handles 0', () => {
    expect(normalizeTimestamp(0)).toBe(0);
  });

  it('normalizes negative millisecond timestamps correctly', () => {
    expect(normalizeTimestamp(-2000000000000)).toBe(-2000000000);
  });
});

// ── timestampToDate ───────────────────────────────────────────────────────────

describe('timestampToDate', () => {
  it('converts Unix epoch 0 to 1970-01-01', () => {
    const d = timestampToDate(0);
    expect(d.getUTCFullYear()).toBe(1970);
    expect(d.getUTCMonth()).toBe(0);
    expect(d.getUTCDate()).toBe(1);
  });

  it('converts a known timestamp to the correct date', () => {
    // 2023-11-14T22:13:20.000Z
    const d = timestampToDate(1700000000);
    expect(d.toISOString()).toBe('2023-11-14T22:13:20.000Z');
  });

  it('returns a Date object', () => {
    expect(timestampToDate(1000000000)).toBeInstanceOf(Date);
  });

  it('handles negative timestamps (pre-epoch)', () => {
    const d = timestampToDate(-86400); // 1969-12-31
    expect(d.getUTCFullYear()).toBe(1969);
  });
});

// ── dateToTimestamp ───────────────────────────────────────────────────────────

describe('dateToTimestamp', () => {
  it('converts epoch date to 0', () => {
    expect(dateToTimestamp(new Date('1970-01-01T00:00:00.000Z'))).toBe(0);
  });

  it('converts a known date to the correct timestamp', () => {
    expect(dateToTimestamp(new Date('2023-11-14T22:13:20.000Z'))).toBe(1700000000);
  });

  it('truncates milliseconds (floor, not round)', () => {
    const d = new Date('2023-11-14T22:13:20.999Z');
    expect(dateToTimestamp(d)).toBe(1700000000);
  });

  it('roundtrips with timestampToDate', () => {
    const ts = 1700000000;
    expect(dateToTimestamp(timestampToDate(ts))).toBe(ts);
  });
});

// ── formatUTC ─────────────────────────────────────────────────────────────────

describe('formatUTC', () => {
  it('returns a string containing UTC', () => {
    const d = new Date('2023-11-14T22:13:20.000Z');
    expect(formatUTC(d)).toContain('UTC');
  });

  it('includes the year', () => {
    const d = new Date('2023-11-14T22:13:20.000Z');
    expect(formatUTC(d)).toContain('2023');
  });

  it('includes the hour in 24h format', () => {
    const d = new Date('2023-11-14T22:13:20.000Z');
    expect(formatUTC(d)).toContain('22');
  });

  it('returns a non-empty string', () => {
    expect(formatUTC(new Date())).toBeTruthy();
  });
});

// ── formatISO ─────────────────────────────────────────────────────────────────

describe('formatISO', () => {
  it('returns an ISO 8601 string ending in Z', () => {
    const d = new Date('2023-11-14T22:13:20.000Z');
    expect(formatISO(d)).toBe('2023-11-14T22:13:20.000Z');
  });

  it('returns the epoch ISO string for timestamp 0', () => {
    expect(formatISO(new Date(0))).toBe('1970-01-01T00:00:00.000Z');
  });
});

// ── formatRelative ────────────────────────────────────────────────────────────

describe('formatRelative', () => {
  const now = new Date('2024-01-01T12:00:00.000Z');

  it('returns "just now" for under 5 seconds', () => {
    const d = new Date(now.getTime() - 3000);
    expect(formatRelative(d, now)).toBe('just now');
  });

  it('returns "just now" for exactly now', () => {
    expect(formatRelative(now, now)).toBe('just now');
  });

  it('returns seconds for 5-59 seconds', () => {
    const d = new Date(now.getTime() - 30_000);
    expect(formatRelative(d, now)).toBe('30 seconds ago');
  });

  it('returns "1 minute ago" for 1 minute', () => {
    const d = new Date(now.getTime() - 60_000);
    expect(formatRelative(d, now)).toBe('1 minute ago');
  });

  it('returns minutes for 2-59 minutes', () => {
    const d = new Date(now.getTime() - 45 * 60_000);
    expect(formatRelative(d, now)).toBe('45 minutes ago');
  });

  it('returns "1 hour ago" for 1 hour', () => {
    const d = new Date(now.getTime() - 3_600_000);
    expect(formatRelative(d, now)).toBe('1 hour ago');
  });

  it('returns hours for 2-23 hours', () => {
    const d = new Date(now.getTime() - 5 * 3_600_000);
    expect(formatRelative(d, now)).toBe('5 hours ago');
  });

  it('returns "1 day ago" for 1 day', () => {
    const d = new Date(now.getTime() - 86_400_000);
    expect(formatRelative(d, now)).toBe('1 day ago');
  });

  it('returns days for 2-6 days', () => {
    const d = new Date(now.getTime() - 3 * 86_400_000);
    expect(formatRelative(d, now)).toBe('3 days ago');
  });

  it('returns weeks for 1-4 weeks', () => {
    const d = new Date(now.getTime() - 14 * 86_400_000);
    expect(formatRelative(d, now)).toBe('2 weeks ago');
  });

  it('returns months for 5+ weeks', () => {
    // 65 days / 30.44 ≈ 2.13 → 2 months
    const d = new Date(now.getTime() - 65 * 86_400_000);
    expect(formatRelative(d, now)).toBe('2 months ago');
  });

  it('returns years for 12+ months', () => {
    const d = new Date(now.getTime() - 400 * 86_400_000);
    expect(formatRelative(d, now)).toBe('1 year ago');
  });

  it('returns "in X" for future dates', () => {
    const d = new Date(now.getTime() + 3 * 3_600_000);
    expect(formatRelative(d, now)).toBe('in 3 hours');
  });

  it('returns "in 1 day" for tomorrow', () => {
    const d = new Date(now.getTime() + 86_400_000);
    expect(formatRelative(d, now)).toBe('in 1 day');
  });
});

// ── validateTimestamp ─────────────────────────────────────────────────────────

describe('validateTimestamp', () => {
  it('accepts a valid seconds timestamp', () => {
    const { seconds, error } = validateTimestamp('1700000000');
    expect(error).toBeNull();
    expect(seconds).toBe(1700000000);
  });

  it('accepts a valid milliseconds timestamp and normalizes it', () => {
    const { seconds, error } = validateTimestamp('1700000000000');
    expect(error).toBeNull();
    expect(seconds).toBe(1700000000);
  });

  it('accepts timestamp 0 (epoch)', () => {
    const { seconds, error } = validateTimestamp('0');
    expect(error).toBeNull();
    expect(seconds).toBe(0);
  });

  it('accepts negative timestamps', () => {
    const { seconds, error } = validateTimestamp('-86400');
    expect(error).toBeNull();
    expect(seconds).toBe(-86400);
  });

  it('returns error for empty input', () => {
    const { error } = validateTimestamp('');
    expect(error).toBeTruthy();
  });

  it('returns error for whitespace-only input', () => {
    const { error } = validateTimestamp('   ');
    expect(error).toBeTruthy();
  });

  it('returns error for non-numeric input', () => {
    const { error } = validateTimestamp('abc');
    expect(error).toBeTruthy();
  });

  it('returns error for decimal input', () => {
    const { error } = validateTimestamp('1700000000.5');
    expect(error).toBeTruthy();
  });

  it('returns error for timestamp too far in the future', () => {
    // Use a ms-range value that normalizes beyond MAX_TIMESTAMP_S
    const beyondMaxMs = String(MAX_TIMESTAMP_S * 1000 + 1000);
    const { error } = validateTimestamp(beyondMaxMs);
    expect(error).toBeTruthy();
  });

  it('returns error for timestamp too far in the past', () => {
    // Use a ms-range value that normalizes beyond MIN_TIMESTAMP_S
    const beyondMinMs = String(MIN_TIMESTAMP_S * 1000 - 1000);
    const { error } = validateTimestamp(beyondMinMs);
    expect(error).toBeTruthy();
  });

  it('accepts the maximum valid timestamp', () => {
    const { error } = validateTimestamp(String(MAX_TIMESTAMP_S));
    expect(error).toBeNull();
  });
});

// ── formatAge ─────────────────────────────────────────────────────────────────

describe('formatAge', () => {
  const now = 1_700_000_100_000;

  it('returns "just now" for under 60 seconds', () => {
    expect(formatAge(now - 59_999, now)).toBe('just now');
    expect(formatAge(now, now)).toBe('just now');
  });

  it('returns minutes for 1 minute to under 1 hour', () => {
    expect(formatAge(now - 60_000, now)).toBe('1m ago');
    expect(formatAge(now - 3_599_999, now)).toBe('59m ago');
  });

  it('returns hours for 1 hour to under 24 hours', () => {
    expect(formatAge(now - 3_600_000, now)).toBe('1h ago');
    expect(formatAge(now - 86_399_999, now)).toBe('23h ago');
  });

  it('returns days for 24+ hours', () => {
    expect(formatAge(now - 86_400_000, now)).toBe('1d ago');
    expect(formatAge(now - 172_800_000, now)).toBe('2d ago');
  });
});

// ── truncate ──────────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('returns the string unchanged when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('uses 52 as default max', () => {
    const long = 'a'.repeat(53);
    const result = truncate(long);
    expect(result.endsWith('…')).toBe(true);
    expect(result).toHaveLength(53); // 52 chars + ellipsis
  });

  it('does not truncate at exactly the limit', () => {
    const exact = 'a'.repeat(52);
    expect(truncate(exact)).toBe(exact);
  });
});

// ── prependHistory ────────────────────────────────────────────────────────────

describe('prependHistory', () => {
  const makeEntry = (output: string): HistoryEntry => ({
    direction: 'to-date',
    input: '1700000000',
    output,
    timestamp: Date.now(),
  });

  it('prepends new entry before existing ones', () => {
    const existing = [makeEntry('old')];
    const result = prependHistory(makeEntry('new'), existing);
    expect(result[0].output).toBe('new');
    expect(result[1].output).toBe('old');
  });

  it('handles empty existing array', () => {
    const result = prependHistory(makeEntry('first'), []);
    expect(result).toHaveLength(1);
    expect(result[0].output).toBe('first');
  });

  it(`caps at ${HISTORY_MAX} entries`, () => {
    const existing = Array.from({ length: HISTORY_MAX }, (_, i) => makeEntry(`entry-${i}`));
    const result = prependHistory(makeEntry('newest'), existing);
    expect(result).toHaveLength(HISTORY_MAX);
    expect(result[0].output).toBe('newest');
  });

  it('drops the oldest entry when at capacity', () => {
    const existing = Array.from({ length: HISTORY_MAX }, (_, i) => makeEntry(`entry-${i}`));
    const result = prependHistory(makeEntry('newest'), existing);
    expect(result.find((e) => e.output === `entry-${HISTORY_MAX - 1}`)).toBeUndefined();
  });
});
