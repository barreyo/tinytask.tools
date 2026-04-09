import { describe, it, expect } from 'vitest';
import { generateJwk, computeThumbprint, pemToJwk } from '../lib/jwk-generator';

describe('computeThumbprint', () => {
  it('computes consistent thumbprint for the same RSA public key', async () => {
    // RFC 7638 example from the spec
    const jwk: JsonWebKey = {
      kty: 'RSA',
      n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
      e: 'AQAB',
    };
    const thumbprint = await computeThumbprint(jwk);
    // Known value from RFC 7638
    expect(thumbprint).toBe('NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs');
  });

  it('computes a thumbprint for an EC key', async () => {
    const jwk: JsonWebKey = {
      kty: 'EC',
      crv: 'P-256',
      x: 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU',
      y: 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0',
    };
    const thumbprint = await computeThumbprint(jwk);
    expect(typeof thumbprint).toBe('string');
    expect(thumbprint.length).toBeGreaterThan(0);
    // base64url characters only
    expect(thumbprint).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('generateJwk', () => {
  it('generates RSA 2048 JWK pair', async () => {
    const pair = await generateJwk({ algorithm: 'RSA', modulusLength: 2048, usage: 'sign' });
    expect(pair.publicJwk.kty).toBe('RSA');
    expect(pair.privateJwk.kty).toBe('RSA');
    const pubKid = (pair.publicJwk as Record<string, unknown>).kid;
    const privKid = (pair.privateJwk as Record<string, unknown>).kid;
    expect(pubKid).toBe(privKid);
    expect(pubKid).toBe(pair.thumbprint);
    // Private key should have d component, public should not
    expect(pair.privateJwk.d).toBeDefined();
    expect(pair.publicJwk.d).toBeUndefined();
  }, 10000);

  it('generates EC P-256 JWK pair for signing', async () => {
    const pair = await generateJwk({ algorithm: 'EC', curve: 'P-256', usage: 'sign' });
    expect(pair.publicJwk.kty).toBe('EC');
    expect(pair.publicJwk.crv).toBe('P-256');
    expect(pair.privateJwk.d).toBeDefined();
    expect(pair.publicJwk.d).toBeUndefined();
  }, 5000);

  it('generates EC P-384 JWK pair for encryption (ECDH)', async () => {
    const pair = await generateJwk({ algorithm: 'EC', curve: 'P-384', usage: 'encrypt' });
    expect(pair.publicJwk.kty).toBe('EC');
    expect(pair.publicJwk.crv).toBe('P-384');
  }, 5000);

  it('generates Ed25519 JWK pair', async () => {
    const pair = await generateJwk({ algorithm: 'EdDSA', usage: 'sign' });
    expect(pair.publicJwk.kty).toBe('OKP');
    expect(pair.publicJwk.crv).toBe('Ed25519');
    expect(pair.privateJwk.d).toBeDefined();
    expect(pair.publicJwk.d).toBeUndefined();
  }, 5000);

  it('assigns matching kid to both keys', async () => {
    const pair = await generateJwk({ algorithm: 'EC', curve: 'P-256', usage: 'sign' });
    const pubKid = (pair.publicJwk as Record<string, unknown>).kid;
    const privKid = (pair.privateJwk as Record<string, unknown>).kid;
    expect(pubKid).toBeDefined();
    expect(pubKid).toBe(privKid);
  }, 5000);
});

describe('pemToJwk', () => {
  it('throws on invalid PEM input', async () => {
    await expect(pemToJwk('not-a-pem', 'public')).rejects.toThrow();
  });

  it('throws on empty input', async () => {
    await expect(pemToJwk('', 'public')).rejects.toThrow();
  });
});
