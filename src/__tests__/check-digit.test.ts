import { describe, it, expect } from 'vitest';
import {
  validateVerhoeff,
  computeVerhoeffCheckDigit,
  verhoeffBreakdown,
  validateDamm,
  computeDammCheckDigit,
  dammBreakdown,
  validateIsbn10,
  computeIsbn10CheckDigit,
  isbn10Breakdown,
} from '../lib/check-digit';

// ── Verhoeff ──────────────────────────────────────────────────────────────────

describe('validateVerhoeff', () => {
  it('accepts a known valid number', () => {
    // 2363 is a well-known Verhoeff example
    expect(validateVerhoeff('2363')).toBe(true);
  });

  it('accepts another known valid number', () => {
    // 9876 with computed check digit 4 → 98764 (manually verified)
    expect(validateVerhoeff('98764')).toBe(true);
  });

  it('rejects a single-digit error', () => {
    // Change one digit in 2363
    expect(validateVerhoeff('2363'.replace('3', '4'))).toBe(false);
  });

  it('rejects an adjacent transposition', () => {
    // Swap first two digits of 2363 → 3263
    expect(validateVerhoeff('3263')).toBe(false);
  });

  it('rejects numbers that are too short', () => {
    expect(validateVerhoeff('1')).toBe(false);
  });

  it('strips non-digit characters before validating', () => {
    expect(validateVerhoeff('23 63')).toBe(true);
  });
});

describe('computeVerhoeffCheckDigit', () => {
  it('computes the correct check digit for 236', () => {
    // 236 + check = 2363
    expect(computeVerhoeffCheckDigit('236')).toBe('3');
  });

  it('produces a number that validates', () => {
    const partial = '54321';
    const check = computeVerhoeffCheckDigit(partial);
    expect(validateVerhoeff(partial + check)).toBe(true);
  });

  it('round-trips for various inputs', () => {
    const partials = ['1', '12', '9876', '100200'];
    for (const p of partials) {
      const check = computeVerhoeffCheckDigit(p);
      expect(validateVerhoeff(p + check)).toBe(true);
    }
  });
});

describe('verhoeffBreakdown', () => {
  it('returns one step per digit', () => {
    const steps = verhoeffBreakdown('2363');
    expect(steps).toHaveLength(4);
  });

  it('contains permuted and running values', () => {
    const steps = verhoeffBreakdown('2363');
    for (const s of steps) {
      expect(s.permuted).toBeGreaterThanOrEqual(0);
      expect(s.running).toBeGreaterThanOrEqual(0);
    }
  });

  it('final running value is 0 for valid number', () => {
    // breakdown unshifts steps (right-to-left processing), so steps[0] holds
    // the last-processed digit (leftmost) with the final accumulator value
    const steps = verhoeffBreakdown('2363');
    expect(steps[0].running).toBe(0);
  });
});

// ── Damm ──────────────────────────────────────────────────────────────────────

describe('validateDamm', () => {
  it('accepts a known valid number', () => {
    // 572 with check digit 4 → 5724
    expect(validateDamm('5724')).toBe(true);
  });

  it('accepts another known valid number', () => {
    // 1234 with computed check digit 0 → 12340 (manually verified)
    expect(validateDamm('12340')).toBe(true);
  });

  it('rejects a single-digit error', () => {
    expect(validateDamm('5725')).toBe(false);
  });

  it('rejects an adjacent transposition', () => {
    // Swap digits: 5274 instead of 5724
    expect(validateDamm('5274')).toBe(false);
  });

  it('rejects numbers that are too short', () => {
    expect(validateDamm('5')).toBe(false);
  });

  it('strips non-digit characters', () => {
    expect(validateDamm('57 24')).toBe(true);
  });
});

