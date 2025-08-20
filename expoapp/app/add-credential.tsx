import { useState, useRef } from 'react';
import { View, Text, Button, Alert, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { parseTotpUri } from '../utils/parseTotpUri';
import * as SecureStore from 'expo-secure-store';
export default function AddCredentialScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualAccountName, setManualAccountName] = useState('');
  const [manualIssuer, setManualIssuer] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrData(data);
    }
  };

  // Only show camera permission UI if camera is requested
  if (showCamera) {
    if (!permission) {
      return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Requesting camera permission...</Text></View>;
    }
    if (!permission.granted) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Camera access denied. Please enter credential manually.</Text>
          <Button title="Grant Camera Permission" onPress={requestPermission} />
        </View>
      );
    }
  }

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
        <>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1, margin: 16 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={({ data }) => handleBarCodeScanned({ data })}
          />
        </>
      ) : manualMode ? (
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
                  // Sanitize key: only alphanumeric, '.', '-', '_'
                  const safeAccountName = manualAccountName.replace(/[^a-zA-Z0-9._-]/g, '_');
                  const key = `totp_${safeAccountName}`;
                  await SecureStore.setItemAsync(
                    key,
                    JSON.stringify({
                      accountName: manualAccountName,
                      issuer: manualIssuer,
                      secret: manualSecret,
                    })
                  );
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
                  setManualAccountName('');
                  setManualIssuer('');
                  setManualSecret('');
                  setManualMode(false);
                } catch (e) {
                  Alert.alert('Error', `Failed to save credential: ${e instanceof Error ? e.message : String(e)}`);
                }
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
