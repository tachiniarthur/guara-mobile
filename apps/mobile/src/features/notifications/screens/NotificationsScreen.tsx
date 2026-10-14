import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  FilterEmpty,
  NotificationsOffNotice,
  ScreenStates,
  StateMessage,
  toast,
  useScreenStatus,
} from '@/components/feedback';
import { PageHeader, Screen, SectionCard, TopBar } from '@/components/layout';
import { Button, Card, Chip, DataRow, IconButton, LinkButton, Text } from '@/components/ui';
import { NOTICE_KINDS } from '@/features/account';
// Straight to the hook: the price-alerts index pulls in screens that open the chat.
import { usePriceAlerts } from '@/features/price-alerts/hooks/usePriceAlerts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';
import { useUiPreferences } from '@/stores';

import { NotificationRow } from '../components/NotificationRow';
import { NOTIFICATION_FILTERS, type NotificationArea } from '../data';
import { useNotifications } from '../hooks';
import { channelsLabel } from '../lib/labels';
import { useNotificationsStore } from '../store';

const EMPTY_TEXT =
  'Você não tem notificações. Avisos de tetos, preços e compras fora do padrão aparecem aqui.';

/** "Nada com esse filtro" of each area (`activeAlerts`: price alerts still waiting). */
function filterEmptyText(area: NotificationArea, activeAlerts: number): string {
  const label = NOTIFICATION_FILTERS.find((option) => option.value === area)?.label ?? '';
  const hint = {
    spending: 'Avisos de tetos, assinaturas e compras fora do padrão aparecem aqui.',
    investments:
      activeAlerts > 0
        ? `${activeAlerts === 1 ? 'Seu alerta' : `Seus ${activeAlerts} alertas`} de preço ainda não ${activeAlerts === 1 ? 'disparou' : 'dispararam'}.`
        : 'Os alertas de preço aparecem aqui quando um ativo chegar no valor escolhido.',
    account: 'Avisos sobre bancos conectados e o seu plano aparecem aqui.',
  }[area];
  return `Nenhuma notificação de ${label}. ${hint}`;
}

/** Last time the list came from the API (shown while offline). */
const NOTIFICATIONS_CHECKED_AT = '2026-09-23T17:30:00.000Z';

function SectionLabel({ children, first = false }: { children: string; first?: boolean }) {
  return (
    <Text
      size={12}
      weight="extrabold"
      tone="subtle"
      tracking={0.1}
      accessibilityRole="header"
      className={first ? undefined : 'mt-2'}
    >
      {children.toUpperCase()}
    </Text>
  );
}

/** Notificações: new and earlier notices, filtered by area, and how each kind is delivered. */
export function NotificationsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { items, unread } = useNotifications();
  // Static data today: the API adds loading and error ("Tudo em dia" is the list's own empty).
  const status = useScreenStatus('ready');
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const notices = useUiPreferences((state) => state.notices);
  const [filter, setFilter] = useState<NotificationArea | 'all'>('all');
  const activeAlerts = usePriceAlerts().alerts.filter((alert) => alert.status === 'active').length;

  const visible = items.filter((item) => filter === 'all' || item.area === filter);
  const fresh = visible.filter((item) => !item.read);
  const earlier = visible.filter((item) => item.read);

  const readAll = () => {
    markAllRead();
    toast.success('Todas as notificações foram marcadas como lidas');
  };

  const chips = NOTIFICATION_FILTERS.map((option) => (
    <Chip
      key={option.value}
      label={option.label}
      selected={filter === option.value}
      onPress={() => setFilter(option.value)}
      appearance="filled"
      textSize={14}
    />
  ));

  // "Tudo em dia": one message in place of the list (also the screen's empty state).
  const allDone = (
    <Card padding="sm" className="p-4">
      <StateMessage
        icon="check"
        title="Tudo em dia"
        description={EMPTY_TEXT}
        action={
          <Button variant="secondary" size="md" onPress={() => router.navigate('/account')}>
            Escolher como receber
          </Button>
        }
      />
    </Card>
  );

  const list = (
    <>
      {fresh.length ? (
        <>
          <SectionLabel first>{`Novas · ${fresh.length}`}</SectionLabel>
          <View className="gap-2.5">
            {fresh.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </View>
        </>
      ) : null}
      {earlier.length ? (
        <>
          <SectionLabel first={!fresh.length}>Anteriores</SectionLabel>
          <View className="gap-2.5">
            {earlier.map((item) => (
              <NotificationRow key={item.id} item={item} />
            ))}
          </View>
        </>
      ) : null}
      {visible.length ? null : filter === 'all' ? (
        allDone
      ) : (
        <Card padding="sm" className="p-4">
          <FilterEmpty
            description={filterEmptyText(filter, activeAlerts)}
            onClear={() => setFilter('all')}
          />
        </Card>
      )}
    </>
  );

  const states = {
    status,
    onRetry: () => undefined,
    since: NOTIFICATIONS_CHECKED_AT,
  };
  const content = status === 'empty' ? allDone : list;

  const delivery = (
    <SectionCard
      title="Como você recebe os avisos"
      description="Cada aviso de teto chega uma vez por mês"
      titleSize={18}
      padding={22}
      empty={null}
    >
      <View>
        {NOTICE_KINDS.map((kind, index) => (
          <DataRow
            key={kind.key}
            label={kind.label}
            value={channelsLabel(notices[kind.key])}
            last={index === NOTICE_KINDS.length - 1}
          />
        ))}
      </View>
      <LinkButton label="Mudar em Meu perfil" onPress={() => router.navigate('/account')} />
    </SectionCard>
  );

  if (isTablet) {
    return (
      <View className="flex-1">
        <Screen contentClassName="pb-28">
          <PageHeader
            title="Notificações"
            subtitle={unread ? `${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Nenhuma nova'}
            actions={
              <Button
                variant="secondary"
                size="md"
                className="px-4.5"
                disabled={!unread}
                onPress={readAll}
              >
                Marcar todas como lidas
              </Button>
            }
          />
          <NotificationsOffNotice />
          <ScreenStates {...states}>
            <View className="flex-row flex-wrap gap-2">{chips}</View>
            {content}
            {delivery}
          </ScreenStates>
        </Screen>
        <ChatFab />
      </View>
    );
  }

  return (
    <Screen
      header={
        <TopBar
          title="Notificações"
          leading="back"
          fallbackHref="/"
          actions={
            <IconButton
              icon="check"
              accessibilityLabel="Marcar todas como lidas"
              disabled={!unread}
              onPress={readAll}
            />
          }
        />
      }
      contentClassName="gap-4 pt-1"
    >
      <NotificationsOffNotice />
      <ScreenStates {...states}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Filtrar notificações"
          className="-mr-4"
          contentContainerClassName="gap-2 pr-4"
        >
          {chips}
        </ScrollView>
        {content}
        {delivery}
      </ScreenStates>
    </Screen>
  );
}
