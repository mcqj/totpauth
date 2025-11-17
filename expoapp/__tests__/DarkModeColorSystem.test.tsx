import React from 'react';
import { render } from '@testing-library/react-native';
import { Colors } from '../constants/Colors';
import { useThemeColor } from '../hooks/useThemeColor';
import { useColorScheme } from '../hooks/useColorScheme';

// Mock the useColorScheme hook
jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockColorScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

describe('Dark Mode Color System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Colors object contains both light and dark themes', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.dark).toBeDefined();
    
    // Check that essential colors are defined for both themes
    const requiredColors = ['text', 'background', 'tint', 'icon', 'border', 'cardBackground'];
    
    requiredColors.forEach(color => {
      expect((Colors as any).light[color]).toBeDefined();
      expect((Colors as any).dark[color]).toBeDefined();
      expect(typeof (Colors as any).light[color]).toBe('string');
      expect(typeof (Colors as any).dark[color]).toBe('string');
    });
  });

  test('useThemeColor returns light colors when scheme is light', () => {
    mockColorScheme.mockReturnValue('light');
    
    // Create a test component to use the hook
    const TestComponent = () => {
      const backgroundColor = useThemeColor({}, 'background');
      const textColor = useThemeColor({}, 'text');
      
      return {
        backgroundColor,
        textColor,
      };
    };

    const result = TestComponent();
    
    expect(result.backgroundColor).toBe(Colors.light.background);
    expect(result.textColor).toBe(Colors.light.text);
  });

  test('useThemeColor returns dark colors when scheme is dark', () => {
    mockColorScheme.mockReturnValue('dark');
    
    // Create a test component to use the hook
    const TestComponent = () => {
      const backgroundColor = useThemeColor({}, 'background');
      const textColor = useThemeColor({}, 'text');
      
      return {
        backgroundColor,
        textColor,
      };
    };

    const result = TestComponent();
    
    expect(result.backgroundColor).toBe(Colors.dark.background);
    expect(result.textColor).toBe(Colors.dark.text);
  });

  test('useThemeColor respects prop overrides', () => {
    mockColorScheme.mockReturnValue('light');
    
    const TestComponent = () => {
      const customColor = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'background');
      return customColor;
    };

    const result = TestComponent();
    expect(result).toBe('#ff0000');
  });

  test('useThemeColor handles dark prop overrides', () => {
    mockColorScheme.mockReturnValue('dark');
    
    const TestComponent = () => {
      const customColor = useThemeColor({ light: '#ff0000', dark: '#00ff00' }, 'background');
      return customColor;
    };

    const result = TestComponent();
    expect(result).toBe('#00ff00');
  });

  test('useThemeColor falls back to default theme when scheme is null', () => {
    mockColorScheme.mockReturnValue(null);
    
    const TestComponent = () => {
      const backgroundColor = useThemeColor({}, 'background');
      return backgroundColor;
    };

    const result = TestComponent();
    // Should fall back to light theme
    expect(result).toBe(Colors.light.background);
  });

  test('Dark and light themes have different background colors', () => {
    expect(Colors.light.background).not.toBe(Colors.dark.background);
    expect(Colors.light.text).not.toBe(Colors.dark.text);
  });

  test('All new theme colors are properly defined', () => {
    const newThemeColors = [
      'border', 'cardBackground', 'inputBackground', 'inputBorder',
      'modalBackground', 'modalBackdrop', 'deleteButton', 'editButton',
      'textSecondary', 'pressedBackground'
    ];

    newThemeColors.forEach(colorKey => {
      expect((Colors as any).light[colorKey]).toBeDefined();
      expect((Colors as any).dark[colorKey]).toBeDefined();
      expect(typeof (Colors as any).light[colorKey]).toBe('string');
      expect(typeof (Colors as any).dark[colorKey]).toBe('string');
      
      // Ensure colors are valid hex/rgba strings
      const lightColor = (Colors as any).light[colorKey];
      const darkColor = (Colors as any).dark[colorKey];
      
      expect(lightColor).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\(|[a-zA-Z]+).*$/);
      expect(darkColor).toMatch(/^(#[0-9a-fA-F]{3,8}|rgba?\(|[a-zA-Z]+).*$/);
    });
  });
});