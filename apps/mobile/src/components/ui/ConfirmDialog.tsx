import { Modal, Pressable, View } from 'react-native';

import { FEEDBACK_COPY } from '@/constants/copy';

import { Button } from './Button';
import { Text } from './Text';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for irreversible actions (delete, revoke consent). */
  destructive?: boolean;
  /** Shows a spinner on the confirm button while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Centered confirmation dialog. Back button / backdrop tap cancel. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = FEEDBACK_COPY.confirm,
  cancelLabel = FEEDBACK_COPY.cancel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-overlay px-6">
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={loading ? undefined : onCancel}
          className="absolute bottom-0 left-0 right-0 top-0"
        />
        <View
          accessibilityViewIsModal
          className="w-full max-w-sm gap-3 rounded-24 border border-border-strong bg-surface-input p-6"
        >
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          {message ? (
            <Text variant="body" tone="muted">
              {message}
            </Text>
          ) : null}
          <View className="mt-3 flex-row justify-end gap-3">
            <Button variant="outline" size="md" onPress={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              size="md"
              variant={destructive ? 'destructive' : 'primary'}
              onPress={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
