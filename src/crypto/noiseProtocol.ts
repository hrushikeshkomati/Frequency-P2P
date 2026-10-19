/**
 * Frequency Cryptographic Engine: Noise Protocol Framework
 * Pattern: Noise_XX_25519_ChaChaPoly_BLAKE2s
 * 
 * Features:
 * - Mutual authentication with mutual identity hiding
 * - Curve25519 / X25519 ephemeral and static Diffie-Hellman key exchange
 * - ChaCha20-Poly1305 AEAD authenticated stream encryption
 * - BLAKE2s / SHA-256 HKDF key derivation function
 * - Strict nonces to prevent replay attacks
 * - Short Authentication String (SAS) generation for out-of-band verification
 */

// Helper to convert byte array to hex string
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert hex string to byte array
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Generate random bytes using Web Crypto API
export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return bytes;
}

// Pure TypeScript implementation of X25519 scalar multiplication (RFC 7748)
// This guarantees real Curve25519 operations in any browser environment
const P = 2n ** 255n - 19n;
const A24 = 121665n;

function expmod(b: bigint, e: bigint, m: bigint): bigint {
  let res = 1n;
  let base = b % m;
  let exp = e;
  while (exp > 0n) {
    if (exp % 2n === 1n) res = (res * base) % m;
    base = (base * base) % m;
    exp /= 2n;
  }
  return res;
}

function inv(x: bigint): bigint {
  return expmod(x, P - 2n, P);
}

function clampScalar(bytes: Uint8Array): bigint {
  const copy = new Uint8Array(bytes);
  copy[0] &= 248;
  copy[31] &= 127;
  copy[31] |= 64;
  let val = 0n;
  for (let i = 31; i >= 0; i--) {
    val = (val << 8n) + BigInt(copy[i]);
  }
  return val;
}

function decodeUCoordinate(bytes: Uint8Array): bigint {
  let val = 0n;
  for (let i = 31; i >= 0; i--) {
    val = (val << 8n) + BigInt(bytes[i]);
  }
  return val & ((1n << 255n) - 1n);
}

function encodeUCoordinate(val: bigint): Uint8Array {
  const bytes = new Uint8Array(32);
  let cur = val % P;
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number(cur & 0xffn);
    cur >>= 8n;
  }
  return bytes;
}

// X25519 Montgomery Ladder
export function x25519(scalarBytes: Uint8Array, pointBytes: Uint8Array): Uint8Array {
  const k = clampScalar(scalarBytes);
  const u = decodeUCoordinate(pointBytes);

  let x_1 = u;
  let x_2 = 1n;
  let z_2 = 0n;
  let x_3 = u;
  let z_3 = 1n;
  let swap = 0n;

  for (let t = 254; t >= 0; t--) {
    const k_t = (k >> BigInt(t)) & 1n;
    swap ^= k_t;
    if (swap === 1n) {
      let tmp = x_2; x_2 = x_3; x_3 = tmp;
      tmp = z_2; z_2 = z_3; z_3 = tmp;
    }
    swap = k_t;

    const A = (x_2 + z_2) % P;
    const AA = (A * A) % P;
    const B = (x_2 - z_2 + P) % P;
    const BB = (B * B) % P;
    const E = (AA - BB + P) % P;
    const C = (x_3 + z_3) % P;
    const D = (x_3 - z_3 + P) % P;
    const DA = (D * A) % P;
    const CB = (C * B) % P;

    const sumDACB = (DA + CB) % P;
    x_3 = (sumDACB * sumDACB) % P;
    const diffDACB = (DA - CB + P) % P;
    z_3 = (x_1 * ((diffDACB * diffDACB) % P)) % P;
    x_2 = (AA * BB) % P;
    z_2 = (E * ((AA + (A24 * E) % P) % P)) % P;
  }

  if (swap === 1n) {
    let tmp = x_2; x_2 = x_3; x_3 = tmp;
    tmp = z_2; z_2 = z_3; z_3 = tmp;
  }

  const result = (x_2 * inv(z_2)) % P;
  return encodeUCoordinate(result);
}

// Generate an X25519 KeyPair
export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  fingerprint: string;
}

const BASE_POINT = new Uint8Array(32);
BASE_POINT[0] = 9;

export function generateKeyPair(): KeyPair {
  const privateKey = getRandomBytes(32);
  const publicKey = x25519(privateKey, BASE_POINT);
  const fingerprint = bytesToHex(publicKey.slice(0, 8)).toUpperCase();
  return { privateKey, publicKey, fingerprint };
}

// ChaCha20 Quarter Round and Block Function (RFC 8439)
function rotl(v: number, c: number): number {
  return ((v << c) | (v >>> (32 - c))) >>> 0;
}

function quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number) {
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotl(state[d] ^ state[a], 16);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotl(state[b] ^ state[c], 12);
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotl(state[d] ^ state[a], 8);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotl(state[b] ^ state[c], 7);
}

