import type { YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { EMPTY, formatCents, formatDate, formatPercent } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { MonthBarsChart } from '@/components/charts';
import { EmptyState, toast } from '@/components/feedback';
import {
  GridCellReset,
  PageHeader,
  ResponsiveGrid,
  Screen,
  SectionCard,
  TopBar,
} from '@/components/layout';
import { Badge, Button, ConfirmDialog, InfoNote, Span, Text } from '@/components/ui';
// Straight to the files: the budgets and chat indexes pull in the navigation.
import { PlainRow } from '@/features/budgets/components/PlainRow';
import { AssistantNote } from '@/features/chat/components/AssistantNote';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation/ChatFab';

import { SubscriptionMark } from '../components';
import type { SubscriptionItem } from '../data';
import { useSubscriptions } from '../hooks/useSubscriptions';
import {
  amountIn,
  chargeBars,
  chargesTotal,
  dayMonth,
  increaseOf,
  monthlyTotal,
  nextCharge,
  yearly,
} from '../lib/subscriptions';
import { useSubscriptionsStore } from '../store';

const LATEST = 4;

function Tile({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={13} tone="subtle">
        {label}
      </Text>
      <Text serif weight="bold" size={19} tabular>
        {value}
      </Text>
      <Text size={12} tone="muted">
        {caption}
      </Text>
    </View>
  );
}

/** "Netflix": price, next charge, a price increase, the charges and how to cancel. */
export function SubscriptionDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { subscriptionId } = useLocalSearchParams<{ subscriptionId: string }>();
  const { items, today } = useSubscriptions();
  const dismiss = useSubscriptionsStore((state) => state.dismiss);
  const [confirming, setConfirming] = useState(false);
  const item = items.find((entry) => entry.id === subscriptionId);

  if (!item) {
    return (
      <Screen header={<TopBar title="Assinatura" fallbackHref="/spending/subscriptions" />}>
        <EmptyState
          icon="repeat"
          title="Assinatura não encontrada"
          description={`Ela pode ter saído da lista (${subscriptionId}). Volte para as assinaturas.`}
          action={{
            label: 'Ver assinaturas',
            onPress: () => router.replace('/spending/subscriptions'),
          }}
        />
      </Screen>
    );
  }

  const next = nextCharge(item, today);
  const nextAmount = amountIn(item, next.slice(0, 7) as YearMonth);
  const increase = increaseOf(item);
  const nextMonthName = formatDate(next, 'MMMM');
  const account = `${item.bank} ${item.payment}`;
  const total = monthlyTotal(items);

  const header = (
    <SectionCard padding={22} gap={16}>
      <View className="flex-row items-center gap-3">
        <SubscriptionMark mark={item.mark} size={52} />
        <View className="min-w-0 flex-1">
          <Text size={20} weight="bold" leading={1.3}>
            {item.name}
          </Text>
          <Text size={13} tone="muted" leading={1.3}>
            {`${item.kind} · ${account} · todo dia ${item.day}`}
          </Text>
        </View>
        {increase ? <Badge label={`Subiu ${formatCents(increase.monthly)}`} tone="brand" /> : null}
      </View>
      <ResponsiveGrid columns={{ phone: 1, tablet: 3 }} gap={10}>
        <Tile
          label="Valor por mês"
          value={formatCents(item.amount)}
          caption={
            increase && increase.from >= today
              ? `a partir de ${formatDate(increase.from, 'MMMM')}`
              : 'cobrado todo mês'
          }
        />
        <Tile
          label="Próxima cobrança"
          value={formatDate(next)}
          caption={`${formatCents(nextAmount)} no ${item.bank}`}
        />
        <Tile
          label="Por ano"
          value={formatCents(yearly(item.amount))}
          caption={increase ? 'com o novo preço' : 'no preço atual'}
        />
      </ResponsiveGrid>
    </SectionCard>
  );

  const increaseCard = increase ? (
    <SectionCard title="Aumento de preço" titleSize={18} padding={22} gap={14}>
      <Text size={14} tone="muted" leading={1.55}>
        Passou de{' '}
        <Span weight="bold" tone="default">
          {formatCents(increase.previous)}
        </Span>{' '}
        para{' '}
        <Span weight="bold" tone="default">
          {formatCents(item.amount)}
        </Span>
        {` por mês (+${formatPercent(increase.percent, { fractionDigits: 1 })}). A primeira cobrança com o preço novo é a de ${formatDate(increase.from)}.`}
      </Text>
      <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
        {`No ano, são ${formatCents(increase.yearly)} a mais do que você pagava.`}
      </InfoNote>
    </SectionCard>
  ) : null;

  const tamandua = (
    <AssistantNote
      assistant="tamandua"
      actions={
        <Button
          variant="secondary"
          size="md"
          className="h-10 px-4.5"
          onPress={() => router.navigate('/investments/simulator/cut-expense')}
        >
          Simular corte
        </Button>
      }
    >
      {`${increase ? 'Com o aumento, as' : 'As'} ${items.length} assinaturas ${increase ? 'passam a somar' : 'somam'} ${formatCents(total)} por mês. Quer ver quanto sobraria cortando uma delas?`}
    </AssistantNote>
  );

  const bars = chargeBars(item, today);
  const latest = item.charges.slice(0, LATEST);
  const historyCard = (
    <SectionCard
      title="Histórico de cobranças"
      description={
        item.charges.length
          ? `Últimos ${item.charges.length} ${item.charges.length === 1 ? 'mês' : 'meses'} · ${formatCents(chargesTotal(item))}`
          : undefined
      }
      titleSize={18}
      padding={22}
      gap={14}
    >
      {item.charges.length ? (
        <>
          <MonthBarsChart
            height={150}
            data={bars.map((bar) => ({
              label: bar.label,
              value: bar.value,
              color: bar.forecast ? colors.brand.DEFAULT : colors.foreground.subtle,
            }))}
            format={(value) => formatCents(value, { hideSymbol: true })}
            accessibilityLabel={`${item.name}: ${bars
              .map(
                (bar) =>
                  `${bar.label.replace('*', '')} ${formatCents(bar.value)}${bar.forecast ? ' previsto' : ''}`,
              )
              .join(', ')}`}
          />
          <View>
            {latest.map((charge, index) => (
              <PlainRow
                key={charge.date}
                title="Cobrança mensal"
                caption={formatDate(charge.date)}
                trailing={
                  <Text weight="bold" tabular>
                    {formatCents(charge.amount)}
                  </Text>
                }
                last={index === latest.length - 1}
              />
            ))}
          </View>
          <Text size={12} tone="subtle" leading={1.55}>
            {`*${nextMonthName} previsto`}
          </Text>
        </>
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          {`Ainda não temos as cobranças anteriores de ${item.name}. A próxima é em ${dayMonth(next)}, de ${formatCents(nextAmount)}.`}
        </Text>
      )}
    </SectionCard>
  );

  const usageCard = (
    <SectionCard title="Uso recente" titleSize={18} padding={22} gap={14}>
      <Text serif weight="extrabold" size={30} leading={1.1} tabular>
        {item.unusedDays === null ? EMPTY : `${item.unusedDays} dias`}
      </Text>
      <Text size={14} tone="muted" leading={1.55}>
        {item.unusedDays === null
          ? `O Guará vê só a cobrança no cartão. Não dá para saber pelo banco se você tem ${item.useVerb}.`
          : `Sem uso aparente: nenhum gasto ligado ${item.article === 'a' ? 'à' : 'ao'} ${item.name} nos últimos ${item.unusedDays} dias.`}
      </Text>
    </SectionCard>
  );

  const cancelCard = (
    <SectionCard title="Como cancelar" titleSize={18} padding={22} gap={14}>
      <View className="gap-1.5">
        {[
          `Abra o app ou o site d${item.article} ${item.name} e entre na sua conta.`,
          item.cancelHint ?? 'Procure a área de assinatura ou plano e escolha cancelar.',
          `Cancele antes de ${dayMonth(next)} para não pagar ${nextMonthName}.`,
        ].map((step, index) => (
          <Text key={step} size={14} tone="muted" leading={1.5}>
            {`${index + 1}. ${step}`}
          </Text>
        ))}
      </View>
      <InfoNote icon="info" size={13} iconColor={colors.foreground.muted}>
        O Guará não cancela por você e não tem acesso à sua conta no serviço.
      </InfoNote>
      <View className="flex-row">
        <Button
          variant="ghost"
          size="md"
          className="h-10 px-4.5"
          onPress={() => setConfirming(true)}
        >
          Não é assinatura
        </Button>
      </View>
    </SectionCard>
  );

  const remove = (target: SubscriptionItem) => {
    setConfirming(false);
    if (router.canGoBack()) router.back();
    else router.replace('/spending/subscriptions');
    dismiss(target.id);
    toast.success(`${target.name} saiu das assinaturas`);
  };

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title={item.name}
              subtitle="Assinatura"
              fallbackHref="/spending/subscriptions"
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title={item.name}
            subtitle={`${item.kind} · ${account}`}
            breadcrumb={{
              parents: [{ label: 'Assinaturas', href: '/spending/subscriptions' }],
              current: item.name,
            }}
          />
        ) : null}
        {header}
        {isTablet ? (
          <ResponsiveGrid>
            <GridCellReset>
              <View className="gap-4">
                {increaseCard}
                {usageCard}
              </View>
            </GridCellReset>
            <GridCellReset>
              <View className="gap-4">
                {tamandua}
                {cancelCard}
              </View>
            </GridCellReset>
          </ResponsiveGrid>
        ) : (
          <>
            {increaseCard}
            {tamandua}
          </>
        )}
        {historyCard}
        {isTablet ? null : (
          <>
            {usageCard}
            {cancelCard}
          </>
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <ConfirmDialog
        open={confirming}
        title="Não é assinatura?"
        message={`${item.name} deixa de aparecer como assinatura e volta a ser um gasto comum.`}
        confirmLabel="Remover da lista"
        onCancel={() => setConfirming(false)}
        onConfirm={() => remove(item)}
      />
    </View>
  );
}
