import { useCallback, useEffect, useMemo, useState } from 'react';
import { Folder } from '../types/folder';
import { addFolder, deleteFolder, loadFolders, updateFolder } from '../utils/folderStore';

export default function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await loadFolders();
      setFolders(items);
    } catch (e) {
      setFolders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (folder: Omit<Folder, '_key'>) => {
    const key = await addFolder(folder);
    await load();
    return key;
  }, [load]);

  const remove = useCallback(async (key: string) => {
    await deleteFolder(key);
    await load();
  }, [load]);

  const update = useCallback(async (key: string, folder: Omit<Folder, '_key'>) => {
    const newKey = await updateFolder(key, folder);
    await load();
    return newKey;
  }, [load]);

  const result = useMemo(() => ({
    folders,
    loading,
    add,
    remove,
    update,
    reload: load,
  }), [folders, loading, add, remove, update, load]);

  return result;
}
