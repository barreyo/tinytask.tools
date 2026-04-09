export type RoundingMode = 'BANKERS' | 'FLOOR' | 'CEIL' | 'HALF_UP' | 'TRUNCATE';

export const ROUNDING_LABELS: Record<RoundingMode, string> = {
  BANKERS: "Banker's (round half to even)",
  FLOOR: 'Floor (round toward −∞)',
  CEIL: 'Ceiling (round toward +∞)',
  HALF_UP: 'Half-up (round half away from zero)',
  TRUNCATE: 'Truncate (round toward zero)',
};

export interface LoanOpts {
  principal: number;
  annualRatePct: number;
  termMonths: number;
  decimalPlaces: number;
  modes: RoundingMode[];
}

export interface MonthRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface SimulationResult {
  mode: RoundingMode;
  months: MonthRow[];
  finalBalance: number;
  totalInterest: number;
  totalPaid: number;
}

export function round(value: number, decimals: number, mode: RoundingMode): number {
  const factor = Math.pow(10, decimals);
  const shifted = value * factor;

  switch (mode) {
    case 'FLOOR':
      return Math.floor(shifted) / factor;

    case 'CEIL':
      return Math.ceil(shifted) / factor;

    case 'TRUNCATE':
      return Math.trunc(shifted) / factor;

    case 'HALF_UP': {
      return Math.round(shifted) / factor;
    }

    case 'BANKERS': {
      const floored = Math.floor(shifted);
      const frac = shifted - floored;
      if (Math.abs(frac - 0.5) < Number.EPSILON) {
        // Exactly half — round to even
        return (floored % 2 === 0 ? floored : floored + 1) / factor;
      }
      return Math.round(shifted) / factor;
    }
  }
}

export function computeMinPayment(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  decimalPlaces: number,
  mode: RoundingMode,
): number {
  const r = annualRatePct / 100 / 12;
  if (r === 0) {
    return round(principal / termMonths, decimalPlaces, mode);
  }
  const raw = (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  return round(raw, decimalPlaces, mode);
}

export function simulateLoan(opts: LoanOpts): SimulationResult[] {
  const { principal, annualRatePct, termMonths, decimalPlaces, modes } = opts;
  const r = annualRatePct / 100 / 12;

  return modes.map((mode) => {
    const payment = computeMinPayment(principal, annualRatePct, termMonths, decimalPlaces, mode);
    let balance = principal;
    let totalInterest = 0;
    let totalPaid = 0;
    const months: MonthRow[] = [];

    for (let month = 1; month <= termMonths; month++) {
      const interest = round(balance * r, decimalPlaces, mode);
      let principalPaid = round(payment - interest, decimalPlaces, mode);

      // Final month: pay off remaining balance
      if (month === termMonths || balance <= payment) {
        principalPaid = balance;
        const finalPayment = round(balance + interest, decimalPlaces, mode);
        balance = 0;
        totalInterest = round(totalInterest + interest, decimalPlaces, mode);
        totalPaid = round(totalPaid + finalPayment, decimalPlaces, mode);
        months.push({ month, payment: finalPayment, interest, principal: principalPaid, balance });
        break;
      }

      balance = round(balance - principalPaid, decimalPlaces, mode);
      totalInterest = round(totalInterest + interest, decimalPlaces, mode);
      totalPaid = round(totalPaid + payment, decimalPlaces, mode);
      months.push({ month, payment, interest, principal: principalPaid, balance });
    }

    return {
      mode,
      months,
      finalBalance: balance,
      totalInterest,
      totalPaid,
    };
  });
}

export interface LoanPreset {
  label: string;
  principal: number;
  annualRatePct: number;
  termMonths: number;
}

export const LOAN_PRESETS: LoanPreset[] = [
  { label: 'Personal Loan', principal: 10000, annualRatePct: 8.5, termMonths: 24 },
  { label: 'Micro-loan', principal: 500, annualRatePct: 12, termMonths: 12 },
  { label: 'Auto Loan', principal: 25000, annualRatePct: 5.9, termMonths: 36 },
  { label: 'Mortgage', principal: 300000, annualRatePct: 6.5, termMonths: 360 },
];
