import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Welcome!</Text>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Step 1: Try it</Text>
      <Text style={{ marginBottom: 8 }}>Edit app/(tabs)/index.tsx to see changes.</Text>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Step 2: Explore</Text>
      <Text style={{ marginBottom: 8 }}>Tap the Explore tab to learn more about what&apos;s included in this starter app.</Text>
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Step 3: Get a fresh start</Text>
      <Text style={{ marginBottom: 8 }}>When you&apos;re ready, run npm run reset-project to get a fresh app directory.</Text>
      <Button title="Add Credential (Scan QR)" onPress={() => router.push('/add-credential')} />
    </View>
  );
}
