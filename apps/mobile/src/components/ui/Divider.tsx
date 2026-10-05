import { View } from 'react-native';

import { cn } from '@/lib/cn';

export interface DividerProps {
  vertical?: boolean;
  className?: string;
}

/** 1px Musgo line. */
export function Divider({ vertical = false, className }: DividerProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(vertical ? 'w-px self-stretch' : 'h-px w-full', 'bg-border', className)}
    />
  );
}
