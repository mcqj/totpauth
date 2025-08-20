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
 * Allowed characters: letters, numbers, space, underscore.
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
    const ok = /^[A-Za-z0-9 _@]+$/.test(normalized);
    if (!ok) errors.push('Only letters, numbers, spaces and underscore are allowed.');
    if (normalized.length > maxLength) errors.push(`Too long; max ${maxLength} characters.`);
  }

  return { valid: errors.length === 0, normalized: errors.length === 0 ? normalized : undefined, errors };
}
