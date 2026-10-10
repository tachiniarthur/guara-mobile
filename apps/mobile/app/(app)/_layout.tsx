import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

import { ChatPanel, useChatStore } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useChatDocked } from '@/hooks/useChatDocked';
import { isChatPath, SideRail } from '@/navigation';
import { stackScreenOptions } from '@/theme/navigation';

export const unstable_settings = { initialRouteName: '(tabs)' };

/**
 * Authenticated area: tabs + pushed screens + everything under (modals).
 * Phones present (modals) as modals; tablets keep them as pages beside the side rail.
 * Wide tablets also keep the chat panel on the right of every page (the chat pages show
 * the history column on the left instead); phones and narrower tablets open it over the page
 * (`/chat-panel`).
 */
export default function AppLayout() {
  const { isTablet } = useBreakpoint();
  const docked = useChatDocked();
  const pathname = usePathname();
  const panelOpen = useChatStore((state) => state.panelOpen);
  const showPanel = docked && panelOpen && !isChatPath(pathname);

  const stack = (
    <Stack
      screenOptions={({ route }) => ({
        ...stackScreenOptions,
        ...(route.name.startsWith('(modals)/') && !isTablet
          ? { presentation: 'modal' as const }
          : null),
      })}
    >
      <Stack.Screen name="(tabs)" />
      {/* "Chat aberto sobre a tela": the page stays visible under the chat. */}
      <Stack.Screen
        name="chat-panel"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );

  if (!isTablet) return stack;

  return (
    <View className="flex-1 flex-row bg-background">
      <SideRail />
      <View className="flex-1">{stack}</View>
      {showPanel ? <ChatPanel /> : null}
    </View>
  );
}
