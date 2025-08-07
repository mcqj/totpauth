import CryptoJS from 'crypto-js';

/**
 * Generate a TOTP code (RFC 6238) using crypto-js.
 * @param {string} secret - The base32-encoded secret.
 * @param {number} [period=30] - The time step in seconds.
 * @param {number} [digits=6] - Number of digits in the code.
 * @returns {string} The TOTP code.
 */
export function generateTotp(secret: string, period = 30, digits = 6): string {
  // Robust base32 decode
  function base32ToBytes(base32: string): number[] {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0, value = 0, index = 0;
    const output = [];
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
    return output;
  }

  const keyBytes = base32ToBytes(secret);
  const key = CryptoJS.lib.WordArray.create(keyBytes);
  // Time counter
  const counter = Math.floor(Date.now() / 1000 / period);


  // Big-endian encoding (RFC 6238)
  const counterBytes = new Array(8).fill(0);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = (counter >> (8 * i)) & 0xff;
  }
  const counterWordArray = CryptoJS.lib.WordArray.create(counterBytes, 8);
  // HMAC-SHA1
  const hmac = CryptoJS.HmacSHA1(counterWordArray, key);
  // Convert hmac to byte array
  const hmacHex = hmac.toString(CryptoJS.enc.Hex);
  const hmacBytes = [];
  for (let i = 0; i < hmacHex.length; i += 2) {
    hmacBytes.push(parseInt(hmacHex.substr(i, 2), 16));
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
