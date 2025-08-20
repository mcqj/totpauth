import { useState } from 'react';
import { View, Text, TextInput, Button, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { validateSecret } from '../utils/validateSecret';
import { validateLabel } from '../utils/validateLabel';
import TotpError from './TotpError';

type Props = {
  onSave: (payload: { accountName: string; issuer?: string; secret: string }) => Promise<void> | void;
  onCancel?: () => void;
};

export default function ManualEntry({ onSave, onCancel }: Props) {
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualIssuer, setManualIssuer] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const { show } = useToast();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Manual Entry</Text>
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Account Name"
          value={manualAccountName}
          onChangeText={(t) => { setManualAccountName(t); setValidationErrors(null); }}
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Issuer (optional)"
          value={manualIssuer}
          onChangeText={(t) => { setManualIssuer(t); setValidationErrors(null); }}
        />
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
          placeholder="Secret"
          value={manualSecret}
          onChangeText={(t) => { setManualSecret(t); setValidationErrors(null); }}
          autoCapitalize="none"
        />
        {validationErrors ? <TotpError errors={validationErrors} /> : null}
        <Button
          title="Save Manual Entry"
          onPress={async () => {
            if (!manualAccountName || !manualSecret) {
              show('Account name and secret are required.', { type: 'error' });
              return;
            }

            // Validate account/issuer labels
            const labelVal = validateLabel(manualAccountName, { required: true });
            if (!labelVal.valid) {
              setValidationErrors(labelVal.errors);
              return;
            }

            if (manualIssuer) {
              const issuerVal = validateLabel(manualIssuer, { required: false });
              if (!issuerVal.valid) {
                setValidationErrors(issuerVal.errors);
                return;
              }
            }

            // Run secret validation
            const { valid, normalized, errors } = validateSecret(manualSecret);
            if (!valid) {
              setValidationErrors(errors);
              return;
            }

            try {
              await onSave({ accountName: manualAccountName.trim(), issuer: manualIssuer.trim() || undefined, secret: normalized! });
              setManualAccountName('');
              setManualIssuer('');
              setManualSecret('');
              setValidationErrors(null);
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
