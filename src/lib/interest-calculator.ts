export type LoanPreset = 'credit-card' | 'bnpl' | 'mortgage' | 'personal' | 'auto' | 'custom';
export type CompoundingFrequency = 'daily' | 'monthly' | 'yearly';
export type PaymentFrequency = 'monthly' | 'biweekly' | 'weekly';

export interface LoanInputs {
  principal: number;
  apr: number; // annual percentage rate as a percentage e.g. 19.99
  termMonths: number;
  compounding: CompoundingFrequency;
  paymentFrequency: PaymentFrequency;
  /** Fixed payment amount per period; 0 = compute minimum/standard */
  fixedPayment: number;
  /** Minimum payment mode: true = pay max(minFloor, minPct * balance) each period */
  minimumPaymentMode: boolean;
  minPaymentPct: number; // e.g. 2 for 2%
  minPaymentFloor: number; // e.g. 25
  originationFeePct: number; // one-time, % of principal
  monthlyFee: number; // recurring flat fee per month
  perPaymentFee: number; // flat fee added to each payment
}

export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  fees: number;
  balance: number;
}

export interface LoanSummary {
  totalPayments: number;
  totalInterest: number;
  totalFees: number;
  totalCost: number;
  effectiveApr: number; // true APR including all fees
  periods: number;
}

export interface PresetDefaults {
  label: string;
  principal: number;
  apr: number;
  termMonths: number;
  compounding: CompoundingFrequency;
  paymentFrequency: PaymentFrequency;
  fixedPayment: number;
  minimumPaymentMode: boolean;
  minPaymentPct: number;
  minPaymentFloor: number;
  originationFeePct: number;
  monthlyFee: number;
  perPaymentFee: number;
}

export const PRESETS: Record<LoanPreset, PresetDefaults> = {
  'credit-card': {
    label: 'Credit Card',
    principal: 5000,
    apr: 24.99,
    termMonths: 60,
    compounding: 'daily',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: true,
    minPaymentPct: 2,
    minPaymentFloor: 25,
    originationFeePct: 0,
    monthlyFee: 0,
    perPaymentFee: 0,
  },
  bnpl: {
    label: 'BNPL',
    principal: 800,
    apr: 0,
    termMonths: 4,
    compounding: 'monthly',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: false,
    minPaymentPct: 0,
    minPaymentFloor: 0,
    originationFeePct: 0,
    monthlyFee: 0,
    perPaymentFee: 5,
  },
  mortgage: {
    label: 'Mortgage',
    principal: 350000,
    apr: 6.5,
    termMonths: 360,
    compounding: 'monthly',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: false,
    minPaymentPct: 0,
    minPaymentFloor: 0,
    originationFeePct: 1,
    monthlyFee: 0,
    perPaymentFee: 0,
  },
  personal: {
    label: 'Personal Loan',
    principal: 10000,
    apr: 12.5,
    termMonths: 36,
    compounding: 'monthly',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: false,
    minPaymentPct: 0,
    minPaymentFloor: 0,
    originationFeePct: 2,
    monthlyFee: 0,
    perPaymentFee: 0,
  },
  auto: {
    label: 'Auto Loan',
    principal: 25000,
    apr: 7.5,
    termMonths: 60,
    compounding: 'monthly',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: false,
    minPaymentPct: 0,
    minPaymentFloor: 0,
    originationFeePct: 0,
    monthlyFee: 0,
    perPaymentFee: 0,
  },
  custom: {
    label: 'Custom',
    principal: 10000,
    apr: 10,
    termMonths: 24,
    compounding: 'monthly',
    paymentFrequency: 'monthly',
    fixedPayment: 0,
    minimumPaymentMode: false,
    minPaymentPct: 0,
    minPaymentFloor: 0,
    originationFeePct: 0,
    monthlyFee: 0,
    perPaymentFee: 0,
  },
};

function periodsPerYear(freq: PaymentFrequency): number {
  return freq === 'monthly' ? 12 : freq === 'biweekly' ? 26 : 52;
}

function compoundingPerYear(comp: CompoundingFrequency): number {
  return comp === 'daily' ? 365 : comp === 'monthly' ? 12 : 1;
}

/**
 * Compute the standard annuity payment for a loan.
 * Uses the formula: P * r / (1 - (1+r)^-n) where r is the periodic rate.
 */
