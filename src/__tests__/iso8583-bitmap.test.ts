import { describe, it, expect } from 'vitest';
import { parseBitmap, getActiveFields, bitmapToHex } from '../lib/iso8583-bitmap';

describe('parseBitmap', () => {
  it('parses a 16-char hex string into 64 primary bits', () => {
    const result = parseBitmap('7230054128C28805');
    expect(result.primary).toHaveLength(64);
    expect(result.secondary).toBeUndefined();
    expect(result.error).toBeUndefined();
  });

  it('sets bits correctly for a known bitmap', () => {
    // F0 = 1111 0000 => bits 1,2,3,4 are set; bits 5,6,7,8 are not
    const result = parseBitmap('F000000000000000');
    expect(result.primary[0]).toBe(true); // bit 1
    expect(result.primary[1]).toBe(true); // bit 2
    expect(result.primary[2]).toBe(true); // bit 3
    expect(result.primary[3]).toBe(true); // bit 4
    expect(result.primary[4]).toBe(false); // bit 5
    expect(result.primary[7]).toBe(false); // bit 8
  });

  it('detects secondary bitmap when bit 1 is set', () => {
    const result = parseBitmap('F000000000000000F000000000000000');
    expect(result.primary).toHaveLength(64);
    expect(result.secondary).toHaveLength(64);
    expect(result.error).toBeUndefined();
  });

  it('returns error when bit 1 is set but only 16 chars provided', () => {
    const result = parseBitmap('F000000000000000');
    expect(result.error).toBeTruthy();
  });

  it('returns error for invalid hex characters', () => {
    const result = parseBitmap('ZZZZZZZZZZZZZZZZ');
    expect(result.error).toBeTruthy();
  });

  it('returns error for too-short hex string', () => {
    const result = parseBitmap('F000');
    expect(result.error).toBeTruthy();
  });

  it('returns error for hex string longer than 32 chars', () => {
    const result = parseBitmap('F000000000000000F000000000000000FF');
    expect(result.error).toBeTruthy();
  });

  it('strips whitespace before parsing', () => {
    const result = parseBitmap('7230 0541 28C2 8805');
    expect(result.primary).toHaveLength(64);
    expect(result.error).toBeUndefined();
  });
});

describe('getActiveFields', () => {
  it('returns active fields for set bits', () => {
    // 0x72 = 0111 0010 => bits 2,3,4,7 set (bit 1 not set)
    const result = parseBitmap('7200000000000000');
    const active = getActiveFields(result);
    const bits = active.map((f) => f.bit);
    expect(bits).toContain(2); // PAN
    expect(bits).toContain(3); // Processing Code
    expect(bits).toContain(4); // Amount
    expect(bits).toContain(7); // Transmission Date
  });

  it('returns fields from secondary bitmap when present', () => {
    // Primary: 8000000000000000 → bit 1 set (secondary bitmap present)
    // Secondary: 4000000000000000 → first nibble 4 = 0100 → bit 66 (Settlement Code) set
    //   because b=2: (4>>2)&1=1 maps to the 2nd bit of the secondary = bit 66
    const result = parseBitmap('80000000000000004000000000000000');
    expect(result.error).toBeUndefined();
    const active = getActiveFields(result);
    const bits = active.map((f) => f.bit);
    expect(bits).toContain(1); // secondary bitmap indicator
    expect(bits).toContain(66); // Settlement Code
  });

  it('returns empty array for zero bitmap', () => {
    const result = parseBitmap('0000000000000000');
    const active = getActiveFields(result);
    expect(active).toHaveLength(0);
  });

  it('includes field name and description for active fields', () => {
    // 0x40 in first nibble: 4 = 0100 → b=2 is set → bit 2 (PAN)
    const result = parseBitmap('4000000000000000');
    const active = getActiveFields(result);
    const bit2 = active.find((f) => f.bit === 2);
    expect(bit2).toBeDefined();
    expect(bit2?.name).toMatch(/Primary Account Number/i);
    expect(bit2?.type).toBe('n');
  });
});

describe('bitmapToHex', () => {
  it('converts bits back to hex correctly', () => {
    const bits = [true, true, true, true, false, false, false, false, ...new Array(56).fill(false)];
    expect(bitmapToHex(bits)).toBe('F000000000000000');
  });

  it('is reversible (round-trip)', () => {
    const hex = '7230054128C28805';
    const result = parseBitmap(hex);
    expect(bitmapToHex(result.primary)).toBe(hex.toUpperCase());
  });
});
