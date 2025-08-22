import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../tests/utils';

jest.mock('../hooks/useCredentials');
const mockUseCredentials = require('../hooks/useCredentials').default as jest.Mock;

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