export function computeStandardPayment(inputs: LoanInputs): number {
  const { principal, apr, termMonths, paymentFrequency, compounding } = inputs;
  const ppy = periodsPerYear(paymentFrequency);
  const cpp = compoundingPerYear(compounding);
  const periodsTotal = (termMonths / 12) * ppy;

  // Effective rate per payment period
  const annualRate = apr / 100;
  let periodicRate: number;
  if (annualRate === 0) return principal / periodsTotal;

  if (compounding === 'daily') {
    // Daily compounding: (1 + r/365)^(365/ppy) - 1
    periodicRate = Math.pow(1 + annualRate / cpp, cpp / ppy) - 1;
  } else {
    periodicRate = Math.pow(1 + annualRate / cpp, cpp / ppy) - 1;
  }

  if (periodicRate === 0) return principal / periodsTotal;
  const n = periodsTotal;
  return (principal * periodicRate) / (1 - Math.pow(1 + periodicRate, -n));
}

export function computeAmortization(inputs: LoanInputs): AmortizationRow[] {
  const {
    principal,
    apr,
    termMonths,
    compounding,
    paymentFrequency,
    fixedPayment,
    minimumPaymentMode,
    minPaymentPct,
    minPaymentFloor,
    originationFeePct,
    monthlyFee,
    perPaymentFee,
  } = inputs;

  const ppy = periodsPerYear(paymentFrequency);
  const cpp = compoundingPerYear(compounding);
  const annualRate = apr / 100;

  let periodicRate: number;
  if (annualRate === 0) {
    periodicRate = 0;
  } else {
    periodicRate = Math.pow(1 + annualRate / cpp, cpp / ppy) - 1;
  }

  const standardPayment = fixedPayment > 0 ? fixedPayment : computeStandardPayment(inputs);
  // Origination fee is an upfront cost, not capitalised into the balance.
  // It appears explicitly in period 1's fees column and reduces net proceeds
  // for the effective APR (CFPB / Reg Z definition).
  const originationFee = (originationFeePct / 100) * principal;
  const maxPeriods = Math.ceil((termMonths / 12) * ppy) + 1;

  let balance = principal;
  const rows: AmortizationRow[] = [];

  for (let period = 1; period <= maxPeriods && balance > 0.005; period++) {
    const interest = balance * periodicRate;
    // Monthly fee spread across payment periods; origination fee shown once in period 1.
    const periodMonthlyFee = monthlyFee * (12 / ppy);
    const fees = perPaymentFee + periodMonthlyFee + (period === 1 ? originationFee : 0);

    let payment: number;
    if (minimumPaymentMode) {
      const minPct = (minPaymentPct / 100) * balance;
      payment = Math.max(minFloor(minPaymentFloor), minPct);
      payment = Math.max(payment, interest + 0.01); // ensure balance decreases
    } else {
      payment = standardPayment;
    }

    // Last payment: don't overpay
    const principalPart = Math.min(payment - interest, balance);
    const actualPayment = Math.min(payment, balance + interest + fees);

    rows.push({
      period,
      payment: actualPayment,
      principal: Math.max(0, principalPart),
      interest,
      fees,
      balance: Math.max(0, balance - principalPart),
    });

    balance = Math.max(0, balance - principalPart);
  }

  return rows;
}

function minFloor(f: number): number {
  return f;
}

export function computeSummary(rows: AmortizationRow[], inputs: LoanInputs): LoanSummary {
  const totalPayments = rows.reduce((s, r) => s + r.payment, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  // Fees are now fully captured in each row's fees column (origination in period 1),
  // so no separate addition is needed.
  const totalFees = rows.reduce((s, r) => s + r.fees, 0);
  const totalCost = totalInterest + totalFees;

  // Effective APR via Newton-Raphson IRR (CFPB / Reg Z definition).
  // Net proceeds = principal minus upfront origination fee — the borrower receives
  // less but repays as if they received the full principal, raising the true APR.
  const periods = rows.length;
  const payments = rows.map((r) => r.payment);
  const originationFee = (inputs.originationFeePct / 100) * inputs.principal;
  const netProceeds = inputs.principal - originationFee;

  let rate = inputs.apr / 100 / periodsPerYear(inputs.paymentFrequency);
  for (let i = 0; i < 50; i++) {
    let npv = -netProceeds;
    let dnpv = 0;
    for (let t = 0; t < payments.length; t++) {
      const disc = Math.pow(1 + rate, t + 1);
      npv += payments[t] / disc;
      dnpv -= ((t + 1) * payments[t]) / (disc * (1 + rate));
    }
    const delta = npv / dnpv;
    rate -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  const effectiveApr = Math.max(0, rate * periodsPerYear(inputs.paymentFrequency) * 100);

  return {
    totalPayments,
    totalInterest,
    totalFees,
    totalCost,
    effectiveApr: isFinite(effectiveApr) ? effectiveApr : inputs.apr,
    periods,
  };
}

export function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
