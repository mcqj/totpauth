import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useCredentialsContext } from '../contexts/CredentialsContext';
import { useFoldersContext } from '../contexts/FoldersContext';
import { isFolderEmpty } from '../utils/folderStore';
import ConfirmModal from '../components/ConfirmModal';
import FolderModal from '../components/FolderModal';
import FolderCard from '../components/FolderCard';
import { useToast } from '../contexts/ToastContext';
import CredentialCard from '../components/CredentialCard';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { ThemedSafeAreaView } from '../components/ThemedSafeAreaView';
import { useThemeColor } from '../hooks/useThemeColor';
import { Folder } from '../types/folder';

export default function CredentialListScreen() {
  const { credentials, loading: credentialsLoading, remove, reload } = useCredentialsContext();
  const { folders, loading: foldersLoading, add: addFolder, update: updateFolder, remove: removeFolder, reload: reloadFolders } = useFoldersContext();
  const router = useRouter();
  const { show } = useToast();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [pendingDeleteCredential, setPendingDeleteCredential] = useState<string | null>(null);
  const [pendingDeleteFolder, setPendingDeleteFolder] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>(undefined);
  
  const iconColor = useThemeColor({}, 'editButton');
  const headerBackgroundColor = useThemeColor({}, 'background');
  const headerTextColor = useThemeColor({}, 'text');
  const pressedBackground = useThemeColor({}, 'pressedBackground');

  const loading = credentialsLoading || foldersLoading;

  useFocusEffect(
    useCallback(() => {
      reload();
      reloadFolders();
    }, [reload, reloadFolders])
  );

  // Filter folders and credentials for current view
  const currentFolders = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId]);

  const currentCredentials = useMemo(() => {
    return credentials.filter(c => c.folderId === currentFolderId);
  }, [credentials, currentFolderId]);

  // Build breadcrumb trail for navigation
  const breadcrumbs = useMemo(() => {
    const trail: Folder[] = [];
    let folderId = currentFolderId;
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) break;
      trail.unshift(folder);
      folderId = folder.parentId;
    }
    return trail;
  }, [currentFolderId, folders]);

  const confirmDeleteCredential = (key: string) => setPendingDeleteCredential(key);
  const handleConfirmDeleteCredential = async () => {
    if (!pendingDeleteCredential) return;
    const key = pendingDeleteCredential;
    setPendingDeleteCredential(null);
    try {
      await remove(key);
      show('Credential deleted', { type: 'success' });
    } catch {
      show('Failed to delete credential.', { type: 'error' });
    }
  };
  const handleCancelDeleteCredential = () => setPendingDeleteCredential(null);

  const confirmDeleteFolder = (key: string) => setPendingDeleteFolder(key);
  const handleConfirmDeleteFolder = async () => {
    if (!pendingDeleteFolder) return;
    const key = pendingDeleteFolder;
    const folder = folders.find(f => f._key === key);
    if (!folder) {
      setPendingDeleteFolder(null);
      return;
    }
    
    // Check if folder is empty
    const isEmpty = await isFolderEmpty(folder.id, credentials, folders);
    if (!isEmpty) {
      show('Cannot delete folder with credentials or sub-folders', { type: 'error' });
      setPendingDeleteFolder(null);
      return;
    }
    
    setPendingDeleteFolder(null);
    try {
      await removeFolder(key);
      show('Folder deleted', { type: 'success' });
    } catch {
      show('Failed to delete folder.', { type: 'error' });
    }
  };
  const handleCancelDeleteFolder = () => setPendingDeleteFolder(null);

  const handleCreateFolder = () => {
    setEditingFolder(undefined);
    setShowFolderModal(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  const handleSaveFolder = async (folderData: Omit<Folder, '_key'>) => {
    try {
      if (editingFolder && editingFolder._key) {
        await updateFolder(editingFolder._key, folderData);
        show('Folder updated', { type: 'success' });
      } else {
        await addFolder(folderData);
        show('Folder created', { type: 'success' });
      }
      setShowFolderModal(false);
      setEditingFolder(undefined);
    } catch {
      show('Failed to save folder', { type: 'error' });
    }
  };

  return (
    <ThemedSafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: 'Credentials',
            headerStyle: {
              backgroundColor: headerBackgroundColor,
            },
            headerTintColor: headerTextColor,
            headerTitleStyle: {
              color: headerTextColor,
            },
            headerRight: () => (
              <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  onPress={handleCreateFolder}
                  accessibilityLabel="Add Folder"
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome name="folder" size={28} color={iconColor} />
                </Pressable>
                <Pressable
                  onPress={() => router.push('/add-credential')}
                  accessibilityLabel="Add Credential"
                  style={{ marginRight: 16 }}
                >
                  <FontAwesome name="plus" size={28} color={iconColor} />
                </Pressable>
              </ThemedView>
            ),
          }}
        />
        
        {/* Breadcrumb navigation */}
        {breadcrumbs.length > 0 && (
          <ThemedView style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: pressedBackground }}>
            <Pressable onPress={() => setCurrentFolderId(undefined)}>
              <ThemedText style={{ color: iconColor }}>Home</ThemedText>
            </Pressable>
            {breadcrumbs.map((folder, index) => (
              <ThemedView key={folder.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={{ marginHorizontal: 8 }}>/</ThemedText>
                <Pressable
                  onPress={() => {
                    if (index === breadcrumbs.length - 1) return; // Don't navigate to current folder
                    setCurrentFolderId(folder.id);
                  }}
                >
                  <ThemedText style={{ color: index === breadcrumbs.length - 1 ? headerTextColor : iconColor }}>
                    {folder.name}
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {loading ? (
          <ThemedText style={{ textAlign: 'center', marginTop: 32 }}>Loading...</ThemedText>
        ) : currentFolders.length === 0 && currentCredentials.length === 0 ? (
          <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ThemedText style={{ textAlign: 'center', marginTop: 32 }}>
              {currentFolderId ? 'This folder is empty.' : 'No folders or credentials saved.'}
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.7 }}>
              Tap the + icon to add a credential or the folder icon to create a folder.
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={[...currentFolders.map(f => ({ type: 'folder' as const, data: f })), ...currentCredentials.map(c => ({ type: 'credential' as const, data: c }))]}
            keyExtractor={(item) => item.type === 'folder' ? item.data.id : item.data._key || item.data.accountName}
            renderItem={({ item }) => {
              if (item.type === 'folder') {
                return (
                  <FolderCard
                    folder={item.data}
                    onPress={() => setCurrentFolderId(item.data.id)}
                    onEdit={() => handleEditFolder(item.data)}
                    onDelete={() => confirmDeleteFolder(item.data._key || '')}
                  />
                );
              } else {
                return (
                  <CredentialCard
                    credential={item.data}
                    onDelete={() => confirmDeleteCredential(item.data._key || '')}
                    onEdit={() => router.push(`/add-credential?key=${encodeURIComponent(item.data._key || '')}`)}
                  />
                );
              }
            }}
            refreshing={loading}
            onRefresh={() => {
              reload();
              reloadFolders();
            }}
          />
        )}
        
        <ConfirmModal
          visible={Boolean(pendingDeleteCredential)}
          title="Delete Credential"
          message="Are you sure you want to delete this credential?"
          onConfirm={handleConfirmDeleteCredential}
          onCancel={handleCancelDeleteCredential}
        />
        
        <ConfirmModal
          visible={Boolean(pendingDeleteFolder)}
          title="Delete Folder"
          message="Are you sure you want to delete this folder? (Only empty folders can be deleted)"
          onConfirm={handleConfirmDeleteFolder}
          onCancel={handleCancelDeleteFolder}
        />
        
        <FolderModal
          visible={showFolderModal}
          folder={editingFolder}
          parentFolderId={currentFolderId}
          onSave={handleSaveFolder}
          onCancel={() => {
            setShowFolderModal(false);
            setEditingFolder(undefined);
          }}
        />
      </ThemedView>
    </ThemedSafeAreaView>
  );
}
