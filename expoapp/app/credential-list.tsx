import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, FlatList, Alert, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { generateTotp } from '../utils/generateTotp';

export type Credential = {
  accountName: string;
  issuer?: string;
  secret: string;
  _key?: string;
};

function CredentialCard({ credential, onDelete }: { credential: Credential; onDelete: () => void }) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));

  useEffect(() => {
    function updateCode() {
      setCode(generateTotp(credential.secret));
      setTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
    }
    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [credential.secret]);

  return (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{credential.accountName}</Text>
        <Text>Issuer: {credential.issuer || 'N/A'}</Text>
        <Text>Code: <Text style={{ fontFamily: 'monospace', fontSize: 18 }}>{code}</Text> <Text style={{ color: '#888' }}>({timeLeft}s)</Text></Text>
      </View>
      <Pressable
        onPress={onDelete}
        accessibilityLabel={`Delete ${credential.accountName}`}
        style={({ pressed }) => [{
          padding: 8,
          borderRadius: 20,
          backgroundColor: pressed ? '#eee' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }]}
      >
        <FontAwesome name="trash" size={20} color="#888" />
      </Pressable>
    </View>
  );
}

export default function CredentialListScreen() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const keysRaw = await SecureStore.getItemAsync('totp_keys');
      let keys: string[] = [];
      if (keysRaw) {
        try { keys = JSON.parse(keysRaw); } catch {}
      }
      const items = await Promise.all(
        keys.map(async (key: string) => {
          const value = await SecureStore.getItemAsync(key);
          if (!value) return null;
          try {
            return { ...JSON.parse(value), _key: key } as Credential;
          } catch {
            return null;
          }
        })
      );
      setCredentials(items.filter(Boolean) as Credential[]);
    } catch (e) {
      Alert.alert('Error', 'Failed to load credentials.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCredentials();
    }, [])
  );

  const handleDelete = async (key: string) => {
    Alert.alert('Delete Credential', 'Are you sure you want to delete this credential?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await SecureStore.deleteItemAsync(key);
            // Update key list
            const keysRaw = await SecureStore.getItemAsync('totp_keys');
            let keys: string[] = [];
            if (keysRaw) {
              try { keys = JSON.parse(keysRaw); } catch {}
            }
            keys = keys.filter((k) => k !== key);
            await SecureStore.setItemAsync('totp_keys', JSON.stringify(keys));
            fetchCredentials();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete credential.');
          }
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Credentials',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/add-credential')}
              accessibilityLabel="Add Credential"
              className="mr-4"
            >
              <Text className="text-2xl text-blue-600 font-bold">＋</Text>
            </Pressable>
          ),
        }}
      />
      {loading ? (
        <Text className="text-center mt-8">Loading...</Text>
      ) : credentials.length === 0 ? (
        <Text className="text-center mt-8">No credentials saved.</Text>
      ) : (
        <FlatList
          data={credentials}
          keyExtractor={(item) => item._key || item.accountName}
          renderItem={({ item }) => (
            <CredentialCard
              credential={item}
              onDelete={() => handleDelete(item._key || '')}
            />
          )}
          refreshing={loading}
          onRefresh={fetchCredentials}
        />
      )}
    </View>
  );
}
