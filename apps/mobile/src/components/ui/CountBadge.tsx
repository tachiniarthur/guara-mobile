import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface CountBadgeProps {
  count: number;
  /** Spoken label, e.g. "3 pendências", "2 novos". */
  accessibilityLabel: string;
  /** `md` = 28 (card headers), `sm` = 22 (menus). */
  size?: 'sm' | 'md';
  className?: string;
}

/** Urucum counter with dark text. */
export function CountBadge({ count, accessibilityLabel, size = 'md', className }: CountBadgeProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'items-center justify-center bg-negative',
        size === 'md'
          ? 'h-7 min-w-7 rounded-14 px-2'
          : 'h-[22px] min-w-[22px] rounded-full px-[7px]',
        className,
      )}
    >
      <Text size={size === 'md' ? 14 : 12} weight="extrabold" tone="inverse" leading={1.2}>
        {count}
      </Text>
    </View>
  );
}
