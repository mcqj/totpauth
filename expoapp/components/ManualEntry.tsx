import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, KeyboardAvoidingView, ScrollView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useToast } from '../contexts/ToastContext';
import { validateSecret } from '../utils/validateSecret';
import { validateLabel } from '../utils/validateLabel';
import TotpError from './TotpError';

type Props = {
  onSave: (payload: { accountName: string; issuer?: string; secret: string; icon?: string }) => Promise<void> | void;
  onCancel?: () => void;
  initial?: { accountName?: string; issuer?: string; secret?: string; icon?: string };
  saveLabel?: string;
  allowSecretEdit?: boolean;
};

export default function ManualEntry({ onSave, onCancel, initial, saveLabel, allowSecretEdit = true }: Props) {
  const [manualAccountName, setManualAccountName] = useState(initial?.accountName || '');
  const [manualIssuer, setManualIssuer] = useState(initial?.issuer || '');
  const [manualSecret, setManualSecret] = useState(initial?.secret || '');
  const [manualIcon, setManualIcon] = useState<string | undefined>(initial?.icon);
  const [validationErrors, setValidationErrors] = useState<string[] | null>(null);

  const { show } = useToast();

  useEffect(() => {
    if (initial) {
  // When `initial` changes we should update the form values so the
  // component can be safely reused. Overwriting user-typed values is
  // acceptable here because a change in `initial` indicates the parent
  // intends to show a different credential (for example switching into
  // edit mode for another item). If you want to preserve in-progress
  // edits instead, use a more specific heuristic (e.g. compare previous
  // initial values) instead of this simple behavior.
  setManualAccountName(initial.accountName || '');
  setManualIssuer(initial.issuer || '');
  setManualSecret(initial.secret || '');
  setManualIcon(initial.icon);
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
        {/* Icon picker: allow user to select an image from device when adding/editing */}
        <View style={{ marginTop: 8, alignItems: 'center' }}>
          {manualIcon ? (
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: manualIcon }} style={{ width: 64, height: 64, borderRadius: 6, marginBottom: 8 }} />
              <Button title="Clear Icon" onPress={async () => {
                try {
                  if (manualIcon && FileSystem.documentDirectory && manualIcon.startsWith(FileSystem.documentDirectory)) {
                    try { await FileSystem.deleteAsync(manualIcon); } catch (e) { /* ignore */ }
                  }
                } catch (e) { /* ignore */ }
                setManualIcon(undefined);
              }} />
            </View>
          ) : (
            <Button
              title="Choose Icon"
              onPress={async () => {
                try {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    show('Permission to access media library is required to select an icon.', { type: 'error' });
                    return;
                  }
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
                  if (!res.cancelled) {
                    // Note: older expo-image-picker returns an object with `uri` and `cancelled`; newer returns `assets`.
                    // Handle both shapes for compatibility.
                    // @ts-ignore
                    const pickedUri = res.uri || (res.assets && res.assets[0] && res.assets[0].uri);
                    if (pickedUri) {
                      try {
                        // Resize to a reasonable width to save space
                        const manipulated = await ImageManipulator.manipulateAsync(
                          pickedUri as string,
                          [{ resize: { width: 512 } }],
                          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                        );

                        const iconsDir = `${FileSystem.documentDirectory}icons`;
                        try { await FileSystem.makeDirectoryAsync(iconsDir, { intermediates: true }); } catch (e) { /* ignore if exists */ }
                        const dest = `${iconsDir}/icon_${Date.now()}.jpg`;
                        await FileSystem.copyAsync({ from: manipulated.uri, to: dest });
                        setManualIcon(dest);
                      } catch (e) {
                        show('Failed to process selected image.', { type: 'error' });
                      }
                    }
                  }
                } catch (e) {
                  show('Failed to pick image.', { type: 'error' });
                }
              }}
            />
          )}
        </View>
        {validationErrors ? <TotpError errors={validationErrors} /> : null}
        <Button
          testID="manual-save"
          accessibilityLabel={saveLabel || 'Save Manual Entry'}
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
                await onSave({ accountName: manualAccountName.trim(), issuer: manualIssuer.trim() || undefined, secret: secretToUse, icon: manualIcon });
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

                await onSave({ accountName: manualAccountName.trim(), issuer: manualIssuer.trim() || undefined, secret: normalized!, icon: manualIcon });
                setManualAccountName('');
                setManualIssuer('');
                setManualSecret('');
                setManualIcon(undefined);
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
