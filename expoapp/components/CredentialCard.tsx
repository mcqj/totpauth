import { useEffect, useState } from 'react';
import { Pressable, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { generateTotp } from '../utils/generateTotp';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

import { Credential } from '../types/credential';

type Props = {
  credential: Credential;
  onDelete: () => void;
  onEdit?: () => void;
};

export default function CredentialCard({ credential, onDelete, onEdit }: Props) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));
  
  const borderColor = useThemeColor({}, 'border');
  const editButtonColor = useThemeColor({}, 'editButton');
  const deleteButtonColor = useThemeColor({}, 'textSecondary');
  const pressedBackground = useThemeColor({}, 'pressedBackground');
  const textSecondary = useThemeColor({}, 'textSecondary');

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
    <ThemedView style={{ padding: 12, borderBottomWidth: 1, borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <ThemedView style={{ marginRight: 12 }}>
          {credential.icon ? (
            <Image source={{ uri: credential.icon }} style={{ width: 48, height: 48, borderRadius: 6 }} />
          ) : (
            <Image source={require('../assets/images/icon.png')} style={{ width: 48, height: 48, borderRadius: 6 }} />
          )}
        </ThemedView>
        <ThemedView>
          <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{credential.accountName}</ThemedText>
          <ThemedText>Issuer: {credential.issuer || 'N/A'}</ThemedText>
          <ThemedText>Code: <ThemedText style={{ fontFamily: 'monospace', fontSize: 18 }}>{code}</ThemedText> <ThemedText style={{ color: textSecondary }}>({timeLeft}s)</ThemedText></ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => onEdit && onEdit()}
          accessibilityLabel={`Edit ${credential.accountName}`}
          testID={`edit-${credential.accountName}`}
          style={({ pressed }) => [{
            padding: 8,
            borderRadius: 20,
            backgroundColor: pressed ? pressedBackground : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
          }]}
        >
          <FontAwesome name="pencil" size={18} color={editButtonColor} />
        </Pressable>
        <Pressable
          onPress={onDelete}
  accessibilityLabel={`Delete ${credential.accountName}`}
  testID={`delete-${credential.accountName}`}
        style={({ pressed }) => [{
          padding: 8,
          borderRadius: 20,
          backgroundColor: pressed ? pressedBackground : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }]}
      >
        <FontAwesome name="trash" size={20} color={deleteButtonColor} />
      </Pressable>
      </ThemedView>
    </ThemedView>
  );
}
