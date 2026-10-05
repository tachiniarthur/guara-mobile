import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { toast } from '@/components/feedback';
import { Button, ConfirmDialog, MoneyText, Span, Text } from '@/components/ui';
import { AssistantAvatar } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab, conversationHref } from '@/navigation';

import { ChargesCalendar, SubscriptionListItem } from '../components';
import {
  CALENDAR,
  PRIME_YEARLY_SAVING,
  SUBSCRIPTIONS,
  SUBSCRIPTIONS_TOTAL,
  SUBSCRIPTIONS_YEARLY,
  type SubscriptionItem,
} from '../data';

/** Assinaturas ativas: total, savings hint, detected list and the charges calendar. */
export function SubscriptionsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const [items, setItems] = useState(SUBSCRIPTIONS);
  const [pending, setPending] = useState<SubscriptionItem | null>(null);

  const charges = new Map<number, string[]>();
  for (const item of items) charges.set(item.day, [...(charges.get(item.day) ?? []), item.name]);

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
            value={SUBSCRIPTIONS_TOTAL}
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
          <MoneyText value={SUBSCRIPTIONS_YEARLY} size={14} tone="muted" /> por ano · {items.length}{' '}
          assinaturas
        </Text>
      </View>
    </SectionCard>
  );

  const insight = (
    <View className="flex-1 flex-row gap-3 rounded-20 bg-surface-muted p-4">
      <AssistantAvatar assistant="tamandua" size={32} />
      <View className="min-w-0 flex-1 gap-2">
        <Text size={14} leading={1.55}>
          Você não comprou na Amazon nos últimos 60 dias. Se cancelar o Prime, economiza{' '}
          <MoneyText value={PRIME_YEARLY_SAVING} size={14} weight="bold" />
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
  );

  return (
    <View className="flex-1">
      <Screen
        header={isTablet ? null : <TopBar title="Assinaturas" fallbackHref="/spending" />}
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {isTablet ? (
          <>
            <PageHeader title="Assinaturas" subtitle="Detectadas automaticamente" />
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
          <View>
            {items.map((item) => (
              <SubscriptionListItem
                key={item.id}
                item={item}
                wide={isTablet}
                onNotSubscription={setPending}
              />
            ))}
          </View>
        </SectionCard>
        <SectionCard title={CALENDAR.title} titleSize={18} gap={12}>
          <ChargesCalendar days={CALENDAR.days} monthName={CALENDAR.monthName} charges={charges} />
          <Text variant="caption" tone="muted">
            Todas as cobranças vencem até o dia 15. Nenhuma na segunda quinzena.
          </Text>
        </SectionCard>
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
            setItems((current) => current.filter((item) => item.id !== pending.id));
            toast.success(`${pending.name} saiu das assinaturas`);
          }
          setPending(null);
        }}
      />
    </View>
  );
}
