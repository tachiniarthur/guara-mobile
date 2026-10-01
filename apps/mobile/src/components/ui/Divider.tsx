import { StyleSheet, View } from 'react-native';

import { cn } from '@/lib/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Left inset to align with list content (e.g. after an icon). */
  inset?: boolean;
  className?: string;
}

/** Hairline separator in the border token color. */
export function Divider({ orientation = 'horizontal', inset = false, className }: DividerProps) {
  const horizontal = orientation === 'horizontal';
  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      className={cn('self-stretch bg-border', inset && 'ml-16', className)}
      style={
        horizontal ? { height: StyleSheet.hairlineWidth } : { width: StyleSheet.hairlineWidth }
      }
    />
  );
}
