import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { FoldersProvider } from '../../contexts/FoldersContext';
import { CredentialsProvider } from '../../contexts/CredentialsContext';
import { ToastProvider } from '../../contexts/ToastContext';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <NavigationContainer>
      <FoldersProvider>
        <CredentialsProvider>
          <ToastProvider>{ui}</ToastProvider>
        </CredentialsProvider>
      </FoldersProvider>
    </NavigationContainer>
  );
}
