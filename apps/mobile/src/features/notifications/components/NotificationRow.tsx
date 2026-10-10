import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { NOTIFICATIONS_TODAY, type NotificationItem, type NotificationTone } from '../data';
import { notificationMeta } from '../lib/labels';
import { useNotificationsStore } from '../store';

const TILE: Record<NotificationTone, { className: string; color: string }> = {
  negative: { className: 'bg-negative-muted', color: colors.negative.DEFAULT },
  brand: { className: 'bg-brand-muted', color: colors.brand.DEFAULT },
  info: { className: 'bg-info-muted', color: colors.info.DEFAULT },
  neutral: { className: 'bg-surface-muted', color: colors.foreground.muted },
};

/** One notice: icon, title, detail, who sent it and when, its action and the unread dot. */
export function NotificationRow({ item }: { item: NotificationItem }) {
  const router = useRouter();
  const markRead = useNotificationsStore((state) => state.markRead);
  const tile = TILE[item.tone];
  const action = item.action;
  return (
    <View
      className={cn(
        'flex-row items-center gap-3.5 rounded-20 border border-border px-4 py-3.5',
        item.read ? 'bg-transparent' : 'bg-surface',
      )}
    >
      <View className={cn('h-10 w-10 items-center justify-center rounded-12', tile.className)}>
        <Icon name={item.icon} size={20} color={tile.color} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text size={15} weight="bold" leading={1.4}>
          {item.title}
        </Text>
        <Text size={13} tone="muted" leading={1.4}>
          {item.body}
        </Text>
        <Text size={12} tone="subtle" leading={1.4}>
          {notificationMeta(item, NOTIFICATIONS_TODAY)}
        </Text>
      </View>
      {action ? (
        <Button
          variant="secondary"
          size="md"
          className="px-4.5"
          accessibilityLabel={`${action.label}: ${item.title}`}
          onPress={() => {
            markRead(item.id);
            router.navigate(action.href);
          }}
        >
          {action.label}
        </Button>
      ) : null}
      {item.read ? null : (
        <View
          accessible
          accessibilityLabel="Não lida"
          className="h-2.5 w-2.5 rounded-full bg-brand"
        />
      )}
    </View>
  );
}
