import { describe, expect, it, vi } from 'vitest';
import {
  encodeCrockford,
  formatAge,
  generateULID,
  HISTORY_MAX,
  isValidUlid,
  isValidUuid,
  mergeHistory,
  pruneHistory,
  ulidTimestamp,
  uuidVersion,
  CROCKFORD,
  ULID_LENGTH,
} from '../lib/uuid-generator';

// ── encodeCrockford ───────────────────────────────────────────────────────────

describe('encodeCrockford', () => {
  it('encodes 0 as all zeros', () => {
    expect(encodeCrockford(0n, 4)).toBe('0000');
  });

  it('encodes max 5-bit value (31) as Z', () => {
    expect(encodeCrockford(31n, 1)).toBe('Z');
  });

  it('only uses characters from the Crockford alphabet', () => {
    for (let i = 0; i < 100; i++) {
      const val = BigInt(Math.floor(Math.random() * 2 ** 32));
      const encoded = encodeCrockford(val, 8);
      for (const char of encoded) {
        expect(CROCKFORD).toContain(char);
      }
    }
  });

  it('produces the requested length', () => {
    expect(encodeCrockford(12345n, 10)).toHaveLength(10);
    expect(encodeCrockford(0n, 1)).toHaveLength(1);
    expect(encodeCrockford(999999n, 16)).toHaveLength(16);
  });

  it('is reversible: re-encoding a decoded value round-trips', () => {
    const original = 123456789n;
    const encoded = encodeCrockford(original, 7);
    let decoded = 0n;
    for (const char of encoded) {
      decoded = (decoded << 5n) | BigInt(CROCKFORD.indexOf(char));
    }
    expect(decoded).toBe(original);
  });
});

// ── generateULID ──────────────────────────────────────────────────────────────

