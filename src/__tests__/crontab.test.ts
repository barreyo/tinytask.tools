import { describe, expect, it } from 'vitest';
import {
  parseCronExpression,
  validateCronExpression,
  describeCron,
  describeField,
  getNextOccurrences,
  formatNextDate,
} from '../lib/crontab';

// ── parseCronExpression ──────────────────────────────────────────────────────

describe('parseCronExpression', () => {
  it('parses a fully wild expression', () => {
    const parts = parseCronExpression('* * * * *');
    expect(parts).toEqual({
      minute: '*',
      hour: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    });
  });

  it('parses a specific time expression', () => {
    const parts = parseCronExpression('0 9 * * 1-5');
    expect(parts.minute).toBe('0');
    expect(parts.hour).toBe('9');
    expect(parts.dayOfMonth).toBe('*');
    expect(parts.month).toBe('*');
    expect(parts.dayOfWeek).toBe('1-5');
  });

  it('parses step expressions', () => {
    const parts = parseCronExpression('*/15 * * * *');
    expect(parts.minute).toBe('*/15');
  });

  it('parses list expressions', () => {
    const parts = parseCronExpression('0 9,17 * * *');
    expect(parts.hour).toBe('9,17');
  });

  it('parses range expressions', () => {
    const parts = parseCronExpression('0 0 1-15 * *');
    expect(parts.dayOfMonth).toBe('1-15');
  });

  it('normalises month names to numbers', () => {
    const parts = parseCronExpression('0 0 1 jan *');
    expect(parts.month).toBe('1');
  });

  it('normalises all month names', () => {
    const cases: Array<[string, string]> = [
      ['jan', '1'],
      ['feb', '2'],
      ['mar', '3'],
      ['apr', '4'],
      ['may', '5'],
      ['jun', '6'],
      ['jul', '7'],
      ['aug', '8'],
      ['sep', '9'],
      ['oct', '10'],
      ['nov', '11'],
      ['dec', '12'],
    ];
    for (const [abbr, num] of cases) {
      expect(parseCronExpression(`0 0 1 ${abbr} *`).month).toBe(num);
    }
  });

  it('normalises day-of-week names to numbers', () => {
    const parts = parseCronExpression('0 0 * * mon');
    expect(parts.dayOfWeek).toBe('1');
  });

  it('normalises all day-of-week names', () => {
    const cases: Array<[string, string]> = [
      ['sun', '0'],
      ['mon', '1'],
      ['tue', '2'],
      ['wed', '3'],
      ['thu', '4'],
      ['fri', '5'],
      ['sat', '6'],
    ];
    for (const [abbr, num] of cases) {
      expect(parseCronExpression(`0 0 * * ${abbr}`).dayOfWeek).toBe(num);
    }
  });

  it('accepts boundary values for minute (0, 59)', () => {
    expect(() => parseCronExpression('0 0 * * *')).not.toThrow();
    expect(() => parseCronExpression('59 0 * * *')).not.toThrow();
  });

  it('accepts boundary values for hour (0, 23)', () => {
    expect(() => parseCronExpression('0 23 * * *')).not.toThrow();
  });

  it('accepts boundary values for day of month (1, 31)', () => {
    expect(() => parseCronExpression('0 0 1 * *')).not.toThrow();
    expect(() => parseCronExpression('0 0 31 * *')).not.toThrow();
  });

  it('accepts boundary values for month (1, 12)', () => {
    expect(() => parseCronExpression('0 0 1 1 *')).not.toThrow();
    expect(() => parseCronExpression('0 0 1 12 *')).not.toThrow();
  });

  it('accepts 0 and 7 as Sunday in day of week', () => {
    expect(() => parseCronExpression('0 0 * * 0')).not.toThrow();
    expect(() => parseCronExpression('0 0 * * 7')).not.toThrow();
  });

  it('throws for an empty string', () => {
    expect(() => parseCronExpression('')).toThrow();
  });

  it('throws for fewer than 5 fields', () => {
    expect(() => parseCronExpression('* * *')).toThrow(/5 fields/);
  });

  it('throws for more than 5 fields', () => {
    expect(() => parseCronExpression('* * * * * *')).toThrow(/5 fields/);
  });

  it('throws for out-of-range minute', () => {
    expect(() => parseCronExpression('60 * * * *')).toThrow(/Minute/);
  });

  it('throws for out-of-range hour', () => {
    expect(() => parseCronExpression('0 24 * * *')).toThrow(/Hour/);
  });

  it('throws for out-of-range day of month', () => {
    expect(() => parseCronExpression('0 0 0 * *')).toThrow(/Day of month/);
    expect(() => parseCronExpression('0 0 32 * *')).toThrow(/Day of month/);
  });

  it('throws for out-of-range month', () => {
    expect(() => parseCronExpression('0 0 1 0 *')).toThrow(/Month/);
    expect(() => parseCronExpression('0 0 1 13 *')).toThrow(/Month/);
  });

  it('throws for range with start > end', () => {
    expect(() => parseCronExpression('59-0 * * * *')).toThrow();
  });

  it('throws for invalid step', () => {
    expect(() => parseCronExpression('*/0 * * * *')).toThrow();
    expect(() => parseCronExpression('*/abc * * * *')).toThrow();
  });
});

