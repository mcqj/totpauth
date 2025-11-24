import CryptoJS from 'crypto-js';

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, index = 0;
  const output: number[] = [];
  base32 = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return Uint8Array.from(output);
}

/**
 * Generate a TOTP code (RFC 6238) using crypto-js.
 * @param {string} secret - The base32-encoded secret.
 * @param {number} [period=30] - The time step in seconds.
 * @param {number} [digits=6] - Number of digits in the code.
 * @returns {string} The TOTP code.
 */
export function generateTotp(secret: string, period = 30, digits = 6, timeSeconds?: number): string {
  const keyBytes = base32ToBytes(secret);
  // Convert bytes to words for CryptoJS
  const keyWords: number[] = [];
  for (let i = 0; i < keyBytes.length; i += 4) {
    const word = (keyBytes[i] << 24) | (keyBytes[i + 1] << 16) | (keyBytes[i + 2] << 8) | (keyBytes[i + 3] || 0);
    keyWords.push(word >>> 0); // Ensure unsigned 32-bit
  }
  const key = CryptoJS.lib.WordArray.create(keyWords, keyBytes.length);
  
  // Time counter
  const now = typeof timeSeconds === 'number' ? timeSeconds : Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / period);

  // Big-endian encoding (RFC 6238) - MSB at index 0
  const counterBytes = new Uint8Array(8);
  // Fill big-endian by repeatedly taking the lowest byte and dividing
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }
  // Convert counter bytes to words for CryptoJS
  const counterWords: number[] = [];
  for (let i = 0; i < 8; i += 4) {
    const word = (counterBytes[i] << 24) | (counterBytes[i + 1] << 16) | (counterBytes[i + 2] << 8) | (counterBytes[i + 3] || 0);
    counterWords.push(word >>> 0); // Ensure unsigned 32-bit
  }
  const counterWordArray = CryptoJS.lib.WordArray.create(counterWords, 8);
  // HMAC-SHA1
  const hmac = CryptoJS.HmacSHA1(counterWordArray, key);
  // Convert hmac to byte array
  const hmacHex = hmac.toString(CryptoJS.enc.Hex);
  const hmacBytes = [];
  for (let i = 0; i < hmacHex.length; i += 2) {
    hmacBytes.push(parseInt(hmacHex.substring(i, i + 2), 16));
  }
  // Dynamic truncation
  const offset = hmacBytes[19] & 0xf;
  const binCode =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);
  const otp = (binCode % Math.pow(10, digits)).toString().padStart(digits, '0');
  return otp;
}

export function generateTotpDebug(secret: string, period = 30, digits = 6, timeSeconds?: number) {
  const normalized = secret.replace(/\s+/g, '').toUpperCase();
  const now = typeof timeSeconds === 'number' ? timeSeconds : Math.floor(Date.now() / 1000);
  const keyBytes = base32ToBytes(normalized);
  // Convert bytes to words for CryptoJS
  const keyWords: number[] = [];
  for (let i = 0; i < keyBytes.length; i += 4) {
    const word = (keyBytes[i] << 24) | (keyBytes[i + 1] << 16) | (keyBytes[i + 2] << 8) | (keyBytes[i + 3] || 0);
    keyWords.push(word >>> 0); // Ensure unsigned 32-bit
  }
  const key = CryptoJS.lib.WordArray.create(keyWords, keyBytes.length);
  
  const counter = Math.floor(now / period);
  const counterBytes = new Uint8Array(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }
  // Convert counter bytes to words for CryptoJS
  const counterWords: number[] = [];
  for (let i = 0; i < 8; i += 4) {
    const word = (counterBytes[i] << 24) | (counterBytes[i + 1] << 16) | (counterBytes[i + 2] << 8) | (counterBytes[i + 3] || 0);
    counterWords.push(word >>> 0); // Ensure unsigned 32-bit
  }
  const counterWordArray = CryptoJS.lib.WordArray.create(counterWords, 8);
  const hmac = CryptoJS.HmacSHA1(counterWordArray, key);
  const hmacHex = hmac.toString(CryptoJS.enc.Hex);
  // compute offset and otp
  const hmacBytes: number[] = [];
  for (let i = 0; i < hmacHex.length; i += 2) {
    hmacBytes.push(parseInt(hmacHex.substring(i, i + 2), 16));
  }
  const offset = hmacBytes[19] & 0xf;
  const binCode =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);
  const otp = (binCode % Math.pow(10, digits)).toString().padStart(digits, '0');
  const keyHex = Array.from(keyBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const counterHex = Array.from(counterBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return {
    normalized,
    now,
    counter,
    counterHex,
    keyHex,
    hmacHex,
    offset,
    otp,
  };
}
