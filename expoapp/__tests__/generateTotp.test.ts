import { generateTotp } from '../utils/generateTotp';
import crypto from 'node:crypto';

function base32ToBytes(base32: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0;
  const out: number[] = [];
  base32 = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function generateReference(secret: string, period = 30, digits = 6, timeSeconds?: number) {
  const key = base32ToBytes(secret);
  const t = Math.floor((typeof timeSeconds === 'number' ? timeSeconds : Math.floor(Date.now() / 1000)) / period);
  const counterBuf = Buffer.alloc(8);
  // Use BigInt write to avoid 32-bit shift issues in JavaScript
  counterBuf.writeBigUInt64BE(BigInt(t));
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, '0');
}

test('generateTotp matches reference implementation', () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const ts = 1697790000; // fixed timestamp
  const expected = generateReference(secret, 30, 6, ts);
  const actual = generateTotp(secret, 30, 6, ts);
  expect(actual).toBe(expected);
});
