import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ visible, title = 'Confirm', message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  const modalBackground = useThemeColor({}, 'modalBackground');
  const modalBackdrop = useThemeColor({}, 'modalBackdrop');
  const deleteButtonColor = useThemeColor({}, 'deleteButton');
  const pressedBackground = useThemeColor({}, 'pressedBackground');
  
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: modalBackdrop }]}>
        <ThemedView style={[styles.container, { backgroundColor: modalBackground }]}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.button, styles.cancel, pressed && { backgroundColor: pressedBackground }]}>
              <ThemedText style={styles.cancelText}>{cancelLabel}</ThemedText>
            </Pressable>
            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.button, { backgroundColor: deleteButtonColor }, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: '86%', borderRadius: 10, padding: 18, alignItems: 'center' },
  title: { fontWeight: '600', fontSize: 18, marginBottom: 8 },
  message: { textAlign: 'center', marginBottom: 12 },
  actions: { flexDirection: 'row', marginTop: 8, width: '100%', justifyContent: 'flex-end' },
  button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
  cancel: { backgroundColor: '#f0f0f0' },
  cancelText: { color: '#333' },
  confirmText: { color: 'white', fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
