import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { cn } from '@/lib/cn';

import { ResponsiveContainer } from './ResponsiveContainer';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /** Pull to refresh (only with `scroll`). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /**
   * Safe-area edges to respect. The native SafeAreaView only pads the part that actually
   * overlaps system UI, so it never doubles the space under a stack header or above the tab bar.
   */
  edges?: Edge[];
  /** Horizontal padding for the content (default true). */
  padded?: boolean;
  /** Show the offline notice at the top (default true). */
  offlineBanner?: boolean;
  /** Classes for the content container (inside the responsive width cap). */
  contentClassName?: string;
}

/** Base of every screen: theme background, safe area, optional scroll/refresh and tablet width cap. */
export function Screen({
  children,
  scroll = false,
  onRefresh,
  refreshing = false,
  edges = ['top', 'left', 'right', 'bottom'],
  padded = true,
  offlineBanner = true,
  contentClassName,
}: ScreenProps) {
  const content = (
    <ResponsiveContainer
      className={cn(padded && 'px-4', scroll ? 'gap-4 py-4' : 'flex-1', contentClassName)}
    >
      {offlineBanner ? <OfflineBanner /> : null}
      {children}
    </ResponsiveContainer>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.brand.DEFAULT}
                colors={[colors.brand.DEFAULT]}
                progressBackgroundColor={colors.background.elevated}
              />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      ) : (
        <View className="flex-1">{content}</View>
      )}
    </SafeAreaView>
  );
}
