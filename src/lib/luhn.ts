/** Returns true if the full card number passes the Luhn check. */
export function validateLuhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 2) return false;

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }

  return sum % 10 === 0;
}

/**
 * Computes the Luhn check digit for a partial number (without the last digit).
 * Returns the single digit (0-9) to append.
 */
export function computeCheckDigit(partial: string): number {
  const digits = partial.replace(/\D/g, '');

  let sum = 0;
  let double = true; // the position of the "appended" check digit is even from the right

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Generates a complete valid test card number.
 * @param iin   The IIN/BIN prefix (e.g. "4" for Visa, "51" for Mastercard)
 * @param length Total desired length (e.g. 16)
 */
export function generateTestNumber(iin: string, length: number): string {
  const prefix = iin.replace(/\D/g, '');
  if (prefix.length >= length) return prefix.slice(0, length);

  const padLength = length - prefix.length - 1;
  // Fill middle digits with zeros for simplicity
  const partial = prefix + '0'.repeat(padLength);
  const check = computeCheckDigit(partial);
  return partial + String(check);
}

/**
 * Returns a step-by-step breakdown of the Luhn calculation.
 */
export interface LuhnStep {
  original: number;
  doubled: boolean;
  value: number;
}

export function luhnBreakdown(num: string): LuhnStep[] {
  const digits = num.replace(/\D/g, '');
  const steps: LuhnStep[] = [];
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    const original = parseInt(digits[i], 10);
    let value = original;
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    steps.unshift({ original, doubled: double, value });
    double = !double;
  }

  return steps;
}