describe('computeDammCheckDigit', () => {
  it('computes check digit for 572 → 4', () => {
    expect(computeDammCheckDigit('572')).toBe('4');
  });

  it('produces a number that validates', () => {
    const partial = '98765';
    const check = computeDammCheckDigit(partial);
    expect(validateDamm(partial + check)).toBe(true);
  });

  it('round-trips for various inputs', () => {
    const partials = ['1', '42', '314159', '000'];
    for (const p of partials) {
      const check = computeDammCheckDigit(p);
      expect(validateDamm(p + check)).toBe(true);
    }
  });
});

describe('dammBreakdown', () => {
  it('returns one step per digit', () => {
    const steps = dammBreakdown('5724');
    expect(steps).toHaveLength(4);
  });

  it('final interim is 0 for valid number', () => {
    const steps = dammBreakdown('5724');
    expect(steps[steps.length - 1].nextInterim).toBe(0);
  });

  it('each step shows previous and next interim', () => {
    const steps = dammBreakdown('5724');
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].prevInterim).toBe(steps[i - 1].nextInterim);
    }
  });
});

// ── ISBN-10 ───────────────────────────────────────────────────────────────────

describe('validateIsbn10', () => {
  it('accepts a known valid ISBN-10', () => {
    // "0-306-40615-2"
    expect(validateIsbn10('0306406152')).toBe(true);
  });

  it('accepts an ISBN-10 with X check digit', () => {
    // "0-8044-2957-X"
    expect(validateIsbn10('080442957X')).toBe(true);
  });

  it('accepts another well-known ISBN-10', () => {
    expect(validateIsbn10('0471958697')).toBe(true);
  });

  it('rejects an invalid ISBN-10', () => {
    expect(validateIsbn10('0306406153')).toBe(false);
  });

  it('rejects numbers that are not 10 characters', () => {
    expect(validateIsbn10('030640615')).toBe(false);
    expect(validateIsbn10('03064061520')).toBe(false);
  });

  it('strips hyphens and spaces', () => {
    expect(validateIsbn10('0-306-40615-2')).toBe(true);
    expect(validateIsbn10('0 306 40615 2')).toBe(true);
  });

  it('accepts lowercase x as check digit', () => {
    expect(validateIsbn10('080442957x')).toBe(true);
  });

  it('rejects non-digit characters in non-check positions', () => {
    expect(validateIsbn10('A306406152')).toBe(false);
  });
});

describe('computeIsbn10CheckDigit', () => {
  it('computes check digit for 030640615 → 2', () => {
    expect(computeIsbn10CheckDigit('030640615')).toBe('2');
  });

  it('computes X when check digit is 10', () => {
    expect(computeIsbn10CheckDigit('080442957')).toBe('X');
  });

  it('produces a number that validates', () => {
    const partial = '047195869';
    const check = computeIsbn10CheckDigit(partial);
    expect(validateIsbn10(partial + check)).toBe(true);
  });

  it('returns empty string for non-9-digit input', () => {
    expect(computeIsbn10CheckDigit('12345678')).toBe('');
    expect(computeIsbn10CheckDigit('1234567890')).toBe('');
    expect(computeIsbn10CheckDigit('12345678A')).toBe('');
  });
});

describe('isbn10Breakdown', () => {
  it('returns 10 steps for a complete ISBN-10', () => {
    const steps = isbn10Breakdown('0306406152');
    expect(steps).toHaveLength(10);
  });

  it('weights descend from 10 to 1', () => {
    const steps = isbn10Breakdown('0306406152');
    steps.forEach((s, i) => expect(s.weight).toBe(10 - i));
  });

  it('product equals value times weight', () => {
    const steps = isbn10Breakdown('0306406152');
    for (const s of steps) {
      expect(s.product).toBe(s.value * s.weight);
    }
  });

  it('sum of products is divisible by 11 for valid ISBN', () => {
    const steps = isbn10Breakdown('0306406152');
    const sum = steps.reduce((acc, s) => acc + s.product, 0);
    expect(sum % 11).toBe(0);
  });

  it('represents X check digit with value 10', () => {
    const steps = isbn10Breakdown('080442957X');
    expect(steps[9].char).toBe('X');
    expect(steps[9].value).toBe(10);
  });
});
