import { colors, navigationSize } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

export interface ChatSideColumnProps {
  /** `right`: panel beside any page. `left`: history beside the conversation page. */
  side: 'left' | 'right';
  accessibilityLabel: string;
  children: ReactNode;
}

/**
 * Shell of every chat column on wide tablets (history or open conversation): always
 * `navigationSize.chatPanelWidth` wide, so the chat looks the same on every page.
 */
export function ChatSideColumn({ side, accessibilityLabel, children }: ChatSideColumnProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'bg-surface',
        side === 'right' ? 'border-l border-border' : 'border-r border-border',
      )}
      style={{
        width: navigationSize.chatPanelWidth,
        paddingTop: insets.top,
        paddingRight: side === 'right' ? insets.right : 0,
        backgroundColor: colors.surface.DEFAULT,
      }}
    >
      {children}
    </View>
  );
}

/** 68-tall header row shared by the chat columns. */
export function ChatColumnHeader({ children }: { children: ReactNode }) {
  return (
    <View className="h-[68px] flex-row items-center gap-2.5 border-b border-border pl-4 pr-3">
      {children}
    </View>
  );
}
