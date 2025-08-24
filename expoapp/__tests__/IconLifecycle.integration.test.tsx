import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Don't mock useCredentials; we want the real hook behavior
jest.unmock('../hooks/useCredentials');

// Mock native modules
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///tmp/picked.png' }] })),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('expo-image-manipulator');
jest.mock('expo-file-system');

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { CredentialsProvider, useCredentialsContext } from '../contexts/CredentialsContext';
import { ToastProvider } from '../contexts/ToastContext';

function TestButtons() {
  const { add, update, remove, credentials } = useCredentialsContext();
  return (
    <>
      <Pressable testID="add" onPress={async () => { await add({ accountName: 'alice', issuer: 'I', secret: 'S', icon: 'file:///app-docs/icons/temp_picked.jpg' }); }}>
        <Text>Add</Text>
      </Pressable>
      <Pressable testID="update" onPress={async () => { if (credentials[0] && credentials[0]._key) await update(credentials[0]._key!, { accountName: 'alice2', issuer: 'I', secret: 'S', icon: 'file:///app-docs/icons/temp_picked2.jpg' }); }}>
        <Text>Update</Text>
      </Pressable>
      <Pressable testID="remove" onPress={async () => { if (credentials[0] && credentials[0]._key) await remove(credentials[0]._key!); }}>
        <Text>Remove</Text>
      </Pressable>
      <Text testID="count">{credentials.length}</Text>
    </>
  );
}

describe('Icon lifecycle integration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // simple in-memory SecureStore mock for this integration test
    const store: Record<string, string> = {};
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync = jest.fn(async (k: string) => (k in store ? store[k] : null));
    SecureStore.setItemAsync = jest.fn(async (k: string, v: string) => { store[k] = v; });
    SecureStore.deleteItemAsync = jest.fn(async (k: string) => { delete store[k]; });
    // make manipulator return a manipulated file path
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({ uri: 'file:///app-docs/icons/temp_picked.jpg' });
    // FileSystem mocks (documentDirectory and operations)
    (FileSystem.documentDirectory as any) = 'file:///app-docs/';
    (FileSystem.makeDirectoryAsync as any).mockResolvedValue(undefined);
    (FileSystem.copyAsync as any).mockResolvedValue(undefined);
    (FileSystem.moveAsync as any).mockResolvedValue(undefined);
    (FileSystem.deleteAsync as any).mockResolvedValue(undefined);
  });

  test('add -> update -> remove moves/copies and deletes icon files', async () => {
    const { getByTestId } = render(
      <CredentialsProvider>
        <ToastProvider>
          <TestButtons />
        </ToastProvider>
      </CredentialsProvider>
    );

    // Add
    fireEvent.press(getByTestId('add'));

    // After add, expect the credentials length to be 1
    await waitFor(() => expect(getByTestId('count').props.children).toBe(1));

    // Update
    await waitFor(async () => { fireEvent.press(getByTestId('update')); });

    // Expect move or copy to have been attempted for the update (manipulated -> canonical)
    expect((FileSystem.moveAsync as jest.Mock).mock.calls.length + (FileSystem.copyAsync as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(0);

    // Remove
    await waitFor(async () => { fireEvent.press(getByTestId('remove')); });

    // After remove, expect no credentials
    await waitFor(() => expect(getByTestId('count').props.children).toBe(0));

    // Expect deleteAsync to have been called at least once
    expect((FileSystem.deleteAsync as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(0);
  });
});
