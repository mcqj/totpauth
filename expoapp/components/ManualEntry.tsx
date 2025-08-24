import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { validateSecret } from '../utils/validateSecret';
import { validateLabel } from '../utils/validateLabel';
import TotpError from './TotpError';

type Props = {
  onSave: (payload: { accountName: string; issuer?: string; secret: string }) => Promise<void> | void;
  onCancel?: () => void;
  initial?: { accountName?: string; issuer?: string; secret?: string };
  saveLabel?: string;
  allowSecretEdit?: boolean;
};

export default function ManualEntry({ onSave, onCancel, initial, saveLabel, allowSecretEdit = true }: Props) {
  const [manualAccountName, setManualAccountName] = useState(initial?.accountName || '');
  const [manualIssuer, setManualIssuer] = useState(initial?.issuer || '');
  const [manualSecret, setManualSecret] = useState(initial?.secret || '');
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const { show } = useToast();

  useEffect(() => {
    if (initial) {
      setManualAccountName((s) => (s ? s : initial.accountName || ''));
      setManualIssuer((s) => (s ? s : initial.issuer || ''));
      setManualSecret((s) => (s ? s : initial.secret || ''));
    }
  }, [initial]);


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
  {allowSecretEdit ? <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Manual Entry</Text> : null}
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
        {/** If allowSecretEdit is false, don't show the secret at all. Otherwise show the editable input. */}
        {allowSecretEdit ? (
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8, width: 240 }}
            placeholder="Secret"
            value={manualSecret}
            onChangeText={(t) => { setManualSecret(t); setValidationErrors(null); }}
            autoCapitalize="none"
          />
        ) : null}
        {validationErrors ? <TotpError errors={validationErrors} /> : null}
        <Button
          title={saveLabel || 'Save Manual Entry'}
          onPress={async () => {
            // In edit mode (allowSecretEdit === false) we don't expect the user to supply a secret.
            if (!manualAccountName) {
              show('Account name is required.', { type: 'error' });
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

            try {
              if (!allowSecretEdit) {
                // Use the initial secret when editing; fail if it's missing
                const secretToUse = initial?.secret;
                if (!secretToUse) {
                  show('Cannot edit credential: original secret not available.', { type: 'error' });
                  return;
                }
                await onSave({ accountName: manualAccountName.trim(), issuer: manualIssuer.trim() || undefined, secret: secretToUse });
                setValidationErrors(null);
                // Do not clear fields in edit mode (keep values stable)
              } else {
                if (!manualSecret) {
                  show('Account name and secret are required.', { type: 'error' });
                  return;
                }
                // Run secret validation
                const { valid, normalized, errors } = validateSecret(manualSecret);
                if (!valid) {
                  setValidationErrors(errors);
                  return;
                }

                await onSave({ accountName: manualAccountName.trim(), issuer: manualIssuer.trim() || undefined, secret: normalized! });
                setManualAccountName('');
                setManualIssuer('');
                setManualSecret('');
                setValidationErrors(null);
              }
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
