import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface SectionProps {
  title: string;
  /** Optional link on the right, e.g. { label: 'Ver tudo', onPress }. */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  className?: string;
}

/** Titled block of content with an optional "Ver tudo" link. */
export function Section({ title, action, children, className }: SectionProps) {
  return (
    <View className={cn('gap-3', className)}>
      <View className="min-h-touch flex-row items-center justify-between gap-3">
        <Text variant="subtitle" accessibilityRole="header" className="flex-1" numberOfLines={1}>
          {title}
        </Text>
        {action ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${action.label}: ${title}`}
            onPress={action.onPress}
            className="min-h-touch justify-center px-2"
          >
            <Text variant="label" tone="brand">
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}
