import type { Cents, IsoDate } from '@guara/types';
import { cents, formatDate, sumCents } from '@guara/utils';

import type { TimelineDay, TimelineEntry } from '../timeline-data';

export type TimelineFilter = 'all' | 'in' | 'out' | 'unusual';

export const TIMELINE_FILTERS: { value: TimelineFilter; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Saídas' },
  { value: 'unusual', label: 'Fora do padrão' },
];

const signed = (entry: TimelineEntry) => (entry.direction === 'in' ? entry.amount : -entry.amount);

/** Net movement of a day (entries plus the grouped outflows). */
export function dayNet(day: TimelineDay): Cents {
  return cents(
    day.entries.reduce((sum, entry) => sum + signed(entry), 0) - (day.group?.amount ?? 0),
  );
}

export interface TimelineSummary {
  opening: Cents;
  totalIn: Cents;
  totalOut: Cents;
  closing: Cents;
  /** End-of-day balance of each day (same order as the days, newest first). */
  balances: Cents[];
}

/** Opening, in, out and today's balance; end-of-day balances from the oldest day on. */
export function summarize(opening: Cents, days: readonly TimelineDay[]): TimelineSummary {
  const balances: Cents[] = new Array(days.length);
  let balance: number = opening;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    balance += dayNet(days[index]!);
    balances[index] = cents(balance);
  }
  const entries = days.flatMap((day) => day.entries);
  return {
    opening,
    totalIn: sumCents(
      entries.filter((entry) => entry.direction === 'in').map((entry) => entry.amount),
    ),
    totalOut: cents(
      entries
        .filter((entry) => entry.direction === 'out')
        .reduce((sum, entry) => sum + entry.amount, 0) +
        days.reduce((sum, day) => sum + (day.group?.amount ?? 0), 0),
    ),
    closing: cents(balance),
    balances,
  };
}

/** "23 set · qua" for a day, "15 a 17 set" for a range (real calendar weekday). */
const WEEKDAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

export function dayLabel(from: IsoDate, to: IsoDate): string {
  if (from === to) {
    const weekday = WEEKDAYS[Number(formatDate(from, 'i')) - 1];
    return `${formatDate(from, 'dd MMM').toLocaleLowerCase('pt-BR')} · ${weekday}`;
  }
  return `${formatDate(from, 'd')} a ${formatDate(to, 'd MMM')}`.toLocaleLowerCase('pt-BR');
}

/** "Dias 2 a 4, 6 a 9 e 11 a 14 agrupados." (null without hidden days). */
export function hiddenNote(days: readonly TimelineDay[]): string | null {
  const ranges = days
    .filter((day) => day.hidden)
    .reverse()
    .map((day) => `${formatDate(day.from, 'd')} a ${formatDate(day.to, 'd')}`);
  if (ranges.length === 0) return null;
  const list =
    ranges.length === 1 ? ranges[0] : `${ranges.slice(0, -1).join(', ')} e ${ranges.at(-1)}`;
  return `Dias ${list} agrupados. Toque em “Mostrar todos os dias” para abrir cada um.`;
}

/** Entries of a day that pass the filter (groups are outflows, never "fora do padrão"). */
export function filterDay(
  day: TimelineDay,
  filter: TimelineFilter,
): { entries: TimelineEntry[]; showGroup: boolean } {
  const entries = day.entries.filter((entry) => {
    if (filter === 'in') return entry.direction === 'in';
    if (filter === 'out') return entry.direction === 'out';
    if (filter === 'unusual') return entry.flagged === true;
    return true;
  });
  return { entries, showGroup: Boolean(day.group) && (filter === 'all' || filter === 'out') };
}
