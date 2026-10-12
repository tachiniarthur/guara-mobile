import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, Text, type IconName } from '@/components/ui';
import { cn } from '@/lib/cn';

/** List line of the cap pages: optional icon, title, caption and something on the right. */
export function PlainRow({
  title,
  caption,
  icon,
  trailing,
  last = false,
}: {
  title: string;
  caption?: string;
  icon?: IconName;
  trailing?: ReactNode;
  last?: boolean;
}) {
  return (
    <View
      accessible
      className={cn('flex-row items-center gap-3 py-3', !last && 'border-b border-border')}
    >
      {icon ? (
        <View className="h-9 w-9 items-center justify-center rounded-12 bg-surface-muted">
          <Icon name={icon} size={18} color={colors.foreground.muted} />
        </View>
      ) : null}
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {title}
        </Text>
        {caption ? (
          <Text size={12} tone="subtle" leading={1.35}>
            {caption}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
