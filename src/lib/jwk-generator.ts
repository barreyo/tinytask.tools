export type JwkAlgorithm = 'RSA' | 'EC' | 'EdDSA';
export type KeyUsageMode = 'sign' | 'encrypt';
export type EcCurve = 'P-256' | 'P-384' | 'P-521';
export type RsaModulusLength = 2048 | 4096;

export interface JwkGenOptions {
  algorithm: JwkAlgorithm;
  modulusLength?: RsaModulusLength;
  curve?: EcCurve;
  usage: KeyUsageMode;
}

export interface JwkPair {
  publicJwk: JsonWebKey;
  privateJwk: JsonWebKey;
  thumbprint: string;
}

function getSubtleParams(
  opts: JwkGenOptions,
): RsaHashedKeyGenParams | EcKeyGenParams | KeyAlgorithm {
  if (opts.algorithm === 'RSA') {
    const hashAlgo = opts.usage === 'encrypt' ? 'SHA-256' : 'SHA-256';
    const rsaAlgo = opts.usage === 'encrypt' ? 'RSA-OAEP' : 'RSASSA-PKCS1-v1_5';
    return {
      name: rsaAlgo,
      modulusLength: opts.modulusLength ?? 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: hashAlgo,
    } as RsaHashedKeyGenParams;
  }

  if (opts.algorithm === 'EC') {
    return {
      name: opts.usage === 'encrypt' ? 'ECDH' : 'ECDSA',
      namedCurve: opts.curve ?? 'P-256',
    } as EcKeyGenParams;
  }

  // EdDSA (Ed25519) — sign only
  return { name: 'Ed25519' } as KeyAlgorithm;
}

function getKeyUsages(opts: JwkGenOptions): KeyUsage[] {
  if (opts.algorithm === 'EdDSA') return ['sign', 'verify'];
  if (opts.algorithm === 'EC' && opts.usage === 'encrypt') return ['deriveKey', 'deriveBits'];
  if (opts.usage === 'encrypt') return ['encrypt', 'decrypt'];
  return ['sign', 'verify'];
}

export async function generateJwk(opts: JwkGenOptions): Promise<JwkPair> {
  const params = getSubtleParams(opts);
  const usages = getKeyUsages(opts);

  const keyPair = (await crypto.subtle.generateKey(params, true, usages)) as CryptoKeyPair;

  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const thumbprint = await computeThumbprint(publicJwk);

  (publicJwk as Record<string, unknown>).kid = thumbprint;
  (privateJwk as Record<string, unknown>).kid = thumbprint;

  return { publicJwk, privateJwk, thumbprint };
}

export async function pemToJwk(pem: string, type: 'public' | 'private'): Promise<JsonWebKey> {
  const stripped = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');

  const binary = atob(stripped);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }

  const format = type === 'public' ? 'spki' : 'pkcs8';

  // Try RSA algorithms
  const rsaAlgos: RsaHashedImportParams[] = [
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    { name: 'RSA-PSS', hash: 'SHA-256' },
    { name: 'RSA-OAEP', hash: 'SHA-256' },
  ];

  for (const algo of rsaAlgos) {
    try {
      const usages: KeyUsage[] =
        type === 'public'
          ? algo.name === 'RSA-OAEP'
            ? ['encrypt']
            : ['verify']
          : algo.name === 'RSA-OAEP'
            ? ['decrypt']
            : ['sign'];
      const key = await crypto.subtle.importKey(format, buf.buffer, algo, true, usages);
      return await crypto.subtle.exportKey('jwk', key);
    } catch {
      // try next
    }
  }

  // Try EC algorithms
  const ecCurves: EcKeyImportParams[] = [
    { name: 'ECDSA', namedCurve: 'P-256' },
    { name: 'ECDSA', namedCurve: 'P-384' },
    { name: 'ECDSA', namedCurve: 'P-521' },
    { name: 'ECDH', namedCurve: 'P-256' },
  ];

  for (const algo of ecCurves) {
    try {
      const usages: KeyUsage[] =
        type === 'public'
          ? algo.name === 'ECDH'
            ? []
            : ['verify']
          : algo.name === 'ECDH'
            ? ['deriveKey', 'deriveBits']
            : ['sign'];
      const key = await crypto.subtle.importKey(format, buf.buffer, algo, true, usages);
      return await crypto.subtle.exportKey('jwk', key);
    } catch {
      // try next
    }
  }

  // Try Ed25519
  try {
    const usages: KeyUsage[] = type === 'public' ? ['verify'] : ['sign'];
    const key = await crypto.subtle.importKey(
      format,
      buf.buffer,
      { name: 'Ed25519' },
      true,
      usages,
    );
    return await crypto.subtle.exportKey('jwk', key);
  } catch {
    // fall through
  }

  throw new Error(
    'Could not import PEM key. Ensure it is a valid RSA, EC (P-256/P-384/P-521), or Ed25519 key in PEM format.',
  );
}

export async function computeThumbprint(jwk: JsonWebKey): Promise<string> {
  // RFC 7638 — serialize required members in lexicographic order, SHA-256
  let canonical: Record<string, unknown>;

  if (jwk.kty === 'RSA') {
    canonical = { e: jwk.e, kty: jwk.kty, n: jwk.n };
  } else if (jwk.kty === 'EC') {
    canonical = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
  } else if (jwk.kty === 'OKP') {
    canonical = { crv: jwk.crv, kty: jwk.kty, x: jwk.x };
  } else {
    canonical = { k: jwk.k, kty: jwk.kty };
  }

  const json = JSON.stringify(canonical);
  const encoded = new TextEncoder().encode(json);
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
  return base64url(new Uint8Array(hashBuf));
}

function base64url(buf: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buf));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
