import { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import ManualEntry from '../components/ManualEntry';
import CameraScanner from '../components/CameraScanner';
import { parseTotpUri } from '../utils/parseTotpUri';
import * as SecureStore from 'expo-secure-store';
export default function AddCredentialScreen() {
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualIssuer, setManualIssuer] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>Add Credential</Text>
      {!showCamera && !manualMode ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button title="Scan QR Code" onPress={() => setShowCamera(true)} />
          <View style={{ marginTop: 16 }}>
            <Button title="Enter Manually" onPress={() => setManualMode(true)} />
          </View>
        </View>
      ) : showCamera && !scanned ? (
        <CameraScanner onScanned={(d) => handleBarCodeScanned({ data: d })} onCancel={() => setShowCamera(false)} />
      ) : manualMode ? (
        <ManualEntry
          onCancel={() => setManualMode(false)}
          onSave={async ({ accountName, issuer, secret }) => {
            try {
              // Sanitize key: only alphanumeric, '.', '-', '_'
              const safeAccountName = accountName.replace(/[^a-zA-Z0-9._-]/g, '_');
              const key = `totp_${safeAccountName}`;
              await SecureStore.setItemAsync(key, JSON.stringify({ accountName, issuer, secret }));
              // Update key list
              const keysRaw = await SecureStore.getItemAsync('totp_keys');
              let keys: string[] = [];
              if (keysRaw) {
                try { keys = JSON.parse(keysRaw); } catch {}
              }
              if (!keys.includes(key)) {
                keys.push(key);
                await SecureStore.setItemAsync('totp_keys', JSON.stringify(keys));
              }
              Alert.alert('Saved', 'Manual credential saved securely.');
              setManualMode(false);
            } catch (e) {
              Alert.alert('Error', `Failed to save credential: ${e instanceof Error ? e.message : String(e)}`);
            }
          }}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ marginBottom: 12 }}>QR Data:</Text>
          <Text style={{ fontWeight: 'bold', marginBottom: 24 }}>{qrData}</Text>
          {(() => {
            const parsed = qrData ? parseTotpUri(qrData) : null;
            if (!parsed) {
              return (
                <View style={{ marginBottom: 16, width: '100%', alignItems: 'center' }}>
                  <Text style={{ color: 'red', marginBottom: 16 }}>Invalid TOTP QR code. Please try again or enter manually.</Text>
                  <Button title="Enter Manually" onPress={() => { setManualMode(true); setShowCamera(false); }} />
                </View>
              );
            }
            const handleSave = async () => {
              if (!parsed) return;
              try {
                // Sanitize key: only alphanumeric, '.', '-', '_'
                const safeAccountName = parsed.accountName.replace(/[^a-zA-Z0-9._-]/g, '_');
                const key = `totp_${safeAccountName}`;
                await SecureStore.setItemAsync(key, JSON.stringify(parsed));
                // Update key list
                const keysRaw = await SecureStore.getItemAsync('totp_keys');
                let keys: string[] = [];
                if (keysRaw) {
                  try { keys = JSON.parse(keysRaw); } catch {}
                }
                if (!keys.includes(key)) {
                  keys.push(key);
                  await SecureStore.setItemAsync('totp_keys', JSON.stringify(keys));
                }
                Alert.alert('Saved', 'Credential saved securely.');
              } catch (e) {
                Alert.alert('Error', `Failed to save credential: ${e instanceof Error ? e.message : String(e)}`);
              }
            };
            return (
              <View style={{ marginBottom: 16 }}>
                <Text>Account: <Text style={{ fontWeight: 'bold' }}>{parsed.accountName}</Text></Text>
                <Text>Issuer: <Text style={{ fontWeight: 'bold' }}>{parsed.issuer || 'N/A'}</Text></Text>
                <Text>Secret: <Text style={{ fontWeight: 'bold' }}>{parsed.secret}</Text></Text>
                <Button title="Save" onPress={handleSave} disabled={!parsed} />
              </View>
            );
          })()}
        </View>
      )}
    </View>
  );
}
