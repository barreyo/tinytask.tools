// ── Verhoeff Algorithm ────────────────────────────────────────────────────────
// Uses the Dihedral group D5. Detects all single-digit errors and all adjacent
// transposition errors.

// Multiplication table for D5
const verhoeffD: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Inverse table
const verhoeffInv: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

// Permutation table
const verhoeffP: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export interface VerhoeffStep {
  position: number;
  digit: number;
  permuted: number;
  running: number;
}

export function validateVerhoeff(num: string): boolean {
  const digits = [...num.replace(/\D/g, '')].reverse().map(Number);
  if (digits.length < 2) return false;
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = verhoeffD[c][verhoeffP[i % 8][digits[i]]];
  }
  return c === 0;
}

export function computeVerhoeffCheckDigit(partial: string): string {
  const digits = [...partial.replace(/\D/g, '')].reverse().map(Number);
  // Prepend a 0 for the check digit position
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = verhoeffD[c][verhoeffP[(i + 1) % 8][digits[i]]];
  }
  return String(verhoeffInv[c]);
}

export function verhoeffBreakdown(num: string): VerhoeffStep[] {
  const digits = [...num.replace(/\D/g, '')].reverse().map(Number);
  const steps: VerhoeffStep[] = [];
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    const permuted = verhoeffP[i % 8][digits[i]];
    c = verhoeffD[c][permuted];
    steps.unshift({ position: i, digit: digits[i], permuted, running: c });
  }
  return steps;
}

// ── Damm Algorithm ────────────────────────────────────────────────────────────
// Uses a 10x10 quasigroup (totally anti-symmetric). Detects all single-digit
// errors and all adjacent transposition errors.

const dammTable: number[][] = [
  [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
  [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
  [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
  [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
  [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
  [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
  [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
  [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
  [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
  [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
];

export interface DammStep {
  digit: number;
  prevInterim: number;
  nextInterim: number;
}

export function validateDamm(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 2) return false;
  let interim = 0;
  for (const ch of digits) interim = dammTable[interim][+ch];
  return interim === 0;
}

export function computeDammCheckDigit(partial: string): string {
  const digits = partial.replace(/\D/g, '');
  let interim = 0;
  for (const ch of digits) interim = dammTable[interim][+ch];
  // The check digit is the one that brings interim to 0:
  // dammTable[interim][check] must equal 0, which is the check digit itself
  // since the table has a 0 in every row (it's anti-symmetric)
  return String(dammTable[interim].indexOf(0));
}

export function dammBreakdown(num: string): DammStep[] {
  const digits = num.replace(/\D/g, '');
  const steps: DammStep[] = [];
  let interim = 0;
  for (const ch of digits) {
    const d = +ch;
    const prev = interim;
    interim = dammTable[interim][d];
    steps.push({ digit: d, prevInterim: prev, nextInterim: interim });
  }
  return steps;
}

// ── ISBN-10 Algorithm ─────────────────────────────────────────────────────────
// Weighted sum mod 11; check digit can be 0-9 or 'X' (representing 10).

export interface Isbn10Step {
  char: string;
  value: number;
  weight: number;
  product: number;
}

export function validateIsbn10(isbn: string): boolean {
  const chars = isbn.replace(/[\s-]/g, '');
  if (chars.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = chars[i].toUpperCase();
    if (i < 9 && !/\d/.test(ch)) return false;
    const v = ch === 'X' ? 10 : +ch;
    if (isNaN(v)) return false;
    sum += v * (10 - i);
  }
  return sum % 11 === 0;
}

export function computeIsbn10CheckDigit(partial: string): string {
  const digits = partial.replace(/[\s-]/g, '');
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) return '';
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +digits[i] * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? 'X' : String(check);
}

export function isbn10Breakdown(isbn: string): Isbn10Step[] {
  const chars = isbn.replace(/[\s-]/g, '');
  const steps: Isbn10Step[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i].toUpperCase();
    const value = ch === 'X' ? 10 : +ch;
    const weight = 10 - i;
    steps.push({ char: ch, value, weight, product: value * weight });
  }
  return steps;
}
