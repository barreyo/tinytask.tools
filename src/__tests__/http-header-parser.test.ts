import { describe, expect, it } from 'vitest';
import { parseHeaders, HEADER_EXPLANATIONS } from '../lib/http-header-parser';

// ── parseHeaders — basic cases ────────────────────────────────────────────────

describe('parseHeaders', () => {
  it('returns empty array for empty input', () => {
    expect(parseHeaders('')).toEqual([]);
    expect(parseHeaders('   ')).toEqual([]);
    expect(parseHeaders('\n\n')).toEqual([]);
  });

  it('parses a single header', () => {
    const result = parseHeaders('Content-Type: application/json');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Content-Type');
    expect(result[0].value).toBe('application/json');
  });

  it('parses multiple headers', () => {
    const raw = [
      'Content-Type: text/html; charset=utf-8',
      'Cache-Control: no-cache',
      'X-Frame-Options: DENY',
    ].join('\n');
    const result = parseHeaders(raw);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Content-Type');
    expect(result[1].name).toBe('Cache-Control');
    expect(result[2].name).toBe('X-Frame-Options');
  });

  it('trims whitespace from name and value', () => {
    const result = parseHeaders('Content-Type :  text/plain  ');
    expect(result[0].name).toBe('Content-Type');
    expect(result[0].value).toBe('text/plain');
  });

  it('preserves colons in the value (only first colon splits)', () => {
    const result = parseHeaders('Location: https://example.com/path?foo=bar');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Location');
    expect(result[0].value).toBe('https://example.com/path?foo=bar');
  });

  it('strips HTTP/1.1 status line', () => {
    const raw = 'HTTP/1.1 200 OK\nContent-Type: text/html';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Content-Type');
  });

  it('strips HTTP/2 status line', () => {
    const raw = 'HTTP/2 404 Not Found\nContent-Type: application/json';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Content-Type');
  });

  it('strips HTTP request line', () => {
    const raw = 'GET /api/data HTTP/1.1\nHost: example.com\nAccept: application/json';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Host');
  });

  it('strips POST request line', () => {
    const raw = 'POST /submit HTTP/1.1\nContent-Type: application/json\nContent-Length: 42';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(2);
  });

  it('skips blank lines', () => {
    const raw = 'Content-Type: text/html\n\nCache-Control: no-cache\n';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(2);
  });

  it('skips lines with no colon', () => {
    const raw = 'not-a-header\nContent-Type: text/html';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Content-Type');
  });

  it('handles CRLF line endings', () => {
    const raw = 'Content-Type: text/html\r\nCache-Control: no-cache\r\n';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Content-Type');
    expect(result[1].name).toBe('Cache-Control');
  });

  it('handles RFC 7230 header folding (continuation lines)', () => {
    const raw = 'Set-Cookie: session=abc;\n  HttpOnly;\n  Secure';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Set-Cookie');
    expect(result[0].value).toContain('HttpOnly');
    expect(result[0].value).toContain('Secure');
  });

  it('handles tab-continuation lines (RFC 7230 folding)', () => {
    const raw = 'Accept:\tapplication/json,\n\ttext/html';
    const result = parseHeaders(raw);
    expect(result).toHaveLength(1);
    expect(result[0].value).toContain('application/json');
    expect(result[0].value).toContain('text/html');
  });
});

// ── parseHeaders — explanation lookup ─────────────────────────────────────────

describe('parseHeaders — explanation lookup', () => {
  it('attaches explanation for known headers', () => {
    const result = parseHeaders('Cache-Control: no-cache');
    expect(result[0].explanation).toBeDefined();
    expect(typeof result[0].explanation).toBe('string');
    expect(result[0].explanation!.length).toBeGreaterThan(0);
  });

  it('explanation lookup is case-insensitive', () => {
    const lower = parseHeaders('cache-control: no-cache');
    const upper = parseHeaders('CACHE-CONTROL: no-cache');
    const mixed = parseHeaders('Cache-Control: no-cache');
    expect(lower[0].explanation).toBe(upper[0].explanation);
    expect(lower[0].explanation).toBe(mixed[0].explanation);
  });

  it('returns undefined explanation for unknown headers', () => {
    const result = parseHeaders('X-Custom-App-Header: some-value');
    expect(result[0].explanation).toBeUndefined();
  });

  it('attaches explanation for Content-Type', () => {
    const result = parseHeaders('Content-Type: application/json');
    expect(result[0].explanation).toBeDefined();
  });

  it('attaches explanation for Strict-Transport-Security', () => {
    const result = parseHeaders('Strict-Transport-Security: max-age=31536000');
    expect(result[0].explanation).toBeDefined();
  });

  it('attaches explanation for X-Frame-Options', () => {
    const result = parseHeaders('X-Frame-Options: DENY');
    expect(result[0].explanation).toBeDefined();
  });

  it('attaches explanation for Access-Control-Allow-Origin', () => {
    const result = parseHeaders('Access-Control-Allow-Origin: *');
    expect(result[0].explanation).toBeDefined();
  });
});

// ── parseHeaders — realistic inputs ──────────────────────────────────────────

describe('parseHeaders — realistic inputs', () => {
  it('parses a typical HTTP/1.1 response block', () => {
    const raw = [
      'HTTP/1.1 200 OK',
      'Date: Mon, 07 Apr 2026 12:00:00 GMT',
      'Content-Type: application/json; charset=utf-8',
      'Content-Length: 512',
      'Cache-Control: no-store',
      'X-Request-Id: abc-123',
    ].join('\n');
    const result = parseHeaders(raw);
    expect(result).toHaveLength(5);
    const names = result.map((h) => h.name);
    expect(names).toContain('Content-Type');
    expect(names).toContain('Cache-Control');
    expect(names).toContain('X-Request-Id');
  });

  it('parses a typical security header block', () => {
    const raw = [
      'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      'Content-Security-Policy: default-src \'self\'',
      'X-Frame-Options: SAMEORIGIN',
      'X-Content-Type-Options: nosniff',
      'Referrer-Policy: strict-origin-when-cross-origin',
    ].join('\n');
    const result = parseHeaders(raw);
    expect(result).toHaveLength(5);
    result.forEach((h) => {
      expect(h.explanation).toBeDefined();
    });
  });
});

// ── HEADER_EXPLANATIONS ───────────────────────────────────────────────────────

describe('HEADER_EXPLANATIONS', () => {
  it('all keys are lowercase', () => {
    for (const key of Object.keys(HEADER_EXPLANATIONS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it('all values are non-empty strings', () => {
    for (const [key, value] of Object.entries(HEADER_EXPLANATIONS)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0, `Explanation for "${key}" is empty`);
    }
  });

  it('covers the most important headers', () => {
    const required = [
      'cache-control',
      'content-type',
      'content-length',
      'authorization',
      'set-cookie',
      'strict-transport-security',
      'x-frame-options',
      'content-security-policy',
      'access-control-allow-origin',
      'etag',
      'location',
      'vary',
    ];
    for (const header of required) {
      expect(HEADER_EXPLANATIONS).toHaveProperty(header);
    }
  });
});
