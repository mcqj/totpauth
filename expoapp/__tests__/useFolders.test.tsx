import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import useFolders from '../hooks/useFolders';

// Mock the folderStore so we control async behavior
jest.mock('../utils/folderStore', () => {
  let store: any[] = [{ _key: 'a', name: 'A' }];
  return {
    loadFolders: jest.fn(async () => store.slice()),
    addFolder: jest.fn(async (f: any) => {
      const key = `k_${Date.now()}`;
      store = [{ ...f, _key: key }, ...store];
      return key;
    }),
    updateFolder: jest.fn(async (key: string, f: any) => {
      store = store.map((s) => (s._key === key ? { ...f, _key: key } : s));
      return key;
    }),
    deleteFolder: jest.fn(async (key: string) => {
      store = store.filter((s) => s._key !== key);
    }),
    __internal: {
      _setStore: (s: any[]) => (store = s.slice()),
    },
  };
});

describe('useFolders hook', () => {
  test('initial load and stable references', async () => {
    let hookResult: any = null;

    function TestComponent() {
      hookResult = useFolders();
      return null;
    }

    const { unmount } = render(<TestComponent />);

    // Wait for load effect to complete
    await waitFor(() => {
      if (!hookResult) throw new Error('hook not initialized yet');
      if (hookResult.loading) throw new Error('still loading');
      return true;
    });

    expect(hookResult.loading).toBe(false);
    const firstFolders = hookResult.folders;
    expect(Array.isArray(firstFolders)).toBe(true);

    // Capture references
    const firstAdd = hookResult.add;
    const firstReload = hookResult.reload;

    // Call reload and wait for it to complete
    await act(async () => {
      await hookResult.reload();
    });

    // After reload, references should be stable (since useMemo is used)
    expect(hookResult.add).toBe(firstAdd);
    expect(hookResult.reload).toBe(firstReload);

    unmount();
  });
});
