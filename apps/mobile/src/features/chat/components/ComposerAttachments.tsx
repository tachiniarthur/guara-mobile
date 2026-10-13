import { colors } from '@guara/ui-tokens';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Icon, IconButton, Sheet, Text, type IconName } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import type { ChatFile } from '../data';

/** Largest file the assistants read (PDF, JPG or PNG). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** "184 KB", "1,2 MB" (null when unknown). */
export function formatBytes(bytes: number | null): string | null {
  if (bytes === null) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** "PDF · 184 KB". */
export function fileCaption(file: ChatFile): string {
  return [file.kind === 'pdf' ? 'PDF' : 'Imagem', formatBytes(file.sizeBytes)]
    .filter(Boolean)
    .join(' · ');
}

const OPTIONS: { key: 'camera' | 'library' | 'pdf'; label: string; icon: IconName }[] = [
  { key: 'camera', label: 'Tirar foto', icon: 'camera' },
  { key: 'library', label: 'Galeria', icon: 'image' },
  { key: 'pdf', label: 'Arquivo PDF', icon: 'document' },
];

/** "Anexar arquivo": photo, gallery or PDF. */
export function AttachSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (source: 'camera' | 'library' | 'pdf') => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Anexar arquivo">
      <Text size={14} leading={1.55} tone="muted">
        Mande um extrato, fatura ou nota fiscal. O assistente lê e responde sobre ele.
      </Text>
      <View className="flex-row gap-2.5">
        {OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            onPress={() => {
              haptics.selection();
              onClose();
              onPick(option.key);
            }}
            className="min-w-0 flex-1 items-center gap-2 rounded-18 border border-border bg-surface-input px-2 py-4 active:bg-surface-pressed"
          >
            <View className="h-11 w-11 items-center justify-center rounded-12 bg-brand-muted">
              <Icon name={option.icon} size={20} color={colors.brand.DEFAULT} />
            </View>
            <Text size={14} weight="semibold" numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text size={13} leading={1.5} tone="subtle">
        PDF, JPG ou PNG até 10 MB. O arquivo fica só nesta conversa e é apagado em 30 dias.
      </Text>
    </Sheet>
  );
}

/** Upload of the file waiting to be sent: going, or stopped at some percent. */
export type AttachmentUpload =
  { state: 'sending'; percent: number } | { state: 'failed'; percent: number };

/** The file waiting to be sent, above the field (sending, or failed with retry). */
export function AttachmentChip({
  file,
  onRemove,
  upload,
  onRetry,
}: {
  file: ChatFile;
  onRemove?: () => void;
  upload?: AttachmentUpload | null;
  onRetry?: () => void;
}) {
  const failed = upload?.state === 'failed';
  const caption = failed
    ? `Não deu para enviar · a conexão caiu em ${upload.percent}%`
    : upload?.state === 'sending'
      ? `Enviando… ${upload.percent}%`
      : onRemove
        ? `${fileCaption(file)} · pronto para enviar`
        : fileCaption(file);
  return (
    <View
      accessible={!onRemove && !failed}
      accessibilityRole={failed ? 'alert' : undefined}
      accessibilityLabel={`Anexo ${file.name}, ${caption}`}
      className={cn(
        'flex-row items-center gap-3 rounded-16 border px-3 py-2.5',
        failed
          ? 'border-negative-border bg-negative-muted'
          : 'border-border-strong bg-surface-muted',
      )}
    >
      <View
        className={cn(
          'h-10 w-10 items-center justify-center rounded-12',
          failed ? 'bg-negative-muted' : 'bg-positive-muted',
        )}
      >
        <Icon
          name={failed ? 'alertTriangle' : file.kind === 'pdf' ? 'document' : 'image'}
          size={20}
          color={failed ? colors.negative.DEFAULT : colors.positive.DEFAULT}
        />
      </View>
      <View className="min-w-0 flex-1">
        <Text size={14} weight="bold" numberOfLines={1} leading={1.3}>
          {file.name}
        </Text>
        <Text size={12} tone={failed ? 'muted' : 'subtle'} leading={1.3}>
          {caption}
        </Text>
      </View>
      {failed && onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar enviar de novo"
          onPress={onRetry}
          className="h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-surface active:bg-surface-pressed"
        >
          <Icon name="retry" size={18} color={colors.foreground.DEFAULT} />
        </Pressable>
      ) : null}
      {upload?.state === 'sending' ? (
        <ActivityIndicator size="small" color={colors.brand.DEFAULT} />
      ) : onRemove ? (
        <IconButton icon="close" accessibilityLabel="Remover anexo" onPress={onRemove} />
      ) : null}
    </View>
  );
}
