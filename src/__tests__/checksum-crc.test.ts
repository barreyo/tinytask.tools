import { describe, it, expect } from 'vitest';
import {
  textToBytes,
  hexToBytes,
  crc32,
  crc16,
  crc8,
  adler32,
  byteSum8,
  byteSum16,
  computeParity,
  toHex,
  toBin,
} from '../lib/checksum-crc';

// ── Helpers ───────────────────────────────────────────────────────────────────

describe('textToBytes', () => {
  it('encodes ASCII text', () => {
    expect(textToBytes('ABC')).toEqual(new Uint8Array([65, 66, 67]));
  });

  it('returns empty array for empty string', () => {
    expect(textToBytes('')).toEqual(new Uint8Array(0));
  });
});

describe('hexToBytes', () => {
  it('parses space-separated hex', () => {
    expect(hexToBytes('41 42 43')).toEqual(new Uint8Array([0x41, 0x42, 0x43]));
  });

  it('parses unseparated hex', () => {
    expect(hexToBytes('414243')).toEqual(new Uint8Array([0x41, 0x42, 0x43]));
  });

  it('parses lowercase hex', () => {
    expect(hexToBytes('ff 00 ab')).toEqual(new Uint8Array([255, 0, 171]));
  });

  it('returns null for odd-length hex', () => {
    expect(hexToBytes('4f2')).toBeNull();
  });

  it('returns null for non-hex characters', () => {
    expect(hexToBytes('4G 2A')).toBeNull();
  });

  it('returns empty array for empty string', () => {
    expect(hexToBytes('')).toEqual(new Uint8Array(0));
  });
});

// ── CRC-32 ────────────────────────────────────────────────────────────────────

describe('crc32', () => {
  it('matches the PKZIP standard reference: CRC-32 of "123456789" = 0xCBF43926', () => {
    const bytes = textToBytes('123456789');
    expect(crc32(bytes)).toBe(0xcbf43926);
  });

  it('returns 0x00000000 for empty input', () => {
    expect(crc32(new Uint8Array(0))).toBe(0x00000000);
  });

  it('produces different results for different inputs', () => {
    expect(crc32(textToBytes('abc'))).not.toBe(crc32(textToBytes('abd')));
  });

  it('is sensitive to byte order (transpositions are detected)', () => {
    expect(crc32(textToBytes('ab'))).not.toBe(crc32(textToBytes('ba')));
  });

  it('returns a 32-bit unsigned number', () => {
    const result = crc32(textToBytes('hello'));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffffffff);
  });

  it('matches known CRC-32 for "hello" = 0x3610A686', () => {
    expect(crc32(textToBytes('hello'))).toBe(0x3610a686);
  });
});

// ── CRC-16 ────────────────────────────────────────────────────────────────────

describe('crc16', () => {
  it('matches the standard reference: CRC-16/XMODEM of "123456789" = 0x31C3', () => {
    const bytes = textToBytes('123456789');
    expect(crc16(bytes)).toBe(0x31c3);
  });

  it('returns 0x0000 for empty input', () => {
    expect(crc16(new Uint8Array(0))).toBe(0x0000);
  });

  it('produces different results for different inputs', () => {
    expect(crc16(textToBytes('abc'))).not.toBe(crc16(textToBytes('abd')));
  });

  it('returns a 16-bit value', () => {
    const result = crc16(textToBytes('test'));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffff);
  });
});

// ── CRC-8 ─────────────────────────────────────────────────────────────────────

describe('crc8', () => {
  it('matches the standard reference: CRC-8/SMBUS of "123456789" = 0xF4', () => {
    const bytes = textToBytes('123456789');
    expect(crc8(bytes)).toBe(0xf4);
  });

  it('returns 0x00 for empty input', () => {
    expect(crc8(new Uint8Array(0))).toBe(0x00);
  });

  it('produces different results for different inputs', () => {
    expect(crc8(textToBytes('abc'))).not.toBe(crc8(textToBytes('xyz')));
  });

  it('returns a value in [0, 255]', () => {
    const result = crc8(textToBytes('data'));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(255);
  });
});

// ── Adler-32 ──────────────────────────────────────────────────────────────────

