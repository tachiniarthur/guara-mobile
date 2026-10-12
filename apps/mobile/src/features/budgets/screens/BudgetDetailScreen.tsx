import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate, joinList } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { MonthCapChart } from '@/components/charts';
import { EmptyState, toast } from '@/components/feedback';
import { MataSurface } from '@/components/illustrations';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Badge, Button, ConfirmDialog, IconButton, LinkButton, Span, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
// Straight to the files: Gastos imports this feature back.
import { TransactionRow } from '@/features/spending/components/TransactionRow';
import { useLedger } from '@/features/spending/hooks/useLedger';
import { bankLabel, rowDetail } from '@/features/spending/lib/format';
import { displayName, signedAmount } from '@/features/spending/lib/ledger';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { haptics } from '@/lib/haptics';
import { ChatFab } from '@/navigation/ChatFab';

import { BudgetBar, BudgetStatusBadge, PlainRow } from '../components';
import { CATEGORY_HISTORY } from '../data';
import { useBudgets } from '../hooks/useBudgets';
import {
  detailParts,
  historyBars,
  historyLabel,
  monthName,
  monthsOverCap,
  noticeDetail,
  noticeRows,
  threeMonthAverage,
  type BudgetView,
} from '../lib/budgets';
import { useBudgetsStore } from '../store';

const whole = (value: number) => formatCents(value, { wholeUnits: true });
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const LATEST = 5;

function Hero({ budget, month }: { budget: BudgetView; month: string }) {
  const parts = detailParts(budget);
  return (
    <MataSurface
      veil={[0.85, 0.55, 0.1]}
      className="gap-2.5 rounded-24 border border-border-strong bg-hero p-[22px]"
    >
      <View className="flex-row items-center gap-2.5">
        <Text size={14} className="flex-1" style={{ color: colors.hero.label }}>
          {`${budget.label} · ${monthName(month)}`}
        </Text>
        <BudgetStatusBadge status={budget.status} />
      </View>
      <View className="flex-row flex-wrap items-baseline">
        <Text serif weight="extrabold" size={36} leading={1.1} tabular>
          {formatCents(budget.spent)}
        </Text>
        <Text serif size={16} weight="medium" tone="muted">
          {` de ${formatCents(budget.limit)}`}
        </Text>
      </View>
      <BudgetBar
        spent={budget.spent}
        limit={budget.limit}
        warnings={budget.warnings}
        height={12}
        onHero
      />
      <Text size={14} style={{ color: colors.hero.caption }}>
        {`${parts.percent} · ${parts.remaining.before} `}
        <Span weight="bold" style={{ color: colors.hero.foreground }}>
          {parts.remaining.value}
        </Span>
        {parts.remaining.after}
        {parts.pace ? ` · ${parts.pace.text}` : ''}
        {parts.pace?.value ? (
          <>
            {' '}
            <Span weight="bold" style={{ color: colors.hero.foreground }}>
              {parts.pace.value}
            </Span>
          </>
        ) : null}
      </Text>
    </MataSurface>
  );
}

