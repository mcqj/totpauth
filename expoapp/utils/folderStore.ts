import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Folder } from '../types/folder';

const FOLDERS_STORE = 'totp_folders';

/**
 * Load all folders from SecureStore
 */
export async function loadFolders(): Promise<Folder[]> {
  try {
    const keysRaw = await SecureStore.getItemAsync(FOLDERS_STORE);
    const keys: string[] = keysRaw ? JSON.parse(keysRaw) : [];
    const items = await Promise.all(
      keys.map(async (key) => {
        const value = await SecureStore.getItemAsync(key);
        if (!value) return null;
        try {
          return { ...JSON.parse(value), _key: key } as Folder;
        } catch {
          return null;
        }
      })
    );
    return items.filter(Boolean) as Folder[];
  } catch (e) {
    return [];
  }
}

/**
 * Add a new folder
 */
export async function addFolder(folder: Omit<Folder, '_key'>): Promise<string> {
  const safeName = folder.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `totp_folder_${safeName}_${Date.now()}`;
  
  // Handle avatar file if provided
  let folderToStore: Omit<Folder, '_key'> = { ...folder };
  try {
    if (folder.avatar && (FileSystem as any).documentDirectory && folder.avatar.startsWith((FileSystem as any).documentDirectory)) {
      const avatarsDir = `${(FileSystem as any).documentDirectory}folder_avatars`;
      try { await FileSystem.makeDirectoryAsync(avatarsDir, { intermediates: true }); } catch (e) { /* ignore */ }
      const dest = `${avatarsDir}/${folder.id}.jpg`;
      try {
        try { await FileSystem.moveAsync({ from: folder.avatar, to: dest }); }
        catch (e) { await FileSystem.copyAsync({ from: folder.avatar, to: dest }); }
        folderToStore = { ...folderToStore, avatar: dest };
      } catch (e) { /* ignore move/copy failures */ }
    }
  } catch (e) { /* ignore */ }

  await SecureStore.setItemAsync(key, JSON.stringify(folderToStore));
  const keysRaw = await SecureStore.getItemAsync(FOLDERS_STORE);
  let keys: string[] = [];
  if (keysRaw) {
    try { keys = JSON.parse(keysRaw); } catch {}
  }
  if (!keys.includes(key)) {
    keys.push(key);
    await SecureStore.setItemAsync(FOLDERS_STORE, JSON.stringify(keys));
  }
  return key;
}

/**
 * Update an existing folder
 */
export async function updateFolder(key: string, folder: Omit<Folder, '_key'>): Promise<string> {
  const safeName = folder.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const newKey = `totp_folder_${safeName}_${folder.id}`;

  // Handle avatar file if provided
  let folderToStore: Omit<Folder, '_key'> = { ...folder };
  try {
    if (folder.avatar && (FileSystem as any).documentDirectory && folder.avatar.startsWith((FileSystem as any).documentDirectory)) {
      const avatarsDir = `${(FileSystem as any).documentDirectory}folder_avatars`;
      try { await FileSystem.makeDirectoryAsync(avatarsDir, { intermediates: true }); } catch (e) { /* ignore */ }
      const dest = `${avatarsDir}/${folder.id}.jpg`;
      try {
        try { await FileSystem.moveAsync({ from: folder.avatar, to: dest }); }
        catch (e) { await FileSystem.copyAsync({ from: folder.avatar, to: dest }); }
        folderToStore = { ...folderToStore, avatar: dest };
      } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }

  await SecureStore.setItemAsync(newKey, JSON.stringify(folderToStore));

  const keysRaw = await SecureStore.getItemAsync(FOLDERS_STORE);
  let keys: string[] = [];
  if (keysRaw) {
    try { keys = JSON.parse(keysRaw); } catch {}
  }

  if (!keys.includes(newKey)) {
    keys.push(newKey);
  }

  if (key !== newKey) {
    // Remove old avatar file if exists
    try {
      const oldRaw = await SecureStore.getItemAsync(key);
      if (oldRaw) {
        try {
          const oldParsed = JSON.parse(oldRaw) as Folder;
          if (oldParsed.avatar && (FileSystem as any).documentDirectory && oldParsed.avatar.startsWith((FileSystem as any).documentDirectory)) {
            if (!folderToStore.avatar || oldParsed.avatar !== folderToStore.avatar) {
              try { await FileSystem.deleteAsync(oldParsed.avatar); } catch (e) { /* ignore */ }
            }
          }
        } catch (e) { /* ignore parse errors */ }
      }
    } catch (e) { /* ignore */ }

    await SecureStore.deleteItemAsync(key);
    keys = keys.filter(k => k !== key);
  }

  await SecureStore.setItemAsync(FOLDERS_STORE, JSON.stringify(keys));
  return newKey;
}

/**
 * Delete a folder
 */
export async function deleteFolder(key: string): Promise<void> {
  try {
    // Remove avatar file if exists
    const raw = await SecureStore.getItemAsync(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Folder;
        if (parsed.avatar && (FileSystem as any).documentDirectory && parsed.avatar.startsWith((FileSystem as any).documentDirectory)) {
          try { await FileSystem.deleteAsync(parsed.avatar); } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore parse errors */ }
    }
  } catch (e) { /* ignore */ }

  await SecureStore.deleteItemAsync(key);
  const keysRaw = await SecureStore.getItemAsync(FOLDERS_STORE);
  let keys: string[] = [];
  if (keysRaw) {
    try { keys = JSON.parse(keysRaw); } catch {}
  }
  keys = keys.filter(k => k !== key);
  await SecureStore.setItemAsync(FOLDERS_STORE, JSON.stringify(keys));
}

/**
 * Check if a folder has any credentials or sub-folders
 */
export async function isFolderEmpty(folderId: string, credentials: any[], folders: Folder[]): Promise<boolean> {
  // Check if any credentials belong to this folder
  const hasCredentials = credentials.some(c => c.folderId === folderId);
  if (hasCredentials) return false;
  
  // Check if any sub-folders belong to this folder
  const hasSubFolders = folders.some(f => f.parentId === folderId);
  return !hasSubFolders;
}
