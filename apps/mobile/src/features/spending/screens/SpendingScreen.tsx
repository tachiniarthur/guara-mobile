import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { BarChart, LegendSwatch, PaceChart } from '@/components/charts';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import {
  Button,
  LinkButton,
  OptionSheet,
  SearchInput,
  SegmentedControl,
  SelectPill,
  Span,
  Text,
} from '@/components/ui';
import { useBankConnectionsStore } from '@/features/bank-connections';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { routeTo } from '@/constants/routes';
import { AccountMenuButton, ChatFab } from '@/navigation';

import {
  BankFilter,
  CategoryBreakdown,
  MonthBudgetRow,
  SubscriptionRow,
  TransactionRow,
  NewUserSpending,
} from '../components';
import {
  ACTIVE_SUBSCRIPTIONS,
  MONTHLY_TOTALS,
  PACE,
  RECENT_SUBSCRIPTION_ROW,
  RECENT_TRANSACTION_IDS,
  SPENDING,
  SPENDING_TODAY,
  SUBSCRIPTIONS_SUMMARY,
  WEEKDAY_AVERAGES,
  type SpendingBankId,
} from '../data';
import { useLedger } from '../hooks/useLedger';
import { categoryLabel } from '../categories';
import { accountLabel, shortDayLabel } from '../lib/format';
import { displayName, normalize, signedAmount } from '../lib/ledger';

const THOUSANDS = [0, 2000, 4000, 6000].map((value) => ({
  value,
  label: value === 0 ? '0' : `${value / 1000} mil`,
}));

const JUMPS = [
  { key: 'pace', label: 'Ritmo' },
  { key: 'months', label: '6 meses' },
  { key: 'categories', label: 'Categorias' },
  { key: 'budgets', label: 'Tetos' },
  { key: 'subscriptions', label: 'Assinaturas' },
  { key: 'transactions', label: 'Lançamentos' },
] as const;

type SectionKey = (typeof JUMPS)[number]['key'];

function Footnote({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption" tone="muted">
      {children}
    </Text>
  );
}