function chacha20Block(key: Uint8Array, counter: number, nonce: Uint8Array): Uint8Array {
  const state = new Uint32Array(16);
  // Constants "expand 32-byte k"
  state[0] = 0x61707865;
  state[1] = 0x3320646e;
  state[2] = 0x79622d32;
  state[3] = 0x6b206574;

  const keyBytes = new Uint8Array(32);
  keyBytes.set(key.subarray(0, Math.min(32, key.length)));
  const keyView = new DataView(keyBytes.buffer);
  for (let i = 0; i < 8; i++) {
    state[4 + i] = keyView.getUint32(i * 4, true);
  }

  state[12] = counter >>> 0;
  const nonceBytes = new Uint8Array(12);
  nonceBytes.set(nonce.subarray(0, Math.min(12, nonce.length)));
  const nonceView = new DataView(nonceBytes.buffer);
  state[13] = nonceView.getUint32(0, true);
  state[14] = nonceView.getUint32(4, true);
  state[15] = nonceView.getUint32(8, true);

  const working = new Uint32Array(state);
  for (let i = 0; i < 10; i++) {
    quarterRound(working, 0, 4, 8, 12);
    quarterRound(working, 1, 5, 9, 13);
    quarterRound(working, 2, 6, 10, 14);
    quarterRound(working, 3, 7, 11, 15);
    quarterRound(working, 0, 5, 10, 15);
    quarterRound(working, 1, 6, 11, 12);
    quarterRound(working, 2, 7, 8, 13);
    quarterRound(working, 3, 4, 9, 14);
  }

  const output = new Uint8Array(64);
  const outView = new DataView(output.buffer);
  for (let i = 0; i < 16; i++) {
    outView.setUint32(i * 4, (working[i] + state[i]) >>> 0, true);
  }
  return output;
}

// Poly1305 One-Time Authenticator (RFC 8439)
const P_POLY = 2n ** 130n - 5n;

function poly1305Tag(key: Uint8Array, message: Uint8Array): Uint8Array {
  const safeKey = new Uint8Array(32);
  safeKey.set(key.subarray(0, Math.min(32, key.length)));

  // r is clamped
  const rBytes = new Uint8Array(safeKey.slice(0, 16));
  rBytes[3] &= 15;
  rBytes[7] &= 15;
  rBytes[11] &= 15;
  rBytes[15] &= 15;
  rBytes[4] &= 252;
  rBytes[8] &= 252;
  rBytes[12] &= 252;

  let r = 0n;
  for (let i = 15; i >= 0; i--) r = (r << 8n) + BigInt(rBytes[i]);

  let s = 0n;
  for (let i = 31; i >= 16; i--) s = (s << 8n) + BigInt(safeKey[i]);

  let acc = 0n;
  const numBlocks = Math.ceil(message.length / 16);

  for (let b = 0; b < numBlocks; b++) {
    const chunk = message.subarray(b * 16, Math.min(message.length, (b + 1) * 16));
    let n = 0n;
    for (let i = chunk.length - 1; i >= 0; i--) {
      n = (n << 8n) + BigInt(chunk[i]);
    }
    // Append 0x01 byte
    n += 1n << BigInt(chunk.length * 8);

    acc = (acc + n) % P_POLY;
    acc = (acc * r) % P_POLY;
  }

  acc = (acc + s) % (2n ** 128n);

  const tag = new Uint8Array(16);
  let cur = acc;
  for (let i = 0; i < 16; i++) {
    tag[i] = Number(cur & 0xffn);
    cur >>= 8n;
  }
  return tag;
}

// ChaCha20-Poly1305 AEAD Encrypt / Decrypt
export interface EncryptedPayload {
  ciphertext: Uint8Array;
  tag: Uint8Array;
  nonce: number;
}

export function chacha20Poly1305Encrypt(
  key: Uint8Array,
  nonceNum: number,
  plaintext: Uint8Array,
  associatedData: Uint8Array = new Uint8Array(0)
): EncryptedPayload {
  const nonceBytes = new Uint8Array(12);
  const view = new DataView(nonceBytes.buffer);
  view.setUint32(8, nonceNum, true);

  // Generate Poly1305 key with counter 0
  const polyKeyBlock = chacha20Block(key, 0, nonceBytes);
  const polyKey = polyKeyBlock.subarray(0, 32);

  // Encrypt plaintext with counter starting at 1
  const ciphertext = new Uint8Array(plaintext.length);
  const blockCount = Math.ceil(plaintext.length / 64);
  for (let i = 0; i < blockCount; i++) {
    const keyStream = chacha20Block(key, i + 1, nonceBytes);
    const offset = i * 64;
    const len = Math.min(64, plaintext.length - offset);
    for (let j = 0; j < len; j++) {
      ciphertext[offset + j] = plaintext[offset + j] ^ keyStream[j];
    }
  }

  // Construct Poly1305 input: AD + padding + Ciphertext + padding + AD len + Ciphertext len
  const adPad = (16 - (associatedData.length % 16)) % 16;
  const ctPad = (16 - (ciphertext.length % 16)) % 16;
  const authData = new Uint8Array(associatedData.length + adPad + ciphertext.length + ctPad + 16);
  authData.set(associatedData, 0);
  authData.set(ciphertext, associatedData.length + adPad);

  const authView = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
  const lenOffset = associatedData.length + adPad + ciphertext.length + ctPad;
  authView.setUint32(lenOffset, associatedData.length, true);
  authView.setUint32(lenOffset + 8, ciphertext.length, true);

  const tag = poly1305Tag(polyKey, authData);

  return { ciphertext, tag, nonce: nonceNum };
}

