import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Credential } from '../types/credential';

const KEYS_STORE = 'totp_keys';

export default function useCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const keysRaw = await SecureStore.getItemAsync(KEYS_STORE);
      const keys: string[] = keysRaw ? JSON.parse(keysRaw) : [];
      const items = await Promise.all(
        keys.map(async (key) => {
          const value = await SecureStore.getItemAsync(key);
          if (!value) return null;
          try {
            return { ...JSON.parse(value), _key: key } as Credential;
          } catch {
            return null;
          }
        })
      );
      setCredentials(items.filter(Boolean) as Credential[]);
    } catch (e) {
      // swallow here; callers can show errors via UI
      setCredentials([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (cred: Omit<Credential, '_key'>) => {
    const safeAccountName = cred.accountName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `totp_${safeAccountName}`;
    // If the credential includes a picked icon inside the app documentDirectory,
    // move/copy it to a canonical path based on the key to avoid leaving temp files.
    let credToStore: Omit<Credential, '_key'> = { ...cred };
    try {
      if (cred.icon && FileSystem.documentDirectory && cred.icon.startsWith(FileSystem.documentDirectory)) {
        const iconsDir = `${FileSystem.documentDirectory}icons`;
        try { await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true }); } catch (e) { /* ignore */ }
        const dest = `${iconsDir}/${key}.jpg`;
        try {
          try { await FileSystem.moveAsync({ from: cred.icon, to: dest }); }
          catch (e) { await FileSystem.copyAsync({ from: cred.icon, to: dest }); }
          credToStore = { ...credToStore, icon: dest };
        } catch (e) { /* ignore move/copy failures */ }
      }
    } catch (e) { /* ignore */ }

    await SecureStore.setItemAsync(key, JSON.stringify(credToStore));
    const keysRaw = await SecureStore.getItemAsync(KEYS_STORE);
    let keys: string[] = [];
    if (keysRaw) {
      try { keys = JSON.parse(keysRaw); } catch {}
    }
    if (!keys.includes(key)) {
      keys.push(key);
      await SecureStore.setItemAsync(KEYS_STORE, JSON.stringify(keys));
    }
    await load();
    return key;
  }, [load]);

  const remove = useCallback(async (key: string) => {
    try {
      // Attempt to read the stored item to cleanup any associated icon file.
      const raw = await SecureStore.getItemAsync(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Credential;
          if (parsed.icon && FileSystem.documentDirectory && parsed.icon.startsWith(FileSystem.documentDirectory)) {
            try { await FileSystem.deleteAsync(parsed.icon); } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore parse errors */ }
      }
    } catch (e) { /* ignore */ }

    await SecureStore.deleteItemAsync(key);
    const keysRaw = await SecureStore.getItemAsync(KEYS_STORE);
    let keys: string[] = [];
    if (keysRaw) {
      try { keys = JSON.parse(keysRaw); } catch {}
    }
    keys = keys.filter(k => k !== key);
    await SecureStore.setItemAsync(KEYS_STORE, JSON.stringify(keys));
    await load();
  }, [load]);

  const update = useCallback(async (key: string, cred: Omit<Credential, '_key'>) => {
    // compute new key based on account name
    const safeAccountName = cred.accountName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const newKey = `totp_${safeAccountName}`;

    // If there is a new icon and it points to a temp file inside documentDirectory,
    // move it to a canonical path based on the new key to avoid accumulating timestamped files.
    let credToStore: Omit<Credential, '_key'> = { ...cred };
    try {
      if (cred.icon && FileSystem.documentDirectory && cred.icon.startsWith(FileSystem.documentDirectory)) {
        const iconsDir = `${FileSystem.documentDirectory}icons`;
        try { await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true }); } catch (e) { /* ignore */ }
        const dest = `${iconsDir}/${newKey}.jpg`;
        try {
          // moveAsync may throw if same path; try move then fallback to copy
          try { await FileSystem.moveAsync({ from: cred.icon, to: dest }); }
          catch (e) { await FileSystem.copyAsync({ from: cred.icon, to: dest }); }
          credToStore = { ...credToStore, icon: dest };
        } catch (e) {
          // ignore move failures and keep original uri
        }
      }
    } catch (e) { /* ignore */ }

    // write new value
    await SecureStore.setItemAsync(newKey, JSON.stringify(credToStore));

    const keysRaw = await SecureStore.getItemAsync(KEYS_STORE);
    let keys: string[] = [];
    if (keysRaw) {
      try { keys = JSON.parse(keysRaw); } catch {}
    }

    // ensure newKey present
    if (!keys.includes(newKey)) {
      keys.push(newKey);
    }

    // if key changed, remove old key and its entry
    if (key !== newKey) {
      // Before deleting the old entry, try to remove any old icon file referenced by it
      try {
        const oldRaw = await SecureStore.getItemAsync(key);
        if (oldRaw) {
          try {
            const oldParsed = JSON.parse(oldRaw) as Credential;
            if (oldParsed.icon && FileSystem.documentDirectory && oldParsed.icon.startsWith(FileSystem.documentDirectory)) {
              // don't delete the file if it's the same as the newly stored icon
              if (!credToStore.icon || oldParsed.icon !== credToStore.icon) {
                try { await FileSystem.deleteAsync(oldParsed.icon); } catch (e) { /* ignore */ }
              }
            }
          } catch (e) { /* ignore parse errors */ }
        }
      } catch (e) { /* ignore */ }

      await SecureStore.deleteItemAsync(key);
      keys = keys.filter(k => k !== key);
    }

    await SecureStore.setItemAsync(KEYS_STORE, JSON.stringify(keys));
    await load();
    return newKey;
  }, [load]);

  return { credentials, loading, add, remove, update, reload: load };
}
