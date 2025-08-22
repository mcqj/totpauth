import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CredentialsProvider } from '../../contexts/CredentialsContext';
import { ToastProvider } from '../../contexts/ToastContext';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <NavigationContainer>
      <CredentialsProvider>
        <ToastProvider>{ui}</ToastProvider>
      </CredentialsProvider>
    </NavigationContainer>
  );
}
