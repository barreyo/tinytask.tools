// ── AAGUID Database ───────────────────────────────────────────────────────────
// Sourced from https://github.com/passkeydeveloper/passkey-authenticator-aaguids
// Last updated: April 2026

export interface AaguidEntry {
  name: string;
  iconDark?: string;
  iconLight?: string;
}

export interface AaguidResult {
  found: boolean;
  name: string;
  aaguid: string;
}

const AAGUID_DB: Record<string, AaguidEntry> = {
  // Apple
  'adce0002-35bc-c60a-648b-0b25f1f05503': { name: 'Chrome on Mac with Touch ID' },
  'fbefdf68-fe86-0106-213e-4d5fa24cbe2e': { name: 'iCloud Keychain (macOS)' },
  '00000000-0000-0000-0000-000000000000': { name: 'Unknown / None' },
  'f8a011f3-8c0a-4d15-8006-17111f9edc7d': { name: 'Security Key by Yubico' },
  'fa2b99dc-9e39-4257-8f92-4a30d23c4118': { name: 'YubiKey 5 Series with NFC' },
  '2fc0579f-8113-47ea-b116-bb5a8db9202a': { name: 'YubiKey 5Ci' },
  '73bb0cd4-e502-49b8-9c6f-b59445bf720b': { name: 'YubiKey 5 FIPS Series' },
  'c1f9a0bc-1dd2-404a-b27f-8e29047a43fd': { name: 'YubiKey 5 FIPS Series with NFC' },
  'a4e9fc6d-4cbe-4758-b8ba-37598bb5bbaa': { name: 'YubiKey 5C NFC FIPS' },
  'c5ef55ff-ad9a-4b9f-b580-adebafe026d0': { name: 'YubiKey 5Ci FIPS' },
  '85203421-48f9-4355-9bc8-8a53846e5083': { name: 'YubiKey 5 NFC FIPS (Enterprise)' },
  '1d8764f5-d640-4c1a-bda5-3f0d5d1f1f6f': { name: 'YubiKey BIO' },
  'b84e4048-15dc-4dd0-8640-f4f60813c8af': { name: 'YubiKey BIO – Multi-protocol Edition' },
  '6d44ba9b-f6ec-2e49-b930-0c8fe920cb73': { name: 'Security Key NFC by Yubico' },
  '149a2021-8ef6-4133-96b8-81f8d5b7f1f5': {
    name: 'Security Key NFC by Yubico – Enterprise Edition',
  },
  '34f5766d-1536-4a24-9033-0e294e510fb0': { name: 'YubiKey 5 Series (Enterprise)' },
  '2ffd6452-01da-471f-821b-ea4bf6c8676a': { name: 'YubiKey 5Ci (Enterprise)' },
  '83c47309-aabb-4108-8470-8be838b573cb': {
    name: 'YubiKey Bio Series – Multi-protocol Edition (Enterprise)',
  },

  // Google
  'b93fd961-f2e6-462f-b122-82002247de78': {
    name: 'Android Authenticator with SafetyNet Attestation',
  },
  'ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4': { name: 'Google Password Manager' },
  '42b4fb4a-2866-43b2-9bf7-6c6669c2e5d3': { name: 'Google Titan Security Key v2' },
  '0d9b2e56-566b-c393-2940-f821b7f15d6a': { name: 'Google Titan Security Key (USB-A/NFC)' },

  // Microsoft
  '9ddd1817-af5a-4672-a2b9-3e3dd95000a9': { name: 'Windows Hello' },
  '08987058-cadc-4b81-b6e1-30de50dcbe96': { name: 'Windows Hello (software)' },
  '6028b017-b1d4-4c02-b4b3-afcdafc96bb2': { name: 'Windows Hello (VBS)' },
  'dd4ec289-e01d-41c9-bb89-70fa845d4bf2': { name: 'Windows Hello for Business (Attestation)' },
  'd821a7d4-e97c-4cb6-bd82-4237731fd4be': { name: 'Enpass' },
  'b5397666-4885-aa6b-cebf-e52262a439a2': { name: 'Chromium Browser' },

  // 1Password
  'bada5566-a7aa-401f-bd96-45619a55120d': { name: '1Password' },
  'd548826e-79b4-db40-a3d8-11116f7e8349': { name: '1Password' },

  // Dashlane
  'fdb141b2-5d84-443e-8a35-4698c205a502': { name: 'Dashlane' },

  // Okta
  'e1a96183-5016-4f24-b55b-e3ae23614cc6': { name: 'Okta Verify' },
  '3e078ffd-4c54-4586-8baa-a77da113aec5': { name: 'Okta Verify (FIDO2)' },

  // LastPass
  'b6867e0e-ba0e-4b47-bdb0-4a3a9b04e5f3': { name: 'LastPass' },

  // Feitian
  '12ded745-4bed-47d4-abaa-e713f51d6393': { name: 'Feitian ePass FIDO' },
  '3e22415d-7fdf-4ea4-8a0c-dd60c4249b9d': { name: 'Feitian ePass FIDO2-NFC' },
  'b6ede29c-3772-412c-8a78-539c1f4c62d2': { name: 'Feitian BioPass FIDO2 K26' },
  '6f350e4a-2b40-4e30-a26e-52de4ffa3974': { name: 'Feitian BioPass FIDO2 K27' },

  // Ledger
  '34523e41-554b-4f96-8e03-bb2de6a51793': { name: 'Ledger Nano X' },
  '116acbef-3147-4095-bc39-81f68b1bcc8e': { name: 'Ledger Nano S Plus' },

  // HID
  'c80dbd9a-533f-4a17-b941-1a2f1c7cedff': { name: 'HID Crescendo Key' },
  '54d9fee8-e621-4291-8b18-8157b21e50f3': { name: 'HID Crescendo Card' },

  // Thales
  'd91c5288-0ef0-49b7-b8ae-21ca0aa6b3f3': { name: 'Thales Bio USB NFC' },
  'b50d5e0a-7f81-4959-9b12-f45407407503': { name: 'Thales FIDO2 USB NFC' },

  // Kensington
  'c317b7e4-134b-4e17-a294-b0b83fb33ea8': { name: 'Kensington VeriMark' },
  'ec31b5ed-5e0a-4958-8580-a87cd19e1d24': { name: 'Kensington VeriMark Guard' },

  // Hideez
  '4e768f2c-5fab-48b3-b300-220eb487752b': { name: 'Hideez Key 3' },
  'd7a423ad-3e19-4492-9200-78137dccc136': { name: 'Hideez Key 4' },

  // Identiv
  '820d89ed-d65a-409e-85cb-f73f0578f82a': { name: 'Identiv uTrust FIDO2 NFC+' },
  '9f0d8150-baa5-4c00-9299-ad62c9bb6d4c': { name: 'Identiv uTrust FIDO2 USB' },

  // AuthenTrend
  '39a5647e-1853-446c-a1f6-a79bae9f5bc7': { name: 'AuthenTrend ATKey.Pro USB-A' },
  'a1f52be5-dfab-4364-b51c-2bd496b14a56': { name: 'AuthenTrend ATKey.Pro USB-C' },

  // Swissbit
  'a3975549-7358-4b0a-8612-44e68b463d28': { name: 'Swissbit iShield Key Pro' },

  // Android platform
  '3aa02b48-a02b-4a10-9ee6-4bcb5a60a71a': { name: 'Android Authenticator (StrongBox)' },
};

