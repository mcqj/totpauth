export type LabelValidationResult = {
  valid: boolean;
  normalized?: string;
  errors: string[];
};

export function normalizeLabel(raw: string): string {
  return (raw || '').trim();
}

/**
 * Validate a label (account name or issuer).
 * Labels may contain any printable characters so valid authenticator URI labels
 * such as email addresses, URLs, and international names are preserved.
 */
export function validateLabel(raw: string, opts?: { required?: boolean; maxLength?: number }): LabelValidationResult {
  const errors: string[] = [];
  const maxLength = opts?.maxLength ?? 64;
  const normalized = normalizeLabel(raw);

  if (opts?.required && !normalized) {
    errors.push('Account name is required.');
    return { valid: false, errors };
  }

  if (normalized) {
    const hasControlCharacters = /[\u0000-\u001F\u007F-\u009F]/.test(normalized);
    if (hasControlCharacters) errors.push('Labels cannot contain control characters.');
    if (normalized.length > maxLength) errors.push(`Too long; max ${maxLength} characters.`);
  }

  return { valid: errors.length === 0, normalized: errors.length === 0 ? normalized : undefined, errors };
}
