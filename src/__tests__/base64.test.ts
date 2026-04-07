import { describe, expect, it } from 'vitest';
import { base64Encode, base64Decode } from '../lib/base64';

// ── Encoding ────────────────────────────────────────────────────────────────

describe('base64Encode', () => {
  it('encodes an empty string to an empty string', () => {
    expect(base64Encode('')).toBe('');
  });

  it('encodes basic ASCII text', () => {
    expect(base64Encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });

  it('encodes a single character', () => {
    expect(base64Encode('A')).toBe('QQ==');
  });

  it('encodes numbers', () => {
    expect(base64Encode('12345')).toBe('MTIzNDU=');
  });

  it('encodes whitespace', () => {
    expect(base64Encode('   ')).toBe('ICAg');
    expect(base64Encode('\n')).toBe('Cg==');
    expect(base64Encode('\t')).toBe('CQ==');
  });

  it('encodes a URL string', () => {
    expect(base64Encode('https://example.com/path?q=1')).toBe(
      'aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoP3E9MQ==',
    );
  });

  it('encodes a string with special characters', () => {
    const input = '!@#$%^&*()_+-=[]{}|;\':",./<>?';
    const encoded = base64Encode(input);
    expect(encoded).toBeTruthy();
    expect(encoded).not.toBe(input);
  });

  it('encodes Unicode characters (accented letters)', () => {
    expect(base64Encode('café')).toBe('Y2Fmw6k=');
  });

  it('encodes CJK characters', () => {
    const encoded = base64Encode('日本語');
    expect(encoded).toBeTruthy();
    expect(encoded).not.toBe('日本語');
  });

  it('encodes emoji', () => {
    const encoded = base64Encode('🚀');
    expect(encoded).toBeTruthy();
    expect(encoded).not.toBe('🚀');
  });

  it('encodes a long string', () => {
    const long = 'a'.repeat(10_000);
    const encoded = base64Encode(long);
    expect(encoded.length).toBeGreaterThan(long.length);
    expect(base64Decode(encoded)).toBe(long);
  });
});

// ── Decoding ────────────────────────────────────────────────────────────────

describe('base64Decode', () => {
  it('decodes an empty string to an empty string', () => {
    expect(base64Decode('')).toBe('');
  });

  it('decodes basic ASCII Base64', () => {
    expect(base64Decode('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
  });

  it('decodes a single encoded character', () => {
    expect(base64Decode('QQ==')).toBe('A');
  });

  it('decodes Base64 without padding', () => {
    // atob is strict about padding; our implementation adds it back
    expect(base64Decode('SGVsbG8')).toBe('Hello');
  });

  it('decodes Base64 with correct padding', () => {
    expect(base64Decode('SGVsbG8=')).toBe('Hello');
    expect(base64Decode('SGVsbG8K')).toBe('Hello\n');
  });

  it('tolerates whitespace (spaces, newlines, tabs) in the input', () => {
    const spaced = 'SGVs bG8s\nIFdv\tcmxkIQ==';
    expect(base64Decode(spaced)).toBe('Hello, World!');
  });

  it('decodes Unicode / multi-byte characters', () => {
    expect(base64Decode('Y2Fmw6k=')).toBe('café');
  });

  it('decodes CJK characters', () => {
    const encoded = base64Encode('日本語');
    expect(base64Decode(encoded)).toBe('日本語');
  });

  it('decodes emoji', () => {
    const encoded = base64Encode('🚀✨🎉');
    expect(base64Decode(encoded)).toBe('🚀✨🎉');
  });
});

// ── Roundtrips ──────────────────────────────────────────────────────────────

describe('base64 roundtrip', () => {
  const cases = [
    '',
    'a',
    'Hello, World!',
    'The quick brown fox jumps over the lazy dog',
    '0123456789',
    'café',
    '日本語テスト',
    '🚀✨🎉💻',
    'line1\nline2\nline3',
    '\t\r\n',
    '+ / = special chars in source',
    'a'.repeat(500),
  ];

  cases.forEach((original) => {
    it(`roundtrips: ${JSON.stringify(original).slice(0, 40)}`, () => {
      expect(base64Decode(base64Encode(original))).toBe(original);
    });
  });
});

// ── Error handling ──────────────────────────────────────────────────────────

describe('base64Decode errors', () => {
  it('throws on a string with characters outside the Base64 alphabet', () => {
    expect(() => base64Decode('not@valid!')).toThrow(/Invalid Base64/);
  });

  it('throws on too many padding characters', () => {
    expect(() => base64Decode('SGVsbG8===')).toThrow(/Invalid Base64/);
  });

  it('throws on arbitrary non-Base64 text', () => {
    expect(() => base64Decode('this is not base64 $$')).toThrow(/Invalid Base64/);
  });

  it('throws on input with angle brackets', () => {
    expect(() => base64Decode('<html>')).toThrow(/Invalid Base64/);
  });

  it('error message is a non-empty string', () => {
    try {
      base64Decode('!!invalid!!');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toMatch(/Invalid Base64/);
    }
  });
});

// ── Edge cases ──────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles a string that is itself valid Base64 when encoded', () => {
    // "SGVsbG8=" is valid Base64 — encoding it again should yield a different string
    const meta = base64Encode('SGVsbG8=');
    expect(meta).not.toBe('SGVsbG8=');
    expect(base64Decode(meta)).toBe('SGVsbG8=');
  });

  it('handles newlines embedded in input', () => {
    const multiline = 'line 1\nline 2\nline 3';
    expect(base64Decode(base64Encode(multiline))).toBe(multiline);
  });

  it('handles a string of only whitespace', () => {
    expect(base64Decode(base64Encode('   \t\n'))).toBe('   \t\n');
  });

  it('handles Base64 strings that contain + and / characters', () => {
    // "+/8=" is valid Base64 containing both + and /; decoding and re-encoding should roundtrip
    const withPlusSlash = 'aGVsbG8+d29ybGQv'; // "hello>world/"
    const decoded = base64Decode(withPlusSlash);
    expect(decoded).toBe('hello>world/');
    expect(base64Encode(decoded)).toBe(withPlusSlash);
  });
});
