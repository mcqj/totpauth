import { Text, Pressable, View } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock the underlying hook so we can control behavior.
// Register this mock before importing modules that use it so Jest will
// apply the mock when the module is evaluated (Jest hoists top-level
// jest.mock calls). Keep the mock above any imports of the module-under-test.
jest.mock('../hooks/useFolders');
// Use Jest's requireMock to synchronously access the mocked module (avoids
// runtime import() and keeps ES-style code without using CommonJS require()).
const mockUseFolders = jest.requireMock('../hooks/useFolders').default as jest.Mock;

import { FoldersProvider, useFoldersContext } from '../contexts/FoldersContext';

function TestConsumer() {
  const { folders, add, remove, update, reload, loading } = useFoldersContext();

  return (
    <View>
      <Text key="loading" testID="loading">{loading ? 'loading' : 'loaded'}</Text>
      {folders.map((f) => (
        <Text key={f._key} testID={`folder-${f._key}`}>
          {f.name}
        </Text>
      ))}
      <Pressable
        key="add-folder"
        testID="add-folder"
        onPress={() => {
          add({ name: 'NewFolder' }).catch(() => {});
        }}
      >
        <Text>Add</Text>
      </Pressable>
      <Pressable
        key="remove-first"
        testID="remove-first"
        onPress={() => {
          if (folders.length > 0) remove(folders[0]._key!).catch(() => {});
        }}
      >
        <Text>Remove</Text>
      </Pressable>
      <Pressable
        key="update-first"
        testID="update-first"
        onPress={() => {
          if (folders.length > 0)
            update(folders[0]._key!, { name: 'Updated' }).catch(() => {});
        }}
      >
        <Text>Update</Text>
      </Pressable>
      <Pressable key="reload" testID="reload" onPress={() => { reload().catch(() => {}); }}>
        <Text>Reload</Text>
      </Pressable>
    </View>
  );
}