export function lookupAaguid(aaguid: string): AaguidResult {
  const normalized = aaguid.toLowerCase().replace(/[^0-9a-f-]/g, '');

  // Ensure canonical format with hyphens: 8-4-4-4-12
  const hex = normalized.replace(/-/g, '');
  const canonical =
    hex.length === 32
      ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      : normalized;

  const entry = AAGUID_DB[canonical];
  return {
    found: !!entry,
    name: entry?.name ?? 'Unknown authenticator',
    aaguid: canonical,
  };
}

// ── Base64URL helpers ─────────────────────────────────────────────────────────

export function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function bytesToBase64url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function bytesToUuid(bytes: Uint8Array): string {
  const h = bytesToHex(bytes);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ── ClientDataJSON decoder ────────────────────────────────────────────────────

export interface ClientData {
  type: string;
  challenge: string;
  challengeDecoded: string;
  origin: string;
  crossOrigin?: boolean;
  tokenBinding?: { status: string; id?: string };
  raw: unknown;
}

export function decodeClientDataJson(base64url: string): ClientData {
  const bytes = base64urlToBytes(base64url.trim());
  const text = new TextDecoder().decode(bytes);
  const raw = JSON.parse(text) as Record<string, unknown>;

  const challenge = String(raw['challenge'] ?? '');
  let challengeDecoded = '';
  try {
    challengeDecoded = new TextDecoder().decode(base64urlToBytes(challenge));
  } catch {
    challengeDecoded = challenge;
  }

  return {
    type: String(raw['type'] ?? ''),
    challenge,
    challengeDecoded,
    origin: String(raw['origin'] ?? ''),
    crossOrigin: typeof raw['crossOrigin'] === 'boolean' ? raw['crossOrigin'] : undefined,
    tokenBinding:
      raw['tokenBinding'] != null
        ? (raw['tokenBinding'] as { status: string; id?: string })
        : undefined,
    raw,
  };
}

// ── Minimal CBOR decoder ──────────────────────────────────────────────────────
// Handles: uint, negint, bytestr, textstr, array, map, bool, null, simple

export function decodeCbor(buffer: ArrayBuffer): unknown {
  const view = new DataView(buffer);
  const { value } = decodeCborValue(view, 0);
  return value;
}

function decodeCborValue(view: DataView, offset: number): { value: unknown; offset: number } {
  if (offset >= view.byteLength) throw new Error('CBOR: unexpected end of data');

  const initialByte = view.getUint8(offset);
  offset++;
  const majorType = initialByte >> 5;
  const additionalInfo = initialByte & 0x1f;

  let argument: number | bigint;
  if (additionalInfo <= 23) {
    argument = additionalInfo;
  } else if (additionalInfo === 24) {
    argument = view.getUint8(offset);
    offset++;
  } else if (additionalInfo === 25) {
    argument = view.getUint16(offset, false);
    offset += 2;
  } else if (additionalInfo === 26) {
    argument = view.getUint32(offset, false);
    offset += 4;
  } else if (additionalInfo === 27) {
    argument = view.getBigUint64(offset, false);
    offset += 8;
  } else if (additionalInfo === 31) {
    argument = -1; // indefinite length
  } else {
    throw new Error(`CBOR: unsupported additional info ${additionalInfo}`);
  }

  const len = typeof argument === 'bigint' ? Number(argument) : argument;

  switch (majorType) {
    case 0: // unsigned int
      return { value: len, offset };

    case 1: // negative int
      return { value: -1 - len, offset };

    case 2: {
      // byte string
      const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, len);
      return { value: bytes.slice(), offset: offset + len };
    }

    case 3: {
      // text string
      const bytes = new Uint8Array(view.buffer, view.byteOffset + offset, len);
      return { value: new TextDecoder().decode(bytes), offset: offset + len };
    }

    case 4: {
      // array
      const arr: unknown[] = [];
      for (let i = 0; i < len; i++) {
        const item = decodeCborValue(view, offset);
        arr.push(item.value);
        offset = item.offset;
      }
      return { value: arr, offset };
    }

    case 5: {
      // map
      const map: Record<string | number, unknown> = {};
      for (let i = 0; i < len; i++) {
        const k = decodeCborValue(view, offset);
        offset = k.offset;
        const v = decodeCborValue(view, offset);
        offset = v.offset;
        map[k.value as string | number] = v.value;
      }
      return { value: map, offset };
    }

    case 7: // float / simple
      if (additionalInfo === 20) return { value: false, offset };
      if (additionalInfo === 21) return { value: true, offset };
      if (additionalInfo === 22) return { value: null, offset };
      if (additionalInfo === 23) return { value: undefined, offset };
      if (additionalInfo === 25) {
        // float16 — approximate
        const half = view.getUint16(offset - 2, false);
        const exp = (half >> 10) & 0x1f;
        const mant = half & 0x3ff;
        let val: number;
        if (exp === 0) val = mant * 5.960464477539063e-8;
        else if (exp === 31) val = mant ? NaN : Infinity;
        else val = (1 + mant / 1024) * Math.pow(2, exp - 15);
        return { value: half & 0x8000 ? -val : val, offset };
      }
      if (additionalInfo === 26) {
        const val = view.getFloat32(offset - 4, false);
        return { value: val, offset };
      }
      if (additionalInfo === 27) {
        const val = view.getFloat64(offset - 8, false);
        return { value: val, offset };
      }
      return { value: undefined, offset };

    default:
      throw new Error(`CBOR: unsupported major type ${majorType}`);
  }
}

