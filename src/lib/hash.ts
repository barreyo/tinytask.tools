// ── Algorithm types ───────────────────────────────────────────────────────────

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export type HashResults = Record<HashAlgorithm, string>;

// ── MD5 (pure JS) ─────────────────────────────────────────────────────────────
// Based on the classic Rivest MD5 specification.

function md5(input: string): string {
  const str = unescape(encodeURIComponent(input));
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return md5Bytes(bytes);
}

function md5Bytes(bytes: Uint8Array): string {
  const msgLen = bytes.length;
  const bitLen = msgLen * 8;

  // Pre-processing: pad to 512-bit blocks
  const padLen = msgLen % 64 < 56 ? 56 - (msgLen % 64) : 120 - (msgLen % 64);
  const padded = new Uint8Array(msgLen + padLen + 8);
  padded.set(bytes);
  padded[msgLen] = 0x80;
  // Append length as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(msgLen + padLen, bitLen & 0xffffffff, true);
  view.setUint32(msgLen + padLen + 4, Math.floor(bitLen / 0x100000000), true);

  // Per-round shift amounts
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Precomputed table T[i] = floor(abs(sin(i+1)) * 2^32)
  const T = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const blocks = padded.length / 64;
  const blockView = new DataView(padded.buffer);

  for (let blk = 0; blk < blocks; blk++) {
    const offset = blk * 64;
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = blockView.getUint32(offset + j * 4, true);
    }

    let A = a0,
      B = b0,
      C = c0,
      D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + T[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  return [a0, b0, c0, d0]
    .map((n) => {
      // Little-endian byte swap
      const swapped =
        ((n & 0xff) << 24) |
        (((n >> 8) & 0xff) << 16) |
        (((n >> 16) & 0xff) << 8) |
        ((n >> 24) & 0xff);
      return (swapped >>> 0).toString(16).padStart(8, '0');
    })
    .join('');
}

// ── Web Crypto SHA ────────────────────────────────────────────────────────────

async function computeSha(
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  input: string,
): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest(algorithm, encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function computeAllHashes(input: string): Promise<HashResults> {
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    computeSha('SHA-1', input),
    computeSha('SHA-256', input),
    computeSha('SHA-384', input),
    computeSha('SHA-512', input),
  ]);
  return {
    MD5: md5(input),
    'SHA-1': sha1,
    'SHA-256': sha256,
    'SHA-384': sha384,
    'SHA-512': sha512,
  };
}

export { md5 as computeMD5 };

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  input: string;
  hashes: HashResults;
  timestamp: number;
}

export const HISTORY_MAX = 30;

export function pruneHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, HISTORY_MAX);
}

export function mergeHistory(incoming: HistoryEntry[], existing: HistoryEntry[]): HistoryEntry[] {
  return pruneHistory([...incoming, ...existing]);
}

export function formatAge(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function truncate(s: string, max = 48): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}