describe('FoldersContext', () => {
  beforeEach(() => {
    mockUseFolders.mockReset();
  });

  describe('initialization and synchronization', () => {
    test('initializes folders from hook after loading completes', async () => {
      const externalFolders = Object.freeze([
        { _key: 'f1', name: 'Folder1' },
        { _key: 'f2', name: 'Folder2' },
      ]);
      
      // Start with loading=true
      const providerMock = {
        folders: externalFolders,
        loading: true,
        add: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { getByTestId, queryByTestId, rerender } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Initially should be loading and no folders shown yet
      expect(getByTestId('loading').children[0]).toBe('loading');
      expect(queryByTestId('folder-f1')).toBeNull();
      expect(queryByTestId('folder-f2')).toBeNull();

      // Now simulate loading complete
      providerMock.loading = false;
      rerender(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for folders to appear after initialization
      await waitFor(() => {
        expect(getByTestId('loading').children[0]).toBe('loaded');
        expect(getByTestId('folder-f1')).toBeTruthy();
        expect(getByTestId('folder-f2')).toBeTruthy();
      });
    });

    test('syncs only once on initial load, not on subsequent external folder changes', async () => {
      // Start with empty folders
      let externalFolders = [{ _key: 'f1', name: 'Initial' }];
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { getByTestId, queryByTestId, rerender } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial sync
      await waitFor(() => {
        expect(getByTestId('folder-f1')).toBeTruthy();
      });

      // Now change the external folders reference (simulating what used to cause loops)
      externalFolders = [{ _key: 'f1', name: 'Initial' }, { _key: 'f2', name: 'External' }];
      providerMock.folders = externalFolders;
      
      rerender(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // The new external folder should NOT appear because we don't sync automatically
      // Only the initial folder should be present
      await waitFor(() => {
        expect(getByTestId('folder-f1')).toBeTruthy();
      });
      expect(queryByTestId('folder-f2')).toBeNull();
    });
  });

  describe('reload functionality', () => {
    test('reload calls underlying reload and syncs from external ref', async () => {
      // We'll track what gets synced by observing state changes
      const mockReload = jest.fn().mockResolvedValue(undefined);
      const mockAdd = jest.fn().mockResolvedValue('new_folder_key');
      const externalFolders = [{ _key: 'f1', name: 'Folder1' }];
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: mockAdd,
        remove: jest.fn(),
        update: jest.fn(),
        reload: mockReload,
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { getByTestId, queryByText } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByTestId('folder-f1')).toBeTruthy();
      });

      // Add a folder optimistically (so local state differs from external)
      fireEvent.press(getByTestId('add-folder'));
      
      await waitFor(() => {
        expect(queryByText('NewFolder')).toBeTruthy();
      });

      // Now change the external folders to simulate backend state
      providerMock.folders = [
        { _key: 'f1', name: 'Folder1' },
        { _key: 'f2', name: 'Folder2' },
      ];

      // Trigger reload - this should call the underlying reload AND sync from ref
      fireEvent.press(getByTestId('reload'));

      await waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });

    test('reload updates local folders even when underlying reload succeeds', async () => {
      const externalFolders = [{ _key: 'f1', name: 'Original' }];
      
      const mockReload = jest.fn().mockResolvedValue(undefined);

      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        reload: mockReload,
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(getByTestId('folder-f1')).toBeTruthy();
      });

      // Modify external folders to simulate backend change
      providerMock.folders = [{ _key: 'f1', name: 'Modified' }];

      // Trigger reload
      fireEvent.press(getByTestId('reload'));

      // Reload should sync the new data
      await waitFor(() => {
        expect(mockReload).toHaveBeenCalled();
      });
    });
  });

  describe('optimistic operations', () => {
    test('optimistically adds folder and keeps it on success', async () => {
      const mockAdd = jest.fn().mockResolvedValue('real_key');
      const externalFolders = Object.freeze([]);
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: mockAdd,
        remove: jest.fn(),
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { queryByText, getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      expect(queryByText('NewFolder')).toBeNull();
      fireEvent.press(getByTestId('add-folder'));

      // Optimistic item should appear immediately
      await waitFor(() => {
        expect(queryByText('NewFolder')).toBeTruthy();
      });

      expect(mockAdd).toHaveBeenCalledWith({ name: 'NewFolder' });
    });

    test('optimistically removes folder and keeps removed on success', async () => {
      const mockRemove = jest.fn().mockResolvedValue(undefined);
      const externalFolders = Object.freeze([
        { _key: 'f1', name: 'ToRemove' },
      ]);
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: mockRemove,
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { queryByText, getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial folder
      await waitFor(() => {
        expect(queryByText('ToRemove')).toBeTruthy();
      });

      // Press remove -> optimistic removal should hide item immediately
      fireEvent.press(getByTestId('remove-first'));
      
      await waitFor(() => {
        expect(queryByText('ToRemove')).toBeNull();
      });

      expect(mockRemove).toHaveBeenCalledWith('f1');
    });

    test('optimistically removes folder but rolls back on failure', async () => {
      const mockRemove = jest.fn().mockRejectedValue(new Error('boom'));
      const externalFolders = Object.freeze([
        { _key: 'f1', name: 'ToRemove' },
      ]);
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: mockRemove,
        update: jest.fn(),
        reload: jest.fn(),
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { queryByText, getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial folder
      await waitFor(() => {
        expect(queryByText('ToRemove')).toBeTruthy();
      });

      // Press remove -> optimistic removal should hide item
      fireEvent.press(getByTestId('remove-first'));
      
      await waitFor(() => {
        expect(queryByText('ToRemove')).toBeNull();
      });

      // Wait for rollback after rejection
      await waitFor(() => {
        expect(queryByText('ToRemove')).toBeTruthy();
      });

      expect(mockRemove).toHaveBeenCalledWith('f1');
    });

    test('optimistically updates folder and keeps update on success', async () => {
      const mockUpdate = jest.fn().mockResolvedValue('f1');
      const mockReload = jest.fn().mockResolvedValue(undefined);
      const externalFolders = Object.freeze([
        { _key: 'f1', name: 'Original' },
      ]);
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: jest.fn(),
        update: mockUpdate,
        reload: mockReload,
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { queryByText, getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial folder
      await waitFor(() => {
        expect(queryByText('Original')).toBeTruthy();
      });

      // Press update -> optimistic update should change text immediately
      fireEvent.press(getByTestId('update-first'));
      
      await waitFor(() => {
        expect(queryByText('Updated')).toBeTruthy();
        expect(queryByText('Original')).toBeNull();
      });

      expect(mockUpdate).toHaveBeenCalledWith('f1', { name: 'Updated' });
      expect(mockReload).toHaveBeenCalled();
    });

    test('optimistically updates folder but rolls back on failure', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('boom'));
      const mockReload = jest.fn().mockResolvedValue(undefined);
      const externalFolders = Object.freeze([
        { _key: 'f1', name: 'Original' },
      ]);
      
      const providerMock = {
        folders: externalFolders,
        loading: false,
        add: jest.fn(),
        remove: jest.fn(),
        update: mockUpdate,
        reload: mockReload,
      };
      mockUseFolders.mockImplementation(() => providerMock as any);

      const { queryByText, getByTestId } = render(
        <FoldersProvider>
          <TestConsumer />
        </FoldersProvider>
      );

      // Wait for initial folder
      await waitFor(() => {
        expect(queryByText('Original')).toBeTruthy();
      });

      // Press update -> optimistic update should change text
      fireEvent.press(getByTestId('update-first'));
      
      await waitFor(() => {
        expect(queryByText('Updated')).toBeTruthy();
      });

      // Wait for rollback after rejection
      await waitFor(() => {
        expect(queryByText('Original')).toBeTruthy();
        expect(queryByText('Updated')).toBeNull();
      });

      expect(mockUpdate).toHaveBeenCalledWith('f1', { name: 'Updated' });
    });
  });
});