// ── AuthData parser ───────────────────────────────────────────────────────────

export interface AuthDataFlags {
  userPresent: boolean;
  userVerified: boolean;
  backupEligible: boolean;
  backedUp: boolean;
  attestedCredentialData: boolean;
  extensionData: boolean;
  raw: number;
}

export interface CosePublicKey {
  kty?: number;
  alg?: number;
  crv?: number;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
}

export interface AttestedCredentialData {
  aaguid: string;
  aaguidResult: AaguidResult;
  credentialId: string;
  credentialIdLength: number;
  publicKey: CosePublicKey;
  publicKeyRaw: unknown;
}

export interface AuthData {
  rpIdHash: string;
  flags: AuthDataFlags;
  signCount: number;
  attestedCredentialData: AttestedCredentialData | null;
  extensionsRaw: unknown | null;
  totalBytes: number;
}

const COSE_KEY_TYPE: Record<number, string> = {
  1: 'OKP',
  2: 'EC2',
  3: 'RSA',
  4: 'Symmetric',
};

const COSE_ALG: Record<number, string> = {
  [-7]: 'ES256 (ECDSA w/ SHA-256)',
  [-8]: 'EdDSA',
  [-35]: 'ES384',
  [-36]: 'ES512',
  [-257]: 'RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)',
  [-258]: 'RS384',
  [-259]: 'RS512',
  [-37]: 'PS256',
  [-38]: 'PS384',
  [-39]: 'PS512',
};

