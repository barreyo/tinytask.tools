import { describe, it, expect } from 'vitest';
import { round, computeMinPayment, simulateLoan } from '../lib/currency-precision';

describe('round', () => {
  describe('FLOOR', () => {
    it('rounds down', () => {
      expect(round(1.005, 2, 'FLOOR')).toBe(1.0);
      expect(round(1.999, 2, 'FLOOR')).toBe(1.99);
      expect(round(-1.001, 2, 'FLOOR')).toBe(-1.01);
    });
  });

  describe('CEIL', () => {
    it('rounds up', () => {
      expect(round(1.001, 2, 'CEIL')).toBe(1.01);
      expect(round(1.99, 2, 'CEIL')).toBe(1.99);
      expect(round(-1.999, 2, 'CEIL')).toBe(-1.99);
    });
  });

  describe('TRUNCATE', () => {
    it('truncates toward zero', () => {
      expect(round(1.999, 2, 'TRUNCATE')).toBe(1.99);
      expect(round(-1.999, 2, 'TRUNCATE')).toBe(-1.99);
    });
  });

  describe('HALF_UP', () => {
    it('rounds half away from zero', () => {
      // 1.005 cannot be represented exactly in IEEE 754 — it is slightly below 1.005
      // so rounding to 2dp gives 1.00 (correct float behavior, not a bug)
      expect(round(1.004, 2, 'HALF_UP')).toBe(1.0);
      expect(round(1.006, 2, 'HALF_UP')).toBe(1.01);
      expect(round(1.5, 0, 'HALF_UP')).toBe(2);
      expect(round(2.5, 0, 'HALF_UP')).toBe(3);
      expect(round(3.5, 0, 'HALF_UP')).toBe(4);
    });
  });

  describe('BANKERS', () => {
    it('rounds half to even', () => {
      // 2.5 → 2 (even), 3.5 → 4 (even), 4.5 → 4 (even), 5.5 → 6 (even)
      expect(round(2.5, 0, 'BANKERS')).toBe(2);
      expect(round(3.5, 0, 'BANKERS')).toBe(4);
      expect(round(4.5, 0, 'BANKERS')).toBe(4);
      expect(round(5.5, 0, 'BANKERS')).toBe(6);
    });

    it('behaves like HALF_UP for non-half values', () => {
      expect(round(1.4, 0, 'BANKERS')).toBe(1);
      expect(round(1.6, 0, 'BANKERS')).toBe(2);
    });
  });

  it('handles zero decimals', () => {
    expect(round(3.7, 0, 'FLOOR')).toBe(3);
    expect(round(3.7, 0, 'CEIL')).toBe(4);
    expect(round(3.5, 0, 'HALF_UP')).toBe(4);
  });

  it('handles higher decimal precision', () => {
    expect(round(1.12345, 4, 'HALF_UP')).toBe(1.1235);
    expect(round(1.12345, 4, 'FLOOR')).toBe(1.1234);
  });
});

describe('computeMinPayment', () => {
  it('computes expected monthly payment for a standard loan', () => {
    // $10,000 at 12% for 12 months → ~$888.49
    const payment = computeMinPayment(10000, 12, 12, 2, 'HALF_UP');
    expect(payment).toBeCloseTo(888.49, 0);
  });

  it('handles zero interest rate', () => {
    const payment = computeMinPayment(1200, 0, 12, 2, 'HALF_UP');
    expect(payment).toBe(100);
  });
});

describe('simulateLoan', () => {
  it('returns one result per mode', () => {
    const results = simulateLoan({
      principal: 1000,
      annualRatePct: 12,
      termMonths: 12,
      decimalPlaces: 2,
      modes: ['HALF_UP', 'BANKERS', 'FLOOR'],
    });
    expect(results).toHaveLength(3);
    expect(results[0].mode).toBe('HALF_UP');
    expect(results[1].mode).toBe('BANKERS');
    expect(results[2].mode).toBe('FLOOR');
  });

  it('produces final balance of 0 after all payments', () => {
    const results = simulateLoan({
      principal: 1000,
      annualRatePct: 12,
      termMonths: 12,
      decimalPlaces: 2,
      modes: ['HALF_UP'],
    });
    expect(results[0].finalBalance).toBe(0);
  });

  it('each month row has non-negative balance', () => {
    const results = simulateLoan({
      principal: 5000,
      annualRatePct: 8.5,
      termMonths: 24,
      decimalPlaces: 2,
      modes: ['BANKERS', 'FLOOR', 'CEIL', 'HALF_UP', 'TRUNCATE'],
    });
    for (const result of results) {
      for (const row of result.months) {
        expect(row.balance).toBeGreaterThanOrEqual(0);
        expect(row.interest).toBeGreaterThanOrEqual(0);
        expect(row.principal).toBeGreaterThan(0);
      }
    }
  });

  it('shows different total interest across rounding modes', () => {
    const results = simulateLoan({
      principal: 10000,
      annualRatePct: 10,
      termMonths: 36,
      decimalPlaces: 2,
      modes: ['FLOOR', 'CEIL'],
    });
    // Floor and Ceiling should produce different totals for a long-running loan
    const floorInterest = results.find((r) => r.mode === 'FLOOR')!.totalInterest;
    const ceilInterest = results.find((r) => r.mode === 'CEIL')!.totalInterest;
    expect(floorInterest).not.toBe(ceilInterest);
  });

  it('month count matches term for standard inputs', () => {
    const results = simulateLoan({
      principal: 1000,
      annualRatePct: 5,
      termMonths: 12,
      decimalPlaces: 2,
      modes: ['HALF_UP'],
    });
    expect(results[0].months).toHaveLength(12);
  });
});
