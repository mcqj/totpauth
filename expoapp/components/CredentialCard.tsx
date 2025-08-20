import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { generateTotp } from '../utils/generateTotp';

import { Credential } from '../types/credential';

type Props = {
  credential: Credential;
  onDelete: () => void;
};

export default function CredentialCard({ credential, onDelete }: Props) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));

  useEffect(() => {
    function updateCode() {
      setCode(generateTotp(credential.secret));
      setTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
    }
    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [credential.secret]);

  return (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{credential.accountName}</Text>
        <Text>Issuer: {credential.issuer || 'N/A'}</Text>
        <Text>Code: <Text style={{ fontFamily: 'monospace', fontSize: 18 }}>{code}</Text> <Text style={{ color: '#888' }}>({timeLeft}s)</Text></Text>
      </View>
      <Pressable
        onPress={onDelete}
        accessibilityLabel={`Delete ${credential.accountName}`}
        style={({ pressed }) => [{
          padding: 8,
          borderRadius: 20,
          backgroundColor: pressed ? '#eee' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }]}
      >
        <FontAwesome name="trash" size={20} color="#888" />
      </Pressable>
    </View>
  );
}
