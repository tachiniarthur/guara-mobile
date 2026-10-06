import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CountBadge, Icon, Text, UserAvatar } from '@/components/ui';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { haptics } from '@/lib/haptics';
import { usePlan, useUserStore } from '@/stores';

import { ACCOUNT_MENU } from './destinations';

/** User avatar ("AR") that opens the account menu (phone headers). */
export function AccountMenuButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const banks = useBankConnectionsStore(
    (state) => state.connections.filter((item) => item.status !== 'paused').length,
  );
  const name = useUserStore((state) => state.name);
  const plan = usePlan();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Menu da conta de ${name}`}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          haptics.selection();
          setOpen(true);
        }}
        className="h-11 w-11 items-center justify-center rounded-full"
      >
        <UserAvatar size={34} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar menu da conta"
          onPress={() => setOpen(false)}
          className="absolute bottom-0 left-0 right-0 top-0 bg-overlay"
        />
        <View
          accessibilityRole="menu"
          accessibilityLabel="Conta"
          accessibilityViewIsModal
          style={{
            top: insets.top + 58,
            shadowColor: colors.shadow,
            shadowOpacity: 0.45,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
          }}
          className="absolute right-3 w-[300px] gap-0.5 rounded-22 border border-border-strong bg-surface-input p-2"
        >
          <View className="mb-1 flex-row items-center gap-3 border-b border-border px-3 pb-3 pt-2.5">
            <UserAvatar size={40} />
            <View className="min-w-0">
              <Text size={15} weight="bold" leading={1.3}>
                {name}
              </Text>
              <Text variant="caption" tone="subtle" leading={1.3}>
                {`${banks} de ${plan.bankLimit} bancos conectados`}
              </Text>
            </View>
          </View>
          {ACCOUNT_MENU.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="menuitem"
              accessibilityLabel={item.badge ? `${item.label}, ${item.badge} novos` : item.label}
              onPress={() => {
                setOpen(false);
                router.navigate(item.href);
              }}
              className="min-h-12 flex-row items-center gap-3 rounded-14 px-3 active:bg-surface-pressed"
            >
              <Icon name={item.icon} size={20} color={colors.foreground.muted} />
              <Text size={15} weight="semibold" className="flex-1">
                {item.label}
              </Text>
              {item.badge ? (
                <CountBadge
                  size="sm"
                  count={item.badge}
                  accessibilityLabel={`${item.badge} novos`}
                />
              ) : null}
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}
