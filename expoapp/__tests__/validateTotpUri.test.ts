import { parseTotpUri } from '../utils/parseTotpUri';
import { validateTotpUri } from '../utils/validateTotpUri';

const secret = 'JBSWY3DPEHPK3PXP';

describe('TOTP URI parsing', () => {
  it('accepts valid account labels containing URL and email characters', () => {
    const result = validateTotpUri(
      `otpauth://totp/Acme%20Inc:jane.doe%2Btag%40example.com?secret=${secret}&issuer=Acme%20Inc`,
    );

    expect(result.valid).toBe(true);
    expect(result.parsed).toEqual({
      secret,
      issuer: 'Acme Inc',
      accountName: 'jane.doe+tag@example.com',
    });
  });

  it('decodes label characters once and preserves colons in account names', () => {
    const result = parseTotpUri(
      `otpauth://totp/Acme%20%25%20Inc:user%3A%20%E7%94%B2?secret=${secret}&issuer=Acme%20%25%20Inc`,
    );

    expect(result).toEqual({
      secret,
      issuer: 'Acme % Inc',
      accountName: 'user: 甲',
    });
  });

  it('accepts a question mark in a query parameter value', () => {
    const result = parseTotpUri(
      `otpauth://totp/account?secret=${secret}&issuer=Acme%3FInc`,
    );

    expect(result).toEqual({
      secret,
      issuer: 'Acme?Inc',
      accountName: 'account',
    });
  });
});
