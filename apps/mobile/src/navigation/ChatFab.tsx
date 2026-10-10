import { colors } from '@guara/ui-tokens';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/components/ui';
import { useChatNavigation } from '@/features/chat/hooks/useChatNavigation';
import { useChatStore } from '@/features/chat/store';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useChatDocked } from '@/hooks/useChatDocked';
import { haptics } from '@/lib/haptics';

const SHADOW = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};

/**
 * "Chat em qualquer tela". Tablets: floating "Conversar" at the bottom right of every page (on
 * wide tablets it reopens the docked panel and hides while the panel is open). Phones: round
 * button on the pages without the bottom bar (forms, Meu perfil); the bar has its own
 * "Conversar".
 */
export function ChatFab() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useBreakpoint();
  const docked = useChatDocked();
  const panelOpen = useChatStore((state) => state.panelOpen);
  const chat = useChatNavigation();
  if (docked && panelOpen) return null;

  const open = () => {
    haptics.impact();
    chat.open();
  };

  if (!isTablet) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir o chat"
        onPress={open}
        // Above the sticky action of the forms.
        style={{ right: 16, bottom: 84 + Math.max(insets.bottom, 24), ...SHADOW }}
        className="absolute h-14 w-14 items-center justify-center rounded-20 bg-brand active:bg-brand-pressed"
      >
        <Icon name="message" size={24} color={colors.brand.foreground} />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Conversar"
      onPress={open}
      style={{ right: 28, bottom: Math.max(insets.bottom, 0) + 28, ...SHADOW }}
      className="absolute h-14 flex-row items-center gap-2.5 rounded-24 bg-brand pl-4.5 pr-5.5 active:bg-brand-pressed"
    >
      <Icon name="message" size={22} color={colors.brand.foreground} />
      <Text size={16} weight="bold" tone="inverse">
        Conversar
      </Text>
    </Pressable>
  );
}