/** "Teto de Alimentação": the month against the cap, last months, warnings and transactions. */
export function BudgetDetailScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();
  const { month, today, budgets } = useBudgets();
  const remove = useBudgetsStore((state) => state.remove);
  const ledger = useLedger();
  const [confirming, setConfirming] = useState(false);
  const budget = budgets.find((item) => item.id === budgetId);

  if (!budget) {
    return (
      <Screen header={<TopBar title="Teto de gasto" fallbackHref="/budgets" />}>
        <EmptyState
          icon="target"
          title="Teto não encontrado"
          description={`Ele pode ter sido excluído (${budgetId}). Volte para os tetos de gasto.`}
          action={{ label: 'Ver tetos', onPress: () => router.replace('/budgets') }}
        />
      </Screen>
    );
  }

  const title = `Teto de ${budget.label}`;
  const edit = () => router.navigate({ pathname: '/new-budget', params: { budgetId: budget.id } });
  const confirmDelete = () => {
    setConfirming(false);
    haptics.success();
    if (router.canGoBack()) router.back();
    else router.replace('/budgets');
    remove(budget.id);
    toast.success(`Teto de ${budget.label} excluído`);
  };

  // History of the category against the cap.
  const history = CATEGORY_HISTORY[budget.categoryId as keyof typeof CATEGORY_HISTORY] ?? [];
  const over = monthsOverCap(history, budget.limit);
  const average = threeMonthAverage(history);
  const historyCard = (
    <SectionCard
      title={`Últimos ${history.length || 6} meses`}
      description={
        history.length
          ? `Teto de ${whole(budget.limit)} · ${
              over.length
                ? `${joinList(over.map(monthName))} ${over.length === 1 ? 'passou' : 'passaram'} do limite`
                : 'nenhum mês passou do limite'
            }`
          : `Teto de ${whole(budget.limit)}`
      }
      titleSize={18}
      padding={22}
      gap={14}
    >
      {history.length ? (
        <>
          <MonthCapChart
            data={historyBars(history)}
            cap={Math.trunc(budget.limit / 100)}
            format={(value) => value.toLocaleString('pt-BR')}
            accessibilityLabel={historyLabel(budget.label, history, budget.limit)}
          />
          <Text size={12} tone="subtle" leading={1.55}>
            {`*${monthName(month)} até o dia ${formatDate(today, 'd')}.${
              average === null ? '' : ` Média dos últimos 3 meses: ${whole(average)}.`
            }`}
          </Text>
        </>
      ) : (
        <Text size={14} tone="muted" leading={1.55}>
          {`Ainda não temos histórico de ${budget.label}. Os meses aparecem aqui conforme o teto completa cada mês.`}
        </Text>
      )}
    </SectionCard>
  );

  const notices = noticeRows(budget);
  const noticesCard = (
    <SectionCard
      title="Avisos"
      description="Cada aviso chega uma única vez por mês"
      titleSize={18}
      padding={22}
      gap={14}
    >
      <View>
        {notices.map((row, index) => (
          <PlainRow
            key={row.amount}
            title={row.label}
            caption={row.notice ? noticeDetail(row.notice) : 'Ainda não chegou'}
            trailing={
              row.notice ? <Badge label="Enviado" tone="positive" /> : <Badge label="Aguardando" />
            }
            last={index === notices.length - 1}
          />
        ))}
      </View>
    </SectionCard>
  );

  const counted = ledger.transactions.filter(
    (tx) =>
      tx.date.startsWith(month) &&
      tx.categoryId === budget.categoryId &&
      tx.direction === 'out' &&
      !tx.markedDuplicate,
  );
  const banks = [
    ...new Set(
      counted.map((tx) => ledger.accounts[tx.accountId]?.bank).filter((bank) => bank !== undefined),
    ),
  ].map(bankLabel);
  const latest = counted.slice(0, LATEST);
  // The month total of the category counts every transaction, also beyond the loaded ones.
  const count =
    ledger.categoryTotals.find((item) => item.id === budget.categoryId)?.count ?? counted.length;
  const transactionsCard = (
    <SectionCard
      title="Lançamentos que contaram"
      description={`${count} em ${monthName(month)}${banks.length ? ` · ${joinList(banks)}` : ''}`}
      titleSize={18}
      padding={22}
      gap={14}
      action={
        counted.length ? (
          <LinkButton
            label="Ver todos"
            chevron={false}
            onPress={() =>
              router.navigate({
                pathname: '/spending/category/[categoryId]',
                params: { categoryId: budget.categoryId },
              })
            }
          />
        ) : undefined
      }
    >
      {latest.length ? (
        <View>
          {latest.map((tx, index) => (
            <TransactionRow
              key={tx.id}
              name={displayName(tx)}
              detail={`${formatDate(tx.date, "d 'de' MMMM")} · ${rowDetail(tx, ledger.accounts[tx.accountId], { showTime: true, showCategory: false })}`}
              amount={signedAmount(tx)}
              onPress={() => router.navigate(routeTo.transaction(tx.id))}
              last={index === latest.length - 1}
            />
          ))}
        </View>
      ) : (
        <Text size={14} tone="muted">
          {`Nenhum gasto de ${budget.label} em ${monthName(month)} até agora.`}
        </Text>
      )}
    </SectionCard>
  );

  const actions = (
    <View className="flex-row items-center gap-2">
      <Button variant="secondary" size="md" className="h-10 px-4.5" onPress={edit}>
        Editar teto
      </Button>
      <Button
        variant="negativeOutline"
        size="md"
        className="h-10 px-4.5"
        onPress={() => setConfirming(true)}
      >
        Excluir
      </Button>
    </View>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title={title}
              fallbackHref="/budgets"
              actions={<IconButton icon="pencil" accessibilityLabel="Editar teto" onPress={edit} />}
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title={title}
            subtitle={capitalize(formatDate(`${month}-01`, 'MMMM yyyy'))}
            breadcrumb={{
              parents: [
                { label: 'Alertas', href: '/alerts' },
                { label: 'Tetos de gasto', href: '/budgets' },
              ],
              current: budget.label,
            }}
            actions={actions}
          />
        ) : null}
        <Hero budget={budget} month={month} />
        {isTablet ? (
          <ResponsiveGrid>
            {historyCard}
            {noticesCard}
          </ResponsiveGrid>
        ) : (
          <>
            {actions}
            {historyCard}
            {noticesCard}
          </>
        )}
        {transactionsCard}
      </Screen>
      {isTablet ? <ChatFab /> : null}
      <ConfirmDialog
        open={confirming}
        title={`Excluir o teto de ${budget.label}?`}
        message={`Os avisos de ${joinList(notices.map((row) => whole(row.amount)))} param. O histórico do teto some, mas seus lançamentos de ${budget.label} não mudam.`}
        confirmLabel="Excluir teto"
        cancelLabel="Cancelar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}
