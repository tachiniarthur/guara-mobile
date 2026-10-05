import { colors, navigationSize } from '@guara/ui-tokens';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { activeTab, hidesTabBar, TAB_DESTINATIONS } from './destinations';

/** Phone navigation bar of the design (Folha escura, 84 tall, Tucano "Conversar"). */
export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  if (hidesTabBar(pathname)) return null;

  const current = activeTab(pathname);
  // The design reserves 16dp under the labels; on devices with a home indicator use the inset.
  const bottom = Math.max(insets.bottom, 16);

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Principal"
      style={{ height: navigationSize.tabBarHeight - 16 + bottom, paddingBottom: bottom }}
      className="flex-row items-start border-t border-border bg-background-elevated px-1 pt-2"
    >
      {TAB_DESTINATIONS.map((item) => {
        const selected = current === item.key;
        const isChat = item.key === 'chat';
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            onPress={() => {
              haptics.selection();
              router.navigate(item.href);
            }}
            className="min-w-14 flex-1 items-center gap-1"
          >
            {isChat ? (
              <View className="h-10 w-[52px] items-center justify-center rounded-20 bg-brand">
                <Icon name={item.icon} size={22} color={colors.brand.foreground} />
              </View>
            ) : (
              <View
                className={cn(
                  'mt-1 h-8 w-[52px] items-center justify-center rounded-full',
                  selected ? 'bg-surface-muted' : 'bg-transparent',
                )}
                // Fixed radius: Android drops it when the background changes after mount.
                style={{ borderRadius: 16 }}
              >
                <Icon
                  name={item.icon}
                  size={22}
                  color={selected ? colors.foreground.DEFAULT : colors.foreground.muted}
                />
              </View>
            )}
            <Text
              size={12}
              weight={selected || isChat ? 'bold' : 'medium'}
              tone={selected || isChat ? 'default' : 'muted'}
              leading={1.3}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
