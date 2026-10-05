import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

export interface StickyFooterProps {
  children: ReactNode;
  className?: string;
}

/** Bottom action bar of forms and onboarding steps (Musgo top border). */
export function StickyFooter({ children, className }: StickyFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 12 }}
      className={cn('flex-row gap-2.5 border-t border-border bg-background px-4 pt-3', className)}
    >
      {children}
    </View>
  );
}
