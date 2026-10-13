import type { YearMonth } from '@guara/types';
import { formatDate, joinList, normalizeForSearch } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  EmptyState,
  ScreenStates,
  lastUpdateLabel,
  toast,
  useScreenStatus,
} from '@/components/feedback';
import { Button, ConfirmDialog, MoneyText, SearchInput, Span, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab, conversationHref } from '@/navigation';

import { ChargesCalendar, SubscriptionListItem } from '../components';
import type { SubscriptionItem } from '../data';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { chargesIn, daysInMonth, nextCharge, yearly } from '../lib/subscriptions';
import { useSubscriptionsStore } from '../store';

/** Last sync with the banks (shown while offline). */
const SUBSCRIPTIONS_SYNCED_AT = '2026-09-23T17:30:00.000Z';

/** Assinaturas ativas: total, savings hint, detected list and the charges calendar. */
export function SubscriptionsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { items, today, total } = useSubscriptions();
  const dismiss = useSubscriptionsStore((state) => state.dismiss);
  const [pending, setPending] = useState<SubscriptionItem | null>(null);
  const [query, setQuery] = useState('');
  const search = normalizeForSearch(query);
  const found = search
    ? items.filter((item) => normalizeForSearch(item.name).includes(search))
    : items;
  // Static data today: the API adds loading and error.
  const status = useScreenStatus(items.length === 0 ? 'empty' : 'ready');

  // The calendar shows the month of the next charges.
  const month = (items[0] ? nextCharge(items[0], today) : today).slice(0, 7) as YearMonth;
  const monthName = formatDate(`${month}-01`, 'MMMM');
  const monthCharges = chargesIn(items, month);
  const charges = new Map<number, string[]>();
  for (const charge of monthCharges) {
    charges.set(charge.day, [...(charges.get(charge.day) ?? []), charge.item.name]);
  }
  const lastDay = monthCharges.at(-1)?.day ?? null;
  const tip = items.find((item) => item.savingTip);
  const open = (item: SubscriptionItem) =>
    router.navigate({
      pathname: '/spending/subscriptions/[subscriptionId]',
      params: { subscriptionId: item.id },
    });

  const totalCard = (
    <SectionCard gap={16} className="flex-1">
      <View className="gap-1">
        <Text size={14} tone="muted">
          Total em assinaturas
        </Text>
        <Text
          serif
          weight="extrabold"
          size={isTablet ? 36 : 32}
          leading={1.1}
          tracking={-0.01}
          tabular
        >
          <MoneyText
            value={total}
            serif
            weight="extrabold"
            size={isTablet ? 36 : 32}
            leading={1.1}
          />
          <Span weight="medium" tone="muted" style={{ fontSize: 16 }}>
            /mês
          </Span>
        </Text>
        <Text size={14} tone="muted">
          <MoneyText value={yearly(total)} size={14} tone="muted" /> por ano · {items.length}{' '}
          {items.length === 1 ? 'assinatura' : 'assinaturas'}
        </Text>
      </View>
    </SectionCard>
  );

  const insight = tip ? (
    <View className="flex-1 flex-row gap-3 rounded-20 bg-surface-muted p-4">
      <AssistantAvatar assistant="tamandua" size={32} />
      <View className="min-w-0 flex-1 gap-2">
        <Text size={14} leading={1.55}>
          {tip.savingTip} <MoneyText value={yearly(tip.amount)} size={14} weight="bold" />
          <Span weight="bold"> por ano</Span>.
        </Text>
        <View className="flex-row">
          <Button
            variant="secondary"
            size="md"
            leftIcon="message"
            className="h-10 px-4.5"
            onPress={() => router.navigate(conversationHref())}
          >
            Perguntar ao Tamanduá
          </Button>
        </View>
      </View>
    </View>
  ) : null;

  return (
    <View className="flex-1">
      <Screen
        header={isTablet ? null : <TopBar title="Assinaturas" fallbackHref="/spending" />}
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {isTablet ? <PageHeader title="Assinaturas" subtitle="Detectadas automaticamente" /> : null}
        <ScreenStates
          status={status}
          errorTitle="Não deu para carregar suas assinaturas"
          onRetry={() => undefined}
          empty={
            <SectionCard padding={16}>
              <EmptyState
                icon="repeat"
                title="Nenhuma assinatura encontrada"
                description="Procuramos cobranças da mesma empresa, com o mesmo valor, todo mês. Com 2 ou 3 meses de lançamentos já dá para reconhecer."
              />
            </SectionCard>
          }
          offline={{
            since: lastUpdateLabel(SUBSCRIPTIONS_SYNCED_AT),
            paused: 'Marcar “não é assinatura” volta quando a conexão voltar.',
          }}
        >
          {isTablet ? (
            <>
              <ResponsiveGrid columns={{ tablet: 2 }}>
                {totalCard}
                {insight}
              </ResponsiveGrid>
            </>
          ) : (
            <>
              {totalCard}
              {insight}
            </>
          )}
          <SectionCard
            title="Ativas"
            description="Detectadas por valor e empresa que se repetem"
            gap={6}
          >
            <SearchInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar assinatura"
              accessibilityLabel="Buscar assinatura"
            />
            {found.length === 0 ? (
              <EmptyState
                icon="search"
                title={`Nenhuma assinatura com “${query.trim()}”`}
                description={`Suas ${items.length} assinaturas são ${joinList(items.map((item) => item.name))}.`}
                action={{
                  label: 'Limpar filtros',
                  variant: 'secondary',
                  onPress: () => setQuery(''),
                }}
              />
            ) : null}
            <View>
              {found.map((item) => (
                <SubscriptionListItem
                  key={item.id}
                  item={item}
                  today={today}
                  wide={isTablet}
                  onOpen={open}
                  onNotSubscription={setPending}
                />
              ))}
            </View>
          </SectionCard>
          <SectionCard
            title={`Cobranças de ${monthName}`}
            titleSize={18}
            gap={12}
            onTitlePress={() => router.navigate('/spending/subscriptions/calendar')}
          >
            <ChargesCalendar days={daysInMonth(month)} monthName={monthName} charges={charges} />
            {lastDay !== null ? (
              <Text variant="caption" tone="muted">
                {lastDay <= 15
                  ? `Todas as cobranças vencem até o dia ${lastDay}. Nenhuma na segunda quinzena.`
                  : `As cobranças vão até o dia ${lastDay}.`}
              </Text>
            ) : null}
          </SectionCard>
        </ScreenStates>
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <ConfirmDialog
        open={pending !== null}
        title="Não é assinatura?"
        message={
          pending
            ? `${pending.name} deixa de aparecer como assinatura e volta a ser um gasto comum.`
            : undefined
        }
        confirmLabel="Remover da lista"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) {
            dismiss(pending.id);
            toast.success(`${pending.name} saiu das assinaturas`);
          }
          setPending(null);
        }}
      />
    </View>
  );
}
