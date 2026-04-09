import { describe, it, expect } from 'vitest';
import {
  computeStandardPayment,
  computeAmortization,
  computeSummary,
  fmt,
} from '../lib/interest-calculator';
import type { LoanInputs } from '../lib/interest-calculator';

// ── Helpers ───────────────────────────────────────────────────────────────────

const base: LoanInputs = {
  principal: 10000,
  apr: 10,
  termMonths: 12,
  compounding: 'monthly',
  paymentFrequency: 'monthly',
  fixedPayment: 0,
  minimumPaymentMode: false,
  minPaymentPct: 0,
  minPaymentFloor: 0,
  originationFeePct: 0,
  monthlyFee: 0,
  perPaymentFee: 0,
};

// ── computeStandardPayment ────────────────────────────────────────────────────

describe('computeStandardPayment', () => {
  it('returns principal / periods for 0% APR', () => {
    const inputs: LoanInputs = { ...base, apr: 0 };
    const payment = computeStandardPayment(inputs);
    expect(payment).toBeCloseTo(10000 / 12, 4);
  });

  it('returns correct annuity payment for known inputs', () => {
    // $10,000 at 10% APR / 12 months monthly compounding
    // monthly rate ≈ 0.008333, payment ≈ $879.16
    const payment = computeStandardPayment(base);
    expect(payment).toBeCloseTo(879.16, 1);
  });

  it('higher APR produces a higher payment', () => {
    const low = computeStandardPayment({ ...base, apr: 5 });
    const high = computeStandardPayment({ ...base, apr: 20 });
    expect(high).toBeGreaterThan(low);
  });

  it('longer term produces a lower monthly payment', () => {
    const short = computeStandardPayment({ ...base, termMonths: 12 });
    const long = computeStandardPayment({ ...base, termMonths: 60 });
    expect(long).toBeLessThan(short);
  });

  it('handles biweekly payment frequency', () => {
    const inputs: LoanInputs = { ...base, paymentFrequency: 'biweekly' };
    const payment = computeStandardPayment(inputs);
    expect(payment).toBeGreaterThan(0);
    // Biweekly payment should be roughly half of monthly
    const monthly = computeStandardPayment(base);
    expect(payment).toBeLessThan(monthly);
  });

  it('handles daily compounding', () => {
    const inputs: LoanInputs = { ...base, compounding: 'daily' };
    const payment = computeStandardPayment(inputs);
    // Daily compounding at 10% should be slightly higher than monthly
    const monthly = computeStandardPayment(base);
    expect(payment).toBeGreaterThan(monthly * 0.99);
  });
});

// ── computeAmortization ───────────────────────────────────────────────────────

