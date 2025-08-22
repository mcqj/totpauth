import { Text, Pressable } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../tests/utils';

// Register this mock before importing modules that use it so Jest will
// apply the mock when the module is evaluated (Jest hoists top-level
// jest.mock calls). Keep the mock above any imports of the module-under-test.
// Register this mock before importing modules that use it so Jest will
jest.mock('../hooks/useCredentials');
// Use Jest's requireMock to synchronously access the mocked module (avoids
// runtime import() and keeps ES-style code without using CommonJS require()).
const mockUseCredentials = jest.requireMock('../hooks/useCredentials').default as jest.Mock;

import { CredentialsProvider, useCredentialsContext } from '../contexts/CredentialsContext';

function TestConsumer() {
  const { credentials, add } = useCredentialsContext();

  return (
    <>
      {credentials.map((c) => (
        <Text key={c._key} testID={`item-${c._key}`}>
          {c.accountName}
        </Text>
      ))}
      <Pressable
        testID="add-one"
        onPress={() => {
          add({ accountName: 'bob', issuer: 'Ex', secret: 'S' }).catch(() => {});
        }}
      >
        <Text>Add</Text>
      </Pressable>
    </>
  );
}

describe('CredentialsProvider optimistic add', () => {
  beforeEach(() => {
    mockUseCredentials.mockReset();
  });

  test('optimistically adds item and keeps it on success', async () => {
    const mockAdd = jest.fn().mockResolvedValue('real_k');
    const externalCreds = Object.freeze([]);
    const providerMock = {
      credentials: externalCreds,
      loading: false,
      add: mockAdd,
      remove: jest.fn(),
      reload: jest.fn(),
    } as const;
    mockUseCredentials.mockImplementation(() => providerMock as any);

  const { queryByText, getByTestId } = renderWithProviders(<TestConsumer />);

    expect(queryByText('bob')).toBeNull();
    fireEvent.press(getByTestId('add-one'));

    // optimistic item should appear immediately (temp key prefixed with tmp_)
    await waitFor(() => {
      const found = queryByText('bob');
      expect(found).toBeTruthy();
    });

    expect(mockAdd).toHaveBeenCalled();
  });
});
