export type SecretValidationResult = {
  valid: boolean;
  normalized?: string;
  errors: string[];
};

/** Normalize secret (remove spaces/hyphens) and uppercase. */
export function normalizeSecret(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase();
}

function base32Regex(secret: string) {
  return /^[A-Z2-7]+=*$/;
}

/** Try a simple Base32 decode; returns null on failure. */
export function tryBase32Decode(secret: string): Uint8Array | null {
  const s = secret.replace(/=+$/, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const val = alphabet.indexOf(ch);
    if (val === -1) return null;

    buffer = (buffer << 5) | val;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      const byte = (buffer >> bitsLeft) & 0xff;
      bytes.push(byte);
    }
  }

  return new Uint8Array(bytes);
}

export function validateSecret(raw: string, opts?: { minLength?: number }): SecretValidationResult {
  const errors: string[] = [];
  const minLength = opts?.minLength ?? 16;
  const normalized = normalizeSecret(raw || '');

  if (!normalized) {
    errors.push('Secret is empty.');
    return { valid: false, errors, normalized };
  }

  if (!base32Regex(normalized)) {
    errors.push('Secret contains invalid characters. Use Base32 (A–Z, 2–7).');
  }

  const lengthNoPad = normalized.replace(/=+$/, '').length;
  if (lengthNoPad < minLength) {
    errors.push(`Secret is too short. Recommended at least ${minLength} Base32 characters.`);
  }

  const decoded = tryBase32Decode(normalized);
  if (decoded === null || decoded.length === 0) {
    errors.push('Secret does not appear to be valid Base32 (decode failed).');
  }

  return { valid: errors.length === 0, normalized, errors };
}