describe('computeAmortization', () => {
  it('produces the correct number of periods', () => {
    const rows = computeAmortization(base);
    expect(rows).toHaveLength(12);
  });

  it('period numbers are sequential starting from 1', () => {
    const rows = computeAmortization(base);
    rows.forEach((row, i) => expect(row.period).toBe(i + 1));
  });

  it('final balance is (approximately) zero', () => {
    const rows = computeAmortization(base);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 1);
  });

  it('interest decreases over time as balance decreases', () => {
    const rows = computeAmortization(base);
    expect(rows[0].interest).toBeGreaterThan(rows[rows.length - 1].interest);
  });

  it('principal portion increases over time', () => {
    const rows = computeAmortization(base);
    expect(rows[0].principal).toBeLessThan(rows[rows.length - 1].principal);
  });

  it('payment ≈ principal + interest + fees for each row', () => {
    const rows = computeAmortization(base);
    for (const row of rows.slice(0, -1)) {
      expect(row.payment).toBeCloseTo(row.principal + row.interest + row.fees, 1);
    }
  });

  it('uses fixed payment when specified', () => {
    const rows = computeAmortization({ ...base, fixedPayment: 1000 });
    // First payment should be 1000 (or less if it's the last)
    expect(rows[0].payment).toBeCloseTo(1000, 0);
  });

  it('origination fee appears only in period 1', () => {
    const rows = computeAmortization({ ...base, originationFeePct: 2 });
    const originationFee = (2 / 100) * 10000; // 200
    expect(rows[0].fees).toBeCloseTo(originationFee, 1);
    expect(rows[1].fees).toBeCloseTo(0, 5);
  });

  it('recurring per-payment fee appears in every period', () => {
    const rows = computeAmortization({ ...base, perPaymentFee: 10 });
    for (const row of rows) {
      expect(row.fees).toBeGreaterThanOrEqual(10);
    }
  });

  it('monthly fee is spread across payment periods', () => {
    const rows = computeAmortization({ ...base, monthlyFee: 12 });
    // Monthly fee = 12 per month, payment is monthly so fee per period = 12
    expect(rows[0].fees).toBeCloseTo(12, 5);
  });

  it('0% APR loan pays exactly principal over term', () => {
    const inputs: LoanInputs = { ...base, apr: 0 };
    const rows = computeAmortization(inputs);
    const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
    expect(totalInterest).toBeCloseTo(0, 5);
  });

  describe('minimum payment mode', () => {
    it('generates more periods than standard mode (slower payoff)', () => {
      const standard = computeAmortization(base);
      const minPayment = computeAmortization({
        ...base,
        minimumPaymentMode: true,
        minPaymentPct: 2,
        minPaymentFloor: 25,
      });
      expect(minPayment.length).toBeGreaterThan(standard.length);
    });

    it('balance eventually reaches zero given enough term months', () => {
      // Use a 60-month term so maxPeriods is large enough for min-payment payoff
      const rows = computeAmortization({
        ...base,
        principal: 1000,
        termMonths: 60,
        minimumPaymentMode: true,
        minPaymentPct: 2,
        minPaymentFloor: 25,
      });
      expect(rows[rows.length - 1].balance).toBeCloseTo(0, 1);
    });
  });
});

// ── computeSummary ────────────────────────────────────────────────────────────

describe('computeSummary', () => {
  it('totalPayments equals sum of all row payments', () => {
    const rows = computeAmortization(base);
    const summary = computeSummary(rows, base);
    const expected = rows.reduce((s, r) => s + r.payment, 0);
    expect(summary.totalPayments).toBeCloseTo(expected, 5);
  });

  it('totalInterest is greater than zero for non-zero APR', () => {
    const rows = computeAmortization(base);
    const summary = computeSummary(rows, base);
    expect(summary.totalInterest).toBeGreaterThan(0);
  });

  it('totalInterest is zero for 0% APR', () => {
    const inputs: LoanInputs = { ...base, apr: 0 };
    const rows = computeAmortization(inputs);
    const summary = computeSummary(rows, inputs);
    expect(summary.totalInterest).toBeCloseTo(0, 4);
  });

  it('totalCost equals totalInterest + totalFees', () => {
    const rows = computeAmortization({ ...base, originationFeePct: 1 });
    const summary = computeSummary(rows, { ...base, originationFeePct: 1 });
    expect(summary.totalCost).toBeCloseTo(summary.totalInterest + summary.totalFees, 5);
  });

  it('periods matches row count', () => {
    const rows = computeAmortization(base);
    const summary = computeSummary(rows, base);
    expect(summary.periods).toBe(rows.length);
  });

  it('effectiveApr is close to nominal APR when there are no fees', () => {
    const rows = computeAmortization(base);
    const summary = computeSummary(rows, base);
    // Without fees, effective APR should be very close to stated APR
    expect(summary.effectiveApr).toBeCloseTo(base.apr, 0);
  });

  it('effectiveApr is higher than nominal APR when origination fee is present', () => {
    const inputs: LoanInputs = { ...base, originationFeePct: 2 };
    const rows = computeAmortization(inputs);
    const summary = computeSummary(rows, inputs);
    expect(summary.effectiveApr).toBeGreaterThan(inputs.apr);
  });
});

// ── fmt ───────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('formats integer values with 2 decimal places', () => {
    expect(fmt(1000)).toBe('1,000.00');
  });

  it('formats decimal values', () => {
    expect(fmt(1234.567)).toBe('1,234.57');
  });

  it('formats zero', () => {
    expect(fmt(0)).toBe('0.00');
  });

  it('formats negative values', () => {
    expect(fmt(-99.5)).toBe('-99.50');
  });

  it('adds thousands separators', () => {
    expect(fmt(1000000)).toBe('1,000,000.00');
  });
});
