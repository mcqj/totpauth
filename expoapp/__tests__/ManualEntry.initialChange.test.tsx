import { render } from '@testing-library/react-native';
import { CredentialsProvider } from '../contexts/CredentialsContext';
import { ToastProvider } from '../contexts/ToastContext';
import ManualEntry from '../components/ManualEntry';

describe('ManualEntry initial prop updates', () => {
  test('form fields update when initial prop changes', () => {
    const onSave = jest.fn();

    const initialA = { accountName: 'alice@example.com', issuer: 'Example', secret: 'JBSWY3DPEHPK3PXP' };
    const initialB = { accountName: 'bob@example.com', issuer: 'Other', secret: 'JBSWY3DPEHPK3PXA' };

    const { getByPlaceholderText, rerender } = render(
      <CredentialsProvider>
        <ToastProvider>
          <ManualEntry onSave={onSave} initial={initialA} />
        </ToastProvider>
      </CredentialsProvider>
    );

    const accountInput = getByPlaceholderText('Account Name');
    const issuerInput = getByPlaceholderText('Issuer (optional)');
    const secretInput = getByPlaceholderText('Secret');

    expect(accountInput.props.value).toBe(initialA.accountName);
    expect(issuerInput.props.value).toBe(initialA.issuer);
    expect(secretInput.props.value).toBe(initialA.secret);

    // Rerender with different initial values
    rerender(
      <CredentialsProvider>
        <ToastProvider>
          <ManualEntry onSave={onSave} initial={initialB} />
        </ToastProvider>
      </CredentialsProvider>
    );

    expect(accountInput.props.value).toBe(initialB.accountName);
    expect(issuerInput.props.value).toBe(initialB.issuer);
    // secret input should also update
    expect(secretInput.props.value).toBe(initialB.secret);
  });
});
