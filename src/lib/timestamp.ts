/**
 * Pure utility functions for Unix timestamp conversion.
 * No DOM access — safe to import in tests and server-side code.
 */

/** Timestamps above this threshold are treated as milliseconds. */
const MS_THRESHOLD = 1e10;

/** Maximum sensible Unix timestamp in seconds (~year 9999). */
export const MAX_TIMESTAMP_S = 253402300799;

/** Minimum sensible Unix timestamp in seconds (year 1000). */
export const MIN_TIMESTAMP_S = -30610224000;

/**
 * Returns true when the value looks like milliseconds rather than seconds.
 * Heuristic: absolute value > 10^10 (i.e. after year 2001 in ms).
 */
export function isMilliseconds(ts: number): boolean {
  return Math.abs(ts) > MS_THRESHOLD;
}

/**
 * Ensures the returned value is seconds.
 * If `ts` looks like milliseconds, divide by 1000.
 */
export function normalizeTimestamp(ts: number): number {
  return isMilliseconds(ts) ? ts / 1000 : ts;
}

/** Convert a Unix timestamp (seconds) to a Date. */
export function timestampToDate(seconds: number): Date {
  return new Date(seconds * 1000);
}

/** Convert a Date to a Unix timestamp in seconds (integer). */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/** Format a Date as a UTC string: "Tuesday, April 8, 2025 12:05:45 UTC" */
export function formatUTC(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short',
  });
}

/** Format a Date in the user's local timezone. */
export function formatLocal(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  });
}

/** Format a Date as an ISO 8601 string with milliseconds. */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Return a human-readable relative time string.
 * Positive deltas = past ("2 hours ago"), negative = future ("in 3 days").
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(absDiff / 60_000);
  const hours = Math.floor(absDiff / 3_600_000);
  const days = Math.floor(absDiff / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  let label: string;
  if (seconds < 5) {
    label = 'just now';
    return label;
  } else if (seconds < 60) {
    label = `${seconds} seconds`;
  } else if (minutes < 60) {
    label = minutes === 1 ? '1 minute' : `${minutes} minutes`;
  } else if (hours < 24) {
    label = hours === 1 ? '1 hour' : `${hours} hours`;
  } else if (days < 7) {
    label = days === 1 ? '1 day' : `${days} days`;
  } else if (weeks < 5) {
    label = weeks === 1 ? '1 week' : `${weeks} weeks`;
  } else if (months < 12) {
    label = months === 1 ? '1 month' : `${months} months`;
  } else {
    label = years === 1 ? '1 year' : `${years} years`;
  }

  return isFuture ? `in ${label}` : `${label} ago`;
}

export interface ValidateResult {
  seconds: number;
  error: string | null;
}

/**
 * Parse and validate a user-supplied timestamp string.
 * Accepts integers in seconds or milliseconds.
 * Returns seconds on success, or an error string on failure.
 */
export function validateTimestamp(input: string): ValidateResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { seconds: 0, error: 'Please enter a timestamp.' };
  }

  const num = Number(trimmed);
  if (!Number.isFinite(num) || !/^-?\d+$/.test(trimmed)) {
    return { seconds: 0, error: 'Invalid input: please enter an integer.' };
  }

  const seconds = normalizeTimestamp(num);

  if (seconds < MIN_TIMESTAMP_S) {
    return { seconds: 0, error: 'Timestamp is too far in the past.' };
  }
  if (seconds > MAX_TIMESTAMP_S) {
    return { seconds: 0, error: 'Timestamp is too far in the future.' };
  }

  return { seconds, error: null };
}

/** History entry types */
export type ConversionDirection = 'to-date' | 'to-ts';

export interface HistoryEntry {
  direction: ConversionDirection;
  input: string;
  output: string;
  timestamp: number;
}

export const HISTORY_KEY = 'tt_timestamp_history';
export const HISTORY_MAX = 50;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)));
  } catch {
    // ignore quota errors
  }
}

export function prependHistory(entry: HistoryEntry, existing: HistoryEntry[]): HistoryEntry[] {
  return [entry, ...existing].slice(0, HISTORY_MAX);
}

export function formatAge(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function truncate(str: string, max = 52): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