const COSE_CRV: Record<number, string> = {
  1: 'P-256',
  2: 'P-384',
  3: 'P-521',
  4: 'X25519',
  5: 'X448',
  6: 'Ed25519',
  7: 'Ed448',
};

export function getCoseAlgName(alg: number): string {
  return COSE_ALG[alg] ?? `Unknown (${alg})`;
}

export function getCoseKtyName(kty: number): string {
  return COSE_KEY_TYPE[kty] ?? `Unknown (${kty})`;
}

export function getCoseCrvName(crv: number): string {
  return COSE_CRV[crv] ?? `Unknown (${crv})`;
}

function parseAttestedCredentialData(
  bytes: Uint8Array,
  offset: number,
): { data: AttestedCredentialData; bytesConsumed: number } {
  const start = offset;

  // AAGUID: 16 bytes
  const aaguidBytes = bytes.slice(offset, offset + 16);
  offset += 16;
  const aaguid = bytesToUuid(aaguidBytes);
  const aaguidResult = lookupAaguid(aaguid);

  // Credential ID length: 2 bytes big-endian
  const credIdLen = (bytes[offset] << 8) | bytes[offset + 1];
  offset += 2;

  // Credential ID: credIdLen bytes
  const credIdBytes = bytes.slice(offset, offset + credIdLen);
  offset += credIdLen;
  const credentialId = bytesToBase64url(credIdBytes);

  // Public key: CBOR map (rest of atCredData)
  const pkBytes = bytes.slice(offset);
  const pkDecoded = decodeCbor(
    pkBytes.buffer.slice(pkBytes.byteOffset, pkBytes.byteOffset + pkBytes.byteLength),
  ) as Record<number, unknown>;

  // Determine how many bytes the CBOR consumed by re-encoding offset tracking
  // Use the CBOR decoder's offset return
  const pkView = new DataView(pkBytes.buffer, pkBytes.byteOffset, pkBytes.byteLength);
  const { offset: cborEnd } = decodeCborValue(pkView, 0);
  offset += cborEnd;

  const cosePk: CosePublicKey = {};
  if (pkDecoded) {
    if (typeof pkDecoded[1] === 'number') cosePk.kty = pkDecoded[1];
    if (typeof pkDecoded[3] === 'number') cosePk.alg = pkDecoded[3];
    if (typeof pkDecoded[-1] === 'number') cosePk.crv = pkDecoded[-1];
    if (pkDecoded[-2] instanceof Uint8Array) cosePk.x = bytesToHex(pkDecoded[-2]);
    if (pkDecoded[-3] instanceof Uint8Array) cosePk.y = bytesToHex(pkDecoded[-3]);
    if (pkDecoded[-1] instanceof Uint8Array) cosePk.n = bytesToHex(pkDecoded[-1]);
    if (pkDecoded[-2] instanceof Uint8Array && cosePk.n == null)
      cosePk.x = bytesToHex(pkDecoded[-2] as Uint8Array);
    // RSA exponent
    if (pkDecoded[-2] instanceof Uint8Array && pkDecoded[-1] instanceof Uint8Array) {
      cosePk.n = bytesToHex(pkDecoded[-1] as Uint8Array);
      cosePk.e = bytesToHex(pkDecoded[-2] as Uint8Array);
    }
  }

  return {
    data: {
      aaguid,
      aaguidResult,
      credentialId,
      credentialIdLength: credIdLen,
      publicKey: cosePk,
      publicKeyRaw: pkDecoded,
    },
    bytesConsumed: offset - start,
  };
}

