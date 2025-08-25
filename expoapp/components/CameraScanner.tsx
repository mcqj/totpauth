import { useState, useRef } from 'react';
import { View, Button, ActivityIndicator } from 'react-native';
import { CameraView } from 'expo-camera';
import useCameraPermission from '../hooks/useCameraPermission';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

type Props = {
  onScanned: (data: string) => void;
  onCancel?: () => void;
  style?: any;
};

export default function CameraScanner({ onScanned, onCancel, style }: Props) {
  const { permission, requestPermission } = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<any>(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScanned(data);
    }
  };

  if (!permission) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 12 }}>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Camera access denied. Please enter credential manually.</ThemedText>
        <View style={{ marginTop: 12 }}>
          <Button title="Grant Camera Permission" onPress={requestPermission} />
        </View>
        {onCancel ? (
          <View style={{ marginTop: 12 }}>
            <Button title="Cancel" onPress={onCancel} />
          </View>
        ) : null}
      </ThemedView>
    );
  }

  return (
    <CameraView
      ref={cameraRef}
      style={[{ flex: 1, margin: 16 }, style]}
      facing="back"
      barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      onBarcodeScanned={({ data }) => handleBarCodeScanned({ data })}
    />
  );
}
