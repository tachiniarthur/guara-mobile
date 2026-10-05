import type { AssistantId } from '@guara/types';
import { Pressable, View } from 'react-native';

import { Sheet, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { ASSISTANTS } from '../assistants';
import { PICKABLE_ASSISTANTS } from '../data';

import { AssistantAvatar } from './AssistantAvatar';

export interface AssistantPickerSheetProps {
  open: boolean;
  onClose: () => void;
  value: AssistantId | null;
  onChange: (assistant: AssistantId) => void;
}

/** "Falar com um bicho" (optional): direct the question to one assistant. */
export function AssistantPickerSheet({
  open,
  onClose,
  value,
  onChange,
}: AssistantPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Falar com um bicho">
      <Text size={14} tone="muted">
        Opcional. Se você não escolher, a Capivara leva sua pergunta pro bicho certo.
      </Text>
      <View accessibilityRole="radiogroup" className="gap-1">
        {PICKABLE_ASSISTANTS.map((item) => {
          const selected = value === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${ASSISTANTS[item.id].name}, ${item.label}`}
              onPress={() => {
                haptics.selection();
                onChange(item.id);
                onClose();
              }}
              className={cn(
                'min-h-16 flex-row items-center gap-3.5 rounded-full px-3 py-2',
                selected ? 'bg-surface-muted' : 'active:bg-surface-pressed',
              )}
            >
              <AssistantAvatar assistant={item.id} size={42} ring={3} />
              <View>
                <Text size={15} weight="bold" leading={1.35}>
                  {ASSISTANTS[item.id].name}
                </Text>
                <Text size={13} tone="muted" leading={1.35}>
                  {item.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
