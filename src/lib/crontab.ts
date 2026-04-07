// ── Types ─────────────────────────────────────────────────────────────────────

export interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export type CronFieldName = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

interface FieldConfig {
  name: CronFieldName;
  label: string;
  min: number;
  max: number;
  names?: string[];
}

// ── Field metadata ────────────────────────────────────────────────────────────

export const FIELD_CONFIGS: FieldConfig[] = [
  { name: 'minute', label: 'Minute', min: 0, max: 59 },
  { name: 'hour', label: 'Hour', min: 0, max: 23 },
  { name: 'dayOfMonth', label: 'Day of Month', min: 1, max: 31 },
  {
    name: 'month',
    label: 'Month',
    min: 1,
    max: 12,
    names: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  {
    name: 'dayOfWeek',
    label: 'Day of Week',
    min: 0,
    max: 7,
    names: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
];

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDINALS = [
  '',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th',
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
  '13th',
  '14th',
  '15th',
  '16th',
  '17th',
  '18th',
  '19th',
  '20th',
  '21st',
  '22nd',
  '23rd',
  '24th',
  '25th',
  '26th',
  '27th',
  '28th',
  '29th',
  '30th',
  '31st',
];

// ── Parsing ───────────────────────────────────────────────────────────────────

function normaliseMonthNames(field: string): string {
  let f = field.toUpperCase();
  const map: Record<string, string> = {
    JAN: '1',
    FEB: '2',
    MAR: '3',
    APR: '4',
    MAY: '5',
    JUN: '6',
    JUL: '7',
    AUG: '8',
    SEP: '9',
    OCT: '10',
    NOV: '11',
    DEC: '12',
  };
  for (const [abbr, num] of Object.entries(map)) {
    f = f.replace(new RegExp(`\\b${abbr}\\b`, 'g'), num);
  }
  return f;
}

function normaliseDowNames(field: string): string {
  let f = field.toUpperCase();
  const map: Record<string, string> = {
    SUN: '0',
    MON: '1',
    TUE: '2',
    WED: '3',
    THU: '4',
    FRI: '5',
    SAT: '6',
  };
  for (const [abbr, num] of Object.entries(map)) {
    f = f.replace(new RegExp(`\\b${abbr}\\b`, 'g'), num);
  }
  return f;
}

function validateAtom(atom: string, min: number, max: number, fieldLabel: string): void {
  if (atom === '*') return;

  // step: */n or value/n
  if (atom.includes('/')) {
    const [base, stepStr] = atom.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step < 1) {
      throw new Error(`${fieldLabel}: step "${stepStr}" must be a positive integer.`);
    }
    if (base !== '*') {
      validateAtom(base, min, max, fieldLabel);
    }
    return;
  }

  // range: a-b
  if (atom.includes('-')) {
    const [startStr, endStr] = atom.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) {
      throw new Error(`${fieldLabel}: range "${atom}" must use integers.`);
    }
    if (start < min || start > max) {
      throw new Error(`${fieldLabel}: value ${start} is out of range [${min}–${max}].`);
    }
    if (end < min || end > max) {
      throw new Error(`${fieldLabel}: value ${end} is out of range [${min}–${max}].`);
    }
    if (start > end) {
      throw new Error(`${fieldLabel}: range start ${start} must not exceed end ${end}.`);
    }
    return;
  }

  // single value
  const n = parseInt(atom, 10);
  if (isNaN(n) || String(n) !== atom) {
    throw new Error(`${fieldLabel}: "${atom}" is not a valid value.`);
  }
  if (n < min || n > max) {
    throw new Error(`${fieldLabel}: value ${n} is out of range [${min}–${max}].`);
  }
}

function validateField(field: string, min: number, max: number, label: string): void {
  for (const atom of field.split(',')) {
    validateAtom(atom.trim(), min, max, label);
  }
}

