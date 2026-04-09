import { describe, it, expect } from 'vitest';
import { validateLuhn, computeCheckDigit, generateTestNumber, luhnBreakdown } from '../lib/luhn';

// ── validateLuhn ──────────────────────────────────────────────────────────────

describe('validateLuhn', () => {
  it('accepts a known valid Visa test number', () => {
    expect(validateLuhn('4532015112830366')).toBe(true);
  });

  it('accepts a known valid Mastercard test number', () => {
    expect(validateLuhn('5425233430109903')).toBe(true);
  });

  it('accepts a known valid Amex test number', () => {
    // Stripe test card for Amex
    expect(validateLuhn('378282246310005')).toBe(true);
  });

  it('rejects a number with a single changed digit', () => {
    // 4532015112830366 → change last digit from 6 to 7
    expect(validateLuhn('4532015112830367')).toBe(false);
  });

  it('rejects a number where two adjacent digits are swapped', () => {
    // Swap last two digits of 4532015112830366 (6,6) → ...36 stays same but swap earlier pair
    expect(validateLuhn('4532015112803366')).toBe(false);
  });

  it('rejects strings shorter than 2 digits', () => {
    expect(validateLuhn('0')).toBe(false);
    expect(validateLuhn('')).toBe(false);
  });

  it('strips non-digit characters before validating', () => {
    expect(validateLuhn('4532-0151-1283-0366')).toBe(true);
    expect(validateLuhn('4532 0151 1283 0366')).toBe(true);
  });

  it('accepts exactly 2 digits (18 passes Luhn)', () => {
    // 18: double 1 → 2, 8 stays → sum=10 → valid
    expect(validateLuhn('18')).toBe(true);
  });

  it('rejects non-valid 2-digit number', () => {
    expect(validateLuhn('17')).toBe(false);
  });
});

// ── computeCheckDigit ─────────────────────────────────────────────────────────

describe('computeCheckDigit', () => {
  it('appends the check digit that makes the full number valid', () => {
    const partial = '453201511283036';
    const check = computeCheckDigit(partial);
    expect(validateLuhn(partial + String(check))).toBe(true);
  });

  it('returns 6 for a known Visa partial', () => {
    expect(computeCheckDigit('453201511283036')).toBe(6);
  });

  it('returns a digit in [0, 9]', () => {
    const check = computeCheckDigit('123456789012345');
    expect(check).toBeGreaterThanOrEqual(0);
    expect(check).toBeLessThanOrEqual(9);
  });

  it('round-trips for various partials', () => {
    const partials = ['1', '123', '9999', '453201511283036', '374251018720955'.slice(0, -1)];
    for (const p of partials) {
      const check = computeCheckDigit(p);
      expect(validateLuhn(p + String(check))).toBe(true);
    }
  });

  it('strips non-digit characters from partial', () => {
    const withDashes = '4532-0151-1283-036';
    const clean = '453201511283036';
    expect(computeCheckDigit(withDashes)).toBe(computeCheckDigit(clean));
  });
});

// ── generateTestNumber ────────────────────────────────────────────────────────

describe('generateTestNumber', () => {
  it('generates a valid Luhn number for Visa IIN "4"', () => {
    const card = generateTestNumber('4', 16);
    expect(validateLuhn(card)).toBe(true);
    expect(card).toHaveLength(16);
    expect(card.startsWith('4')).toBe(true);
  });

  it('generates a valid Luhn number for Mastercard IIN "51"', () => {
    const card = generateTestNumber('51', 16);
    expect(validateLuhn(card)).toBe(true);
    expect(card).toHaveLength(16);
    expect(card.startsWith('51')).toBe(true);
  });

  it('generates a valid Luhn number for Amex IIN "34" with length 15', () => {
    const card = generateTestNumber('34', 15);
    expect(validateLuhn(card)).toBe(true);
    expect(card).toHaveLength(15);
    expect(card.startsWith('34')).toBe(true);
  });

  it('truncates when IIN is longer than or equal to requested length', () => {
    const result = generateTestNumber('123456', 4);
    expect(result).toHaveLength(4);
    expect(result).toBe('1234');
  });

  it('strips non-digit characters from IIN', () => {
    const withDash = generateTestNumber('4-XXX', 16);
    const clean = generateTestNumber('4', 16);
    expect(withDash.startsWith('4')).toBe(true);
    expect(withDash).toHaveLength(16);
    // Both should be valid Luhn numbers
    expect(validateLuhn(withDash)).toBe(true);
    expect(validateLuhn(clean)).toBe(true);
  });
});

// ── luhnBreakdown ─────────────────────────────────────────────────────────────

describe('luhnBreakdown', () => {
  it('returns one step per digit', () => {
    const steps = luhnBreakdown('4532015112830366');
    expect(steps).toHaveLength(16);
  });

  it('rightmost digit is never doubled', () => {
    const steps = luhnBreakdown('4532015112830366');
    expect(steps[steps.length - 1].doubled).toBe(false);
  });

  it('alternates doubled flag from right to left', () => {
    const steps = luhnBreakdown('12345678');
    for (let i = 0; i < steps.length; i++) {
      const expectedDoubled = (steps.length - 1 - i) % 2 === 1;
      expect(steps[i].doubled).toBe(expectedDoubled);
    }
  });

  it('doubled value is original × 2 (minus 9 if > 9)', () => {
    const steps = luhnBreakdown('4532015112830366');
    for (const step of steps) {
      if (step.doubled) {
        const expected = step.original * 2 > 9 ? step.original * 2 - 9 : step.original * 2;
        expect(step.value).toBe(expected);
      } else {
        expect(step.value).toBe(step.original);
      }
    }
  });

  it('sum of values is divisible by 10 for a valid number', () => {
    const steps = luhnBreakdown('4532015112830366');
    const sum = steps.reduce((acc, s) => acc + s.value, 0);
    expect(sum % 10).toBe(0);
  });

  it('sum of values is NOT divisible by 10 for an invalid number', () => {
    const steps = luhnBreakdown('4532015112830367');
    const sum = steps.reduce((acc, s) => acc + s.value, 0);
    expect(sum % 10).not.toBe(0);
  });

  it('handles stripped non-digit characters transparently', () => {
    const withSpaces = luhnBreakdown('4532 0151 1283 0366');
    const clean = luhnBreakdown('4532015112830366');
    expect(withSpaces).toEqual(clean);
  });
});
