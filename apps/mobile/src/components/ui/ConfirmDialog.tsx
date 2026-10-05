import { colors } from '@guara/ui-tokens';
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
          className="w-full max-w-[340px] gap-4 rounded-28 border border-border-strong bg-surface p-7"
          style={{
            shadowColor: colors.shadow,
            shadowOpacity: 0.5,
            shadowRadius: 32,
            shadowOffset: { width: 0, height: 24 },
            elevation: 24,
          }}
        >
          <Text serif weight="bold" size={22} leading={1.25} accessibilityRole="header">
            {title}
          </Text>
          {message ? (
            <Text size={15} leading={1.55} tone="muted">
              {message}
            </Text>
          ) : null}
          <View className="flex-row flex-wrap justify-end gap-2.5">
            <Button variant="ghost" size="md" onPress={onCancel} disabled={loading}>
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
