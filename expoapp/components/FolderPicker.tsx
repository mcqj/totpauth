import { useState } from 'react';
import { Modal, Pressable, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';
import { Folder } from '../types/folder';

type Props = {
  folders: Folder[];
  selectedFolderId?: string;
  onSelect: (folderId?: string) => void;
  label?: string;
};

export default function FolderPicker({ folders, selectedFolderId, onSelect, label = 'Select Folder' }: Props) {
  const [showModal, setShowModal] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const buttonColor = useThemeColor({}, 'editButton');
  const pressedBackground = useThemeColor({}, 'pressedBackground');

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  const handleSelect = (folderId?: string) => {
    onSelect(folderId);
    setShowModal(false);
  };

  return (
    <>
      <ThemedView style={{ marginBottom: 16 }}>
        <ThemedText style={{ fontSize: 14, marginBottom: 8 }}>{label}</ThemedText>
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [{
            borderWidth: 1,
            borderColor,
            borderRadius: 8,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: pressed ? pressedBackground : backgroundColor,
          }]}
        >
          <ThemedText style={{ color: selectedFolder ? textColor : pressedBackground }}>
            {selectedFolder ? selectedFolder.name : 'No folder (root)'}
          </ThemedText>
          <FontAwesome name="chevron-down" size={16} color={textColor} />
        </Pressable>
      </ThemedView>

      <Modal visible={showModal} animationType="slide" transparent>
        <ThemedView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <ThemedView style={{ backgroundColor, width: '90%', maxWidth: 400, maxHeight: '70%', borderRadius: 12, padding: 24, borderWidth: 1, borderColor }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
              {label}
            </ThemedText>
            
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 400 }}
              ListHeaderComponent={
                <Pressable
                  onPress={() => handleSelect(undefined)}
                  style={({ pressed }) => [{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: !selectedFolderId ? buttonColor : (pressed ? pressedBackground : backgroundColor),
                    borderWidth: 1,
                    borderColor: !selectedFolderId ? buttonColor : borderColor,
                  }]}
                >
                  <ThemedText style={{ color: !selectedFolderId ? '#fff' : textColor }}>
                    No folder (root)
                  </ThemedText>
                </Pressable>
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelect(item.id)}
                  style={({ pressed }) => [{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: selectedFolderId === item.id ? buttonColor : (pressed ? pressedBackground : backgroundColor),
                    borderWidth: 1,
                    borderColor: selectedFolderId === item.id ? buttonColor : borderColor,
                  }]}
                >
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome 
                      name="folder" 
                      size={20} 
                      color={selectedFolderId === item.id ? '#fff' : buttonColor} 
                      style={{ marginRight: 12 }} 
                    />
                    <ThemedText style={{ color: selectedFolderId === item.id ? '#fff' : textColor }}>
                      {item.name}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              )}
              ListFooterComponent={
                <Pressable
                  onPress={() => setShowModal(false)}
                  style={({ pressed }) => [{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor,
                    alignItems: 'center',
                    backgroundColor: pressed ? pressedBackground : backgroundColor,
                  }]}
                >
                  <ThemedText>Close</ThemedText>
                </Pressable>
              }
            />
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}
