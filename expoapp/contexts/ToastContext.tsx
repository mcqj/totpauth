import { createContext, useContext, ReactNode, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';

type ToastOptions = { type?: 'success' | 'error' | 'info'; duration?: number };

type ToastContextValue = { show: (message: string, opts?: ToastOptions) => void };

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');
  const timerRef = useRef<number | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setMessage(null);
    });
    if (timerRef.current) {
      clearTimeout(timerRef.current as unknown as number);
      timerRef.current = null;
    }
  }, [opacity]);

  const show = useCallback((msg: string, opts?: ToastOptions) => {
    setMessage(msg);
    setType(opts?.type || 'info');
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (timerRef.current) clearTimeout(timerRef.current as unknown as number);
    const duration = opts?.duration ?? 3000;
    // @ts-ignore setTimeout id
    timerRef.current = setTimeout(() => {
      hide();
    }, duration) as unknown as number;
  }, [hide, opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <Animated.View style={[styles.container, { opacity }] } pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={hide}>
            <View style={[styles.toast, getToastStyle(type, colorScheme ?? 'light')]}>
              <Text style={styles.text}>{message}</Text>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

function getToastStyle(type: 'success' | 'error' | 'info', colorScheme: 'light' | 'dark' | null) {
  const isDark = colorScheme === 'dark';
  
  switch (type) {
    case 'error':
      return { backgroundColor: '#d9534f' };
    case 'success':
      return { backgroundColor: '#5cb85c' };
    default:
      return { backgroundColor: isDark ? '#444' : '#333' };
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: '90%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    color: '#fff',
  },
});
