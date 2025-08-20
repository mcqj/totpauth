import React from 'react';
import { View, Text } from 'react-native';

export default function TotpError({ errors }: { errors: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <View style={{ backgroundColor: '#fee', borderColor: '#f99', borderWidth: 1, padding: 12, borderRadius: 6, marginVertical: 12 }}>
      <Text style={{ color: '#900', fontWeight: '600', marginBottom: 8 }}>Invalid TOTP QR</Text>
      {errors.map((e, i) => (
        <Text key={i} style={{ color: '#900' }}>• {e}</Text>
      ))}
    </View>
  );
}
