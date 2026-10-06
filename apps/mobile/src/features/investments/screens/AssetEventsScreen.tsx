import type { Cents } from '@guara/types';
import { cents, formatCents } from '@guara/utils';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { PageHeader, ResponsiveGrid, Screen, SectionCard, TopBar } from '@/components/layout';
import { Chip, MoneyText, Text } from '@/components/ui';
import { routeTo } from '@/constants/routes';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/cn';
import { ChatFab } from '@/navigation';

import { ASSETS, type Asset, type EventItem, type EventList } from '../assets';
import { POSITIONS } from '../data';
import {
  EVENT_KINDS,
  eventsByYear,
  filterEvents,
  lastTwelveMonths,
  receivedSummary,
  type EventKindFilter,
} from '../lib/events';

/** The list of events of an asset (stocks always have one; funds may only have a note). */
function eventListOf(asset: Asset): EventList | null {
  if (asset.kind === 'stock') return asset.events;
  return asset.events.kind === 'list' ? asset.events : null;
}

/** Older years start collapsed with this many events ("Mostrar mais 9 de 2025"). */
const COLLAPSED = 3;

function Tile({
  label,
  value,
  caption,
  positive = false,
}: {
  label: string;
  value: Cents;
  caption: string;
  positive?: boolean;
}) {
  return (
    <View className="min-w-0 flex-1 gap-1 rounded-16 bg-surface-input px-4 py-3.5">
      <Text size={13} tone="subtle">
        {label}
      </Text>
      <MoneyText
        value={value}
        serif
        weight="bold"
        size={18}
        tone={positive ? 'positive' : 'default'}
      />
      <Text size={12} tone="muted">
        {caption}
      </Text>
    </View>
  );
}

