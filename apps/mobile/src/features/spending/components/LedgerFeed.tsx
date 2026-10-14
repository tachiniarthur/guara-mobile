import { FlashList } from '@shopify/flash-list';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import type { LedgerTransaction } from '../data';
import type { LedgerDay } from '../lib/ledger';

import { DayHeader } from './DayHeader';

type FeedItem =
  | { kind: 'day'; key: string; day: LedgerDay }
  | { kind: 'tx'; key: string; tx: LedgerTransaction; first: boolean };

export interface LedgerFeedProps {
  days: readonly LedgerDay[];
  dayLabel: (day: LedgerDay) => string;
  renderRow: (tx: LedgerTransaction) => ReactNode;
  /** Above everything (tablet page header, summary cards). */
  top?: ReactNode;
  /** First block of the list: inside the card on tablets (search, filters). */
  cardTop?: ReactNode;
  /** Last block of the list ("Carregar dias anteriores"), or the empty state. */
  cardBottom?: ReactNode;
  /** Tablet: the list sits in a Folha escura card with 22 padding. */
  framed?: boolean;
  /** Gap between blocks (design: 16 on phones, 14 inside the tablet card). */
  gap?: number;
  /** Page padding (16 phone / 28 tablet). */
  padding: number;
  /** Extra space at the end (tab bar / chat button). */
  bottomInset?: number;
  /** Shown under each day instead of its rows (connection error of the screen). */
  dayBody?: ReactNode;
}

type Edge = 'top' | 'middle' | 'bottom';

/**
 * Background of one slice of the tablet card. It reaches 1 dp into the next one: FlashList
 * places cells at fractional offsets, and edge-to-edge slices would show hairline seams.
 */
const BACKGROUND: Record<Edge, { className: string; top: number; bottom: number }> = {
  top: { className: 'rounded-t-24 border-x border-t', top: 0, bottom: -1 },
  middle: { className: 'border-x', top: 0, bottom: -1 },
  bottom: { className: 'rounded-b-24 border-x border-b', top: 0, bottom: 0 },
};

/** Transactions grouped by day in a FlashList, with the page above it as the list header. */
export function LedgerFeed({
  days,
  dayLabel,
  renderRow,
  top,
  cardTop,
  cardBottom,
  framed = false,
  gap = 16,
  padding,
  bottomInset = 32,
  dayBody,
}: LedgerFeedProps) {
  const items: FeedItem[] = days.flatMap((day) => [
    { kind: 'day' as const, key: `day-${day.date}`, day },
    ...(dayBody ? day.items.slice(0, 1) : day.items).map((tx, index) => ({
      kind: 'tx' as const,
      key: tx.id,
      tx,
      first: index === 0,
    })),
  ]);

  const slice = (children: ReactNode, edge: Edge = 'middle') => {
    if (!framed) return <View>{children}</View>;
    const background = BACKGROUND[edge];
    return (
      <View
        className={cn('px-[22px]', edge === 'top' && 'pt-[22px]', edge === 'bottom' && 'pb-[22px]')}
      >
        <View
          pointerEvents="none"
          className={cn('absolute inset-x-0 border-border bg-surface', background.className)}
          style={{ top: background.top, bottom: background.bottom }}
        />
        {children}
      </View>
    );
  };

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.key}
      getItemType={(item) => item.kind}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingHorizontal: padding, paddingBottom: bottomInset }}
      ListHeaderComponent={
        <View style={{ gap: framed ? 20 : gap }}>
          {top}
          {cardTop ? slice(<View style={{ gap }}>{cardTop}</View>, 'top') : null}
        </View>
      }
      renderItem={({ item }) =>
        item.kind === 'day'
          ? slice(
              <View style={{ paddingTop: gap }}>
                <DayHeader label={dayLabel(item.day)} total={item.day.total} />
              </View>,
            )
          : slice(
              <View style={item.first ? { paddingTop: gap } : undefined}>
                {dayBody ?? renderRow(item.tx)}
              </View>,
            )
      }
      ListFooterComponent={slice(
        cardBottom ? <View style={{ paddingTop: gap }}>{cardBottom}</View> : null,
        'bottom',
      )}
    />
  );
}
