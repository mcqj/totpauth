import { Pressable, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';
import { Folder } from '../types/folder';

type Props = {
  folder: Folder;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function FolderCard({ folder, onPress, onEdit, onDelete }: Props) {
  const borderColor = useThemeColor({}, 'border');
  const editButtonColor = useThemeColor({}, 'editButton');
  const deleteButtonColor = useThemeColor({}, 'textSecondary');
  const pressedBackground = useThemeColor({}, 'pressedBackground');
  const folderColor = useThemeColor({}, 'editButton');

  return (
    <Pressable onPress={onPress} testID={`folder-${folder.name}`}>
      <ThemedView style={{ padding: 12, borderBottomWidth: 1, borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <ThemedView style={{ marginRight: 12 }}>
            {folder.avatar ? (
              <Image source={{ uri: folder.avatar }} style={{ width: 48, height: 48, borderRadius: 6 }} />
            ) : (
              <ThemedView style={{ width: 48, height: 48, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: pressedBackground }}>
                <FontAwesome name="folder" size={32} color={folderColor} />
              </ThemedView>
            )}
          </ThemedView>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{folder.name}</ThemedText>
            {folder.parentId && <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Sub-folder</ThemedText>}
          </ThemedView>
        </ThemedView>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onEdit && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              accessibilityLabel={`Edit ${folder.name}`}
              testID={`edit-folder-${folder.name}`}
              style={({ pressed }) => [{
                padding: 8,
                borderRadius: 20,
                backgroundColor: pressed ? pressedBackground : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }]}
            >
              <FontAwesome name="pencil" size={18} color={editButtonColor} />
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              accessibilityLabel={`Delete ${folder.name}`}
              testID={`delete-folder-${folder.name}`}
              style={({ pressed }) => [{
                padding: 8,
                borderRadius: 20,
                backgroundColor: pressed ? pressedBackground : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }]}
            >
              <FontAwesome name="trash" size={20} color={deleteButtonColor} />
            </Pressable>
          )}
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}
