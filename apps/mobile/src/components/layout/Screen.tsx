import { colors } from '@guara/ui-tokens';
import type { ReactNode, Ref } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';

import { ScreenOverlayHost } from './ScreenOverlay';

export interface ScreenProps {
  children: ReactNode;
  /** Fixed above the content (phone `TopBar`, app header). */
  header?: ReactNode;
  /** Fixed below the content (`StickyFooter` with the main action). */
  footer?: ReactNode;
  /** Wrap the content in a ScrollView (default true). */
  scroll?: boolean;
  /** Pull to refresh (only with `scroll`). */
  onRefresh?: () => void;
  refreshing?: boolean;
  /**
   * Safe-area edges to respect. Default: top only — the tab bar, the side rail and
   * `StickyFooter` handle the bottom inset themselves.
   */
  edges?: Edge[];
  /** Page padding: 16 on phones, 28 on tablets (default true). */
  padded?: boolean;
  /** Show the offline notice at the top (default true). */
  offlineBanner?: boolean;
  /** Classes for the content container. Default gap: 16 (phone) / 20 (tablet). */
  contentClassName?: string;
  /** Ref of the ScrollView (jump to a section). */
  scrollRef?: Ref<ScrollView>;
  /** Center short content vertically (result screens like "Conectando o Itaú…"). */
  centered?: boolean;
}

/** Base of every screen: Mata à noite background, safe area, header/footer slots, scroll. */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  onRefresh,
  refreshing = false,
  edges = ['top', 'left', 'right'],
  padded = true,
  offlineBanner = true,
  contentClassName,
  scrollRef,
  centered = false,
}: ScreenProps) {
  const { isTablet } = useBreakpoint();
  const content = (
    <View
      className={cn(
        isTablet ? 'gap-5' : 'gap-4',
        padded && (isTablet ? 'px-7 pb-10 pt-7' : 'px-4 pb-8 pt-1'),
        !scroll && 'flex-1',
        centered && 'flex-grow justify-center',
        contentClassName,
      )}
    >
      {offlineBanner ? <OfflineBanner /> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}>
      {header}
      <ScreenOverlayHost>
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={centered ? { flexGrow: 1 } : undefined}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.brand.DEFAULT}
                  colors={[colors.brand.DEFAULT]}
                  progressBackgroundColor={colors.surface.DEFAULT}
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          <View className="flex-1">{content}</View>
        )}
      </ScreenOverlayHost>
      {footer}
    </SafeAreaView>
  );
}
