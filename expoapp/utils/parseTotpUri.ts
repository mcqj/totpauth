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
    const rest = uri.slice('otpauth://totp/'.length);
    const querySeparator = rest.indexOf('?');
    if (querySeparator < 0) return null;

    const label = rest.slice(0, querySeparator);
    const queryString = rest.slice(querySeparator + 1);
    if (!label || !queryString) return null;

    // Label: issuer:account or just account
    let issuer: string | undefined;
    let accountName = label;
    const issuerSeparator = label.indexOf(':');
    if (issuerSeparator >= 0) {
      issuer = label.slice(0, issuerSeparator);
      accountName = label.slice(issuerSeparator + 1);
    }

    // URL-decode the label parts
    if (issuer) issuer = decodeURIComponent(issuer);
    accountName = decodeURIComponent(accountName);

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
