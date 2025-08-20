import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, FlatList, Alert, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import useCredentials from '../hooks/useCredentials';
import { Credential } from '../types/credential';
import CredentialCard from '../components/CredentialCard';

export default function CredentialListScreen() {
  const { credentials, loading, remove, reload } = useCredentials();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const handleDelete = async (key: string) => {
    Alert.alert('Delete Credential', 'Are you sure you want to delete this credential?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await remove(key);
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
          onRefresh={reload}
        />
      )}
    </View>
  );
}
