import { Stack } from "expo-router";
import { CredentialsProvider } from '../contexts/CredentialsContext';
import { ToastProvider } from '../contexts/ToastContext';

export default function Layout() {
  return (
    <CredentialsProvider>
      <ToastProvider>
        <Stack />
      </ToastProvider>
    </CredentialsProvider>
  );
}