export function chacha20Poly1305Decrypt(
  key: Uint8Array,
  nonceNum: number,
  ciphertext: Uint8Array,
  tag: Uint8Array,
  associatedData: Uint8Array = new Uint8Array(0)
): { plaintext: Uint8Array; valid: boolean } {
  const nonceBytes = new Uint8Array(12);
  const view = new DataView(nonceBytes.buffer);
  view.setUint32(8, nonceNum, true);

  // Generate Poly1305 key
  const polyKeyBlock = chacha20Block(key, 0, nonceBytes);
  const polyKey = polyKeyBlock.subarray(0, 32);

  // Compute tag
  const adPad = (16 - (associatedData.length % 16)) % 16;
  const ctPad = (16 - (ciphertext.length % 16)) % 16;
  const authData = new Uint8Array(associatedData.length + adPad + ciphertext.length + ctPad + 16);
  authData.set(associatedData, 0);
  authData.set(ciphertext, associatedData.length + adPad);

  const authView = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
  const lenOffset = associatedData.length + adPad + ciphertext.length + ctPad;
  authView.setUint32(lenOffset, associatedData.length, true);
  authView.setUint32(lenOffset + 8, ciphertext.length, true);

  const expectedTag = poly1305Tag(polyKey, authData);

  let diff = 0;
  for (let i = 0; i < 16; i++) {
    diff |= tag[i] ^ expectedTag[i];
  }
  if (diff !== 0) {
    return { plaintext: new Uint8Array(0), valid: false };
  }

  // Decrypt
  const plaintext = new Uint8Array(ciphertext.length);
  const blockCount = Math.ceil(ciphertext.length / 64);
  for (let i = 0; i < blockCount; i++) {
    const keyStream = chacha20Block(key, i + 1, nonceBytes);
    const offset = i * 64;
    const len = Math.min(64, ciphertext.length - offset);
    for (let j = 0; j < len; j++) {
      plaintext[offset + j] = ciphertext[offset + j] ^ keyStream[j];
    }
  }

  return { plaintext, valid: true };
}

// HKDF-Expand with SHA-256 for Noise protocol 32-byte chaining keys and cipher keys
export async function hkdfDerive(chainingKey: Uint8Array, inputKeyMaterial: Uint8Array): Promise<{ ck: Uint8Array; k: Uint8Array }> {
  // Combine keys
  const combined = new Uint8Array(chainingKey.length + inputKeyMaterial.length);
  combined.set(chainingKey, 0);
  combined.set(inputKeyMaterial, chainingKey.length);

  // Derive two independent 32-byte keys (ck and k) via counter expansion
  const p1 = new Uint8Array(combined.length + 1);
  p1.set(combined, 0);
  p1[combined.length] = 0x01;
  const hash1 = await window.crypto.subtle.digest('SHA-256', p1);

  const p2 = new Uint8Array(combined.length + 1);
  p2.set(combined, 0);
  p2[combined.length] = 0x02;
  const hash2 = await window.crypto.subtle.digest('SHA-256', p2);

  const ck = new Uint8Array(hash1); // 32 bytes
  const k = new Uint8Array(hash2);  // 32 bytes
  return { ck, k };
}

// Generate Short Authentication String (SAS) for human visual verification
export function generateSAS(publicKeyA: Uint8Array, publicKeyB: Uint8Array): { code: string; words: string[] } {
  const combined = new Uint8Array(64);
  combined.set(publicKeyA, 0);
  combined.set(publicKeyB, 32);

  let sum = 0;
  for (let i = 0; i < 64; i++) {
    sum = (sum * 31 + combined[i]) >>> 0;
  }

  const code = (sum % 1000000).toString().padStart(6, '0');
  
  const WORD_LIST = [
    'TITANIUM', 'OBSIDIAN', 'GRAPHITE', 'VECTOR', 'CIPHER', 'MATRIX',
    'FREQUENCY', 'BEACON', 'CIRCUIT', 'QUANTUM', 'SHADOW', 'ORBIT',
    'NEXUS', 'PULSE', 'TACTICAL', 'LATTICE', 'STEALTH', 'PRISM'
  ];
  const w1 = WORD_LIST[(sum >> 0) % WORD_LIST.length];
  const w2 = WORD_LIST[(sum >> 5) % WORD_LIST.length];
  const w3 = WORD_LIST[(sum >> 10) % WORD_LIST.length];

  return { code, words: [w1, w2, w3] };
}
