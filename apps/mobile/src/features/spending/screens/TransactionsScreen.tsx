import { CategoryIdSchema, type CategoryId, type YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatDate, orEmpty } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ErrorState } from '@/components/feedback';
import { PageHeader, TopBar } from '@/components/layout';
import { Button, IconButton, InfoNote, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { LedgerFeed, LedgerFilterBar, SummaryTiles, TransactionRow } from '../components';
import { BANK_SYNC, SPENDING_TODAY } from '../data';
import { useLedger, type Ledger } from '../hooks/useLedger';
import { bankLabel, dayLabel, noResultsMessage, rowDetail } from '../lib/format';
import {
  displayName,
  filterLedger,
  groupByDay,
  signedAmount,
  type LedgerFilters,
} from '../lib/ledger';

/** Days shown per page ("Carregar dias anteriores" shows the next ones). */
export const DAYS_PER_PAGE = 6;

const BANKS_TEXT = BANK_SYNC.map((item) => bankLabel(item.bank)).join(' e ');

function monthWord(month: YearMonth): string {
  return formatDate(`${month}-01`, 'MMMM');
}

function initialCategory(value: string | undefined): CategoryId | 'all' {
  const parsed = CategoryIdSchema.safeParse(value);
  return parsed.success ? parsed.data : 'all';
}

/** Only the bank filter has month figures; other filters show "—" in Entrou/Saiu. */
function summaryOf(ledger: Ledger, filters: LedgerFilters) {
  const onlyBank =
    filters.query.trim() === '' && filters.categoryId === 'all' && filters.direction === 'all';
  return onlyBank && filters.month === ledger.month ? ledger.summaryFor(filters.bank) : null;
}

/** "Todos os lançamentos": search, filters, Entrou/Saiu and the month day by day. */
export function TransactionsScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const ledger = useLedger();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [filters, setFilters] = useState<LedgerFilters>({
    query: '',
    bank: 'all',
    categoryId: initialCategory(params.categoryId),
    direction: 'all',
    month: ledger.month,
  });
  const [pages, setPages] = useState(1);

  const monthTransactions = ledger.transactions.filter((tx) => tx.date.startsWith(filters.month));
  const months = [...new Set(ledger.transactions.map((tx) => tx.date.slice(0, 7)))];
  const categories = [
    ...new Set(monthTransactions.flatMap((tx) => (tx.categoryId ? [tx.categoryId] : []))),
  ];
  const days = groupByDay(filterLedger(ledger.transactions, filters, ledger.accounts));
  const visibleDays = days.slice(0, pages * DAYS_PER_PAGE);
  const monthSummary = ledger.summaryFor('all');
  const subtitle = `${orEmpty(monthSummary?.count)} lançamentos em ${monthWord(filters.month)} · ${BANKS_TEXT}`;
  const exportReport = () => router.navigate('/export-report');
  const padding = isTablet ? 28 : 16;

  const header = isTablet ? (
    <PageHeader
      title="Todos os lançamentos"
      subtitle={subtitle}
      breadcrumb={{ parents: [{ label: 'Gastos', href: '/spending' }], current: 'Lançamentos' }}
      actions={
        <Button
          variant="secondary"
          size="md"
          leftIcon="download"
          className="h-10 px-4.5"
          onPress={exportReport}
        >
          Exportar
        </Button>
      }
    />
  ) : null;

  let content: ReactNode;
  if (ledger.status !== 'ready') {
    content = (
      <View style={{ paddingHorizontal: padding, gap: isTablet ? 20 : 16 }}>
        {header}
        <View className="gap-3.5 rounded-24 border border-border bg-surface p-4">
          {ledger.staleMessage ? (
            <InfoNote icon="alertTriangle" tone="warning" size={13}>
              {ledger.staleMessage}
            </InfoNote>
          ) : null}
          {ledger.status === 'empty' ? (
            <EmptyState
              icon="wallet"
              title="Ainda sem lançamentos"
              description="Assim que um banco for conectado, seus gastos e entradas aparecem aqui, organizados por dia."
              action={{
                label: 'Conectar banco',
                variant: 'primary',
                onPress: () => router.navigate('/connect-bank'),
              }}
            />
          ) : (
            <ErrorState
              title="Não deu para carregar os lançamentos"
              description="Seus dados continuam salvos. Tente de novo em instantes."
              onRetry={ledger.refetch}
            />
          )}
        </View>
      </View>
    );
  } else {
    content = (
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
              showCategory: true,
            })}
            amount={signedAmount(tx)}
            flagged={ledger.unusualOf(tx.id)?.status === 'pending'}
            duplicate={tx.markedDuplicate}
            onPress={() => router.navigate(routeTo.transaction(tx.id))}
          />
        )}
        top={
          header ?? (
            <Text size={14} tone="muted">
              {subtitle}
            </Text>
          )
        }
        cardTop={
          <>
            {ledger.staleMessage ? (
              <InfoNote icon="alertTriangle" tone="warning" size={13}>
                {ledger.staleMessage}
              </InfoNote>
            ) : null}
            <LedgerFilterBar
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                setPages(1);
              }}
              months={months}
              categories={categories}
              wrap={isTablet}
            />
            <SummaryTiles summary={summaryOf(ledger, filters)} />
          </>
        }
        cardBottom={
          days.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nada encontrado"
              description={noResultsMessage(filters)}
              action={{
                label: 'Limpar filtros',
                onPress: () => {
                  setFilters({
                    query: '',
                    bank: 'all',
                    categoryId: 'all',
                    direction: 'all',
                    month: ledger.month,
                  });
                  setPages(1);
                },
              }}
            />
          ) : days.length > visibleDays.length ? (
            <Button variant="secondary" size="md" fullWidth onPress={() => setPages(pages + 1)}>
              Carregar dias anteriores
            </Button>
          ) : null
        }
      />
    );
  }

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
            title="Lançamentos"
            fallbackHref="/spending"
            actions={
              <IconButton
                icon="download"
                accessibilityLabel="Exportar lançamentos"
                onPress={exportReport}
              />
            }
          />
        )}
        {content}
      </SafeAreaView>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
