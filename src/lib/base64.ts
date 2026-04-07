/**
 * UTF-8-safe Base64 encoding and decoding.
 *
 * Uses TextEncoder/TextDecoder so that multi-byte Unicode characters
 * (e.g. emoji, CJK, accented letters) round-trip correctly.
 */

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Encode a string to Base64.
 * Handles the full Unicode range by first encoding to UTF-8 bytes.
 */
export function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Decode a Base64 string back to a UTF-8 string.
 * Strips whitespace before decoding to be tolerant of line-wrapped input.
 * Throws a descriptive Error on invalid input.
 */
export function base64Decode(input: string): string {
  const cleaned = input.replace(/\s/g, '');

  if (cleaned.length === 0) return '';

  const valid = /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned);
  if (!valid) {
    throw new Error('Invalid Base64: contains characters outside the Base64 alphabet.');
  }

  const paddingCount = (cleaned.match(/=/g) ?? []).length;
  if (paddingCount > 2) {
    throw new Error('Invalid Base64: too many padding characters.');
  }

  // Add missing padding so atob doesn't throw.
  const padded = cleaned.padEnd(Math.ceil(cleaned.length / 4) * 4, '=');

  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new Error('Invalid Base64: could not decode.');
  }

  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export { BASE64_CHARS };
