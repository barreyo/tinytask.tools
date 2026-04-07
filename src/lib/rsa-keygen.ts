export type KeyUsageMode = 'encrypt' | 'sign';
export type ModulusLength = 2048 | 4096;
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface KeyPairResult {
  publicKeyPem: string;
  privateKeyPem: string;
  publicKeyFingerprint: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatPem(base64: string, label: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export async function generateRsaKeyPair(
  modulusLength: ModulusLength,
  hash: HashAlgorithm,
  usage: KeyUsageMode,
): Promise<KeyPairResult> {
  const algorithm =
    usage === 'encrypt'
      ? { name: 'RSA-OAEP', modulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash }
      : {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash,
        };

  const keyUsages: KeyUsage[] = usage === 'encrypt' ? ['encrypt', 'decrypt'] : ['sign', 'verify'];

  const keyPair = await crypto.subtle.generateKey(algorithm, true, keyUsages);

  const [publicKeyDer, privateKeyDer] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);

  const publicKeyBase64 = arrayBufferToBase64(publicKeyDer);
  const privateKeyBase64 = arrayBufferToBase64(privateKeyDer);

  const publicKeyPem = formatPem(publicKeyBase64, 'PUBLIC KEY');
  const privateKeyPem = formatPem(privateKeyBase64, 'PRIVATE KEY');

  // Compute SHA-256 fingerprint of the public key DER
  const fingerprintBuffer = await crypto.subtle.digest('SHA-256', publicKeyDer);
  const fingerprintBytes = new Uint8Array(fingerprintBuffer);
  const publicKeyFingerprint = Array.from(fingerprintBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':');

  return { publicKeyPem, privateKeyPem, publicKeyFingerprint };
}
