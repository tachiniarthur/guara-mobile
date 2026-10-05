import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export interface CardHeaderProps {
  title: string;
  /** Element right after the title (counter, badge). */
  adornment?: ReactNode;
  /** Right side (link, segmented control). */
  aside?: ReactNode;
  /** Title size (design: 19 on cards, 18/20 on simulators). */
  size?: number;
  className?: string;
}

/** Card title row: Fraunces 700 title on the left, action on the right. */
export function CardHeader({ title, adornment, aside, size = 19, className }: CardHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3', className)}>
      <View className="min-w-0 flex-shrink flex-row items-center gap-2.5">
        <Text variant="heading" size={size} accessibilityRole="header">
          {title}
        </Text>
        {adornment}
      </View>
      {aside}
    </View>
  );
}
