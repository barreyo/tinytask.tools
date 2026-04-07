export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Raw base64url-encoded signature (not decoded to bytes) */
  signatureB64: string;
}

/** Decodes a base64url string to a UTF-8 string. */
function base64urlDecode(str: string): string {
  // Convert base64url to standard base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad to a multiple of 4
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

export function decodeJwt(token: string): JwtDecoded {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error(`Expected 3 parts (header.payload.signature), got ${parts.length}`);
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(base64urlDecode(headerB64));
  } catch {
    throw new Error('Failed to decode header: not valid base64url-encoded JSON');
  }

  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    throw new Error('Failed to decode payload: not valid base64url-encoded JSON');
  }

  return { header, payload, signatureB64 };
}

/** Formats a Unix timestamp (seconds) as a human-readable date string. */
export function formatUnixTime(ts: unknown): string | null {
  if (typeof ts !== 'number') return null;
  try {
    return new Date(ts * 1000).toUTCString();
  } catch {
    return null;
  }
}
