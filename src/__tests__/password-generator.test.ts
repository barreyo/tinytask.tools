import { describe, it, expect } from 'vitest';
import { buildCharset, generatePassword, estimateStrength } from '../lib/password-generator';
import type { PasswordOptions } from '../lib/password-generator';

// ── buildCharset ──────────────────────────────────────────────────────────────

const baseOpts: PasswordOptions = {
  length: 16,
  uppercase: false,
  lowercase: false,
  digits: false,
  symbols: false,
  customChars: '',
  excludeAmbiguous: false,
  requireEachSet: false,
};

describe('buildCharset', () => {
  it('returns empty string when no character sets are enabled', () => {
    expect(buildCharset(baseOpts)).toBe('');
  });

  it('includes only uppercase letters when uppercase is true', () => {
    const cs = buildCharset({ ...baseOpts, uppercase: true });
    expect(cs).toMatch(/^[A-Z]+$/);
    expect(cs).toHaveLength(26);
  });

  it('includes only lowercase letters when lowercase is true', () => {
    const cs = buildCharset({ ...baseOpts, lowercase: true });
    expect(cs).toMatch(/^[a-z]+$/);
    expect(cs).toHaveLength(26);
  });

  it('includes only digits when digits is true', () => {
    const cs = buildCharset({ ...baseOpts, digits: true });
    expect(cs).toMatch(/^[0-9]+$/);
    expect(cs).toHaveLength(10);
  });

  it('includes all character sets when all are enabled', () => {
    const cs = buildCharset({
      ...baseOpts,
      uppercase: true,
      lowercase: true,
      digits: true,
      symbols: true,
    });
    expect(cs).toMatch(/[A-Z]/);
    expect(cs).toMatch(/[a-z]/);
    expect(cs).toMatch(/[0-9]/);
    expect(cs).toMatch(/[!@#$%^&*]/);
  });

  it('appends custom characters not already in charset', () => {
    const cs = buildCharset({ ...baseOpts, uppercase: true, customChars: 'ABC∑' });
    // A, B, C already in uppercase; ∑ is new
    expect(cs).toContain('∑');
  });

  it('does not duplicate custom chars that are already in charset', () => {
    const cs = buildCharset({ ...baseOpts, uppercase: true, customChars: 'ABC' });
    // A, B, C appear exactly once (deduplication applied at end)
    const aCount = [...cs].filter((c) => c === 'A').length;
    expect(aCount).toBe(1);
  });

  it('excludes ambiguous characters when excludeAmbiguous is true', () => {
    const cs = buildCharset({
      ...baseOpts,
      uppercase: true,
      lowercase: true,
      digits: true,
      excludeAmbiguous: true,
    });
    expect(cs).not.toContain('0');
    expect(cs).not.toContain('O');
    expect(cs).not.toContain('l');
    expect(cs).not.toContain('1');
    expect(cs).not.toContain('I');
  });

  it('produces deduplicated charset', () => {
    const cs = buildCharset({
      ...baseOpts,
      uppercase: true,
      customChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    });
    const unique = [...new Set(cs)];
    expect(cs.length).toBe(unique.length);
  });
});

// ── generatePassword ──────────────────────────────────────────────────────────

describe('generatePassword', () => {
  it('generates a password of the exact requested length', () => {
    for (const len of [1, 8, 16, 32, 64]) {
      const pwd = generatePassword({ ...baseOpts, lowercase: true, length: len });
      expect(pwd).toHaveLength(len);
    }
  });

  it('throws when no character sets are enabled', () => {
    expect(() => generatePassword(baseOpts)).toThrow(/no characters available/i);
  });

  it('throws when length is less than 1', () => {
    expect(() => generatePassword({ ...baseOpts, lowercase: true, length: 0 })).toThrow(
      /length must be at least 1/i,
    );
  });

  it('only contains lowercase letters when lowercase only', () => {
    const pwd = generatePassword({ ...baseOpts, lowercase: true, length: 50 });
    expect(pwd).toMatch(/^[a-z]+$/);
  });

  it('only contains digits when digits only', () => {
    const pwd = generatePassword({ ...baseOpts, digits: true, length: 50 });
    expect(pwd).toMatch(/^[0-9]+$/);
  });

  it('contains at least one of each required set when requireEachSet is true', () => {
    const opts: PasswordOptions = {
      ...baseOpts,
      uppercase: true,
      lowercase: true,
      digits: true,
      symbols: true,
      length: 20,
      requireEachSet: true,
    };
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 10; i++) {
      const pwd = generatePassword(opts);
      expect(pwd).toMatch(/[A-Z]/);
      expect(pwd).toMatch(/[a-z]/);
      expect(pwd).toMatch(/[0-9]/);
      expect(pwd).toMatch(/[!@#$%^&*\-_=+[\]{}|;:,.<>?()]/);
    }
  });

  it('generates different passwords on successive calls', () => {
    const opts: PasswordOptions = { ...baseOpts, lowercase: true, length: 16 };
    const passwords = new Set(Array.from({ length: 10 }, () => generatePassword(opts)));
    // With a 26-char alphabet and length 16, collisions are astronomically unlikely
    expect(passwords.size).toBeGreaterThan(1);
  });

  it('does not contain ambiguous characters when excludeAmbiguous is true', () => {
    const opts: PasswordOptions = {
      ...baseOpts,
      uppercase: true,
      lowercase: true,
      digits: true,
      excludeAmbiguous: true,
      length: 100,
    };
    const pwd = generatePassword(opts);
    expect(pwd).not.toMatch(/[0OlI1]/);
  });
});

// ── estimateStrength ──────────────────────────────────────────────────────────

describe('estimateStrength', () => {
  it('rates a very short all-lowercase password as weak', () => {
    const result = estimateStrength('abc');
    expect(result.label).toBe('weak');
    expect(result.level).toBe(1);
  });

  it('rates a long mixed password as very strong', () => {
    const result = estimateStrength('aB3!xK9#mZ2@qR7$');
    expect(result.label).toBe('very strong');
    expect(result.level).toBe(4);
  });

  it('bits increases with password length', () => {
    const short = estimateStrength('abc');
    const long = estimateStrength('abcdefghijklmno');
    expect(long.bits).toBeGreaterThan(short.bits);
  });

  it('bits increases with character set diversity', () => {
    const lower = estimateStrength('abcdefgh');
    const mixed = estimateStrength('aBcDeF1!');
    expect(mixed.bits).toBeGreaterThan(lower.bits);
  });

  it('returns level 2 (fair) for moderate passwords', () => {
    // ~8 char lowercase = 8 * log2(26) ≈ 37.6 bits → weak
    // ~10 chars mixed case = 10 * log2(52) ≈ 57 bits → fair
    const result = estimateStrength('aAbBcCdDeE');
    expect(result.level).toBe(2);
    expect(result.label).toBe('fair');
  });

  it('returns level 3 (strong) for long single-charset passwords', () => {
    // 14 lowercase: 14 * log2(26) ≈ 65.8 bits → strong
    const result = estimateStrength('abcdefghijklmn');
    expect(result.label).toBe('strong');
    expect(result.level).toBe(3);
  });

  it('bits is a positive finite number', () => {
    const { bits } = estimateStrength('hello');
    expect(bits).toBeGreaterThan(0);
    expect(isFinite(bits)).toBe(true);
  });

  it('falls back to charsetSize 26 when password has no recognised characters', () => {
    // Emoji only — no A-Z, a-z, 0-9, or symbols matched by regex
    const result = estimateStrength('🔑🔑🔑');
    expect(result.bits).toBeGreaterThan(0);
  });
});
