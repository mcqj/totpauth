import { View, Text } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export default function TotpError({ errors }: { errors: string[] }) {
  const errorBackground = useThemeColor({ light: '#fee', dark: '#4a1515' }, 'background');
  const errorBorder = useThemeColor({ light: '#f99', dark: '#a03434' }, 'border');
  const errorText = useThemeColor({ light: '#900', dark: '#ff6b6b' }, 'text');
  
  if (!errors || errors.length === 0) return null;
  return (
    <View style={{ backgroundColor: errorBackground, borderColor: errorBorder, borderWidth: 1, padding: 12, borderRadius: 6, marginVertical: 12 }}>
      <Text style={{ color: errorText, fontWeight: '600', marginBottom: 8 }}>Invalid TOTP QR</Text>
      {errors.map((e, i) => (
        <Text key={i} style={{ color: errorText }}>• {e}</Text>
      ))}
    </View>
  );
}
