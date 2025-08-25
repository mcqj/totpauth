import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter, Stack } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useCredentialsContext } from '../contexts/CredentialsContext';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import CredentialCard from '../components/CredentialCard';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

export default function CredentialListScreen() {
  const { credentials, loading, remove, reload } = useCredentialsContext();
  const router = useRouter();
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  
  const iconColor = useThemeColor({}, 'editButton');

  useFocusEffect(
    useCallback(() => {
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
    } catch {
      show('Failed to delete credential.', { type: 'error' });
    }
  };
  const handleCancelDelete = () => setPendingDelete(null);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1">
      <ThemedView className="flex-1">
        <Stack.Screen
          options={{
            title: 'Credentials',
              headerRight: () => (
              <Pressable
                onPress={() => router.push('/add-credential')}
                accessibilityLabel="Add Credential"
                className="mr-4"
              >
                <FontAwesome name="plus" size={28} color={iconColor} />
              </Pressable>
            ),
          }}
        />
        {loading ? (
          <ThemedText className="text-center mt-8">Loading...</ThemedText>
        ) : credentials.length === 0 ? (
          <ThemedText className="text-center mt-8">No credentials saved.</ThemedText>
        ) : (
          <FlatList
            data={credentials}
            keyExtractor={(item) => item._key || item.accountName}
            renderItem={({ item }) => (
              <CredentialCard
                credential={item}
                onDelete={() => confirmDelete(item._key || '')}
                onEdit={() => router.push(`/add-credential?key=${encodeURIComponent(item._key || '')}`)}
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
      </ThemedView>
    </SafeAreaView>
  );
}
