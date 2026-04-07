import { describe, expect, it } from 'vitest';
import { statusCodes } from '../data/http-status-codes';

describe('http-status-codes data', () => {
  it('has no duplicate codes', () => {
    const seen = new Set<number>();
    for (const s of statusCodes) {
      expect(seen.has(s.code), `Duplicate code: ${s.code}`).toBe(false);
      seen.add(s.code);
    }
  });

  it('every code is between 100 and 599', () => {
    for (const s of statusCodes) {
      expect(s.code, `Code out of range: ${s.code}`).toBeGreaterThanOrEqual(100);
      expect(s.code, `Code out of range: ${s.code}`).toBeLessThanOrEqual(599);
    }
  });

  it('every entry has a non-empty phrase and description', () => {
    for (const s of statusCodes) {
      expect(s.phrase.trim().length, `Empty phrase for code ${s.code}`).toBeGreaterThan(0);
      expect(s.description.trim().length, `Empty description for code ${s.code}`).toBeGreaterThan(
        0,
      );
    }
  });

  it('every category matches the code range', () => {
    for (const s of statusCodes) {
      const expectedCategory = `${Math.floor(s.code / 100)}xx` as typeof s.category;
      expect(s.category, `Wrong category for code ${s.code}`).toBe(expectedCategory);
    }
  });

  it('all five categories are represented', () => {
    const categories = new Set(statusCodes.map((s) => s.category));
    expect(categories.has('1xx')).toBe(true);
    expect(categories.has('2xx')).toBe(true);
    expect(categories.has('3xx')).toBe(true);
    expect(categories.has('4xx')).toBe(true);
    expect(categories.has('5xx')).toBe(true);
  });

  it('contains well-known codes', () => {
    const codes = new Set(statusCodes.map((s) => s.code));
    for (const code of [
      200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 405, 409, 422, 429, 500, 502, 503, 504,
    ]) {
      expect(codes.has(code), `Missing expected code: ${code}`).toBe(true);
    }
  });
});
