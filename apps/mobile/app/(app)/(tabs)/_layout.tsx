import { Tabs } from 'expo-router';

import { useBreakpoint } from '@/hooks/useBreakpoint';
import { BottomTabBar } from '@/navigation';

/**
 * Tabs of the app. Phones draw the design's bottom bar; tablets hide it and navigate through
 * the side rail rendered by the (app) layout. Same features on every screen size.
 */
export default function TabsLayout() {
  const { isTablet } = useBreakpoint();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => (isTablet ? null : <BottomTabBar />)}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="spending" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="investments" />
      <Tabs.Screen name="assistants" />
    </Tabs>
  );
}
