import { Text, Pressable } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../tests/utils';

// Mock the underlying hook so we can control add/remove behavior.
// Register this mock before importing modules that use it so Jest will
// apply the mock when the module is evaluated (Jest hoists top-level
// jest.mock calls). Keep the mock above any imports of the module-under-test.
// Register this mock before importing modules that use it so Jest will
// apply the mock when the module is evaluated (Jest hoists top-level
// jest.mock calls). Keep the mock above any imports of the module-under-test.
jest.mock('../hooks/useCredentials');
// Use Jest's requireMock to synchronously access the mocked module (avoids
// runtime import() and keeps ES-style code without using CommonJS require()).
const mockUseCredentials = jest.requireMock('../hooks/useCredentials').default as jest.Mock;

import { CredentialsProvider, useCredentialsContext } from '../contexts/CredentialsContext';

function TestConsumer() {
  const { credentials, remove } = useCredentialsContext();

  return (
    <>
      {credentials.map((c) => (
        <Text key={c._key} testID={`item-${c._key}`}>
          {c.accountName}
        </Text>
      ))}
      <Pressable
        testID="delete-first"
        onPress={() => {
          if (credentials.length > 0)
            // swallow error from remove so test can assert rollback
            remove(credentials[0]._key!).catch(() => {});
        }}
      >
        <Text>Delete</Text>
      </Pressable>
    </>
  );
}

describe('CredentialsProvider optimistic remove', () => {
  beforeEach(() => {
    mockUseCredentials.mockReset();
  });

  test('optimistically removes item and keeps removed on success', async () => {
    const mockRemove = jest.fn().mockResolvedValue(undefined);
    // Provide a stable externalCreds reference so CredentialsProvider's
    // useEffect doesn't detect a new array on every render and loop.
    const externalCreds = Object.freeze([
      { _key: 'k1', accountName: 'alice', issuer: 'Ex', secret: 'S' },
    ]);
    const providerMock = {
      credentials: externalCreds,
      loading: false,
      add: jest.fn(),
      remove: mockRemove,
      reload: jest.fn(),
    } as const;
    mockUseCredentials.mockImplementation(() => providerMock as any);

  const { queryByText, getByTestId } = renderWithProviders(<TestConsumer />);

    // initial item present
    expect(queryByText('alice')).toBeTruthy();

    // Press delete -> optimistic removal should hide item immediately
    fireEvent.press(getByTestId('delete-first'));
    expect(queryByText('alice')).toBeNull();

    // Underlying remove should have been called with the key
    expect(mockRemove).toHaveBeenCalledWith('k1');
  });

  test('optimistically removes item but rolls back on failure', async () => {
    const mockRemove = jest.fn().mockRejectedValue(new Error('boom'));
    const externalCreds = Object.freeze([
      { _key: 'k1', accountName: 'alice', issuer: 'Ex', secret: 'S' },
    ]);
    const providerMock = {
      credentials: externalCreds,
      loading: false,
      add: jest.fn(),
      remove: mockRemove,
      reload: jest.fn(),
    } as const;
    mockUseCredentials.mockImplementation(() => providerMock as any);

    const { queryByText, getByTestId, getByText } = render(
      <CredentialsProvider>
        <TestConsumer />
      </CredentialsProvider>
    );

    // initial item present
    expect(queryByText('alice')).toBeTruthy();

    // Press delete -> optimistic removal should hide item immediately
    fireEvent.press(getByTestId('delete-first'));
    expect(queryByText('alice')).toBeNull();

    // Wait for the rollback to occur after the rejected promise
    await waitFor(() => {
      expect(getByText('alice')).toBeTruthy();
    });

    expect(mockRemove).toHaveBeenCalledWith('k1');
  });
});
