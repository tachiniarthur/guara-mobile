import type { DateRange, IsoDate, PeriodPreset, ReportGranularity } from '@guara/types';

import { addDays, addMonths, daysBetween, firstDayOf, lastDayOf, monthOf } from '../clock';

/** Resolves a preset or explicit range against "today" of the fake world. */
export function resolvePeriod(
  query: { period?: PeriodPreset; from?: IsoDate; to?: IsoDate },
  today: IsoDate,
  fallback: PeriodPreset = 'this_month',
): DateRange {
  if (query.from || query.to) {
    return { from: query.from ?? query.to!, to: query.to ?? today };
  }
  const month = monthOf(today);
  switch (query.period ?? fallback) {
    case 'this_month':
      return { from: firstDayOf(month), to: today };
    case 'last_month':
      return { from: firstDayOf(addMonths(month, -1)), to: lastDayOf(addMonths(month, -1)) };
    case 'last_3_months':
      return { from: firstDayOf(addMonths(month, -2)), to: today };
    case 'last_6_months':
      return { from: firstDayOf(addMonths(month, -5)), to: today };
    case 'last_12_months':
      return { from: firstDayOf(addMonths(month, -11)), to: today };
    case 'this_year':
      return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
}

/** Same-length range right before `range`. */
export function previousRange(range: DateRange): DateRange {
  const length = daysBetween(range.from, range.to);
  const to = addDays(range.from, -1);
  return { from: addDays(to, -length), to };
}

export function granularityFor(range: DateRange): ReportGranularity {
  const days = daysBetween(range.from, range.to) + 1;
  if (days <= 31) return 'day';
  if (days <= 92) return 'week';
  return 'month';
}

/** Buckets covering the range: first day of each and the last day it includes. */
export function bucketsOf(range: DateRange, granularity: ReportGranularity) {
  const buckets: { start: IsoDate; end: IsoDate }[] = [];
  let start = range.from;
  while (start <= range.to) {
    let next: IsoDate;
    if (granularity === 'day') next = addDays(start, 1);
    else if (granularity === 'week') next = addDays(start, 7);
    else next = firstDayOf(addMonths(monthOf(start), 1));
    const end = addDays(next, -1);
    buckets.push({ start, end: end < range.to ? end : range.to });
    start = next;
  }
  return buckets;
}

export function inRange(date: IsoDate, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}
