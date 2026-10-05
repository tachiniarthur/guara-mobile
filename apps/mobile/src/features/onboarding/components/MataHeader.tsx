import { View } from 'react-native';

import { AppLogo } from '@/components/brand';
import { MataBackdrop } from '@/components/illustrations';
import { cn } from '@/lib/cn';

export interface MataHeaderProps {
  /** Phone: 180 tall, logo on the left. Tablet: 210 tall, logo centered. */
  layout: 'phone' | 'tablet';
  /** Extra top inset (status bar). */
  topInset?: number;
}

/** Mata photo header with the Guará logo (welcome and onboarding). */
export function MataHeader({ layout, topInset = 0 }: MataHeaderProps) {
  const isTablet = layout === 'tablet';
  return (
    <View
      style={{ height: (isTablet ? 210 : 180) + topInset, paddingTop: topInset }}
      className={cn('overflow-hidden bg-hero', !isTablet && 'mb-4')}
    >
      <MataBackdrop />
      <View className={cn('flex-row', isTablet ? 'justify-center pt-10' : 'px-4 py-7')}>
        <AppLogo size={54} wordmarkSize={30} inverse />
      </View>
    </View>
  );
}
