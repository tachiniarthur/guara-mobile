import { CategoryIdSchema } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatDate } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { PageHeader, TopBar } from '@/components/layout';
import { Button, IconButton, SearchInput } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { AssistantNote } from '@/features/chat';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { CATEGORY_LABELS } from '../categories';
import { CategorySummaryCard, LedgerFeed, SubcategoryCard, TransactionRow } from '../components';
import { BANK_SYNC, SPENDING_TODAY } from '../data';
import { useLedger } from '../hooks/useLedger';
import { bankLabel, categoryInsight, dayLabel, monthPillLabel, rowDetail } from '../lib/format';
import { displayName, filterLedger, groupByDay, signedAmount } from '../lib/ledger';

import { DAYS_PER_PAGE } from './TransactionsScreen';

/** "Lançamentos de uma categoria": month total, cap, Tamanduá's reading and the days. */
export function CategoryTransactionsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const ledger = useLedger();
  const params = useLocalSearchParams<{ categoryId: string }>();
  const parsed = CategoryIdSchema.safeParse(params.categoryId);
  const [query, setQuery] = useState('');

  if (!parsed.success) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}
      >
        <TopBar title="Categoria" fallbackHref="/spending" />
        <EmptyState
          icon="tag"
          title="Categoria não encontrada"
          description="Volte para Gastos e escolha uma categoria."
        />
      </SafeAreaView>
    );
  }

  const categoryId = parsed.data;
  const label = CATEGORY_LABELS[categoryId];
  const summary = ledger.categorySummary(categoryId);
  const monthName = formatDate(`${ledger.month}-01`, 'MMMM');
  const filters = {
    query,
    bank: 'all' as const,
    categoryId,
    direction: 'all' as const,
    month: ledger.month,
  };
  const days = groupByDay(filterLedger(ledger.transactions, filters, ledger.accounts));
  const visibleDays = days.slice(0, DAYS_PER_PAGE);
  const insight = summary ? categoryInsight(summary, ledger.transactions) : null;
  const count = summary?.count ?? days.reduce((sum, day) => sum + day.items.length, 0);
  const editBudget = () => router.navigate({ pathname: '/new-budget', params: { categoryId } });
  const openAll = () =>
    router.navigate({ pathname: '/spending/transactions', params: { categoryId } });
  const padding = isTablet ? 28 : 16;
  const budgetLabel = summary?.budget ? 'Editar teto' : 'Criar teto';

  const summaryCard = <CategorySummaryCard label={label} monthName={monthName} summary={summary} />;
  const note = insight ? <AssistantNote assistant="tamandua">{insight}</AssistantNote> : null;
  const where =
    summary && summary.subcategories.length > 0 ? (
      <SubcategoryCard items={summary.subcategories} />
    ) : null;

  const top = isTablet ? (
    <>
      <PageHeader
        title={label}
        subtitle={`${monthPillLabel(ledger.month)} · ${BANK_SYNC.map((item) => bankLabel(item.bank)).join(' e ')}`}
        breadcrumb={{
          parents: [
            { label: 'Gastos', href: '/spending' },
            { label: 'Por categoria', href: '/spending' },
          ],
          current: label,
        }}
        actions={
          <Button
            variant="secondary"
            size="md"
            leftIcon="pencil"
            className="h-10 px-4.5"
            onPress={editBudget}
          >
            {budgetLabel}
          </Button>
        }
      />
      <View className="flex-row items-start gap-4">
        <View className="min-w-0 flex-1">{summaryCard}</View>
        <View className="min-w-0 flex-1 gap-4">
          {note}
          {where}
        </View>
      </View>
    </>
  ) : (
    <>
      {summaryCard}
      {note}
      {where}
    </>
  );

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: colors.background.DEFAULT }}
      >
        {isTablet ? (
          <View style={{ height: 28 }} />
        ) : (
          <TopBar
            title={label}
            fallbackHref="/spending"
            actions={
              <IconButton
                icon="pencil"
                accessibilityLabel={`${budgetLabel} de ${label}`}
                onPress={editBudget}
              />
            }
          />
        )}
        <LedgerFeed
          framed={isTablet}
          gap={isTablet ? 14 : 16}
          padding={padding}
          bottomInset={isTablet ? 110 : 32}
          days={visibleDays}
          dayLabel={(day) => dayLabel(day.date, SPENDING_TODAY)}
          renderRow={(tx) => (
            <TransactionRow
              name={displayName(tx)}
              detail={rowDetail(tx, ledger.accounts[tx.accountId], {
                showTime: tx.date === SPENDING_TODAY,
                showCategory: false,
              })}
              amount={signedAmount(tx)}
              flagged={ledger.unusualOf(tx.id)?.status === 'pending'}
              duplicate={tx.markedDuplicate}
              onPress={() => router.navigate(routeTo.transaction(tx.id))}
            />
          )}
          top={top}
          cardTop={
            <SearchInput
              size={46}
              value={query}
              onChangeText={setQuery}
              placeholder={`Buscar em ${label}`}
              accessibilityLabel={`Buscar em ${label}`}
            />
          }
          cardBottom={
            days.length === 0 ? (
              <EmptyState
                icon="search"
                title="Nada encontrado"
                description={
                  query
                    ? `Nenhum lançamento com “${query.trim()}” em ${label} em ${monthName}.`
                    : `Nenhum lançamento em ${label} em ${monthName}.`
                }
                action={query ? { label: 'Limpar busca', onPress: () => setQuery('') } : undefined}
              />
            ) : (
              <Button variant="secondary" size="md" fullWidth onPress={openAll}>
                {`Ver os ${count} lançamentos`}
              </Button>
            )
          }
        />
      </SafeAreaView>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
