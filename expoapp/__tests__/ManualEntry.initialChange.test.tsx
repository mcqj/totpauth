import { render } from '@testing-library/react-native';
import ManualEntry from '../components/ManualEntry';

// Mock the toast context to avoid animations/timers interfering with test timing.
jest.mock('../contexts/ToastContext', () => ({
  ToastProvider: ({ children }: any) => children,
  useToast: () => ({ show: jest.fn() }),
}));

// Mock the folders context
jest.mock('../contexts/FoldersContext', () => ({
  FoldersProvider: ({ children }: any) => children,
  useFoldersContext: () => ({
    folders: [],
    loading: false,
    add: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    reload: jest.fn(),
  }),
}));

describe('ManualEntry initial prop updates', () => {
  test('form fields update when initial prop changes', () => {
    const onSave = jest.fn();

    const initialA = { accountName: 'alice@example.com', issuer: 'Example', secret: 'JBSWY3DPEHPK3PXP' };
    const initialB = { accountName: 'bob@example.com', issuer: 'Other', secret: 'JBSWY3DPEHPK3PXA' };

    const { getByPlaceholderText, rerender } = render(
      <ManualEntry onSave={onSave} initial={initialA} />
    );

    expect(getByPlaceholderText('Account Name').props.value).toBe(initialA.accountName);
    expect(getByPlaceholderText('Issuer (optional)').props.value).toBe(initialA.issuer);
    expect(getByPlaceholderText('Secret').props.value).toBe(initialA.secret);

    // Rerender with different initial values
    rerender(
      <ManualEntry onSave={onSave} initial={initialB} />
    );

    expect(getByPlaceholderText('Account Name').props.value).toBe(initialB.accountName);
    expect(getByPlaceholderText('Issuer (optional)').props.value).toBe(initialB.issuer);
    // secret input should also update
    expect(getByPlaceholderText('Secret').props.value).toBe(initialB.secret);
  });
});