function EventRow({ item, last }: { item: EventItem; last: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${item.date}, ${item.kind}, ${item.perUnit} por cota, ${item.received === null ? 'você não tinha' : `você recebeu ${formatCents(item.received)}`}`}
      className={cn('flex-row items-center gap-2.5 py-[11px]', !last && 'border-b border-border')}
    >
      <Text size={14} tone="muted" tabular style={{ width: 92 }}>
        {item.date}
      </Text>
      <View className="min-w-0 flex-1">
        <Text size={14} weight="bold" leading={1.3}>
          {item.kind}
        </Text>
        <Text size={12} tone="subtle" leading={1.3}>
          {`${item.perUnit} por cota`}
        </Text>
      </View>
      {item.received === null ? (
        <Text size={14} weight="bold" tone="subtle" numberOfLines={1}>
          você não tinha
        </Text>
      ) : (
        <MoneyText
          value={item.received}
          showSign
          size={14}
          weight="bold"
          tone="positive"
          numberOfLines={1}
        />
      )}
    </View>
  );
}

/** "Eventos corporativos": everything the asset paid, by year, with what the user received. */
export function AssetEventsScreen() {
  const { isTablet } = useBreakpoint();
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const asset = ticker ? ASSETS[ticker] : undefined;
  const events = asset ? eventListOf(asset) : null;
  const eventsNote =
    asset?.kind === 'fund' && asset.events.kind === 'note' ? asset.events.text : null;
  const title = asset?.header.title ?? ticker ?? '';
  const [kind, setKind] = useState<EventKindFilter>('all');
  const [fromYear, setFromYear] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  const all = events?.items ?? [];
  const position = POSITIONS.find((item) => item.ticker === ticker);
  const quantity = position?.quantity ? Number(position.quantity.replace(',', '.')) : null;
  const price = position && quantity ? cents(Math.round(position.value / quantity)) : null;
  const received = receivedSummary(all);
  const twelve = price ? lastTwelveMonths(all, price) : null;
  const years = eventsByYear(filterEvents(all, kind));
  const yearChips = eventsByYear(all).map((item) => item.year);
  const selectedYear = fromYear ?? yearChips[0] ?? null;
  const visibleYears = years.filter((item) => selectedYear === null || item.year <= selectedYear);
  const notHeld = all.some((item) => item.received === null) && received;
  const subtitle = `${title} · ${all.length} ${all.length === 1 ? 'evento' : 'eventos'}`;

  const chipRow = (children: React.ReactNode) =>
    isTablet ? (
      <View className="flex-row flex-wrap gap-2">{children}</View>
    ) : (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginRight: -16 }}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {children}
      </ScrollView>
    );

  const content = !events ? (
    <EmptyState
      icon="calendar"
      title="Sem eventos"
      description={eventsNote ?? 'Este ativo não tem eventos registrados.'}
    />
  ) : (
    <>
      <View className="flex-row gap-2.5">
        {received ? (
          <Tile
            label="Você recebeu"
            value={received.total}
            caption={`desde ${received.since}`}
            positive
          />
        ) : null}
        {twelve ? (
          <Tile
            label="Últimos 12 meses"
            value={twelve.perUnit}
            caption={`por cota · yield de ${twelve.yieldText}`}
          />
        ) : null}
      </View>
      {chipRow(
        EVENT_KINDS.map((item) => (
          <Chip
            key={item.value}
            label={item.value === 'all' ? `${item.label} (${all.length})` : item.label}
            selected={kind === item.value}
            appearance="filled"
            textSize={14}
            onPress={() => setKind(item.value)}
          />
        )),
      )}
      {chipRow(
        yearChips.map((year) => (
          <Chip
            key={year}
            label={String(year)}
            selected={selectedYear === year}
            appearance="filled"
            textSize={14}
            accessibilityLabel={`A partir de ${year}`}
            onPress={() => setFromYear(year)}
          />
        )),
      )}
      {visibleYears.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nenhum evento desse tipo"
          description={`O ${title} não teve ${EVENT_KINDS.find((item) => item.value === kind)!.label.toLowerCase()} no período.`}
          action={{ label: 'Ver todos', onPress: () => setKind('all') }}
        />
      ) : (
        <ResponsiveGrid columns={{ tablet: 2 }} gap={16} stretch={false}>
          {visibleYears.map((year, index) => {
            const collapsed = index > 0 && !expanded.includes(year.year);
            const shown = collapsed ? year.items.slice(0, COLLAPSED) : year.items;
            const hidden = year.items.length - shown.length;
            const perUnit = year.perUnit === null ? null : `${formatCents(year.perUnit)} por cota`;
            return (
              <SectionCard
                key={year.year}
                title={String(year.year)}
                description={[
                  perUnit,
                  year.received ? `você recebeu ${formatCents(year.received)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                titleSize={17}
                padding={18}
                gap={8}
              >
                <View>
                  {shown.map((item, itemIndex) => (
                    <EventRow
                      key={item.date}
                      item={item}
                      last={itemIndex === shown.length - 1 && hidden === 0}
                    />
                  ))}
                </View>
                {hidden > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setExpanded([...expanded, year.year])}
                    className="min-h-11 items-center justify-center rounded-full border border-border-strong active:bg-surface-pressed"
                  >
                    <Text size={14} weight="bold">
                      {`Mostrar mais ${hidden} de ${year.year}`}
                    </Text>
                  </Pressable>
                ) : null}
              </SectionCard>
            );
          })}
        </ResponsiveGrid>
      )}
      <Text size={13} leading={1.55} tone="subtle">
        {notHeld
          ? `“Você não tinha”: na data com, você ainda não tinha cotas (comprou em ${received.since}). ${events.note}`
          : events.note}
      </Text>
    </>
  );

  return (
    <View className="flex-1">
      <Screen
        header={
          isTablet ? null : (
            <TopBar
              title="Eventos corporativos"
              subtitle={subtitle}
              fallbackHref={routeTo.asset(ticker ?? '')}
            />
          )
        }
        contentClassName={isTablet ? 'gap-5 pb-32' : 'gap-4 pt-1'}
      >
        {isTablet ? (
          <PageHeader
            title="Eventos corporativos"
            subtitle={subtitle}
            breadcrumb={{
              parents: [
                { label: 'Investimentos', href: '/investments' },
                { label: title, href: routeTo.asset(ticker ?? '') },
              ],
              current: 'Eventos',
            }}
          />
        ) : null}
        {content}
      </Screen>
      {isTablet ? <ChatFab /> : null}
    </View>
  );
}
