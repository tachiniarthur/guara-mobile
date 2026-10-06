import type { Cents } from '@guara/types';
import { formatPercent, sumCents } from '@guara/utils';

import type { EventItem } from '../assets';

export const EVENT_KINDS = [
  { value: 'all', label: 'Todos' },
  { value: 'Rendimento', label: 'Rendimentos' },
  { value: 'Amortização', label: 'Amortizações' },
  { value: 'Desdobramento', label: 'Desdobramentos' },
] as const;
export type EventKindFilter = (typeof EVENT_KINDS)[number]['value'];

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "15/09/2026" → { year: 2026, month: 9 }. */
function parts(date: string) {
  const [, month, year] = date.split('/').map(Number) as [number, number, number];
  return { year, month };
}

/** Sum of what the user received and the month of the first payment ("desde abril de 2026"). */
export function receivedSummary(
  items: readonly EventItem[],
): { total: Cents; since: string } | null {
  const received = items.filter((item) => item.received !== null);
  if (received.length === 0) return null;
  const first = parts(received.at(-1)!.date);
  return {
    total: sumCents(received.map((item) => item.received!)),
    since: `${MONTHS[first.month - 1]} de ${first.year}`,
  };
}

/** Income per unit in the 12 months up to the latest payment, and the yield over the price. */
export function lastTwelveMonths(
  items: readonly EventItem[],
  price: Cents,
): { perUnit: Cents; yieldText: string } | null {
  const latest = items[0];
  if (!latest) return null;
  const end = parts(latest.date);
  const endIndex = end.year * 12 + end.month;
  const window = items.filter((item) => {
    const { year, month } = parts(item.date);
    return endIndex - (year * 12 + month) < 12;
  });
  if (window.some((item) => item.perUnitCents === undefined)) return null;
  const perUnit = sumCents(window.map((item) => item.perUnitCents!));
  return {
    perUnit,
    yieldText: formatPercent((perUnit / price) * 100, { fractionDigits: 1 }),
  };
}

export interface EventYear {
  year: number;
  items: EventItem[];
  /** Sum per unit (null when some value has a fraction of a cent). */
  perUnit: Cents | null;
  received: Cents | null;
}

/** Events by year, newest first. */
export function eventsByYear(items: readonly EventItem[]): EventYear[] {
  const years = [...new Set(items.map((item) => parts(item.date).year))].sort((a, b) => b - a);
  return years.map((year) => {
    const list = items.filter((item) => parts(item.date).year === year);
    const received = list.filter((item) => item.received !== null);
    return {
      year,
      items: list,
      perUnit: list.every((item) => item.perUnitCents !== undefined)
        ? sumCents(list.map((item) => item.perUnitCents!))
        : null,
      received: received.length > 0 ? sumCents(received.map((item) => item.received!)) : null,
    };
  });
}

export function filterEvents(items: readonly EventItem[], kind: EventKindFilter): EventItem[] {
  return kind === 'all' ? [...items] : items.filter((item) => item.kind === kind);
}
