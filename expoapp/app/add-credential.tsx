import { useState } from 'react';
import { View, Text, Button } from 'react-native';import { useRouter, Stack } from 'expo-router';
import { useToast } from '../contexts/ToastContext';
import ManualEntry from '../components/ManualEntry';
import CameraScanner from '../components/CameraScanner';
import { validateTotpUri } from '../utils/validateTotpUri';
import TotpError from '../components/TotpError';
import { useCredentialsContext } from '../contexts/CredentialsContext';

export default function AddCredentialScreen() {
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
    }
  };

  const { add } = useCredentialsContext();
  const { show } = useToast();
  const router = useRouter();

  const onSaveParsed = async (parsed: { accountName: string; issuer?: string; secret: string }) => {
    try {
      await add(parsed as any);
      show('Credential saved securely.', { type: 'success' });
  // Go back to credential list after successful save
  router.replace('/credential-list');
    } catch (e) {
      show(`Failed to save credential: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Add Credential' }} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>Add Credential</Text>
      {!showCamera && !manualMode ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Scan QR Code" onPress={() => setShowCamera(true)} />
          <View style={{ marginTop: 16 }}>
            <Button title="Enter Manually" onPress={() => setManualMode(true)} />
          </View>
        </View>
      ) : showCamera && !scanned ? (
        <CameraScanner onScanned={(d) => handleBarCodeScanned({ data: d })} onCancel={() => { show('Cancelled', { type: 'info' }); router.replace('/credential-list'); }} />
      ) : manualMode ? (
        <ManualEntry
          onCancel={() => { show('Cancelled', { type: 'info' }); router.replace('/credential-list'); }}
          onSave={async ({ accountName, issuer, secret }) => {
            try {
              await add({ accountName, issuer, secret });
              show('Manual credential saved securely.', { type: 'success' });
              // navigate back to credential list
              router.replace('/credential-list');
            } catch (e) {
              show(`Failed to save credential: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
            }
          }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ marginBottom: 12 }}>QR Data:</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 24 }}>{qrData}</Text>
          {(() => {
            const validated = qrData ? validateTotpUri(qrData) : { parsed: null, valid: false, errors: ['No QR data scanned.'] };
            if (!validated.valid) {
              return (
                <View style={{ marginBottom: 16, width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
                  <TotpError errors={validated.errors} />
                  <Button title="Enter Manually" onPress={() => { setManualMode(true); setShowCamera(false); }} />
                </View>
              );
            }

            const parsed = validated.parsed!;
            const handleSave = async () => {
              if (!parsed) return;
              await onSaveParsed(parsed);
            };

            return (
              <View style={{ marginBottom: 16 }}>
                <Text>Account: <Text style={{ fontWeight: 'bold' }}>{parsed.accountName}</Text></Text>
                <Text>Issuer: <Text style={{ fontWeight: 'bold' }}>{parsed.issuer || 'N/A'}</Text></Text>
                <Text>Secret: <Text style={{ fontWeight: 'bold' }}>{parsed.secret}</Text></Text>
                <Button title="Save" onPress={handleSave} disabled={!validated.valid} />
              </View>
            );
          })()}
        </View>
      )}
    </View>
  );
}
