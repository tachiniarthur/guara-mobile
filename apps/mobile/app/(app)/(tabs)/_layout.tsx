import { Tabs } from 'expo-router';
import {
  EllipsisIcon,
  HouseIcon,
  MessagesSquareIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
  type LucideIcon,
} from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { TAB_LABELS } from '@/constants/copy';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { tabBarColors } from '@/theme/navigation';

interface TabIconProps {
  icon: LucideIcon;
  color: ColorValue;
  size: number;
}

// Tint colors come from the tokens (hex strings), so the ColorValue cast is safe.
function TabIcon({ icon: Icon, color, size }: TabIconProps) {
  return <Icon color={color as string} size={size} />;
}

export default function TabsLayout() {
  const { isTablet } = useBreakpoint();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarColors.active,
        tabBarInactiveTintColor: tabBarColors.inactive,
        tabBarStyle: {
          backgroundColor: tabBarColors.background,
          borderTopColor: tabBarColors.border,
        },
        // Tablet: labels beside icons. A side rail can replace this later without
        // changing routes (same features on every screen size).
        tabBarLabelPosition: isTablet ? 'beside-icon' : 'below-icon',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: TAB_LABELS.home,
          tabBarIcon: (props) => <TabIcon icon={HouseIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="spending"
        options={{
          title: TAB_LABELS.spending,
          tabBarIcon: (props) => <TabIcon icon={ReceiptTextIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: TAB_LABELS.investments,
          tabBarIcon: (props) => <TabIcon icon={TrendingUpIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: TAB_LABELS.assistants,
          tabBarIcon: (props) => <TabIcon icon={MessagesSquareIcon} {...props} />,
        }}
      />
      <Tabs.Screen
        name="more/index"
        options={{
          title: TAB_LABELS.more,
          tabBarIcon: (props) => <TabIcon icon={EllipsisIcon} {...props} />,
        }}
      />
    </Tabs>
  );
}
