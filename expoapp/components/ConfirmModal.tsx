import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

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
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.button, styles.confirm, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '86%', backgroundColor: 'white', borderRadius: 10, padding: 18, alignItems: 'center' },
  title: { fontWeight: '600', fontSize: 18, marginBottom: 8 },
  message: { color: '#444', textAlign: 'center', marginBottom: 12 },
  actions: { flexDirection: 'row', marginTop: 8, width: '100%', justifyContent: 'flex-end' },
  button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, marginLeft: 8 },
  cancel: { backgroundColor: '#f0f0f0' },
  confirm: { backgroundColor: '#e53935' },
  cancelText: { color: '#333' },
  confirmText: { color: 'white', fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
