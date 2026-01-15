import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useToast } from '../contexts/ToastContext';
import ManualEntry from '../components/ManualEntry';
import CameraScanner from '../components/CameraScanner';
import { validateTotpUri } from '../utils/validateTotpUri';
import TotpError from '../components/TotpError';
import { useCredentialsContext } from '../contexts/CredentialsContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

export default function AddCredentialScreen() {
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const headerBackgroundColor = useThemeColor({}, 'background');
  const headerTextColor = useThemeColor({}, 'text');

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
    }
  };

  const { add, update, credentials } = useCredentialsContext();
  const { show } = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingKey = typeof params?.key === 'string' ? params.key : undefined;
  const [initial, setInitial] = useState<{ accountName?: string; issuer?: string; secret?: string; icon?: string; folderId?: string } | null>(null);

  useEffect(() => {
    if (editingKey) {
      const found = credentials.find((c) => c._key === editingKey);
      if (found) {
  setInitial({ accountName: found.accountName, issuer: found.issuer, secret: found.secret, icon: found.icon, folderId: found.folderId });
        // Enter manual edit mode when editing an existing credential
        setManualMode(true);
        setShowCamera(false);
      }
    }
  }, [editingKey, credentials]);

  const onSaveParsed = async (parsed: { accountName: string; issuer?: string; secret: string }) => {
    try {
      if (editingKey) {
        await update(editingKey, parsed as any);
        show('Credential updated securely.', { type: 'success' });
      } else {
        await add(parsed as any);
        show('Credential saved securely.', { type: 'success' });
      }
      // Go back to credential list after successful save
      router.replace('/credential-list');
    } catch (e) {
      show(`Failed to save credential: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ 
        title: editingKey ? 'Edit Credential' : 'Add Credential',
        headerStyle: {
          backgroundColor: headerBackgroundColor,
        },
        headerTintColor: headerTextColor,
        headerTitleStyle: {
          color: headerTextColor,
        },
      }} />
      <ThemedText style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>{editingKey ? 'Edit Credential' : 'Add Credential'}</ThemedText>
      {!showCamera && !manualMode ? (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Scan QR Code" onPress={() => setShowCamera(true)} />
          <ThemedView style={{ marginTop: 16 }}>
            <Button title="Enter Manually" onPress={() => setManualMode(true)} />
          </ThemedView>
        </ThemedView>
      ) : showCamera && !scanned ? (
        <CameraScanner onScanned={(d) => handleBarCodeScanned({ data: d })} onCancel={() => { show('Cancelled', { type: 'info' }); router.replace('/credential-list'); }} />
      ) : manualMode ? (
        <ManualEntry
          initial={initial || undefined}
          allowSecretEdit={editingKey ? false : true}
          saveLabel={editingKey ? 'Save Changes' : 'Save Manual Entry'}
          onCancel={() => { show('Cancelled', { type: 'info' }); router.replace('/credential-list'); }}
      onSave={async ({ accountName, issuer, secret, icon, folderId }) => {
            try {
              if (editingKey) {
                // When editing we treat this as updating name/issuer only; keep the existing secret
                const secretToUse = initial?.secret || secret;
        await update(editingKey, { accountName, issuer, secret: secretToUse, icon, folderId });
                show('Manual credential updated securely.', { type: 'success' });
              } else {
        await add({ accountName, issuer, secret, icon, folderId });
                show('Manual credential saved securely.', { type: 'success' });
              }
              // navigate back to credential list
              router.replace('/credential-list');
            } catch (e) {
              show(`Failed to save credential: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
            }
          }}
        />
      ) : (
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText style={{ marginBottom: 12 }}>QR Data:</ThemedText>
          <ThemedText style={{ fontWeight: 'bold', marginBottom: 24 }}>{qrData}</ThemedText>
          {(() => {
            const validated = qrData ? validateTotpUri(qrData) : { parsed: null, valid: false, errors: ['No QR data scanned.'] };
            if (!validated.valid) {
              return (
                <ThemedView style={{ marginBottom: 16, width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
                  <TotpError errors={validated.errors} />
                  <Button title="Enter Manually" onPress={() => { setManualMode(true); setShowCamera(false); }} />
                </ThemedView>
              );
            }

            const parsed = validated.parsed!;
            const handleSave = async () => {
              if (!parsed) return;
              await onSaveParsed(parsed);
            };

            return (
              <ThemedView style={{ marginBottom: 16 }}>
                <ThemedText>Account: <ThemedText style={{ fontWeight: 'bold' }}>{parsed.accountName}</ThemedText></ThemedText>
                <ThemedText>Issuer: <ThemedText style={{ fontWeight: 'bold' }}>{parsed.issuer || 'N/A'}</ThemedText></ThemedText>
                <ThemedText>Secret: <ThemedText style={{ fontWeight: 'bold' }}>{parsed.secret}</ThemedText></ThemedText>
                <Button title="Save" onPress={handleSave} disabled={!validated.valid} />
              </ThemedView>
            );
          })()}
        </ThemedView>
      )}
    </ThemedView>
  );
}
