import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, StickyFooter, TopBar, type TopBarProps } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';

import { MataHeader } from './MataHeader';

export interface OnboardingFrameProps {
  children: ReactNode;
  /** Phone header (back button, optional title and actions). Omit to hide it. */
  topBar?: TopBarProps;
  /** Phone: sticky action bar. */
  footer?: ReactNode;
  /** Tablet: action row at the end of the card (default: `footer`). */
  tabletFooter?: ReactNode;
  /** Phone: center short content vertically (Malvo connecting/error). */
  centered?: boolean;
  /** Phone: show the Mata header instead of a top bar (welcome screen). */
  mataHeaderOnPhone?: boolean;
}

/**
 * Onboarding layout. Phone: top bar, content and a sticky footer. Tablet: Mata header and a
 * 600-wide card overlapping it, with the actions inside the card.
 */
export function OnboardingFrame({
  children,
  topBar,
  footer,
  tabletFooter,
  mataHeaderOnPhone = false,
  centered = false,
}: OnboardingFrameProps) {
  const { isTablet } = useBreakpoint();
  const insets = useSafeAreaInsets();

  if (isTablet) {
    const actions = tabletFooter ?? footer;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <MataHeader layout="tablet" topInset={insets.top} />
        <View className="-mt-[70px] w-[600px] max-w-full gap-6.5 self-center rounded-24 border border-border bg-surface p-10">
          {children}
          {actions ? <View className="flex-row gap-2.5">{actions}</View> : null}
        </View>
      </ScrollView>
    );
  }

  if (mataHeaderOnPhone) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <MataHeader layout="phone" topInset={insets.top} />
        <View className="gap-5.5 px-4 pt-2">{children}</View>
      </ScrollView>
    );
  }

  return (
    <Screen
      header={topBar ? <TopBar {...topBar} /> : null}
      footer={footer ? <StickyFooter>{footer}</StickyFooter> : null}
      centered={centered}
      contentClassName="gap-5.5 pt-2"
    >
      {children}
    </Screen>
  );
}
