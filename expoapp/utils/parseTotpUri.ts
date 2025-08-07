/**
 * Parses a TOTP otpauth URI and extracts secret, issuer, and account name.
 * Returns null if invalid or missing required fields.
 */
export type ParsedTotpCredential = {
  secret: string;
  issuer?: string;
  accountName: string;
};

export function parseTotpUri(uri: string): ParsedTotpCredential | null {
  if (!uri.startsWith('otpauth://totp/')) return null;
  try {
    // Remove otpauth://totp/
    const rest = uri.replace('otpauth://totp/', '');
    // Split label and query
    const [label, queryString] = rest.split('?');
    if (!label || !queryString) return null;
    // Label: issuer:account or just account
    let issuer: string | undefined;
    let accountName = label;
    if (label.includes(':')) {
      [issuer, accountName] = label.split(':');
    }
    // Parse query params
    const params = Object.fromEntries(new URLSearchParams(queryString));
    const secret = params['secret'];
    if (!secret) return null;
    // Prefer issuer from query param
    if (params['issuer']) issuer = params['issuer'];
    return { secret, issuer, accountName };
  } catch {
    return null;
  }
}
