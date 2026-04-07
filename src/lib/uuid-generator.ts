// ── ULID ─────────────────────────────────────────────────────────────────────

export const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const ULID_LENGTH = 26;
export const ULID_TIME_LENGTH = 10;
export const ULID_RANDOM_LENGTH = 16;

export function encodeCrockford(value: bigint, length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result = CROCKFORD[Number(value & 31n)] + result;
    value >>= 5n;
  }
  return result;
}

export function generateULID(): string {
  const tsMs = BigInt(Date.now());
  const timePart = encodeCrockford(tsMs, ULID_TIME_LENGTH);
  const randBytes = new Uint8Array(10);
  crypto.getRandomValues(randBytes);
  let randBig = 0n;
  for (const byte of randBytes) {
    randBig = (randBig << 8n) | BigInt(byte);
  }
  const randPart = encodeCrockford(randBig, ULID_RANDOM_LENGTH);
  return timePart + randPart;
}

export function ulidTimestamp(ulid: string): number {
  let value = 0n;
  for (const char of ulid.slice(0, ULID_TIME_LENGTH)) {
    const idx = CROCKFORD.indexOf(char);
    value = (value << 5n) | BigInt(idx);
  }
  return Number(value);
}

// ── History ───────────────────────────────────────────────────────────────────

export type UuidType = 'v1' | 'v3' | 'v4' | 'v5' | 'v7' | 'ulid';

export interface HistoryEntry {
  value: string;
  type: UuidType;
  timestamp: number;
}

export const HISTORY_MAX = 50;

export function pruneHistory(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.slice(0, HISTORY_MAX);
}

export function mergeHistory(incoming: HistoryEntry[], existing: HistoryEntry[]): HistoryEntry[] {
  return pruneHistory([...incoming, ...existing]);
}

// ── Relative time ─────────────────────────────────────────────────────────────

export function formatAge(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ── UUID format validators ────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isValidUlid(value: string): boolean {
  return ULID_RE.test(value);
}

export function uuidVersion(value: string): number | null {
  if (!isValidUuid(value)) return null;
  return parseInt(value[14], 16);
}
