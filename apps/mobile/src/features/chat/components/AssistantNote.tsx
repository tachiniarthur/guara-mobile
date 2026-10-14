import type { AssistantId } from '@guara/types';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { StateSlot } from '@/components/feedback';
import { Card, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { ASSISTANTS } from '../assistants';

import { AssistantAvatar } from './AssistantAvatar';

export interface AssistantNoteProps {
  assistant: AssistantId;
  children: string;
  /** Buttons under the text ("Fui eu", "Não reconheço"). */
  actions?: ReactNode;
  className?: string;
}

/** A short note signed by an assistant, in Sombra (Tamanduá on a category, Quero-quero…). */
export function AssistantNote({ assistant, children, actions, className }: AssistantNoteProps) {
  const { name } = ASSISTANTS[assistant];
  return (
    <Card
      variant="muted"
      padding="none"
      accessible={!actions}
      accessibilityLabel={actions ? undefined : `${name}: ${children}`}
      className={cn('p-4', className)}
    >
      <StateSlot>
        <View className="flex-row gap-3">
          <AssistantAvatar assistant={assistant} size={32} />
          <View className="min-w-0 flex-1 gap-2">
            <Text size={12} weight="bold" tone="subtle">
              {name}
            </Text>
            <Text size={14} leading={1.55}>
              {children}
            </Text>
            {actions ? (
              <View className="flex-row flex-wrap items-center gap-2">{actions}</View>
            ) : null}
          </View>
        </View>
      </StateSlot>
    </Card>
  );
}
