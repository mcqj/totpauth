import { View, Text, Button } from 'react-native';
import { Stack, useRouter } from 'expo-router';
export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 16 }}>TOTP Authenticator App</Text>
      <Stack.Screen options={{ title: "Home" }} />
      <Button title="Add Credential (Scan QR)" onPress={() => router.push('/add-credential')} />
      <View style={{ marginTop: 12 }}>
        <Button title="View Saved Credentials" onPress={() => router.push('/credential-list')} />
      </View>
    </View>
  );
}
