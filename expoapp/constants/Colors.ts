/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e0e0e0',
    cardBackground: '#fff',
    inputBackground: '#fff',
    inputBorder: '#ccc',
    modalBackground: '#fff',
    modalBackdrop: 'rgba(0,0,0,0.4)',
    deleteButton: '#e53935',
    editButton: '#2563EB',
    textSecondary: '#888',
    pressedBackground: '#eee',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#3a3a3a',
    cardBackground: '#1f2024',
    inputBackground: '#2a2a2a',
    inputBorder: '#555',
    modalBackground: '#2a2a2a',
    modalBackdrop: 'rgba(0,0,0,0.6)',
    deleteButton: '#d32f2f',
    editButton: '#3b82f6',
    textSecondary: '#aaa',
    pressedBackground: '#333',
  },
};
