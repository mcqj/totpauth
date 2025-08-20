import { ParsedTotpCredential, parseTotpUri } from './parseTotpUri';
import { validateSecret } from './validateSecret';
import { validateLabel } from './validateLabel';

export type TotpValidationResult = {
  parsed: ParsedTotpCredential | null;
  valid: boolean;
  errors: string[];
};

/**
 * Validate an otpauth://totp/ URI using parseTotpUri and a few lightweight checks.
 * Returns a structured result: parsed data (when available), validity flag, and an array of errors.
 */
export function validateTotpUri(uri: string): TotpValidationResult {
  const errors: string[] = [];
  const parsed = parseTotpUri(uri);
  if (!parsed) {
    errors.push('Invalid otpauth URI format or missing required fields.');
    return { parsed: null, valid: false, errors };
  }

  const { secret, accountName } = parsed;

  // Reuse secret validation used by manual entry
  const secretValidation = validateSecret(secret);
  if (!secretValidation.valid) {
    errors.push(...secretValidation.errors);
    // If we normalized the secret, update parsed.secret so callers get the cleaned value
    if (secretValidation.normalized) parsed.secret = secretValidation.normalized;
  } else if (secretValidation.normalized) {
    parsed.secret = secretValidation.normalized;
  }

  // Validate account label and optionally issuer
  const accountValidation = validateLabel(accountName, { required: true });
  if (!accountValidation.valid) errors.push(...accountValidation.errors);

  // parseTotpUri may have set parsed.issuer
  if (parsed.issuer) {
    const issuerValidation = validateLabel(parsed.issuer, { required: false });
    if (!issuerValidation.valid) errors.push(...issuerValidation.errors);
    else if (issuerValidation.normalized) parsed.issuer = issuerValidation.normalized;
  }

  return { parsed, valid: errors.length === 0, errors };

  return { parsed, valid: errors.length === 0, errors };
}
