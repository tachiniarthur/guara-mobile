/**
 * Clock of the fake world. Data is generated around a fixed instant so it never changes
 * with the real date (and the current month always has the planned budgets, alerts…).
 * Handlers use `context.now`; nothing in src/mocks reads the device time.
 */
import type { IsoDate, IsoDateTime, YearMonth } from '@guara/types';
import { APP_TIME_ZONE, toISODate } from '@guara/utils';
import { fromZonedTime } from 'date-fns-tz';

/** 25/09/2026 12:00 in São Paulo. */
export const MOCK_NOW: IsoDateTime = '2026-09-25T15:00:00.000Z';

/** São Paulo calendar day of an instant. */
export function dayOf(instant: IsoDateTime | Date): IsoDate {
  const day = toISODate(instant);
  if (!day) throw new Error(`Invalid instant: ${String(instant)}`);
  return day;
}

export function monthOf(date: IsoDate): YearMonth {
  return date.slice(0, 7);
}

/** Instant of a São Paulo wall-clock time ("2026-09-05", "08:10"). */
export function instantAt(date: IsoDate, time = '12:00'): IsoDateTime {
  return fromZonedTime(`${date}T${time}:00`, APP_TIME_ZONE).toISOString();
}

function fromUtcDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

/** Calendar arithmetic on date labels (no time zone involved). */
export function addDays(date: IsoDate, days: number): IsoDate {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  return fromUtcDate(new Date(Date.UTC(year, month - 1, day + days)));
}

export function addMonths(month: YearMonth, months: number): YearMonth {
  const [year, value] = month.split('-').map(Number) as [number, number];
  return fromUtcDate(new Date(Date.UTC(year, value - 1 + months, 1))).slice(0, 7);
}

export function daysInMonth(month: YearMonth): number {
  const [year, value] = month.split('-').map(Number) as [number, number];
  return new Date(Date.UTC(year, value, 0)).getUTCDate();
}

export function firstDayOf(month: YearMonth): IsoDate {
  return `${month}-01`;
}

export function lastDayOf(month: YearMonth): IsoDate {
  return `${month}-${String(daysInMonth(month)).padStart(2, '0')}`;
}

/** Day `day` of `month`, clamped to the month length (31 → 30 in September). */
export function dayIn(month: YearMonth, day: number): IsoDate {
  return `${month}-${String(Math.min(day, daysInMonth(month))).padStart(2, '0')}`;
}

/** Whole months from `from` to `to` (both "YYYY-MM"). */
export function monthsBetween(from: YearMonth, to: YearMonth): number {
  const [fy, fm] = from.split('-').map(Number) as [number, number];
  const [ty, tm] = to.split('-').map(Number) as [number, number];
  return (ty - fy) * 12 + (tm - fm);
}

/** Inclusive number of days between two dates. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
