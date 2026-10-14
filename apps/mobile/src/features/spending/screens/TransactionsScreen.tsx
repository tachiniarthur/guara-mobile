import { CategoryIdSchema, type CategoryId, type YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { EMPTY, formatDate, orEmpty } from '@guara/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ContainerError,
  FilterEmpty,
  ScreenStates,
  StateMessage,
  useScreenStatus,
} from '@/components/feedback';
import { MataButton } from '@/components/illustrations';
import { PageHeader, TopBar } from '@/components/layout';
import { ScreenOverlayHost } from '@/components/layout/ScreenOverlay';
import { Button, Card, InfoNote, SkeletonScope, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
// Straight to the file: the Relatórios index imports Gastos back.
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ChatFab } from '@/navigation';

import { LedgerFeed, LedgerFilterBar, SummaryTiles, TransactionRow } from '../components';
import { BANK_SYNC, SPENDING, SPENDING_TODAY } from '../data';
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
  // The ledger knows when it is empty; the API adds loading and error.
  const status = useScreenStatus(ledger.status);

  const monthTransactions = ledger.transactions.filter((tx) => tx.date.startsWith(filters.month));
  const months = [...new Set(ledger.transactions.map((tx) => tx.date.slice(0, 7)))];
  const categories = [
    ...new Set(monthTransactions.flatMap((tx) => (tx.categoryId ? [tx.categoryId] : []))),
  ];
  const days = groupByDay(filterLedger(ledger.transactions, filters, ledger.accounts));
  const visibleDays = days.slice(0, pages * DAYS_PER_PAGE);
  const monthSummary = ledger.summaryFor('all');
  const subtitle = `${orEmpty(monthSummary?.count)} lançamentos em ${monthWord(filters.month)} · ${BANKS_TEXT}`;
  const padding = isTablet ? 28 : 16;

  const header = isTablet ? (
    <PageHeader
      title="Todos os lançamentos"
      subtitle={subtitle}
      breadcrumb={{ parents: [{ label: 'Gastos', href: '/spending' }], current: 'Lançamentos' }}
      actions={<ExportMenu variant="button" />}
    />
  ) : null;

  const clearFilters = () => {
    setFilters({
      query: '',
      bank: 'all',
      categoryId: 'all',
      direction: 'all',
      month: ledger.month,
    });
    setPages(1);
  };

  const content = (
    <LedgerFeed
      framed={isTablet}
      gap={isTablet ? 14 : 16}
      padding={padding}
      bottomInset={isTablet ? 110 : 32}
      // The list itself: one message in place of the days when there is nothing to show.
      days={status === 'empty' ? [] : visibleDays}
      dayLabel={(day) => dayLabel(day.date, SPENDING_TODAY)}
      dayBody={
        status === 'error' ? (
          <Card variant="muted" padding="sm">
            <ContainerError compact />
          </Card>
        ) : undefined
      }
      renderRow={(tx) => (
        <SkeletonScope active={status === 'loading'}>
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
        </SkeletonScope>
      )}
      top={
        header ?? (
          <SkeletonScope active={status === 'loading'}>
            <Text size={14} tone="muted">
              {status === 'error' ? EMPTY : subtitle}
            </Text>
          </SkeletonScope>
        )
      }
      cardTop={
        <SkeletonScope active={status === 'loading'}>
          {ledger.staleMessage && status === 'ready' ? (
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
          <SummaryTiles summary={status === 'error' ? null : summaryOf(ledger, filters)} />
        </SkeletonScope>
      }
      cardBottom={
        status === 'empty' ? (
          <StateMessage
            icon="wallet"
            title="Ainda sem lançamentos"
            description="Assim que um banco for conectado, seus gastos e entradas aparecem aqui, organizados por dia."
            action={
              <MataButton
                label="Conectar banco"
                size={44}
                onPress={() => router.navigate('/connect-bank')}
              />
            }
          />
        ) : status !== 'ready' ? null : days.length === 0 ? (
          <FilterEmpty description={noResultsMessage(filters)} onClear={clearFilters} />
        ) : days.length > visibleDays.length ? (
          <Button variant="secondary" size="md" fullWidth onPress={() => setPages(pages + 1)}>
            Carregar dias anteriores
          </Button>
        ) : null
      }
    />
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
            title="Lançamentos"
            fallbackHref="/spending"
            actions={<ExportMenu variant="icon" accessibilityLabel="Exportar lançamentos" />}
          />
        )}
        <ScreenOverlayHost>
          <ScreenStates status={status} onRetry={ledger.refetch} since={SPENDING.syncedAt}>
            {content}
          </ScreenStates>
        </ScreenOverlayHost>
      </SafeAreaView>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
