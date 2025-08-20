import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Credential = {
  accountName: string;
  issuer?: string;
  secret: string;
  _key?: string;
};

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

  return { credentials, loading, add, remove, reload: load };
}
