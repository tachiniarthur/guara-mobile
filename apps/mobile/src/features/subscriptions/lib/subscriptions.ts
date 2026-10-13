import type { Cents, IsoDate, YearMonth } from '@guara/types';
import {
  cents,
  formatCents,
  formatDate,
  joinList,
  multiplyCents,
  subtractCents,
  sumCents,
} from '@guara/utils';

import type { SubscriptionItem } from '../data';

const pad = (value: number) => String(value).padStart(2, '0');

/** Month after `month` ("2026-09" → "2026-10"). */
export function nextMonth(month: YearMonth): YearMonth {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return number === 12 ? `${year + 1}-01` : `${year}-${pad(number + 1)}`;
}

/** Month before `month`. */
export function previousMonth(month: YearMonth): YearMonth {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return number === 1 ? `${year - 1}-12` : `${year}-${pad(number - 1)}`;
}

/** Days in a month (calendar). */
export function daysInMonth(month: YearMonth): number {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number, 0)).getUTCDate();
}

/** Weekday of day 1 (0 = Sunday), for the empty cells of the calendar. */
export function firstWeekday(month: YearMonth): number {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
}

/** Next charge on or after today (this month if the day has not passed, otherwise the next). */
export function nextCharge(item: Pick<SubscriptionItem, 'day'>, today: IsoDate): IsoDate {
  const month = today.slice(0, 7) as YearMonth;
  const day = Number(today.slice(8, 10));
  const target = item.day > day ? month : nextMonth(month);
  return `${target}-${pad(Math.min(item.day, daysInMonth(target)))}`;
}

/** Price charged in a month (the old price before an increase starts). */
export function amountIn(item: SubscriptionItem, month: YearMonth): Cents {
  if (item.increase && `${month}-${pad(item.day)}` < item.increase.from) {
    return item.increase.previous;
  }
  return item.amount;
}

/** "Subiu R$ 5,00", "+12,5%" and the yearly difference of a price increase. */
export function increaseOf(item: SubscriptionItem) {
  if (!item.increase) return null;
  const monthly = subtractCents(item.amount, item.increase.previous);
  return {
    previous: item.increase.previous,
    from: item.increase.from,
    monthly,
    percent: (monthly / item.increase.previous) * 100,
    yearly: multiplyCents(monthly, 12),
  };
}

/** Flags of the list: price increase and no apparent use. */
export function flagsOf(item: SubscriptionItem): { label: string; tone: 'warning' | 'negative' }[] {
  const flags: { label: string; tone: 'warning' | 'negative' }[] = [];
  if (item.increase) {
    flags.push({ label: `Subiu de ${formatCents(item.increase.previous)}`, tone: 'warning' });
  }
  if (item.unusedDays !== null) {
    flags.push({ label: `Sem uso aparente há ${item.unusedDays} dias`, tone: 'negative' });
  }
  return flags;
}

export function monthlyTotal(items: readonly SubscriptionItem[]): Cents {
  return sumCents(items.map((item) => item.amount));
}

export function yearly(amount: Cents): Cents {
  return multiplyCents(amount, 12);
}

/** Charges of a month in the calendar, by day. */
export function chargesIn(items: readonly SubscriptionItem[], month: YearMonth) {
  return items
    .map((item) => ({
      item,
      day: Math.min(item.day, daysInMonth(month)),
      amount: amountIn(item, month),
    }))
    .sort((a, b) => a.day - b.day);
}

/**
 * "Todas vencem até o dia 15: R$ 66,80 até o dia 8 (Spotify e Netflix) e R$ 34,80 entre os
 * dias 12 e 15 (Amazon Prime e iCloud+). Nenhuma na segunda quinzena." Charges are grouped in
 * the first ten days, days 11 to 15 and the second half of the month.
 */
export function monthSummary(charges: ReturnType<typeof chargesIn>): string | null {
  if (charges.length === 0) return null;
  const total = (group: typeof charges) => formatCents(sumCents(group.map((c) => c.amount)));
  const names = (group: typeof charges) => joinList(group.map((charge) => charge.item.name));
  const windows = [
    charges.filter((charge) => charge.day <= 10),
    charges.filter((charge) => charge.day > 10 && charge.day <= 15),
    charges.filter((charge) => charge.day > 15),
  ].filter((group) => group.length > 0);
  const range = (group: typeof charges, index: number) => {
    const first = group[0]!.day;
    const last = group.at(-1)!.day;
    if (index === 0) return `até o dia ${last}`;
    return first === last ? `no dia ${first}` : `entre os dias ${first} e ${last}`;
  };
  const parts = windows.map(
    (group, index) => `${total(group)} ${range(group, index)} (${names(group)})`,
  );
  const secondHalf = charges.filter((charge) => charge.day > 15).length;
  const last = charges.at(-1)!.day;
  const opening = secondHalf === 0 ? `Todas vencem até o dia ${last}` : `Vencem até o dia ${last}`;
  const closing = secondHalf === 0 ? ' Nenhuma na segunda quinzena.' : '';
  return `${opening}${parts.length > 1 ? `: ${joinList(parts)}` : ''}.${closing}`;
}

/** "08/10". */
export const dayMonth = (date: IsoDate) => formatDate(date, 'dd/MM');

/** "Outubro de 2026". */
export function monthTitle(month: YearMonth): string {
  const text = formatDate(`${month}-01`, "MMMM 'de' yyyy");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Last charges in the chart (whole months) plus the forecast of the next one. */
export function chargeBars(item: SubscriptionItem, today: IsoDate) {
  const past = [...item.charges].reverse().map((charge) => ({
    label: formatDate(charge.date, 'MMM').replace('.', ''),
    value: charge.amount,
    forecast: false,
  }));
  const next = nextCharge(item, today);
  return [
    ...past,
    {
      label: `${formatDate(next, 'MMM').replace('.', '')}*`,
      value: amountIn(item, next.slice(0, 7) as YearMonth),
      forecast: true,
    },
  ];
}

/** Sum of the last charges ("Últimos 6 meses · R$ 239,40"). */
export function chargesTotal(item: SubscriptionItem): Cents {
  return item.charges.length ? sumCents(item.charges.map((charge) => charge.amount)) : cents(0);
}
