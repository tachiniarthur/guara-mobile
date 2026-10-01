import type { ISODate } from '@guara/types';
import { addDays, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

import { EMPTY } from './empty';

/** Every date shown to the user is in this time zone, regardless of the device setting. */
export const APP_TIME_ZONE = 'America/Sao_Paulo';

export type DateInput = Date | string | number;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converts input to a `Date` instant, or `null` if invalid.
 * Date-only strings ("2026-10-01") are calendar dates in São Paulo and are anchored
 * at noon local time so the day never shifts with offsets or DST.
 */
export function parseDate(input: DateInput | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null;

  let date: Date;
  if (input instanceof Date) date = input;
  else if (typeof input === 'number') date = new Date(input);
  else if (DATE_ONLY.test(input)) date = fromZonedTime(`${input}T12:00:00`, APP_TIME_ZONE);
  else date = parseISO(input);

  return isValid(date) ? date : null;
}

/** Current instant. Use the formatters below to display it in São Paulo time. */
export function now(): Date {
  return new Date();
}

/**
 * Current wall-clock time in São Paulo as a `Date` whose *local* fields
 * (getHours, getDate…) match São Paulo. Only for calendar math — never send it to the API.
 */
export function nowInAppTimeZone(): Date {
  return toZonedTime(now(), APP_TIME_ZONE);
}

/** Formats a date in São Paulo time with a date-fns pattern and the pt-BR locale. */
export function formatDate(input: DateInput | null | undefined, pattern = 'dd/MM/yyyy'): string {
  const date = parseDate(input);
  if (!date) return EMPTY;
  return formatInTimeZone(date, APP_TIME_ZONE, pattern, { locale: ptBR });
}

/** "01/10/2026 14:30" */
export function formatDateTime(input: DateInput | null | undefined): string {
  return formatDate(input, 'dd/MM/yyyy HH:mm');
}

/** "14:30" */
export function formatTime(input: DateInput | null | undefined): string {
  return formatDate(input, 'HH:mm');
}

/** "outubro de 2026" */
export function formatMonthYear(input: DateInput | null | undefined): string {
  return formatDate(input, "MMMM 'de' yyyy");
}

/** Calendar date in São Paulo ("2026-10-01"), or `null` if invalid. */
export function toISODate(input: DateInput | null | undefined): ISODate | null {
  const date = parseDate(input);
  return date ? formatInTimeZone(date, APP_TIME_ZONE, 'yyyy-MM-dd') : null;
}

/** Today's calendar date in São Paulo. */
export function todayISODate(): ISODate {
  return formatInTimeZone(now(), APP_TIME_ZONE, 'yyyy-MM-dd');
}

/** Instant at which the São Paulo calendar day of `input` starts. */
export function startOfDayInAppTimeZone(input: DateInput): Date | null {
  const isoDate = toISODate(input);
  return isoDate ? fromZonedTime(`${isoDate}T00:00:00`, APP_TIME_ZONE) : null;
}

export function isSameDayInAppTimeZone(a: DateInput, b: DateInput): boolean {
  const dayA = toISODate(a);
  return dayA !== null && dayA === toISODate(b);
}

/**
 * Label for grouping lists by day (e.g. chat history): "Hoje", "Ontem" or "28/09/2026".
 */
export function formatDayLabel(
  input: DateInput | null | undefined,
  reference: DateInput = now(),
): string {
  const day = toISODate(input);
  const today = toISODate(reference);
  if (!day || !today) return EMPTY;
  if (day === today) return 'Hoje';

  const todayAnchor = parseDate(today);
  const yesterday = todayAnchor ? toISODate(addDays(todayAnchor, -1)) : null;
  if (day === yesterday) return 'Ontem';

  return formatDate(day);
}
