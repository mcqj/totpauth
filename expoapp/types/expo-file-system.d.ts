import * as FileSystem from 'expo-file-system';

declare module 'expo-file-system' {
  export const documentDirectory: string | null;
}
