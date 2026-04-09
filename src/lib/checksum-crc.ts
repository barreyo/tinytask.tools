// ── Shared helpers ────────────────────────────────────────────────────────────

/** Convert a UTF-8 string to a Uint8Array. */
export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Parse a hex byte string (e.g. "4F 2A 1B" or "4f2a1b") into a Uint8Array.
 * Returns null if the input contains invalid hex bytes.
 */
export function hexToBytes(hex: string): Uint8Array | null {
  // Allow space/dash/comma separators or no separator
  const cleaned = hex.trim().replace(/[\s,\-:]+/g, '');
  if (cleaned.length === 0) return new Uint8Array(0);
  if (cleaned.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ── CRC-32 ────────────────────────────────────────────────────────────────────
// ISO 3309 / ITU-T V.42 / PKZIP. Polynomial: 0xEDB88320 (reversed).

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ── CRC-16/CCITT ──────────────────────────────────────────────────────────────
// CRC-16-CCITT (XModem variant). Polynomial: 0x1021, init: 0x0000.
// Used in XMODEM, Bluetooth, USB, and many embedded protocols.

const CRC16_TABLE = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i << 8;
    for (let j = 0; j < 8; j++) c = c & 0x8000 ? (0x1021 ^ (c << 1)) & 0xffff : (c << 1) & 0xffff;
    table[i] = c;
  }
  return table;
})();

export function crc16(bytes: Uint8Array): number {
  let crc = 0x0000;
  for (const byte of bytes) crc = ((crc << 8) ^ CRC16_TABLE[((crc >> 8) ^ byte) & 0xff]) & 0xffff;
  return crc;
}

// ── CRC-8 ─────────────────────────────────────────────────────────────────────
// CRC-8/SMBUS. Polynomial: 0x07, init: 0x00, no reflection.
// Used in SMBus, ATM HEC, and many sensor protocols.

const CRC8_TABLE = (() => {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 0x80 ? (0x07 ^ (c << 1)) & 0xff : (c << 1) & 0xff;
    table[i] = c;
  }
  return table;
})();

export function crc8(bytes: Uint8Array): number {
  let crc = 0x00;
  for (const byte of bytes) crc = CRC8_TABLE[(crc ^ byte) & 0xff];
  return crc;
}

// ── Adler-32 ──────────────────────────────────────────────────────────────────
// Described in RFC 1950. Used in zlib. Two 16-bit running sums mod 65521.
// Faster to compute than CRC-32 but weaker for small messages.

const ADLER_MOD = 65521;

export function adler32(bytes: Uint8Array): number {
  let s1 = 1;
  let s2 = 0;
  for (const byte of bytes) {
    s1 = (s1 + byte) % ADLER_MOD;
    s2 = (s2 + s1) % ADLER_MOD;
  }
  return ((s2 << 16) | s1) >>> 0;
}

// ── Simple byte checksum ──────────────────────────────────────────────────────
// Sum all bytes, keep low 8 bits (mod 256). Simple and fast; does not detect
// transpositions but detects most single-byte corruption.

export function byteSum8(bytes: Uint8Array): number {
  let sum = 0;
  for (const byte of bytes) sum += byte;
  return sum & 0xff;
}

// 16-bit variant: sum mod 65536
export function byteSum16(bytes: Uint8Array): number {
  let sum = 0;
  for (const byte of bytes) sum += byte;
  return sum & 0xffff;
}

// ── Parity bit ────────────────────────────────────────────────────────────────
// XOR all bits together. Even parity = total number of 1-bits is even.
// Odd parity = total number of 1-bits is odd.

export interface ParityResult {
  /** XOR of all bytes; low bit is the even-parity bit */
  xorByte: number;
  /** Number of 1-bits across all bytes */
  totalOnes: number;
  /** Even parity bit: 0 if total ones is already even, 1 otherwise */
  evenParityBit: number;
  /** Odd parity bit: inverse of even parity bit */
  oddParityBit: number;
  /** Binary representation of each byte (max 64 shown) */
  bytesBinary: string[];
}

export function computeParity(bytes: Uint8Array): ParityResult {
  let xorByte = 0;
  let totalOnes = 0;
  const bytesBinary: string[] = [];

  for (let i = 0; i < bytes.length; i++) {
    xorByte ^= bytes[i];
    // Count set bits (popcount)
    let b = bytes[i];
    while (b) {
      totalOnes += b & 1;
      b >>>= 1;
    }
    if (i < 64) bytesBinary.push(bytes[i].toString(2).padStart(8, '0'));
  }

  const evenParityBit = totalOnes % 2 === 0 ? 0 : 1;
  return { xorByte, totalOnes, evenParityBit, oddParityBit: 1 - evenParityBit, bytesBinary };
}

// ── Formatting helpers ─────────────────────────────────────────────────────────

export function toHex(value: number, bytes: 1 | 2 | 4): string {
  return (
    '0x' +
    value
      .toString(16)
      .toUpperCase()
      .padStart(bytes * 2, '0')
  );
}

export function toBin(value: number, bits: number): string {
  return '0b' + value.toString(2).padStart(bits, '0');
}
