import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { CredentialsProvider } from '../contexts/CredentialsContext';
import { ToastProvider } from '../contexts/ToastContext';

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <CredentialsProvider>
      <ToastProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack />
      </ToastProvider>
    </CredentialsProvider>
  );
}
