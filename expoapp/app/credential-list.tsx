import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, FlatList, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { useCredentialsContext } from '../contexts/CredentialsContext';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { Credential } from '../types/credential';
import CredentialCard from '../components/CredentialCard';

export default function CredentialListScreen() {
  const { credentials, loading, remove, reload } = useCredentialsContext();
  const router = useRouter();
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmDelete = (key: string) => setPendingDelete(key);
  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const key = pendingDelete;
    setPendingDelete(null);
    try {
      await remove(key);
      show('Credential deleted', { type: 'success' });
    } catch (e) {
      show('Failed to delete credential.', { type: 'error' });
    }
  };
  const handleCancelDelete = () => setPendingDelete(null);

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
              <FontAwesome name="plus" size={28} color="#2563EB" />
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
              onDelete={() => confirmDelete(item._key || '')}
            />
          )}
          refreshing={loading}
          onRefresh={reload}
        />
      )}
      <ConfirmModal
        visible={Boolean(pendingDelete)}
        title="Delete Credential"
        message="Are you sure you want to delete this credential?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
