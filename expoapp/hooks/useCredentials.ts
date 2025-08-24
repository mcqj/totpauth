import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
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
    await SecureStore.setItemAsync(key, JSON.stringify(cred));
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

    // write new value
    await SecureStore.setItemAsync(newKey, JSON.stringify(cred));

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
      await SecureStore.deleteItemAsync(key);
      keys = keys.filter(k => k !== key);
    }

    await SecureStore.setItemAsync(KEYS_STORE, JSON.stringify(keys));
    await load();
    return newKey;
  }, [load]);

  return { credentials, loading, add, remove, update, reload: load };
}