/** Gastos: pace of the month, last months, weekdays, categories, caps, subscriptions, entries. */
export function SpendingScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const scrollRef = useRef<ScrollView>(null);
  const [offsets, setOffsets] = useState<Partial<Record<SectionKey, number>>>({});
  const [bank, setBank] = useState<SpendingBankId>('all');
  const [view, setView] = useState<'consolidated' | 'byBank'>('consolidated');
  const [month, setMonth] = useState('2026-09');
  const [monthOpen, setMonthOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Without a connected bank, Gastos explains what will show up ("Gastos · novo").
  const newUser = useBankConnectionsStore((state) => state.connections.length === 0);

  const track = (key: SectionKey) => ({
    onLayout: (event: { nativeEvent: { layout: { y: number } } }) => {
      const { y } = event.nativeEvent.layout;
      setOffsets((current) => (current[key] === y ? current : { ...current, [key]: y }));
    },
  });
  const jump = (key: SectionKey) =>
    scrollRef.current?.scrollTo({ y: Math.max(0, (offsets[key] ?? 0) - 8), animated: true });

  const ledger = useLedger();
  const totalOut = ledger.summaryFor('all')?.totalOut ?? SPENDING.totalOut;
  const recent = [
    ...RECENT_TRANSACTION_IDS.flatMap((id) => {
      const tx = ledger.transactions.find((item) => item.id === id);
      if (!tx) return [];
      return [
        {
          id: tx.id,
          name: displayName(tx),
          detail: `${shortDayLabel(tx, SPENDING_TODAY)} · ${accountLabel(tx, ledger.accounts[tx.accountId])}`,
          category: categoryLabel(tx.categoryId),
          amount: signedAmount(tx),
          flagged: ledger.unusualOf(tx.id)?.status === 'pending',
          duplicate: tx.markedDuplicate,
          linked: true,
        },
      ];
    }),
    { ...RECENT_SUBSCRIPTION_ROW, flagged: false, duplicate: false, linked: false },
  ];
  const normalized = normalize(query);
  const transactions = recent.filter((tx) =>
    normalize(`${tx.name} ${tx.detail} ${tx.category}`).includes(normalized),
  );

  const monthPicker = (
    <SelectPill
      size={44}
      icon="calendar"
      label={isTablet ? SPENDING.monthShort : 'Set'}
      accessibilityLabel="Mês: setembro de 2026"
      onPress={() => setMonthOpen(true)}
    />
  );

  const viewToggle = (
    <SegmentedControl
      accessibilityLabel={isTablet ? 'Modo de visualização' : 'Visão'}
      size="sm"
      textSize={14}
      track={isTablet ? 'muted' : 'input'}
      appearance={isTablet ? 'raised' : 'inverse'}
      fill={isTablet}
      value={view}
      onChange={setView}
      options={[
        { value: 'consolidated', label: 'Consolidado' },
        { value: 'byBank', label: 'Por banco' },
      ]}
    />
  );

  const paceCard = (
    <View {...track('pace')}>
      <SectionCard title="Ritmo do mês" description="Gasto acumulado dia a dia">
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          <LegendSwatch label="Setembro" color={colors.chart.out} width={16} />
          <LegendSwatch label="Agosto" dashed width={16} />
        </View>
        <PaceChart
          variant={isTablet ? 'wide' : 'compact'}
          current={PACE.september}
          previous={PACE.august}
          daysInPeriod={PACE.daysInMonth}
          maxValue={6000}
          ticks={THOUSANDS}
          currentLabel="Setembro R$ 5.912"
          previousLabel="Agosto R$ 4.900"
          previousEndLabel={isTablet ? 'R$ 6.290' : undefined}
          describeDay={(day) =>
            `Dia ${day}: setembro R$ ${PACE.september[day - 1]?.toLocaleString('pt-BR')} · agosto R$ ${PACE.august[day - 1]?.toLocaleString('pt-BR')}`
          }
          accessibilityLabel={PACE.accessibilityLabel}
        />
        <Footnote>
          <Span weight="bold" tone="default">
            R$ 1.012 acima
          </Span>{' '}
          de agosto no mesmo dia, puxado pela compra de eletrônicos de hoje.
        </Footnote>
      </SectionCard>
    </View>
  );

  const monthsCard = (
    <View {...track('months')} className="flex-1">
      <SectionCard title="Últimos 6 meses" description="Total gasto por mês" className="flex-1">
        <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
          <LegendSwatch label="Gasto no mês" color={colors.chart.out} width={16} />
          <LegendSwatch
            label="Média de abr a ago"
            dashed
            color={colors.foreground.muted}
            width={16}
          />
          <LegendSwatch label="Previsão de setembro" dashed color={colors.chart.out} width={16} />
        </View>
        <View className="flex-1 justify-end">
          <BarChart
            data={MONTHLY_TOTALS.bars}
            maxValue={6000}
            ticks={THOUSANDS}
            average={MONTHLY_TOTALS.average}
            accessibilityLabel={MONTHLY_TOTALS.accessibilityLabel}
          />
        </View>
        <Footnote>
          Setembro deve fechar perto de{' '}
          <Span weight="bold" tone="default">
            R$ 6.050
          </Span>
          , 4% acima da média dos últimos meses.
        </Footnote>
      </SectionCard>
    </View>
  );

  const weekdayCard = (
    <SectionCard
      title="Por dia da semana"
      description="Gasto médio por dia, sem aluguel e compras acima de R$ 1.000"
      className="flex-1"
    >
      <View className="flex-1 justify-end">
        <BarChart
          data={WEEKDAY_AVERAGES.bars}
          maxValue={(200 * 144) / 134.4}
          ticks={[0, 100, 200].map((value) => ({ value, label: String(value) }))}
          left={36}
          barWidth={30}
          dimOpacity={0.45}
          accessibilityLabel={WEEKDAY_AVERAGES.accessibilityLabel}
        />
      </View>
      <Footnote>
        Sexta e sábado concentram{' '}
        <Span weight="bold" tone="default">
          36%
        </Span>{' '}
        dos gastos do mês, quase tudo em delivery e lazer.
      </Footnote>
    </SectionCard>
  );

  const categoriesCard = (
    <View {...track('categories')}>
      <SectionCard
        title="Por categoria"
        titleSize={isTablet ? 20 : 18}
        description={
          isTablet
            ? 'Outros gastos somam R$ 1.332,39'
            : 'Toque numa categoria para ver os lançamentos'
        }
        padding={isTablet ? 20 : 16}
        gap={isTablet ? 16 : 8}
      >
        <CategoryBreakdown
          items={ledger.categoryTotals}
          totalOut={totalOut}
          wide={isTablet}
          onSelect={(categoryId) =>
            router.navigate({ pathname: '/spending/category/[categoryId]', params: { categoryId } })
          }
        />
      </SectionCard>
    </View>
  );

  const budgetsCard = (
    <View {...track('budgets')} className="flex-1">
      <SectionCard
        title="Tetos do mês"
        description="Cada aviso chega uma vez por mês, somando crédito e débito"
        onTitlePress={() => router.navigate('/budgets')}
        padding={isTablet ? 20 : 16}
        gap={20}
        className="flex-1"
        action={
          <Button
            variant="secondary"
            size="md"
            leftIcon="plus"
            className="h-10 px-4.5"
            onPress={() => router.navigate('/new-budget')}
          >
            Novo teto
          </Button>
        }
      >
        {ledger.budgets.map((budget) => (
          <MonthBudgetRow
            key={budget.id}
            {...budget}
            onPress={() => router.navigate(routeTo.budget(budget.id))}
          />
        ))}
      </SectionCard>
    </View>
  );

  const subscriptionsCard = (
    <View {...track('subscriptions')} className="flex-1">
      <SectionCard
        title="Assinaturas ativas"
        description={SUBSCRIPTIONS_SUMMARY}
        padding={isTablet ? 20 : 16}
        gap={16}
        className="flex-1"
        action={
          <LinkButton
            label="Ver todas"
            onPress={() => router.navigate('/spending/subscriptions')}
            className="min-h-6"
          />
        }
      >
        <View className="gap-1.5">
          {ACTIVE_SUBSCRIPTIONS.map((item) => (
            <SubscriptionRow key={item.id} {...item} />
          ))}
        </View>
      </SectionCard>
    </View>
  );

  const transactionsCard = (
    <View {...track('transactions')}>
      <SectionCard
        title={isTablet ? 'Lançamentos' : 'Últimos lançamentos'}
        titleSize={isTablet ? 20 : 18}
        padding={isTablet ? 20 : 16}
        gap={isTablet ? 12 : 4}
        action={
          <LinkButton
            label={`Ver ${SPENDING.transactionsCount}`}
            onPress={() => router.navigate('/spending/transactions')}
            className="min-h-6"
          />
        }
      >
        <View className={isTablet ? undefined : 'mb-1 mt-2'}>
          <SearchInput
            size={44}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar lançamento"
            accessibilityLabel="Buscar lançamento"
          />
        </View>
        <View>
          {transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              name={tx.name}
              detail={isTablet ? `${tx.detail} · ${tx.category}` : tx.detail}
              amount={tx.amount}
              flagged={tx.flagged}
              duplicate={tx.duplicate}
              incomeTone="info"
              onPress={tx.linked ? () => router.navigate(routeTo.transaction(tx.id)) : undefined}
            />
          ))}
          {transactions.length === 0 ? (
            <Text variant="caption" tone="subtle" className="py-3">
              Nenhum lançamento encontrado.
            </Text>
          ) : null}
        </View>
      </SectionCard>
    </View>
  );

  return (
    <View className="flex-1">
      <Screen
        scrollRef={scrollRef}
        header={
          isTablet ? null : (
            <TopBar
              title="Gastos"
              leading="none"
              actions={
                <>
                  {newUser ? null : monthPicker}
                  <AccountMenuButton />
                </>
              }
            />
          )
        }
        contentClassName={isTablet ? 'pb-32' : undefined}
      >
        {newUser ? (
          <>
            {isTablet ? <PageHeader title="Gastos" /> : null}
            <NewUserSpending />
          </>
        ) : isTablet ? (
          <>
            <PageHeader title="Gastos" subtitle={SPENDING.subtitle} actions={monthPicker} />
            <View className="flex-row flex-wrap items-center justify-between gap-3">
              <BankFilter value={bank} onChange={setBank} wrap />
              <View className="w-[260px]">{viewToggle}</View>
            </View>
            {paceCard}
            <ResponsiveGrid columns={{ tablet: 2 }}>
              {monthsCard}
              {weekdayCard}
            </ResponsiveGrid>
            {categoriesCard}
            {transactionsCard}
            <ResponsiveGrid columns={{ tablet: 2 }}>
              {budgetsCard}
              {subscriptionsCard}
            </ResponsiveGrid>
          </>
        ) : (
          <>
            <BankFilter value={bank} onChange={setBank} />
            {viewToggle}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              accessibilityLabel="Ir para"
              className="-mr-4"
              contentContainerClassName="gap-1.5 pr-4"
            >
              {JUMPS.map((item) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="link"
                  onPress={() => jump(item.key)}
                  className="h-[34px] justify-center rounded-full border border-border-strong px-3 active:bg-surface-pressed"
                >
                  <Text size={13} weight="bold" tone="muted">
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {paceCard}
            {monthsCard}
            {weekdayCard}
            {categoriesCard}
            {budgetsCard}
            {subscriptionsCard}
            {transactionsCard}
          </>
        )}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <OptionSheet
        open={monthOpen}
        onClose={() => setMonthOpen(false)}
        title="Mês"
        value={month}
        onChange={setMonth}
        options={[
          { value: '2026-09', label: 'Setembro de 2026' },
          { value: '2026-08', label: 'Agosto de 2026' },
          { value: '2026-07', label: 'Julho de 2026' },
        ]}
      />
    </View>
  );
}
