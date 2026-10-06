import { colors, navigationSize } from '@guara/ui-tokens';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand';
import { Icon, Text, UserAvatar } from '@/components/ui';
import { ASSISTANT_ORDER, ASSISTANTS, AssistantAvatar } from '@/features/chat';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/haptics';

import { activeRail, conversationHref, RAIL_DESTINATIONS } from './destinations';

/** Assistants with something new for the user (dot on the portrait). */
const ASSISTANTS_WITH_ALERT = new Set(['quero_quero']);

/** Tablet navigation rail: logo, pages, the team and the user's profile. */
export function SideRail() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const current = activeRail(pathname);

  const go = (href: Parameters<typeof router.navigate>[0]) => {
    haptics.selection();
    router.navigate(href);
  };

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Principal"
      style={{
        width: navigationSize.railWidth,
        paddingTop: insets.top + 24,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
      className="border-r border-border bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center gap-6"
        showsVerticalScrollIndicator={false}
      >
        <LogoMark size={56} />
        <View className="gap-3">
          {RAIL_DESTINATIONS.map((item) => {
            const selected = current === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => go(item.href)}
                className="min-h-14 w-[72px] items-center gap-1"
              >
                <View
                  className={cn(
                    'h-8 w-14 items-center justify-center rounded-full',
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
                <Text
                  size={item.label.length > 10 ? 11 : 12}
                  weight={selected ? 'bold' : 'medium'}
                  tone={selected ? 'default' : 'muted'}
                  leading={1.3}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="w-[72px] items-center gap-2 border-t border-border pt-3.5">
          <Text size={9} weight="extrabold" tone="subtle" tracking={0.04}>
            ASSISTENTES
          </Text>
          <View className="items-center gap-2.5">
            {ASSISTANT_ORDER.map((id) => {
              const meta = ASSISTANTS[id];
              const alert = ASSISTANTS_WITH_ALERT.has(id);
              return (
                <Pressable
                  key={id}
                  accessibilityRole="link"
                  accessibilityLabel={`Conversar com ${meta.name}, ${meta.railLabel}${alert ? ', 1 alerta novo' : ''}`}
                  onPress={() => go(conversationHref())}
                  className="min-h-11 w-[72px] items-center gap-1"
                >
                  <AssistantAvatar assistant={id} size={40} alert={alert} />
                  <Text size={11} weight="semibold" tone="muted" leading={1.3} numberOfLines={1}>
                    {meta.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="flex-1" />
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Meu perfil"
          onPress={() => go('/account')}
          className="mt-4"
        >
          <UserAvatar size={44} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