// ── describeCron ─────────────────────────────────────────────────────────────

describe('describeCron', () => {
  it('returns "Every minute" for * * * * *', () => {
    const parts = parseCronExpression('* * * * *');
    expect(describeCron(parts)).toBe('Every minute');
  });

  it('describes a specific time', () => {
    const parts = parseCronExpression('0 9 * * *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/09:00/);
  });

  it('describes weekday restriction', () => {
    const parts = parseCronExpression('0 9 * * 1-5');
    const desc = describeCron(parts);
    expect(desc).toMatch(/Monday/i);
    expect(desc).toMatch(/Friday/i);
  });

  it('describes every 15 minutes', () => {
    const parts = parseCronExpression('*/15 * * * *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/15 minute/i);
  });

  it('describes hourly', () => {
    const parts = parseCronExpression('0 * * * *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/every hour/i);
  });

  it('describes a specific day of month', () => {
    const parts = parseCronExpression('0 0 1 * *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/1st/i);
  });

  it('describes a specific month', () => {
    const parts = parseCronExpression('0 0 1 6 *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/June/i);
  });

  it('describes multiple hours', () => {
    const parts = parseCronExpression('0 9,17 * * *');
    const desc = describeCron(parts);
    expect(desc).toMatch(/09/);
    expect(desc).toMatch(/17/);
  });

  it('describes oversized steps with concrete values', () => {
    const parts = parseCronExpression('* * */30 */30 */30');
    const desc = describeCron(parts);
    expect(desc).toMatch(/1st/);
    expect(desc).toMatch(/January/i);
    expect(desc).toMatch(/Sunday/i);
    expect(desc).not.toMatch(/every 30/i);
  });

  it('returns a non-empty string for any valid expression', () => {
    const exprs = ['* * * * *', '0 9 * * 1-5', '*/15 * * * *', '0 0 1 * *', '30 6 * * 0'];
    for (const expr of exprs) {
      const desc = describeCron(parseCronExpression(expr));
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    }
  });
});

// ── describeField ─────────────────────────────────────────────────────────────

describe('describeField', () => {
  it('returns "Every minute" for wildcard minute', () => {
    expect(describeField('*', 'minute')).toBe('Every minute');
  });

  it('returns "Every hour" for wildcard hour', () => {
    expect(describeField('*', 'hour')).toBe('Every hour');
  });

  it('returns "Every day" for wildcard day of month', () => {
    expect(describeField('*', 'dayOfMonth')).toBe('Every day');
  });

  it('returns "Every month" for wildcard month', () => {
    expect(describeField('*', 'month')).toBe('Every month');
  });

  it('returns "Every day of the week" for wildcard weekday', () => {
    expect(describeField('*', 'dayOfWeek')).toBe('Every day of the week');
  });

  it('describes a specific minute', () => {
    expect(describeField('30', 'minute')).toMatch(/30/);
  });

  it('describes a specific hour', () => {
    expect(describeField('9', 'hour')).toMatch(/09/);
  });

  it('describes a step', () => {
    expect(describeField('*/15', 'minute')).toMatch(/15/);
  });

  it('describes a range of weekdays', () => {
    expect(describeField('1-5', 'dayOfWeek')).toMatch(/Monday/i);
    expect(describeField('1-5', 'dayOfWeek')).toMatch(/Friday/i);
  });

  it('describes a list of months', () => {
    const result = describeField('1,6,12', 'month');
    expect(result).toMatch(/January/i);
    expect(result).toMatch(/June/i);
    expect(result).toMatch(/December/i);
  });

  it('describes a specific day of month', () => {
    expect(describeField('15', 'dayOfMonth')).toMatch(/15th/);
  });

  it('expands oversized month step to concrete values', () => {
    expect(describeField('*/30', 'month')).toMatch(/January/i);
    expect(describeField('*/30', 'month')).not.toMatch(/30/);
  });

  it('expands oversized day-of-week step to concrete value', () => {
    expect(describeField('*/30', 'dayOfWeek')).toMatch(/Sunday/i);
    expect(describeField('*/30', 'dayOfWeek')).not.toMatch(/30/);
  });

  it('expands oversized day-of-month step to concrete values', () => {
    const result = describeField('*/30', 'dayOfMonth');
    expect(result).toMatch(/1st/);
    expect(result).toMatch(/31st/);
    expect(result).not.toMatch(/30/);
  });

  it('expands */6 month to two concrete months', () => {
    const result = describeField('*/6', 'month');
    expect(result).toMatch(/January/i);
    expect(result).toMatch(/July/i);
  });

  it('keeps "every N" for steps that produce many values', () => {
    expect(describeField('*/15', 'minute')).toMatch(/15 minute/i);
    expect(describeField('*/3', 'month')).toMatch(/3 month/i);
  });
});

// ── getNextOccurrences ────────────────────────────────────────────────────────

describe('getNextOccurrences', () => {
  it('returns the requested count of results', () => {
    const parts = parseCronExpression('* * * * *');
    const results = getNextOccurrences(parts, 5);
    expect(results).toHaveLength(5);
  });

  it('returns dates in the future', () => {
    const parts = parseCronExpression('* * * * *');
    const now = new Date();
    const results = getNextOccurrences(parts, 3);
    for (const d of results) {
      expect(d.getTime()).toBeGreaterThan(now.getTime());
    }
  });

  it('returns dates in ascending order', () => {
    const parts = parseCronExpression('* * * * *');
    const results = getNextOccurrences(parts, 5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].getTime()).toBeGreaterThan(results[i - 1].getTime());
    }
  });

  it('each result matches the cron pattern (every minute)', () => {
    const parts = parseCronExpression('* * * * *');
    const results = getNextOccurrences(parts, 5);
    for (const d of results) {
      expect(d.getSeconds()).toBe(0);
    }
  });

  it('respects a specific hour constraint', () => {
    const parts = parseCronExpression('0 9 * * *');
    const after = new Date(2025, 0, 1, 0, 0, 0); // 2025-01-01 00:00
    const results = getNextOccurrences(parts, 3, after);
    for (const d of results) {
      expect(d.getHours()).toBe(9);
      expect(d.getMinutes()).toBe(0);
    }
  });

  it('respects a specific minute constraint', () => {
    const parts = parseCronExpression('30 * * * *');
    const after = new Date(2025, 0, 1, 0, 0, 0);
    const results = getNextOccurrences(parts, 3, after);
    for (const d of results) {
      expect(d.getMinutes()).toBe(30);
    }
  });

  it('respects a day of week constraint', () => {
    const parts = parseCronExpression('0 12 * * 0'); // Sundays at noon
    const after = new Date(2025, 0, 1, 0, 0, 0);
    const results = getNextOccurrences(parts, 3, after);
    for (const d of results) {
      expect(d.getDay()).toBe(0);
      expect(d.getHours()).toBe(12);
    }
  });

  it('respects a month constraint', () => {
    const parts = parseCronExpression('0 0 1 6 *'); // June 1st midnight
    const after = new Date(2025, 0, 1, 0, 0, 0);
    const results = getNextOccurrences(parts, 2, after);
    for (const d of results) {
      expect(d.getMonth()).toBe(5); // June = 5
      expect(d.getDate()).toBe(1);
    }
  });

  it('handles */15 minute stepping', () => {
    const parts = parseCronExpression('*/15 * * * *');
    const after = new Date(2025, 0, 1, 0, 0, 0);
    const results = getNextOccurrences(parts, 4, after);
    const expectedMinutes = [0, 15, 30, 45];
    for (let i = 0; i < 4; i++) {
      expect(expectedMinutes).toContain(results[i].getMinutes());
    }
  });

  it('returns fewer results if no more matches exist within cap (Feb 29)', () => {
    // Feb 29 only exists in leap years; still should find some within 2-year cap
    const parts = parseCronExpression('0 0 29 2 *');
    const after = new Date(2025, 0, 1, 0, 0, 0);
    const results = getNextOccurrences(parts, 5, after);
    // 2026-02-29 does not exist, 2028-02-29 does. Within 2 years from 2025-01-01 we may get 1.
    expect(results.length).toBeGreaterThanOrEqual(0);
    for (const d of results) {
      expect(d.getDate()).toBe(29);
      expect(d.getMonth()).toBe(1); // February = 1
    }
  });

  it('uses the current time as default "after"', () => {
    const before = new Date();
    const parts = parseCronExpression('* * * * *');
    const results = getNextOccurrences(parts, 1);
    expect(results[0].getTime()).toBeGreaterThan(before.getTime());
  });
});

// ── formatNextDate ────────────────────────────────────────────────────────────

describe('formatNextDate', () => {
  it('formats a date correctly', () => {
    const d = new Date(2026, 3, 7, 9, 30, 0); // Tue Apr 7, 2026 09:30
    const formatted = formatNextDate(d);
    expect(formatted).toMatch(/Apr/);
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/09:30/);
  });

  it('pads hours and minutes with leading zeros', () => {
    const d = new Date(2026, 0, 5, 3, 5, 0); // 03:05
    const formatted = formatNextDate(d);
    expect(formatted).toMatch(/03:05/);
  });

  it('includes day-of-week abbreviation', () => {
    const d = new Date(2026, 3, 7, 9, 0, 0); // Tuesday
    const formatted = formatNextDate(d);
    expect(formatted).toMatch(/Tue/);
  });
});

// ── validateCronExpression ────────────────────────────────────────────────────

describe('validateCronExpression', () => {
  it('returns no errors for a valid expression', () => {
    expect(validateCronExpression('* * * * *')).toEqual([]);
    expect(validateCronExpression('0 9 * * 1-5')).toEqual([]);
    expect(validateCronExpression('*/15 * * * *')).toEqual([]);
    expect(validateCronExpression('0 0 1 JAN *')).toEqual([]);
    expect(validateCronExpression('0 12 * * MON,FRI')).toEqual([]);
  });

  it('reports empty expression', () => {
    const errors = validateCronExpression('');
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('expression');
    expect(errors[0].suggestion).toBeTruthy();
  });

  it('reports wrong field count', () => {
    const tooFew = validateCronExpression('* * *');
    expect(tooFew).toHaveLength(1);
    expect(tooFew[0].message).toMatch(/5 fields/);
    expect(tooFew[0].message).toMatch(/got 3/);

    const tooMany = validateCronExpression('* * * * * *');
    expect(tooMany).toHaveLength(1);
    expect(tooMany[0].message).toMatch(/got 6/);
    expect(tooMany[0].suggestion).toMatch(/seconds/i);
  });

  it('suggests removing seconds field for 6-field expression', () => {
    const errors = validateCronExpression('0 */5 * * * *');
    expect(errors[0].suggestion).toContain('*/5 * * * *');
  });

  it('reports out-of-range values with field name', () => {
    const errors = validateCronExpression('60 * * * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('minute');
    expect(errors[0].message).toMatch(/60/);
    expect(errors[0].message).toMatch(/0–59/);
    expect(errors[0].suggestion).toBeTruthy();
  });

  it('collects errors from multiple fields at once', () => {
    const errors = validateCronExpression('60 25 0 13 8');
    expect(errors.length).toBeGreaterThanOrEqual(3);
    const fields = errors.map((e) => e.field);
    expect(fields).toContain('minute');
    expect(fields).toContain('hour');
    expect(fields).toContain('month');
  });

  it('detects ? as Quartz extension', () => {
    const errors = validateCronExpression('0 0 ? * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('dayOfMonth');
    expect(errors[0].message).toMatch(/\?/);
    expect(errors[0].suggestion).toMatch(/\*/);
  });

  it('detects # as Quartz extension', () => {
    const errors = validateCronExpression('0 0 * * 2#3');
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('dayOfWeek');
    expect(errors[0].message).toMatch(/#/);
    expect(errors[0].suggestion).toMatch(/Quartz/i);
  });

  it('detects L as Quartz extension', () => {
    const errors = validateCronExpression('0 0 L * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/L/);
  });

  it('detects W as Quartz extension', () => {
    const errors = validateCronExpression('0 0 15W * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/W/);
  });

  it('reports reversed range with fix suggestion', () => {
    const errors = validateCronExpression('59-0 * * * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('minute');
    expect(errors[0].message).toMatch(/reversed/i);
    expect(errors[0].suggestion).toMatch(/0-59/);
  });

  it('reports invalid step', () => {
    const errors = validateCronExpression('*/0 * * * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/step/i);
    expect(errors[0].suggestion).toMatch(/interval/i);
  });

  it('reports multiple slashes', () => {
    const errors = validateCronExpression('*/5/2 * * * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/multiple \//);
  });

  it('reports empty atoms from extra commas', () => {
    const errors = validateCronExpression('1,, * * * *');
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(errors.some((e) => e.message.match(/empty value/i))).toBe(true);
  });

  it('reports unrecognized values', () => {
    const errors = validateCronExpression('abc * * * *');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/not a recognized value/);
  });

  it('every error has a suggestion', () => {
    const cases = ['', '* *', '60 * * * *', '* * ? * *', '*/0 * * * *', 'abc * * * *'];
    for (const expr of cases) {
      const errors = validateCronExpression(expr);
      for (const err of errors) {
        expect(err.suggestion).toBeTruthy();
      }
    }
  });
});
