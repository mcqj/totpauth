import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import useFolders from '../hooks/useFolders';
import { Folder } from '../types/folder';

type FoldersContextValue = {
  folders: Folder[];
  loading: boolean;
  add: (f: Omit<Folder, '_key'>) => Promise<string>;
  remove: (key: string) => Promise<void>;
  update: (key: string, f: Omit<Folder, '_key'>) => Promise<string>;
  reload: () => Promise<void>;
};

const FoldersContext = createContext<FoldersContextValue | undefined>(undefined);

export function FoldersProvider({ children }: { children: ReactNode }) {
  const { folders: externalFolders, loading, add: addOrig, remove: removeOrig, update: updateOrig, reload: reloadOrig } = useFolders();

  // Local copy used for optimistic updates. We'll sync this once after initial load
  // and when an explicit reload is requested.
  const [folders, setFolders] = useState<Folder[]>([]);
  const didInit = useRef(false);
  const externalFoldersRef = useRef<Folder[]>(externalFolders);

  useEffect(() => {
    externalFoldersRef.current = externalFolders;
  }, [externalFolders]);

  useEffect(() => {
    if (!loading && !didInit.current) {
      didInit.current = true;
      setFolders(externalFoldersRef.current);
    }
  }, [loading]);

  // Optimistic add
  const add = useCallback(async (folder: Omit<Folder, '_key'>) => {
    const tempKey = `tmp_folder_${Date.now()}`;
    const tempItem: Folder = { ...folder, _key: tempKey } as Folder;
    setFolders((prev) => [tempItem, ...prev]);
    try {
      const realKey = await addOrig(folder);
      setFolders((prev) => prev.map((f) => (f._key === tempKey ? { ...f, _key: realKey } : f)));
      return realKey;
    } catch (e) {
      setFolders((prev) => prev.filter((f) => f._key !== tempKey));
      throw e;
    }
  }, [addOrig]);

  // Optimistic remove
  const remove = useCallback(async (key: string) => {
    const before = folders;
    setFolders((prev) => prev.filter((f) => f._key !== key));
    try {
      await removeOrig(key);
    } catch (e) {
      setFolders(before);
      throw e;
    }
  }, [removeOrig, folders]);

  // Reload wrapper: call the underlying reload and then sync our local copy
  const reload = useCallback(async () => {
    await reloadOrig();
    setFolders(externalFoldersRef.current);
  }, [reloadOrig]);

  const update = useCallback(async (key: string, folder: Omit<Folder, '_key'>) => {
    const before = folders;
    const optimistic: Folder = { ...folder, _key: key } as Folder;
    setFolders((prev) => prev.map((f) => (f._key === key ? optimistic : f)));
    try {
      const realKey = await updateOrig(key, folder);
      if (realKey && realKey !== key) {
        setFolders((prev) => prev.map((f) => (f._key === key ? { ...f, _key: realKey } : f)));
        return realKey;
      }
      return realKey || key;
    } catch (e) {
      setFolders(before);
      throw e;
    } finally {
      try { await reload(); } catch {}
    }
  }, [folders, reload, updateOrig]);

  const value: FoldersContextValue = {
    folders,
    loading,
    add,
    remove,
    update,
    reload,
  };

  return <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>;
}

export function useFoldersContext() {
  const ctx = useContext(FoldersContext);
  if (!ctx) throw new Error('useFoldersContext must be used within a FoldersProvider');
  return ctx;
}
