import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/components/ui';
import { useChatStore } from '@/features/chat/store';
import { useChatDocked } from '@/hooks/useChatDocked';
import { haptics } from '@/lib/haptics';

import { conversationHref } from './destinations';

/**
 * Tablet floating "Conversar" button (bottom right of the main pages). On wide tablets it
 * reopens the chat side panel and hides while the panel is open.
 */
export function ChatFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const docked = useChatDocked();
  const panelOpen = useChatStore((state) => state.panelOpen);
  const openPanel = useChatStore((state) => state.openPanel);
  if (docked && panelOpen) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Conversar"
      onPress={() => {
        haptics.impact();
        if (docked) openPanel('conversation');
        else router.navigate(conversationHref());
      }}
      style={{
        right: 28,
        bottom: Math.max(insets.bottom, 0) + 28,
        shadowColor: colors.shadow,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
      className="absolute h-14 flex-row items-center gap-2.5 rounded-24 bg-brand pl-4.5 pr-5.5 active:bg-brand-pressed"
    >
      <Icon name="message" size={22} color={colors.brand.foreground} />
      <Text size={16} weight="bold" tone="inverse">
        Conversar
      </Text>
    </Pressable>
  );
}
