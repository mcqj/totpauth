import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useToast } from '../contexts/ToastContext';
import ManualEntry from '../components/ManualEntry';
import CameraScanner from '../components/CameraScanner';
import { parseTotpUri } from '../utils/parseTotpUri';
import { useCredentialsContext } from '../contexts/CredentialsContext';
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

  const { add } = useCredentialsContext();
  const { show } = useToast();

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
                await add({ accountName, issuer, secret });
                show('Manual credential saved securely.', { type: 'success' });
                setManualMode(false);
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
                await add(parsed as any);
                show('Credential saved securely.', { type: 'success' });
              } catch (e) {
                show(`Failed to save credential: ${e instanceof Error ? e.message : String(e)}`, { type: 'error' });
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
