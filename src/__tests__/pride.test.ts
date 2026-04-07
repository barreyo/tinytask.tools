import { describe, expect, it } from 'vitest';
import { PRIDE_COLORS, getPrideColor, isPrideMonth } from '../utils/pride';

const june = (day = 1) => new Date(2024, 5, day); // month 5 = June
const notJune = (month: number) => new Date(2024, month, 1);

describe('isPrideMonth', () => {
  it('returns true for June', () => {
    expect(isPrideMonth(june())).toBe(true);
  });

  it('returns true for any day in June', () => {
    for (let d = 1; d <= 30; d++) {
      expect(isPrideMonth(june(d))).toBe(true);
    }
  });

  it('returns false for every other month', () => {
    const otherMonths = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
    for (const m of otherMonths) {
      expect(isPrideMonth(notJune(m))).toBe(false);
    }
  });
});

describe('getPrideColor', () => {
  it('returns undefined outside of June', () => {
    const otherMonths = [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
    for (const m of otherMonths) {
      expect(getPrideColor(0, notJune(m))).toBeUndefined();
    }
  });

  it('returns a color string in June', () => {
    expect(getPrideColor(0, june())).toBeDefined();
    expect(getPrideColor(0, june())).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns different colors for consecutive indices in June', () => {
    const colors = PRIDE_COLORS.map((_, i) => getPrideColor(i, june()));
    const unique = new Set(colors);
    expect(unique.size).toBe(PRIDE_COLORS.length);
  });

  it('cycles back to the first color after exhausting all pride colors', () => {
    expect(getPrideColor(0, june())).toBe(getPrideColor(PRIDE_COLORS.length, june()));
  });

  it('covers a full grid of tiles without undefined gaps in June', () => {
    for (let i = 0; i < 50; i++) {
      expect(getPrideColor(i, june())).toBeDefined();
    }
  });
});
