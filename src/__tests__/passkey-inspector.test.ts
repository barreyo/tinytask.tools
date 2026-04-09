import { describe, it, expect } from 'vitest';
import {
  lookupAaguid,
  base64urlToBytes,
  bytesToHex,
  bytesToBase64url,
  getCoseAlgName,
  getCoseKtyName,
  getCoseCrvName,
  decodeCbor,
  decodeClientDataJson,
  parseAuthData,
} from '../lib/passkey-inspector';

// ── lookupAaguid ──────────────────────────────────────────────────────────────

describe('lookupAaguid', () => {
  it('finds a known AAGUID (YubiKey 5 Series with NFC)', () => {
    const result = lookupAaguid('fa2b99dc-9e39-4257-8f92-4a30d23c4118');
    expect(result.found).toBe(true);
    expect(result.name).toBe('YubiKey 5 Series with NFC');
    expect(result.aaguid).toBe('fa2b99dc-9e39-4257-8f92-4a30d23c4118');
  });

  it('finds Windows Hello', () => {
    const result = lookupAaguid('9ddd1817-af5a-4672-a2b9-3e3dd95000a9');
    expect(result.found).toBe(true);
    expect(result.name).toBe('Windows Hello');
  });

  it('normalises hex without hyphens to canonical UUID form', () => {
    const result = lookupAaguid('fa2b99dc9e3942578f924a30d23c4118');
    expect(result.found).toBe(true);
    expect(result.aaguid).toBe('fa2b99dc-9e39-4257-8f92-4a30d23c4118');
  });

  it('is case-insensitive', () => {
    const result = lookupAaguid('FA2B99DC-9E39-4257-8F92-4A30D23C4118');
    expect(result.found).toBe(true);
  });

  it('returns found=false and "Unknown authenticator" for unknown AAGUID', () => {
    const result = lookupAaguid('00000000-0000-0000-0000-000000000001');
    expect(result.found).toBe(false);
    expect(result.name).toBe('Unknown authenticator');
  });

  it('returns the canonical AAGUID in the result', () => {
    const result = lookupAaguid('fa2b99dc9e3942578f924a30d23c4118');
    expect(result.aaguid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

// ── base64urlToBytes ──────────────────────────────────────────────────────────

describe('base64urlToBytes', () => {
  it('decodes a standard base64url string', () => {
    // "hello" in base64url
    const bytes = base64urlToBytes('aGVsbG8');
    expect(new TextDecoder().decode(bytes)).toBe('hello');
  });

  it('handles base64url characters - and _ (not + and /)', () => {
    // base64 "+/" → base64url "-_"
    // 0xfb 0xfc = base64 "+/w=" = base64url "-_w"
    const bytes = base64urlToBytes('-_w');
    expect(bytes[0]).toBe(0xfb);
    expect(bytes[1]).toBe(0xfc);
  });

  it('handles strings without padding', () => {
    const bytes = base64urlToBytes('dGVzdA');
    expect(new TextDecoder().decode(bytes)).toBe('test');
  });

  it('returns a Uint8Array', () => {
    const bytes = base64urlToBytes('dGVzdA');
    expect(bytes).toBeInstanceOf(Uint8Array);
  });

  it('decodes empty-ish single-char edge case', () => {
    // "A" in base64url = 0x00 top bits
    const bytes = base64urlToBytes('AA');
    expect(bytes.length).toBeGreaterThan(0);
  });
});

// ── bytesToHex ────────────────────────────────────────────────────────────────

describe('bytesToHex', () => {
  it('converts bytes to lowercase hex string', () => {
    expect(bytesToHex(new Uint8Array([0x00, 0xff, 0xab]))).toBe('00ffab');
  });

  it('pads single-digit hex values with leading zero', () => {
    expect(bytesToHex(new Uint8Array([0x01, 0x0f]))).toBe('010f');
  });

  it('returns empty string for empty Uint8Array', () => {
    expect(bytesToHex(new Uint8Array(0))).toBe('');
  });

  it('produces 2 hex chars per byte', () => {
    const bytes = new Uint8Array(16).fill(0xaa);
    expect(bytesToHex(bytes)).toHaveLength(32);
  });
});

// ── bytesToBase64url ──────────────────────────────────────────────────────────

describe('bytesToBase64url', () => {
  it('encodes bytes to base64url (no padding)', () => {
    const bytes = new TextEncoder().encode('hello');
    const result = bytesToBase64url(bytes);
    expect(result).toBe('aGVsbG8');
  });

  it('uses - and _ instead of + and /', () => {
    const result = bytesToBase64url(new Uint8Array([0xfb, 0xfc]));
    expect(result).toContain('-');
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
  });

  it('omits = padding', () => {
    const bytes = new TextEncoder().encode('test');
    const result = bytesToBase64url(bytes);
    expect(result).not.toContain('=');
  });

  it('round-trips with base64urlToBytes', () => {
    const original = new Uint8Array([1, 2, 3, 200, 255]);
    const encoded = bytesToBase64url(original);
    const decoded = base64urlToBytes(encoded);
    expect(decoded).toEqual(original);
  });
});

// ── COSE lookup helpers ───────────────────────────────────────────────────────

describe('getCoseAlgName', () => {
  it('returns ES256 for -7', () => {
    expect(getCoseAlgName(-7)).toContain('ES256');
  });

  it('returns RS256 for -257', () => {
    expect(getCoseAlgName(-257)).toContain('RS256');
  });

  it('returns EdDSA for -8', () => {
    expect(getCoseAlgName(-8)).toBe('EdDSA');
  });

  it('returns Unknown for unrecognised algorithm', () => {
    expect(getCoseAlgName(-999)).toContain('Unknown');
    expect(getCoseAlgName(-999)).toContain('-999');
  });
});

describe('getCoseKtyName', () => {
  it('returns OKP for 1', () => {
    expect(getCoseKtyName(1)).toBe('OKP');
  });

  it('returns EC2 for 2', () => {
    expect(getCoseKtyName(2)).toBe('EC2');
  });

  it('returns RSA for 3', () => {
    expect(getCoseKtyName(3)).toBe('RSA');
  });

  it('returns Unknown for unrecognised type', () => {
    expect(getCoseKtyName(99)).toContain('Unknown');
  });
});

describe('getCoseCrvName', () => {
  it('returns P-256 for 1', () => {
    expect(getCoseCrvName(1)).toBe('P-256');
  });

  it('returns Ed25519 for 6', () => {
    expect(getCoseCrvName(6)).toBe('Ed25519');
  });

  it('returns Unknown for unrecognised curve', () => {
    expect(getCoseCrvName(999)).toContain('Unknown');
  });
});

// ── decodeCbor ────────────────────────────────────────────────────────────────

describe('decodeCbor', () => {
  function buf(...bytes: number[]): ArrayBuffer {
    return new Uint8Array(bytes).buffer;
  }

  it('decodes unsigned integer 0', () => {
    expect(decodeCbor(buf(0x00))).toBe(0);
  });

  it('decodes unsigned integer 23', () => {
    expect(decodeCbor(buf(0x17))).toBe(23);
  });

  it('decodes unsigned integer 24 (1-byte argument)', () => {
    expect(decodeCbor(buf(0x18, 24))).toBe(24);
  });

  it('decodes unsigned integer 255', () => {
    expect(decodeCbor(buf(0x18, 0xff))).toBe(255);
  });

  it('decodes unsigned integer 256 (2-byte argument)', () => {
    expect(decodeCbor(buf(0x19, 0x01, 0x00))).toBe(256);
  });

  it('decodes negative integer -1', () => {
    expect(decodeCbor(buf(0x20))).toBe(-1);
  });

  it('decodes negative integer -24', () => {
    // major type 1, value 23 → -1-23 = -24
    expect(decodeCbor(buf(0x37))).toBe(-24);
  });

  it('decodes a byte string', () => {
    // major type 2 (0x40), length 3, bytes 0x01 0x02 0x03
    const result = decodeCbor(buf(0x43, 0x01, 0x02, 0x03));
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('decodes a text string', () => {
    // major type 3 (0x60), length 5, "hello"
    const hello = [0x68, 0x65, 0x6c, 0x6c, 0x6f];
    const result = decodeCbor(buf(0x65, ...hello));
    expect(result).toBe('hello');
  });

  it('decodes an empty array', () => {
    expect(decodeCbor(buf(0x80))).toEqual([]);
  });

  it('decodes an array with elements', () => {
    // [1, 2] → 0x82 0x01 0x02
    expect(decodeCbor(buf(0x82, 0x01, 0x02))).toEqual([1, 2]);
  });

  it('decodes an empty map', () => {
    expect(decodeCbor(buf(0xa0))).toEqual({});
  });

  it('decodes a simple map {"a": 1}', () => {
    // 0xa1 (map, 1 entry), 0x61 0x61 (text "a"), 0x01 (int 1)
    expect(decodeCbor(buf(0xa1, 0x61, 0x61, 0x01))).toEqual({ a: 1 });
  });

  it('decodes false', () => {
    expect(decodeCbor(buf(0xf4))).toBe(false);
  });

  it('decodes true', () => {
    expect(decodeCbor(buf(0xf5))).toBe(true);
  });

  it('decodes null', () => {
    expect(decodeCbor(buf(0xf6))).toBeNull();
  });

  it('throws on unexpected end of data', () => {
    expect(() => decodeCbor(buf())).toThrow();
  });
});

// ── decodeClientDataJson ──────────────────────────────────────────────────────

describe('decodeClientDataJson', () => {
  function encodeClientData(obj: object): string {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return bytesToBase64url(bytes);
  }

  it('decodes type and origin from ClientDataJSON', () => {
    const b64 = encodeClientData({
      type: 'webauthn.create',
      challenge: 'dGVzdA',
      origin: 'https://example.com',
    });
    const result = decodeClientDataJson(b64);
    expect(result.type).toBe('webauthn.create');
    expect(result.origin).toBe('https://example.com');
  });

  it('decodes and decodes the challenge', () => {
    // challenge = base64url of "test"
    const b64 = encodeClientData({
      type: 'webauthn.get',
      challenge: 'dGVzdA',
      origin: 'https://example.com',
    });
    const result = decodeClientDataJson(b64);
    expect(result.challenge).toBe('dGVzdA');
    expect(result.challengeDecoded).toBe('test');
  });

  it('includes crossOrigin when present', () => {
    const b64 = encodeClientData({
      type: 'webauthn.create',
      challenge: 'abc',
      origin: 'https://example.com',
      crossOrigin: true,
    });
    const result = decodeClientDataJson(b64);
    expect(result.crossOrigin).toBe(true);
  });

  it('returns raw parsed object', () => {
    const b64 = encodeClientData({
      type: 'webauthn.create',
      challenge: 'abc',
      origin: 'https://x.com',
    });
    const result = decodeClientDataJson(b64);
    expect(result.raw).toBeDefined();
  });

  it('strips leading/trailing whitespace from input', () => {
    const b64 = encodeClientData({
      type: 'webauthn.create',
      challenge: 'abc',
      origin: 'https://x.com',
    });
    expect(() => decodeClientDataJson(`  ${b64}  `)).not.toThrow();
  });
});

// ── parseAuthData ─────────────────────────────────────────────────────────────

describe('parseAuthData', () => {
  /**
   * Build a minimal authenticator data byte array:
   * - rpIdHash: 32 bytes
   * - flags: 1 byte
   * - signCount: 4 bytes big-endian
   */
  function buildAuthData(flags: number, signCount: number, extra?: Uint8Array): Uint8Array {
    const buf = new Uint8Array(37 + (extra?.length ?? 0));
    // rpIdHash is all zeros by default
    buf[32] = flags;
    buf[33] = (signCount >>> 24) & 0xff;
    buf[34] = (signCount >>> 16) & 0xff;
    buf[35] = (signCount >>> 8) & 0xff;
    buf[36] = signCount & 0xff;
    if (extra) buf.set(extra, 37);
    return buf;
  }

  it('parses rpIdHash as 32-byte hex string', () => {
    const auth = parseAuthData(buildAuthData(0x01, 0));
    expect(auth.rpIdHash).toHaveLength(64); // 32 bytes × 2 hex chars
    expect(auth.rpIdHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('parses sign count correctly', () => {
    const auth = parseAuthData(buildAuthData(0x01, 42));
    expect(auth.signCount).toBe(42);
  });

  it('parses flags — userPresent (bit 0)', () => {
    const auth = parseAuthData(buildAuthData(0x01, 0));
    expect(auth.flags.userPresent).toBe(true);
    expect(auth.flags.userVerified).toBe(false);
  });

  it('parses flags — userVerified (bit 2)', () => {
    const auth = parseAuthData(buildAuthData(0x05, 0));
    expect(auth.flags.userPresent).toBe(true);
    expect(auth.flags.userVerified).toBe(true);
  });

  it('parses flags — backupEligible (bit 3) and backedUp (bit 4)', () => {
    const auth = parseAuthData(buildAuthData(0x18, 0));
    expect(auth.flags.backupEligible).toBe(true);
    expect(auth.flags.backedUp).toBe(true);
  });

  it('parses flags — extensionData (bit 7)', () => {
    const auth = parseAuthData(buildAuthData(0x80, 0));
    expect(auth.flags.extensionData).toBe(true);
  });

  it('exposes raw flags byte', () => {
    const auth = parseAuthData(buildAuthData(0x45, 0));
    expect(auth.flags.raw).toBe(0x45);
  });

  it('returns null for attestedCredentialData when AT flag is unset', () => {
    const auth = parseAuthData(buildAuthData(0x01, 0));
    expect(auth.attestedCredentialData).toBeNull();
  });

  it('returns total byte count', () => {
    const auth = parseAuthData(buildAuthData(0x01, 0));
    expect(auth.totalBytes).toBe(37);
  });

  it('handles large sign counts (unsigned 32-bit)', () => {
    const auth = parseAuthData(buildAuthData(0x01, 0xffffffff));
    expect(auth.signCount).toBe(0xffffffff);
  });
});