export function parseAuthData(bytes: Uint8Array): AuthData {
  let offset = 0;

  // rpIdHash: 32 bytes
  const rpIdHash = bytesToHex(bytes.slice(0, 32));
  offset += 32;

  // Flags: 1 byte
  const flagsByte = bytes[offset];
  offset++;
  const flags: AuthDataFlags = {
    userPresent: !!(flagsByte & 0x01),
    userVerified: !!(flagsByte & 0x04),
    backupEligible: !!(flagsByte & 0x08),
    backedUp: !!(flagsByte & 0x10),
    attestedCredentialData: !!(flagsByte & 0x40),
    extensionData: !!(flagsByte & 0x80),
    raw: flagsByte,
  };

  // Sign count: 4 bytes big-endian
  const signCount =
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0;
  offset += 4;

  // Attested credential data (optional, present when AT flag set)
  let attestedCredentialData: AttestedCredentialData | null = null;
  if (flags.attestedCredentialData && offset < bytes.length) {
    try {
      const { data, bytesConsumed } = parseAttestedCredentialData(bytes, offset);
      attestedCredentialData = data;
      offset += bytesConsumed;
    } catch {
      // Parsing failed — leave as null
    }
  }

  // Extensions (optional)
  let extensionsRaw: unknown = null;
  if (flags.extensionData && offset < bytes.length) {
    try {
      const extBytes = bytes.slice(offset);
      extensionsRaw = decodeCbor(
        extBytes.buffer.slice(extBytes.byteOffset, extBytes.byteOffset + extBytes.byteLength),
      );
    } catch {
      // Ignore
    }
  }

  return {
    rpIdHash,
    flags,
    signCount,
    attestedCredentialData,
    extensionsRaw,
    totalBytes: bytes.length,
  };
}

