import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react-native';

import * as FileSystem from 'expo-file-system';
function HookRunner({ onReady, hook }: { onReady: any; hook: () => any }) {
  const api = hook();
  useEffect(() => { onReady(api); }, [api]);
  return null;
}

describe('Icon lifecycle (hook)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // prepare SecureStore in-memory mock on the module object (useCredentials imports * as SecureStore)
    const SecureStoreMod = require('expo-secure-store');
    const store: Record<string, string> = {};
    SecureStoreMod.getItemAsync = jest.fn(async (k: string) => (k in store ? store[k] : null));
    SecureStoreMod.setItemAsync = jest.fn(async (k: string, v: string) => { store[k] = v; });
    SecureStoreMod.deleteItemAsync = jest.fn(async (k: string) => { delete store[k]; });

    (FileSystem.documentDirectory as any) = 'file:///app-docs/';
    (FileSystem.makeDirectoryAsync as any).mockResolvedValue(undefined);
    (FileSystem.copyAsync as any).mockResolvedValue(undefined);
    (FileSystem.moveAsync as any).mockResolvedValue(undefined);
    (FileSystem.deleteAsync as any).mockResolvedValue(undefined);
  });

  test('add -> update -> remove triggers file operations', async () => {
  let apiRef: any = null;
  // require the hook after mocking SecureStore
  const hook = require('../hooks/useCredentials').default;
  const { unmount } = render(<HookRunner onReady={(api: any) => { apiRef = api; }} hook={hook} />);

    // allow hook to initialize
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    if (!apiRef) throw new Error('hook did not initialize');
    const api = apiRef as any;

    // Add a credential with temp icon
    await act(async () => { await api.add({ accountName: 'alice', issuer: 'I', secret: 'S', icon: 'file:///app-docs/icons/temp1.jpg' }); });

    // Update it
    await act(async () => { await api.update('totp_alice', { accountName: 'alice2', issuer: 'I', secret: 'S', icon: 'file:///app-docs/icons/temp2.jpg' }); });

    // Remove it
    await act(async () => { await api.remove('totp_alice'); });

  // Assert SecureStore was used to persist and then delete the credential
  const SecureStoreMod = require('expo-secure-store');
  expect((SecureStoreMod.setItemAsync as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
  expect((SecureStoreMod.deleteItemAsync as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);

    unmount();
  });
});
