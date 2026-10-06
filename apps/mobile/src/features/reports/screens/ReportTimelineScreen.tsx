import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { formatCents, formatDate } from '@guara/utils';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { PageHeader, Screen, TopBar } from '@/components/layout';
import { Badge, Button, Chip, IconButton, MoneyText, Span, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { displayName, rowDetail, useLedger } from '@/features/spending';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation';

import { PERIODS, type ReportPeriod } from '../data';
import {
  TIMELINE_FILTERS,
  dayLabel,
  filterDay,
  hiddenNote,
  summarize,
  type TimelineFilter,
} from '../lib/timeline';
import { TIMELINE_MONTH, type TimelineDay } from '../timeline-data';

interface Row {
  key: string;
  title: string;
  detail: string;
  amount: Cents;
  direction: 'in' | 'out';
  flagged?: boolean;
  onPress?: () => void;
}

function Tile({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <View
      className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5"
      style={{ flexBasis: '45%' }}
    >
      <Text size={13} tone="subtle">
        {label}
      </Text>
      <Text serif weight="bold" size={16} style={color ? { color } : undefined} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function TimelineRow({ row }: { row: Row }) {
  return (
    <Pressable
      accessibilityRole={row.onPress ? 'link' : undefined}
      accessibilityLabel={`${row.title}, ${row.detail}, ${row.direction === 'in' ? 'entrada' : 'saída'} de ${formatCents(row.amount)}${row.flagged ? ', fora do padrão' : ''}`}
      disabled={!row.onPress}
      onPress={row.onPress}
      className="flex-row items-center gap-3 border-b border-border py-3 active:opacity-80"
    >
      <View className="min-w-0 flex-1">
        <Text weight="medium" leading={1.35}>
          {row.title}
        </Text>
        <Text size={12} tone="subtle" leading={1.35}>
          {row.detail}
        </Text>
        {row.flagged ? (
          <Badge
            label="Fora do padrão"
            tone="negative"
            icon="alertTriangle"
            className="mt-1 self-start"
          />
        ) : null}
      </View>
      <MoneyText
        value={(row.direction === 'out' ? -row.amount : row.amount) as Cents}
        weight="bold"
        showSign
        tone={row.flagged ? 'negative' : row.direction === 'in' ? 'positive' : 'default'}
        numberOfLines={1}
      />
    </Pressable>
  );
}

/** "Linha do tempo" of the month: start, in, out, today and every day with its balance. */
export function ReportTimelineScreen() {
  const router = useRouter();
  const { isTablet } = useBreakpoint();
  const ledger = useLedger();
  const [period, setPeriod] = useState<ReportPeriod | 'custom'>('month');
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [expanded, setExpanded] = useState(false);
  const { days, opening, today } = TIMELINE_MONTH;
  const summary = summarize(opening, days);
  const subtitle = `${formatDate(days.at(-1)!.from, 'd')} a ${formatDate(today, "d 'de' MMMM")} · ${TIMELINE_MONTH.scope}`;
  const openTransaction = (id: string) => router.navigate(routeTo.transaction(id));

  const rowsOf = (day: TimelineDay): Row[] => {
    const { entries, showGroup } = filterDay(day, filter);
    const rows: Row[] = entries.map((entry) => ({
      key: entry.id,
      title: entry.title,
      detail: entry.detail,
      amount: entry.amount,
      direction: entry.direction,
      flagged: entry.flagged,
      onPress: entry.transactionId ? () => openTransaction(entry.transactionId!) : undefined,
    }));
    const group = day.group;
    if (!group || !showGroup) return rows;
    if (day.hidden) {
      rows.push({
        key: `${day.from}-hidden`,
        title: 'Lançamentos agrupados',
        detail: `Soma dos dias ${formatDate(day.from, 'd')} a ${formatDate(day.to, 'd')}`,
        amount: group.amount,
        direction: 'out',
      });
      return rows;
    }
    const txs = expanded
      ? (group.transactionIds ?? [])
          .map((id) => ledger.transactions.find((tx) => tx.id === id))
          .filter((tx) => tx !== undefined)
      : [];
    if (txs.length > 0) {
      for (const tx of txs) {
        rows.push({
          key: tx.id,
          title: displayName(tx),
          detail: rowDetail(tx, ledger.accounts[tx.accountId], {
            showTime: false,
            showCategory: true,
          }),
          amount: tx.amount,
          direction: tx.direction,
          onPress: () => openTransaction(tx.id),
        });
      }
      return rows;
    }
    const plural = `${group.count} lançamentos`;
    rows.push({
      key: `${day.from}-group`,
      title: entries.length > 0 || day.entries.length > 0 ? `Mais ${plural}` : plural,
      detail: group.labels,
      amount: group.amount,
      direction: 'out',
      onPress: group.transactionIds ? () => setExpanded(true) : undefined,
    });
    return rows;
  };

  const visibleDays = days
    .map((day, index) => ({ day, balance: summary.balances[index]!, rows: rowsOf(day) }))
    .filter((item) => (expanded || !item.day.hidden) && item.rows.length > 0);
  const note = expanded ? null : hiddenNote(days);

  const chipRow = (children: ReactNode, label: string) =>
    isTablet ? (
      <View accessibilityLabel={label} className="flex-row flex-wrap gap-2">
        {children}
      </View>
    ) : (
      <ScrollView
        horizontal
        accessibilityLabel={label}
        showsHorizontalScrollIndicator={false}
        style={{ marginRight: -16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {children}
      </ScrollView>
    );

  const periodChips = chipRow(
    [...PERIODS, { value: 'custom' as const, label: 'Personalizado' }].map((item) => (
      <Chip
        key={item.value}
        label={item.label}
        selected={period === item.value}
        appearance="filled"
        textSize={14}
        onPress={() => setPeriod(item.value)}
      />
    )),
    'Período',
  );
  const filterChips = chipRow(
    TIMELINE_FILTERS.map((item) => (
      <Chip
        key={item.value}
        label={item.label}
        selected={filter === item.value}
        appearance="filled"
        textSize={14}
        onPress={() => setFilter(item.value)}
      />
    )),
    'Tipo',
  );

  const content =
    period !== 'month' ? (
      <EmptyState
        icon="calendar"
        title="Sem esse período ainda"
        description="Por enquanto, a linha do tempo mostra o mês atual. Os outros períodos chegam quando os bancos trouxerem o histórico."
        action={{ label: 'Ver este mês', onPress: () => setPeriod('month') }}
      />
    ) : (
      <>
        <View className="flex-row flex-wrap gap-2.5">
          <Tile label="Começou o mês" value={formatCents(summary.opening)} />
          <Tile
            label="Entrou"
            value={`+${formatCents(summary.totalIn)}`}
            color={colors.positive.DEFAULT}
          />
          <Tile label="Saiu" value={`−${formatCents(summary.totalOut)}`} />
          <Tile label="Hoje" value={formatCents(summary.closing)} color={colors.brand.DEFAULT} />
        </View>
        {visibleDays.length === 0 ? (
          <EmptyState
            icon="filter"
            title="Nada com esse filtro"
            description="Nenhum lançamento desse tipo no período."
            action={{ label: 'Ver tudo', onPress: () => setFilter('all') }}
          />
        ) : (
          <View className="ml-1.5 border-l-2 border-border pl-[22px]">
            {visibleDays.map(({ day, balance, rows }) => (
              <View key={day.from} className="gap-0.5 pb-3.5">
                <View className="flex-row items-baseline justify-between gap-2">
                  <View
                    className="absolute h-3 w-3 rounded-full border-2 border-brand bg-background"
                    style={{ left: -30, top: 4 }}
                  />
                  <Text size={13} weight="extrabold" tracking={0.06} accessibilityRole="header">
                    {dayLabel(day.from, day.to).toLocaleUpperCase('pt-BR')}
                  </Text>
                  <Text size={12} tone="subtle">
                    saldo no fim do dia{' '}
                    <Span weight="bold" tone="muted">
                      {formatCents(balance)}
                    </Span>
                  </Text>
                </View>
                <View>
                  {rows.map((row) => (
                    <TimelineRow key={row.key} row={row} />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        {note ? (
          <Text size={13} leading={1.55} tone="subtle">
            {note}
          </Text>
        ) : null}
        <Button variant="secondary" size="md" fullWidth onPress={() => setExpanded(!expanded)}>
          {expanded ? 'Mostrar resumo' : 'Mostrar todos os dias'}
        </Button>
      </>
    );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Linha do tempo"
              subtitle={subtitle}
              fallbackHref="/reports"
              actions={
                <IconButton
                  icon="download"
                  accessibilityLabel="Exportar"
                  onPress={() => router.navigate('/export-report')}
                />
              }
            />
          )
        }
        contentClassName={cn(isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1')}
      >
        {isTablet ? (
          <PageHeader
            title="Linha do tempo completa"
            subtitle={subtitle}
            breadcrumb={{
              parents: [{ label: 'Relatórios', href: '/reports' }],
              current: 'Linha do tempo',
            }}
            actions={
              <Button
                variant="secondary"
                size="md"
                leftIcon="download"
                className="h-10 px-4.5"
                onPress={() => router.navigate('/export-report')}
              >
                Exportar
              </Button>
            }
          />
        ) : null}
        {periodChips}
        {period === 'month' ? filterChips : null}
        {content}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
