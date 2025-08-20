import { useState } from 'react';
import { View, Text, TextInput, Button, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useToast } from '../contexts/ToastContext';

type Props = {
  onSave: (payload: { accountName: string; issuer?: string; secret: string }) => Promise<void> | void;
  onCancel?: () => void;
};

export default function ManualEntry({ onSave, onCancel }: Props) {
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualIssuer, setManualIssuer] = useState('');
  const [manualSecret, setManualSecret] = useState('');

  const { show } = useToast();

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
              show('Account name and secret are required.', { type: 'error' });
              return;
            }
            try {
              await onSave({ accountName: manualAccountName, issuer: manualIssuer, secret: manualSecret });
              setManualAccountName('');
              setManualIssuer('');
              setManualSecret('');
            } catch (e) {
              show(`${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
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