describe('generateULID', () => {
  it('returns a string of exactly 26 characters', () => {
    expect(generateULID()).toHaveLength(ULID_LENGTH);
  });

  it('only contains valid Crockford Base32 characters', () => {
    const ulid = generateULID();
    for (const char of ulid) {
      expect(CROCKFORD).toContain(char);
    }
  });

  it('matches the ULID regex', () => {
    expect(isValidUlid(generateULID())).toBe(true);
  });

  it('encodes the current timestamp in the first 10 characters', () => {
    const before = Date.now();
    const ulid = generateULID();
    const after = Date.now();
    const ts = ulidTimestamp(ulid);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('generates unique values on successive calls', () => {
    const values = new Set(Array.from({ length: 100 }, generateULID));
    expect(values.size).toBe(100);
  });

  it('is monotonically ordered when generated in the same millisecond (time part)', () => {
    // Freeze time so both ULIDs get identical timestamps
    const frozen = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(frozen);
    const a = generateULID();
    const b = generateULID();
    vi.restoreAllMocks();
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
  });
});

// ── ulidTimestamp ─────────────────────────────────────────────────────────────

describe('ulidTimestamp', () => {
  it('recovers the timestamp used when generating', () => {
    const ts = 1_700_000_000_123;
    vi.spyOn(Date, 'now').mockReturnValue(ts);
    const ulid = generateULID();
    vi.restoreAllMocks();
    expect(ulidTimestamp(ulid)).toBe(ts);
  });
});

// ── isValidUuid ───────────────────────────────────────────────────────────────

describe('isValidUuid', () => {
  it('accepts standard RFC 4122 UUIDs', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('rejects strings that are too short', () => {
    expect(isValidUuid('550e8400-e29b-41d4')).toBe(false);
  });

  it('rejects strings with wrong separators', () => {
    expect(isValidUuid('550e8400_e29b_41d4_a716_446655440000')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidUuid('')).toBe(false);
  });

  it('rejects a ULID', () => {
    expect(isValidUuid(generateULID())).toBe(false);
  });
});

// ── isValidUlid ───────────────────────────────────────────────────────────────

describe('isValidUlid', () => {
  it('accepts well-formed ULIDs', () => {
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
  });

  it('rejects lowercase', () => {
    expect(isValidUlid('01arz3ndektsv4rrffq69g5fav')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FA')).toBe(false);
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAVX')).toBe(false);
  });

  it('rejects characters not in Crockford alphabet (I, L, O, U)', () => {
    expect(isValidUlid('0IARЗ3NDEKTSV4RRFFQ69G5FAV')).toBe(false);
  });

  it('rejects a UUID', () => {
    expect(isValidUlid('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
  });
});

// ── uuidVersion ──────────────────────────────────────────────────────────────

describe('uuidVersion', () => {
  it('returns 4 for a v4 UUID', () => {
    expect(uuidVersion('550e8400-e29b-41d4-a716-446655440000')).toBe(4);
  });

  it('returns 1 for a v1 UUID', () => {
    expect(uuidVersion('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(1);
  });

  it('returns null for an invalid string', () => {
    expect(uuidVersion('not-a-uuid')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(uuidVersion('')).toBeNull();
  });
});

// ── formatAge ────────────────────────────────────────────────────────────────

describe('formatAge', () => {
  const now = 1_700_000_100_000;

  it('returns "just now" for differences under 60 seconds', () => {
    expect(formatAge(now - 0, now)).toBe('just now');
    expect(formatAge(now - 30_000, now)).toBe('just now');
    expect(formatAge(now - 59_999, now)).toBe('just now');
  });

  it('returns minutes for differences between 1 minute and 1 hour', () => {
    expect(formatAge(now - 60_000, now)).toBe('1m ago');
    expect(formatAge(now - 90_000, now)).toBe('1m ago');
    expect(formatAge(now - 3_599_999, now)).toBe('59m ago');
  });

  it('returns hours for differences between 1 hour and 24 hours', () => {
    expect(formatAge(now - 3_600_000, now)).toBe('1h ago');
    expect(formatAge(now - 7_200_000, now)).toBe('2h ago');
    expect(formatAge(now - 86_399_999, now)).toBe('23h ago');
  });

  it('returns days for differences >= 24 hours', () => {
    expect(formatAge(now - 86_400_000, now)).toBe('1d ago');
    expect(formatAge(now - 172_800_000, now)).toBe('2d ago');
  });
});

// ── pruneHistory ─────────────────────────────────────────────────────────────

describe('pruneHistory', () => {
  it('returns the same array when under the limit', () => {
    const entries = [{ value: 'a', type: 'v4' as const, timestamp: 1 }];
    expect(pruneHistory(entries)).toEqual(entries);
  });

  it(`caps at ${HISTORY_MAX} entries`, () => {
    const entries = Array.from({ length: HISTORY_MAX + 10 }, (_, i) => ({
      value: `val-${i}`,
      type: 'v4' as const,
      timestamp: i,
    }));
    expect(pruneHistory(entries)).toHaveLength(HISTORY_MAX);
  });

  it('keeps the first (newest) entries when trimming', () => {
    const entries = Array.from({ length: HISTORY_MAX + 5 }, (_, i) => ({
      value: `val-${i}`,
      type: 'v4' as const,
      timestamp: i,
    }));
    const pruned = pruneHistory(entries);
    expect(pruned[0].value).toBe('val-0');
    expect(pruned[pruned.length - 1].value).toBe(`val-${HISTORY_MAX - 1}`);
  });
});

// ── mergeHistory ─────────────────────────────────────────────────────────────

describe('mergeHistory', () => {
  it('prepends incoming entries before existing ones', () => {
    const existing = [{ value: 'old', type: 'v4' as const, timestamp: 1 }];
    const incoming = [{ value: 'new', type: 'v7' as const, timestamp: 2 }];
    const merged = mergeHistory(incoming, existing);
    expect(merged[0].value).toBe('new');
    expect(merged[1].value).toBe('old');
  });

  it('respects the max history cap', () => {
    const existing = Array.from({ length: HISTORY_MAX }, (_, i) => ({
      value: `old-${i}`,
      type: 'v4' as const,
      timestamp: i,
    }));
    const incoming = [{ value: 'brand-new', type: 'ulid' as const, timestamp: 999 }];
    const merged = mergeHistory(incoming, existing);
    expect(merged).toHaveLength(HISTORY_MAX);
    expect(merged[0].value).toBe('brand-new');
  });

  it('handles empty existing history', () => {
    const incoming = [{ value: 'x', type: 'v4' as const, timestamp: 1 }];
    expect(mergeHistory(incoming, [])).toEqual(incoming);
  });

  it('handles empty incoming entries', () => {
    const existing = [{ value: 'y', type: 'v1' as const, timestamp: 2 }];
    expect(mergeHistory([], existing)).toEqual(existing);
  });
});