describe('adler32', () => {
  it('matches the RFC 1950 reference: Adler-32 of "Wikipedia" = 0x11E60398', () => {
    // Well-known reference value for "Wikipedia"
    expect(adler32(textToBytes('Wikipedia'))).toBe(0x11e60398);
  });

  it('returns 1 for empty input (s1=1, s2=0)', () => {
    expect(adler32(new Uint8Array(0))).toBe(1);
  });

  it('matches known value: Adler-32 of "Mark Adler" = 0x13070394', () => {
    expect(adler32(textToBytes('Mark Adler'))).toBe(0x13070394);
  });

  it('returns a 32-bit unsigned value', () => {
    const result = adler32(textToBytes('hello world'));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xffffffff);
  });
});

// ── Byte sum checksum ─────────────────────────────────────────────────────────

describe('byteSum8', () => {
  it('sums bytes mod 256', () => {
    // 0x41 + 0x42 + 0x43 = 0xC6
    expect(byteSum8(new Uint8Array([0x41, 0x42, 0x43]))).toBe(0xc6);
  });

  it('wraps around at 256', () => {
    expect(byteSum8(new Uint8Array([0xff, 0x01]))).toBe(0x00);
  });

  it('returns 0 for empty input', () => {
    expect(byteSum8(new Uint8Array(0))).toBe(0);
  });
});

describe('byteSum16', () => {
  it('sums bytes mod 65536', () => {
    expect(byteSum16(new Uint8Array([0x41, 0x42, 0x43]))).toBe(0xc6);
  });

  it('handles sums over 255 without wrapping to 8 bits', () => {
    // 200 + 200 = 400 > 255 but < 65536
    expect(byteSum16(new Uint8Array([200, 200]))).toBe(400);
  });

  it('wraps at 65536', () => {
    const bytes = new Uint8Array(257).fill(255);
    const expected = (257 * 255) % 65536;
    expect(byteSum16(bytes)).toBe(expected);
  });
});

// ── Parity ────────────────────────────────────────────────────────────────────

describe('computeParity', () => {
  it('counts total 1-bits correctly', () => {
    // 0x01 = 1 one-bit, 0x03 = 2 one-bits, 0x07 = 3 one-bits → total = 6
    const result = computeParity(new Uint8Array([0x01, 0x03, 0x07]));
    expect(result.totalOnes).toBe(6);
  });

  it('even parity bit is 0 when total ones is even', () => {
    // 0x03 has 2 ones (even)
    const result = computeParity(new Uint8Array([0x03]));
    expect(result.evenParityBit).toBe(0);
    expect(result.oddParityBit).toBe(1);
  });

  it('even parity bit is 1 when total ones is odd', () => {
    // 0x01 has 1 one (odd)
    const result = computeParity(new Uint8Array([0x01]));
    expect(result.evenParityBit).toBe(1);
    expect(result.oddParityBit).toBe(0);
  });

  it('xorByte is XOR of all bytes', () => {
    const result = computeParity(new Uint8Array([0xaa, 0x55]));
    expect(result.xorByte).toBe(0xff);
  });

  it('returns binary representation of bytes', () => {
    const result = computeParity(new Uint8Array([0x0f]));
    expect(result.bytesBinary[0]).toBe('00001111');
  });

  it('caps binary output at 64 bytes', () => {
    const bytes = new Uint8Array(100).fill(1);
    const result = computeParity(bytes);
    expect(result.bytesBinary.length).toBe(64);
  });

  it('handles empty input', () => {
    const result = computeParity(new Uint8Array(0));
    expect(result.totalOnes).toBe(0);
    expect(result.evenParityBit).toBe(0);
    expect(result.xorByte).toBe(0);
  });
});

// ── Formatting ────────────────────────────────────────────────────────────────

describe('toHex', () => {
  it('formats 1-byte value', () => {
    expect(toHex(0xf4, 1)).toBe('0xF4');
  });

  it('formats 2-byte value with zero padding', () => {
    expect(toHex(0x31c3, 2)).toBe('0x31C3');
  });

  it('formats 4-byte value', () => {
    expect(toHex(0xcbf43926, 4)).toBe('0xCBF43926');
  });
});

describe('toBin', () => {
  it('formats binary with prefix and padding', () => {
    expect(toBin(0b1010, 8)).toBe('0b00001010');
  });

  it('formats 1-bit value', () => {
    expect(toBin(1, 1)).toBe('0b1');
  });
});
