import { describe, it, expect } from 'vitest';
import { decodeJwt, formatUnixTime } from '../lib/jwt';

// A well-known example JWT from jwt.io:
// Header:  {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022}
const EXAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ' +
  '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// ── decodeJwt ─────────────────────────────────────────────────────────────────

describe('decodeJwt', () => {
  it('decodes header correctly', () => {
    const { header } = decodeJwt(EXAMPLE_JWT);
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('decodes payload correctly', () => {
    const { payload } = decodeJwt(EXAMPLE_JWT);
    expect(payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
  });

  it('returns the raw signature base64url string', () => {
    const { signatureB64 } = decodeJwt(EXAMPLE_JWT);
    expect(signatureB64).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  it('trims leading/trailing whitespace from token', () => {
    const { payload } = decodeJwt(`  ${EXAMPLE_JWT}  `);
    expect(payload.sub).toBe('1234567890');
  });

  it('throws when token has fewer than 3 parts', () => {
    expect(() => decodeJwt('aaa.bbb')).toThrow(/expected 3 parts/i);
  });

  it('throws when token has more than 3 parts', () => {
    expect(() => decodeJwt('aaa.bbb.ccc.ddd')).toThrow(/expected 3 parts/i);
  });

  it('throws when header is not valid base64url JSON', () => {
    expect(() => decodeJwt('!!!.bbb.ccc')).toThrow(/header/i);
  });

  it('throws when payload is not valid base64url JSON', () => {
    // Valid base64url but not JSON → decode error
    const validBase64ButNotJson = btoa('not-json')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const validHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    expect(() => decodeJwt(`${validHeader}.${validBase64ButNotJson}.sig`)).toThrow(/payload/i);
  });

  it('handles base64url padding differences (no padding in token)', () => {
    // The example token has no = padding — should still decode correctly
    const { header } = decodeJwt(EXAMPLE_JWT);
    expect(header.alg).toBe('HS256');
  });

  it('handles tokens with numeric claims', () => {
    // Construct a JWT with exp/nbf claims
    const payloadObj = { sub: 'user', exp: 9999999999, nbf: 1000000000 };
    const headerB64 = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(payloadObj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const { payload } = decodeJwt(`${headerB64}.${payloadB64}.sig`);
    expect(payload.exp).toBe(9999999999);
    expect(payload.nbf).toBe(1000000000);
  });
});

// ── formatUnixTime ────────────────────────────────────────────────────────────

describe('formatUnixTime', () => {
  it('formats a known Unix timestamp', () => {
    // 0 → epoch
    const result = formatUnixTime(0);
    expect(result).toBe('Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('formats the jwt.io example iat timestamp', () => {
    // 1516239022 → Wed, 18 Jan 2018 01:30:22 GMT
    const result = formatUnixTime(1516239022);
    expect(result).toContain('2018');
  });

  it('returns null for non-number input', () => {
    expect(formatUnixTime('not a number')).toBeNull();
    expect(formatUnixTime(null)).toBeNull();
    expect(formatUnixTime(undefined)).toBeNull();
    expect(formatUnixTime({ ts: 0 })).toBeNull();
  });

  it('returns a string for a valid timestamp', () => {
    expect(typeof formatUnixTime(1700000000)).toBe('string');
  });

  it('handles future timestamps', () => {
    // Year 2100 approximately
    const result = formatUnixTime(4102444800);
    expect(result).toContain('2100');
  });
});
