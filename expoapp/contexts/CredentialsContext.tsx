import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import useCredentials from '../hooks/useCredentials';
import { Credential } from '../types/credential';

type CredentialsContextValue = {
  credentials: Credential[];
  loading: boolean;
  add: (c: Omit<Credential, '_key'>) => Promise<string>;
  remove: (key: string) => Promise<void>;
  reload: () => Promise<void>;
};

const CredentialsContext = createContext<CredentialsContextValue | undefined>(undefined);

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const { credentials: externalCreds, loading, add: addOrig, remove: removeOrig, reload } = useCredentials();

  // Local copy used for optimistic updates. Keep in sync with externalCreds.
  const [credentials, setCredentials] = useState<Credential[]>(externalCreds);

  useEffect(() => {
    setCredentials(externalCreds);
  }, [externalCreds]);

  // Optimistic add: inject a temporary item, call underlying add, and rely on reload to reconcile.
  const add = useCallback(async (cred: Omit<Credential, '_key'>) => {
    const tempKey = `tmp_${Date.now()}`;
    const tempItem: Credential = { ...cred, _key: tempKey } as Credential;
    // Prepend optimistic item
    setCredentials((prev) => [tempItem, ...prev]);
    try {
      const realKey = await addOrig(cred);
      // Optionally replace temp key with realKey immediately, but the underlying hook will call reload()
      setCredentials((prev) => prev.map((c) => (c._key === tempKey ? { ...c, _key: realKey } : c)));
      return realKey;
    } catch (e) {
      // Rollback optimistic item
      setCredentials((prev) => prev.filter((c) => c._key !== tempKey));
      throw e;
    }
  }, [addOrig]);

  // Optimistic remove: remove locally first, then call underlying remove and rollback on failure
  const remove = useCallback(async (key: string) => {
    const before = credentials;
    setCredentials((prev) => prev.filter((c) => c._key !== key));
    try {
      await removeOrig(key);
    } catch (e) {
      // rollback
      setCredentials(before);
      throw e;
    }
  }, [removeOrig, credentials]);

  const value: CredentialsContextValue = {
    credentials,
    loading,
    add,
    remove,
    reload,
  };

  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>;
}

export function useCredentialsContext() {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error('useCredentialsContext must be used within a CredentialsProvider');
  return ctx;
}
