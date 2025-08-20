import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

type Props = {
  onSave: (payload: { accountName: string; issuer?: string; secret: string }) => Promise<void> | void;
  onCancel?: () => void;
};

export default function ManualEntry({ onSave, onCancel }: Props) {
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualIssuer, setManualIssuer] = useState('');
  const [manualSecret, setManualSecret] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Manual Entry</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Account Name"
          value={manualAccountName}
          onChangeText={setManualAccountName}
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Issuer (optional)"
          value={manualIssuer}
          onChangeText={setManualIssuer}
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Secret"
          value={manualSecret}
          onChangeText={setManualSecret}
          autoCapitalize="none"
        />
        <Button
          title="Save Manual Entry"
          onPress={async () => {
            if (!manualAccountName || !manualSecret) {
              Alert.alert('Missing Fields', 'Account name and secret are required.');
              return;
            }
            try {
              await onSave({ accountName: manualAccountName, issuer: manualIssuer, secret: manualSecret });
              setManualAccountName('');
              setManualIssuer('');
              setManualSecret('');
            } catch (e) {
              Alert.alert('Error', `${e instanceof Error ? e.message : String(e)}`);
            }
          }}
        />
        {onCancel ? (
          <View style={{ marginTop: 12 }}>
            <Button title="Cancel" onPress={onCancel} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
