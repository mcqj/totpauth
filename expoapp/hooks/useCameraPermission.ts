import { useState, useEffect, useCallback } from 'react';
import { Camera } from 'expo-camera';

export default function useCameraPermission() {
  const [permission, setPermission] = useState<any | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Camera.requestCameraPermissionsAsync();
      setPermission(result);
      return result;
    } catch (e) {
      setPermission({ granted: false });
      return { granted: false };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const status = await Camera.getCameraPermissionsAsync();
        if (mounted) setPermission(status);
      } catch (e) {
        if (mounted) setPermission({ granted: false });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { permission, requestPermission } as const;
}
