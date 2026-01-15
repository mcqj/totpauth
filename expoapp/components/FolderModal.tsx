import { useState, useEffect } from 'react';
import { Modal, Pressable, TextInput, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';
import { Folder } from '../types/folder';

type Props = {
  visible: boolean;
  folder?: Folder; // If provided, we're editing an existing folder
  parentFolderId?: string; // Optional parent folder ID for creating sub-folders
  onSave: (folder: Omit<Folder, '_key'>) => void;
  onCancel: () => void;
};

export default function FolderModal({ visible, folder, parentFolderId, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const buttonColor = useThemeColor({}, 'editButton');
  const pressedBackground = useThemeColor({}, 'pressedBackground');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setAvatar(folder.avatar);
    } else {
      setName('');
      setAvatar(undefined);
    }
  }, [folder, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }
    
    const folderData: Omit<Folder, '_key'> = {
      id: folder?.id || `folder_${Date.now()}`,
      name: name.trim(),
      avatar,
      parentId: parentFolderId || folder?.parentId,
    };
    
    onSave(folderData);
    setName('');
    setAvatar(undefined);
  };

  const handleCancel = () => {
    setName('');
    setAvatar(undefined);
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ThemedView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <ThemedView style={{ backgroundColor, width: '90%', maxWidth: 400, borderRadius: 12, padding: 24, borderWidth: 1, borderColor }}>
          <ScrollView>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              {folder ? 'Edit Folder' : 'Create Folder'}
            </ThemedText>
            
            <ThemedText style={{ fontSize: 14, marginBottom: 8 }}>Folder Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter folder name"
              placeholderTextColor={placeholderColor}
              style={{
                borderWidth: 1,
                borderColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 16,
                color: textColor,
                backgroundColor,
              }}
            />

            <ThemedText style={{ fontSize: 14, marginBottom: 8 }}>Folder Avatar (Optional)</ThemedText>
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [{
                borderWidth: 1,
                borderColor,
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? pressedBackground : backgroundColor,
              }]}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={{ width: 80, height: 80, borderRadius: 8 }} />
              ) : (
                <>
                  <FontAwesome name="image" size={40} color={buttonColor} />
                  <ThemedText style={{ marginTop: 8, fontSize: 14 }}>Tap to pick an image</ThemedText>
                </>
              )}
            </Pressable>

            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [{
                  flex: 1,
                  marginRight: 8,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor,
                  alignItems: 'center',
                  backgroundColor: pressed ? pressedBackground : backgroundColor,
                }]}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!name.trim()}
                style={({ pressed }) => [{
                  flex: 1,
                  marginLeft: 8,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: pressed ? pressedBackground : buttonColor,
                  opacity: !name.trim() ? 0.5 : 1,
                }]}
              >
                <ThemedText style={{ color: pressed ? textColor : '#fff', fontWeight: 'bold' }}>
                  {folder ? 'Save' : 'Create'}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}