// ── AttestationObject decoder ─────────────────────────────────────────────────

export interface AttestationObject {
  fmt: string;
  authData: AuthData;
  attStmt: unknown;
  authDataRaw: Uint8Array;
}

export function decodeAttestationObject(base64url: string): AttestationObject {
  const bytes = base64urlToBytes(base64url.trim());
  const decoded = decodeCbor(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  ) as Record<string, unknown>;

  const fmt = String(decoded['fmt'] ?? 'unknown');
  const attStmt = decoded['attStmt'] ?? {};
  const authDataRaw =
    decoded['authData'] instanceof Uint8Array ? decoded['authData'] : new Uint8Array(0);
  const authData = parseAuthData(authDataRaw);

  return { fmt, authData, attStmt, authDataRaw };
}

// ── PublicKeyCredential JSON decoder ──────────────────────────────────────────

export type CredentialType = 'registration' | 'assertion' | 'unknown';

export interface DecodedCredential {
  type: CredentialType;
  id: string;
  clientData: ClientData | null;
  attestationObject: AttestationObject | null;
  authenticatorData: AuthData | null;
  signature: string | null;
  userHandle: string | null;
  error: string | null;
}

export function decodePublicKeyCredential(jsonText: string): DecodedCredential {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return {
      type: 'unknown',
      id: '',
      clientData: null,
      attestationObject: null,
      authenticatorData: null,
      signature: null,
      userHandle: null,
      error: 'Invalid JSON — paste the full PublicKeyCredential object.',
    };
  }

  const id = String(raw['id'] ?? raw['rawId'] ?? '');
  const response = (raw['response'] ?? {}) as Record<string, unknown>;

  // Detect type: registration has attestationObject, assertion has authenticatorData + signature
  const hasAttestation = 'attestationObject' in response;
  const hasAssertion = 'authenticatorData' in response && 'signature' in response;
  const type: CredentialType = hasAttestation
    ? 'registration'
    : hasAssertion
      ? 'assertion'
      : 'unknown';

  let clientData: ClientData | null = null;
  try {
    const cdjRaw = String(response['clientDataJSON'] ?? '');
    if (cdjRaw) clientData = decodeClientDataJson(cdjRaw);
  } catch {
    // leave null
  }

  let attestationObject: AttestationObject | null = null;
  let authenticatorData: AuthData | null = null;
  let signature: string | null = null;
  let userHandle: string | null = null;

  if (type === 'registration') {
    try {
      const aoRaw = String(response['attestationObject'] ?? '');
      if (aoRaw) attestationObject = decodeAttestationObject(aoRaw);
    } catch {
      // leave null
    }
  }

  if (type === 'assertion') {
    try {
      const adRaw = String(response['authenticatorData'] ?? '');
      if (adRaw) {
        const bytes = base64urlToBytes(adRaw);
        authenticatorData = parseAuthData(bytes);
      }
    } catch {
      // leave null
    }

    try {
      const sigRaw = String(response['signature'] ?? '');
      if (sigRaw) signature = bytesToHex(base64urlToBytes(sigRaw));
    } catch {
      // leave null
    }

    try {
      const uhRaw = response['userHandle'];
      if (uhRaw) userHandle = bytesToBase64url(base64urlToBytes(String(uhRaw)));
    } catch {
      // leave null
    }
  }

  return {
    type,
    id,
    clientData,
    attestationObject,
    authenticatorData,
    signature,
    userHandle,
    error: null,
  };
}
