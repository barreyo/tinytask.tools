export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  customChars: string;
  excludeAmbiguous: boolean;
  requireEachSet: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS = /[0Ol1I]/g;

export interface StrengthResult {
  bits: number;
  label: 'weak' | 'fair' | 'strong' | 'very strong';
  level: 1 | 2 | 3 | 4;
}

export function buildCharset(opts: PasswordOptions): string {
  let charset = '';
  if (opts.uppercase) charset += UPPERCASE;
  if (opts.lowercase) charset += LOWERCASE;
  if (opts.digits) charset += DIGITS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.customChars) {
    // Add unique chars from customChars not already in charset
    for (const c of opts.customChars) {
      if (!charset.includes(c)) charset += c;
    }
  }
  if (opts.excludeAmbiguous) {
    charset = charset.replace(AMBIGUOUS, '');
  }
  // Deduplicate
  charset = [...new Set(charset)].join('');
  return charset;
}

export function generatePassword(opts: PasswordOptions): string {
  const charset = buildCharset(opts);
  if (charset.length === 0) throw new Error('No characters available');
  if (opts.length < 1) throw new Error('Length must be at least 1');

  const length = opts.length;
  let result = '';

  // Build required chars first (one from each enabled set)
  const required: string[] = [];
  if (opts.requireEachSet) {
    if (opts.uppercase) {
      const pool = opts.excludeAmbiguous ? UPPERCASE.replace(AMBIGUOUS, '') : UPPERCASE;
      if (pool) required.push(randomChar(pool));
    }
    if (opts.lowercase) {
      const pool = opts.excludeAmbiguous ? LOWERCASE.replace(AMBIGUOUS, '') : LOWERCASE;
      if (pool) required.push(randomChar(pool));
    }
    if (opts.digits) {
      const pool = opts.excludeAmbiguous ? DIGITS.replace(AMBIGUOUS, '') : DIGITS;
      if (pool) required.push(randomChar(pool));
    }
    if (opts.symbols) required.push(randomChar(SYMBOLS));
  }

  // Fill the rest randomly
  const fillLength = Math.max(0, length - required.length);
  const fillChars = Array.from({ length: fillLength }, () => randomChar(charset));
  const combined = [...required, ...fillChars];

  // Fisher-Yates shuffle
  shuffle(combined);
  result = combined.slice(0, length).join('');

  return result;
}

function randomChar(charset: string): string {
  const buf = new Uint32Array(1);
  // Rejection sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / charset.length) * charset.length;
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return charset[buf[0] % charset.length];
  }
}

function shuffle(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / (i + 1)) * (i + 1);
    let j: number;
    do {
      crypto.getRandomValues(buf);
      j = buf[0] % (i + 1);
    } while (buf[0] >= limit);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function estimateStrength(password: string): StrengthResult {
  let charsetSize = 0;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 26;

  const bits = Math.log2(Math.pow(charsetSize, password.length));

  let label: StrengthResult['label'];
  let level: StrengthResult['level'];
  if (bits < 40) {
    label = 'weak';
    level = 1;
  } else if (bits < 60) {
    label = 'fair';
    level = 2;
  } else if (bits < 80) {
    label = 'strong';
    level = 3;
  } else {
    label = 'very strong';
    level = 4;
  }

  return { bits, label, level };
}
