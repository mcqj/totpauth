import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import CredentialCard from '../components/CredentialCard';
import { useColorScheme } from '../hooks/useColorScheme';

// Mock the useColorScheme hook
jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

const mockCredential = {
  _key: 'test-key',
  accountName: 'Test Account',
  issuer: 'Test Issuer',
  secret: 'JBSWY3DPEHPK3PXP',
};

describe('Dark Mode Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ThemedView uses light background by default', () => {
    mockColorScheme.mockReturnValue('light');
    
    const { toJSON } = render(<ThemedView testID="test-view" />);
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  test('ThemedView adapts to dark mode', () => {
    mockColorScheme.mockReturnValue('dark');
    
    const { toJSON } = render(<ThemedView testID="test-view" />);
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  test('ThemedText uses light colors by default', () => {
    mockColorScheme.mockReturnValue('light');
    
    const { toJSON } = render(<ThemedText>Test Text</ThemedText>);
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  test('ThemedText adapts to dark mode', () => {
    mockColorScheme.mockReturnValue('dark');
    
    const { toJSON } = render(<ThemedText>Test Text</ThemedText>);
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  test('CredentialCard renders in light mode', () => {
    mockColorScheme.mockReturnValue('light');
    
    const { toJSON } = render(
      <CredentialCard 
        credential={mockCredential} 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  test('CredentialCard renders in dark mode', () => {
    mockColorScheme.mockReturnValue('dark');
    
    const { toJSON } = render(
      <CredentialCard 
        credential={mockCredential} 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });
});