export function parseCronExpression(expr: string): CronParts {
  if (!expr || !expr.trim()) {
    throw new Error('Expression is empty. A cron expression must have exactly 5 fields.');
  }

  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Expected 5 fields (minute hour day month weekday) but got ${parts.length}.`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const normMonth = normaliseMonthNames(month);
  const normDow = normaliseDowNames(dayOfWeek);

  validateField(minute, 0, 59, 'Minute');
  validateField(hour, 0, 23, 'Hour');
  validateField(dayOfMonth, 1, 31, 'Day of month');
  validateField(normMonth, 1, 12, 'Month');
  validateField(normDow, 0, 7, 'Day of week');

  return { minute, hour, dayOfMonth, month: normMonth, dayOfWeek: normDow };
}

// ── Matching ──────────────────────────────────────────────────────────────────

function expandAtom(atom: string, min: number, max: number): Set<number> {
  const result = new Set<number>();
  const effectiveMax = max;

  if (atom === '*') {
    for (let i = min; i <= effectiveMax; i++) result.add(i);
    return result;
  }

  if (atom.includes('/')) {
    const [base, stepStr] = atom.split('/');
    const step = parseInt(stepStr, 10);
    const start = base === '*' ? min : parseInt(base.split('-')[0], 10);
    const end =
      base === '*'
        ? effectiveMax
        : base.includes('-')
          ? parseInt(base.split('-')[1], 10)
          : effectiveMax;
    for (let i = start; i <= end; i += step) result.add(i);
    return result;
  }

  if (atom.includes('-')) {
    const [startStr, endStr] = atom.split('-');
    for (let i = parseInt(startStr, 10); i <= parseInt(endStr, 10); i++) result.add(i);
    return result;
  }

  result.add(parseInt(atom, 10));
  return result;
}

function expandField(field: string, min: number, max: number): Set<number> {
  const result = new Set<number>();
  for (const atom of field.split(',')) {
    for (const v of expandAtom(atom.trim(), min, max)) result.add(v);
  }
  return result;
}

// ── Next occurrences ──────────────────────────────────────────────────────────

export function getNextOccurrences(parts: CronParts, count: number, after?: Date): Date[] {
  // Pre-expand all sets once — avoids rebuilding them on every iteration
  const minutes = expandField(parts.minute, 0, 59);
  const hours = expandField(parts.hour, 0, 23);
  const doms = expandField(parts.dayOfMonth, 1, 31);
  const months = expandField(parts.month, 1, 12);
  const dows = expandField(parts.dayOfWeek, 0, 7);
  if (dows.has(7)) dows.add(0);

  const domIsWild = parts.dayOfMonth === '*';
  const dowIsWild = parts.dayOfWeek === '*';

  const sortedMinutes = [...minutes].sort((a, b) => a - b);
  const sortedHours = [...hours].sort((a, b) => a - b);
  const sortedMonths = [...months].sort((a, b) => a - b);

  const dayMatches = (d: Date): boolean => {
    if (domIsWild && dowIsWild) return true;
    if (domIsWild) return dows.has(d.getDay());
    if (dowIsWild) return doms.has(d.getDate());
    return doms.has(d.getDate()) || dows.has(d.getDay());
  };

  const results: Date[] = [];
  const cursor = after ? new Date(after.getTime()) : new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  // Cap at 5 years — still safe but avoids looping infinitely on rare expressions
  const limit = new Date(cursor.getTime() + 5 * 365 * 24 * 60 * 60 * 1000);

  while (cursor <= limit && results.length < count) {
    // Skip to the next valid month
    if (!months.has(cursor.getMonth() + 1)) {
      const next = sortedMonths.find((m) => m > cursor.getMonth() + 1);
      if (next !== undefined) {
        cursor.setMonth(next - 1, 1);
      } else {
        cursor.setFullYear(cursor.getFullYear() + 1, sortedMonths[0] - 1, 1);
      }
      cursor.setHours(sortedHours[0], sortedMinutes[0], 0, 0);
      continue;
    }

    // Skip to the next valid day
    if (!dayMatches(cursor)) {
      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(sortedHours[0], sortedMinutes[0], 0, 0);
      continue;
    }

    // Skip to the next valid hour
    if (!hours.has(cursor.getHours())) {
      const next = sortedHours.find((h) => h > cursor.getHours());
      if (next !== undefined) {
        cursor.setHours(next, sortedMinutes[0], 0, 0);
      } else {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(sortedHours[0], sortedMinutes[0], 0, 0);
      }
      continue;
    }

    // Skip to the next valid minute
    if (!minutes.has(cursor.getMinutes())) {
      const next = sortedMinutes.find((m) => m > cursor.getMinutes());
      if (next !== undefined) {
        cursor.setMinutes(next, 0, 0);
      } else {
        const nextHour = sortedHours.find((h) => h > cursor.getHours());
        if (nextHour !== undefined) {
          cursor.setHours(nextHour, sortedMinutes[0], 0, 0);
        } else {
          cursor.setDate(cursor.getDate() + 1);
          cursor.setHours(sortedHours[0], sortedMinutes[0], 0, 0);
        }
      }
      continue;
    }

    // All fields match
    results.push(new Date(cursor.getTime()));
    // Advance past this minute to find the next one
    cursor.setMinutes(cursor.getMinutes() + 1, 0, 0);
  }

  return results;
}

// ── Human-readable descriptions ───────────────────────────────────────────────

function describeAtom(atom: string, fieldName: CronFieldName): string {
  if (atom === '*') return null as unknown as string;

  if (atom.includes('/')) {
    const [base, stepStr] = atom.split('/');
    const step = parseInt(stepStr, 10);
    switch (fieldName) {
      case 'minute':
        return base === '*'
          ? `every ${step} minute${step === 1 ? '' : 's'}`
          : `every ${step} minute${step === 1 ? '' : 's'} starting at minute ${base}`;
      case 'hour':
        return base === '*'
          ? `every ${step} hour${step === 1 ? '' : 's'}`
          : `every ${step} hour${step === 1 ? '' : 's'} starting at ${base}:00`;
      case 'dayOfMonth':
        return base === '*'
          ? `every ${step} day${step === 1 ? '' : 's'}`
          : `every ${step} day${step === 1 ? '' : 's'} starting on the ${ORDINALS[parseInt(base, 10)]}`;
      case 'month':
        return `every ${step} month${step === 1 ? '' : 's'}`;
      case 'dayOfWeek':
        return `every ${step} day of the week`;
    }
  }

  if (atom.includes('-')) {
    const [startStr, endStr] = atom.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    switch (fieldName) {
      case 'minute':
        return `minutes ${start}–${end}`;
      case 'hour':
        return `${padHour(start)}:00–${padHour(end)}:00`;
      case 'dayOfMonth':
        return `${ORDINALS[start]}–${ORDINALS[end]} of the month`;
      case 'month':
        return `${MONTH_FULL[start - 1]} through ${MONTH_FULL[end - 1]}`;
      case 'dayOfWeek': {
        const s = start % 7;
        const e = end % 7;
        return `${DOW_NAMES[s]} through ${DOW_NAMES[e]}`;
      }
    }
  }

  // single value
  const n = parseInt(atom, 10);
  switch (fieldName) {
    case 'minute':
      return `at minute ${n}`;
    case 'hour':
      return `at ${padHour(n)}:00`;
    case 'dayOfMonth':
      return `on the ${ORDINALS[n]}`;
    case 'month':
      return `in ${MONTH_FULL[n - 1]}`;
    case 'dayOfWeek':
      return `on ${DOW_NAMES[n % 7]}`;
  }
}

function padHour(h: number): string {
  return String(h).padStart(2, '0');
}

function listAtoms(field: string, fieldName: CronFieldName): string[] {
  return field
    .split(',')
    .map((a) => describeAtom(a.trim(), fieldName))
    .filter(Boolean);
}

export function describeField(field: string, fieldName: CronFieldName): string {
  if (field === '*') {
    switch (fieldName) {
      case 'minute':
        return 'Every minute';
      case 'hour':
        return 'Every hour';
      case 'dayOfMonth':
        return 'Every day';
      case 'month':
        return 'Every month';
      case 'dayOfWeek':
        return 'Every day of the week';
    }
  }
  const parts = listAtoms(field, fieldName);
  if (parts.length === 0) return field;
  const joined = parts.join(', ');
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export function describeCron(parts: CronParts): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parts;

  // Fully wild: every minute
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute';
  }

  // Build description from components
  const minuteDesc = buildMinuteDesc(minute);
  const hourDesc = buildHourDesc(hour, minute);
  const dayDesc = buildDayDesc(dayOfMonth, dayOfWeek);
  const monthDesc = buildMonthDesc(month);

  const pieces: string[] = [];

  if (hourDesc) pieces.push(hourDesc);
  if (minuteDesc) pieces.push(minuteDesc);
  if (dayDesc) pieces.push(dayDesc);
  if (monthDesc) pieces.push(monthDesc);

  if (pieces.length === 0) return 'Every minute';

  const sentence = pieces.join(', ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function buildMinuteDesc(minute: string): string {
  if (minute === '*') return '';
  if (minute === '0') return '';

  if (minute.includes('/')) {
    const [base, stepStr] = minute.split('/');
    const step = parseInt(stepStr, 10);
    if (base === '*' || base === '0') {
      return `every ${step} minute${step === 1 ? '' : 's'}`;
    }
    return `every ${step} minute${step === 1 ? '' : 's'} starting at minute ${base}`;
  }

  if (minute.includes(',')) {
    const nums = minute.split(',').map(Number);
    return `at minute${nums.length > 1 ? 's' : ''} ${nums.join(', ')}`;
  }

  if (minute.includes('-')) {
    const [a, b] = minute.split('-');
    return `at minutes ${a}–${b}`;
  }

  return `at minute ${minute}`;
}

function buildHourDesc(hour: string, minute: string): string {
  if (hour === '*') {
    if (minute === '*') return '';
    return 'every hour';
  }

  const exactMinute =
    !minute.includes('*') &&
    !minute.includes('/') &&
    !minute.includes('-') &&
    !minute.includes(',');

  if (hour.includes('/')) {
    const [base, stepStr] = hour.split('/');
    const step = parseInt(stepStr, 10);
    if (base === '*' || base === '0') {
      return `every ${step} hour${step === 1 ? '' : 's'}`;
    }
    return `every ${step} hour${step === 1 ? '' : 's'} starting at ${padHour(parseInt(base, 10))}:00`;
  }

  if (hour.includes(',')) {
    const hours = hour.split(',').map(Number);
    const minStr = exactMinute ? `:${minute.padStart(2, '0')}` : '';
    return `at ${hours.map((h) => `${padHour(h)}${minStr}`).join(', ')}`;
  }

  if (hour.includes('-')) {
    const [a, b] = hour.split('-');
    const minStr = exactMinute && minute === '0' ? ':00' : '';
    return `between ${padHour(parseInt(a, 10))}:00 and ${padHour(parseInt(b, 10))}:59${minStr}`;
  }

  // single hour
  const h = parseInt(hour, 10);
  const m = exactMinute ? parseInt(minute, 10) : 0;
  return `at ${padHour(h)}:${String(m).padStart(2, '0')}`;
}

function buildDayDesc(dayOfMonth: string, dayOfWeek: string): string {
  const domWild = dayOfMonth === '*';
  const dowWild = dayOfWeek === '*';

  if (domWild && dowWild) return '';

  const parts: string[] = [];

  if (!domWild) {
    if (dayOfMonth.includes('/')) {
      const [, stepStr] = dayOfMonth.split('/');
      const step = parseInt(stepStr, 10);
      parts.push(`every ${step} day${step === 1 ? '' : 's'} of the month`);
    } else if (dayOfMonth.includes(',')) {
      const days = dayOfMonth.split(',').map((d) => ORDINALS[parseInt(d, 10)]);
      parts.push(`on the ${days.join(', ')}`);
    } else if (dayOfMonth.includes('-')) {
      const [a, b] = dayOfMonth.split('-');
      parts.push(`from the ${ORDINALS[parseInt(a, 10)]} to the ${ORDINALS[parseInt(b, 10)]}`);
    } else {
      parts.push(`on the ${ORDINALS[parseInt(dayOfMonth, 10)]}`);
    }
  }

  if (!dowWild) {
    if (dayOfWeek.includes('/')) {
      const [, stepStr] = dayOfWeek.split('/');
      parts.push(`every ${stepStr} days of the week`);
    } else if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map((d) => DOW_NAMES[parseInt(d, 10) % 7]);
      parts.push(`on ${days.join(', ')}`);
    } else if (dayOfWeek.includes('-')) {
      const [a, b] = dayOfWeek.split('-');
      const start = parseInt(a, 10) % 7;
      const end = parseInt(b, 10) % 7;
      parts.push(`${DOW_NAMES[start]} through ${DOW_NAMES[end]}`);
    } else {
      const d = parseInt(dayOfWeek, 10) % 7;
      parts.push(`on ${DOW_NAMES[d]}s`);
    }
  }

  return parts.join(', ');
}

function buildMonthDesc(month: string): string {
  if (month === '*') return '';

  if (month.includes('/')) {
    const [, stepStr] = month.split('/');
    const step = parseInt(stepStr, 10);
    return `every ${step} month${step === 1 ? '' : 's'}`;
  }

  if (month.includes(',')) {
    const months = month.split(',').map((m) => MONTH_NAMES[parseInt(m, 10) - 1]);
    return `in ${months.join(', ')}`;
  }

  if (month.includes('-')) {
    const [a, b] = month.split('-');
    return `${MONTH_FULL[parseInt(a, 10) - 1]} through ${MONTH_FULL[parseInt(b, 10) - 1]}`;
  }

  return `in ${MONTH_FULL[parseInt(month, 10) - 1]}`;
}

// ── Presets ───────────────────────────────────────────────────────────────────

export interface CronPreset {
  label: string;
  expression: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'every minute', expression: '* * * * *' },
  { label: 'hourly', expression: '0 * * * *' },
  { label: 'daily midnight', expression: '0 0 * * *' },
  { label: 'weekdays 9am', expression: '0 9 * * 1-5' },
  { label: 'monthly 1st', expression: '0 0 1 * *' },
  { label: 'every 15 min', expression: '*/15 * * * *' },
  { label: 'sundays noon', expression: '0 12 * * 0' },
];

// ── Format date for display ───────────────────────────────────────────────────

export function formatNextDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = MONTH_NAMES;
  const dow = days[d.getDay()];
  const mon = months[d.getMonth()];
  const date = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dow}, ${mon} ${date}, ${year} ${hh}:${mm}`;
}
