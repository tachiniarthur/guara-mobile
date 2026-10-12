import type { BudgetNotice, BudgetStatus, Cents, YearMonth } from '@guara/types';
import { cents, formatCents, formatDate, joinList, subtractCents, sumCents } from '@guara/utils';

/** From 70% of the cap the month is "Perto do teto" (design legend). */
export const NEAR_CAP = 70;

export const STATUS_LABEL: Record<BudgetStatus, string> = {
  ok: 'No ritmo',
  warning: 'Perto do teto',
  exceeded: 'Estourou',
};

/** Legend under "Tetos do mês". */
export const STATUS_HINT: Record<BudgetStatus, string> = {
  ok: `abaixo de ${NEAR_CAP}% do teto`,
  warning: `${NEAR_CAP}% ou mais`,
  exceeded: 'passou do teto no mês',
};

/** Share of the cap already spent, whole percent ("74%"). */
export function usedPercent(spent: Cents, limit: Cents): number {
  return Math.round((spent / limit) * 100);
}

export function budgetStatus(spent: Cents, limit: Cents): BudgetStatus {
  if (spent > limit) return 'exceeded';
  if ((spent / limit) * 100 >= NEAR_CAP) return 'warning';
  return 'ok';
}

const whole = (value: Cents) => formatCents(value, { wholeUnits: true });

/** A cap with the month's figures, as `budgets.list` sends it. */
export interface BudgetView {
  id: string;
  categoryId: string;
  label: string;
  limit: Cents;
  warnings: Cents[];
  spent: Cents;
  percent: number;
  status: BudgetStatus;
  /** What is left before the cap (`null` once it passed). */
  remaining: Cents | null;
  projectedSpent: Cents | null;
  notices: BudgetNotice[];
}

/** "No ritmo atual, fecha perto de R$ 960" or "passa do teto" (`null` without a projection). */
function paceText(budget: BudgetView): string | null {
  if (budget.projectedSpent === null || budget.status === 'exceeded') return null;
  return budget.projectedSpent > budget.limit
    ? 'no ritmo atual, passa do teto'
    : `no ritmo atual, fecha perto de ${whole(budget.projectedSpent)}`;
}

/**
 * Line under the bar in "Tetos do mês": "86% · Faltam R$ 63,60 · no ritmo atual, passa do
 * teto". Near the cap and on the way to stay under it, the pace alone says enough.
 */
export function budgetLine(budget: BudgetView): string {
  const percent = `${budget.percent}%`;
  if (budget.remaining === null) {
    return `${percent} · Passou ${formatCents(subtractCents(budget.spent, budget.limit))} do teto`;
  }
  const remaining = `Faltam ${formatCents(budget.remaining)}`;
  const pace = paceText(budget);
  if (budget.status === 'ok' || pace === null) return `${percent} · ${remaining}`;
  if (budget.projectedSpent !== null && budget.projectedSpent > budget.limit) {
    return `${percent} · ${remaining} · ${pace}`;
  }
  return `${percent} · ${pace.charAt(0).toUpperCase()}${pace.slice(1)}`;
}

/**
 * Parts of the detail caption, values apart so they can be bold: "74% · faltam R$ 257,82 · no
 * ritmo atual, fecha perto de R$ 960" or "112% · passou R$ 120,00 do teto".
 */
export function detailParts(budget: BudgetView): {
  percent: string;
  remaining: { before: string; value: string; after: string };
  pace: { text: string; value: string | null } | null;
} {
  const remaining =
    budget.remaining === null
      ? {
          before: 'passou',
          value: formatCents(subtractCents(budget.spent, budget.limit)),
          after: ' do teto',
        }
      : { before: 'faltam', value: formatCents(budget.remaining), after: '' };
  let pace: { text: string; value: string | null } | null = null;
  if (budget.projectedSpent !== null && budget.status !== 'exceeded') {
    pace =
      budget.projectedSpent > budget.limit
        ? { text: 'no ritmo atual, passa do teto', value: null }
        : { text: 'no ritmo atual, fecha perto de', value: whole(budget.projectedSpent) };
  }
  return { percent: `${budget.percent}%`, remaining, pace };
}

/** Sum of every cap of the month (hero of Tetos de gasto). */
export function budgetTotals(budgets: readonly BudgetView[]) {
  const spent = sumCents(budgets.map((budget) => budget.spent));
  const limit = sumCents(budgets.map((budget) => budget.limit));
  return { spent, limit, percent: limit > 0 ? usedPercent(spent, limit) : 0 };
}

/** Average of the last 3 closed months (the last entry is the current, partial month). */
export function threeMonthAverage(history: readonly { spent: Cents }[]): Cents | null {
  const closed = history.slice(0, -1).slice(-3);
  if (closed.length < 3) return null;
  return cents(Math.round(sumCents(closed.map((item) => item.spent)) / 3));
}

/** "julho" (month name in pt-BR). */
export function monthName(month: YearMonth): string {
  return formatDate(`${month}-01`, 'MMMM');
}

/** "R$ 500 · 1º de 3 avisos", "R$ 1.000 · teto", each with the notice sent this month. */
export function noticeRows(budget: Pick<BudgetView, 'limit' | 'warnings' | 'notices'>) {
  const count = budget.warnings.length + 1;
  const sent = (amount: Cents) => budget.notices.find((notice) => notice.amount === amount) ?? null;
  return [
    ...budget.warnings.map((amount, index) => ({
      amount,
      label: `${whole(amount)} · ${index + 1}º de ${count} avisos`,
      notice: sent(amount),
    })),
    { amount: budget.limit, label: `${whole(budget.limit)} · teto`, notice: sent(budget.limit) },
  ];
}

const CHANNEL_LABEL: Record<BudgetNotice['channels'][number], string> = {
  push: 'celular',
  email: 'e-mail',
};

/** "12/09/2026, 13:48 · celular". */
export function noticeDetail(notice: BudgetNotice): string {
  return `${formatDate(notice.sentAt, 'dd/MM/yyyy, HH:mm')} · ${joinList(notice.channels.map((channel) => CHANNEL_LABEL[channel]))}`;
}

/**
 * Tamanduá's suggestion when there is no cap yet: a round cap a little above the 3-month
 * average and the closed months that would have passed it.
 */
export function capSuggestion(
  history: readonly { month: YearMonth; spent: Cents }[],
): { average: Cents; limit: Cents; monthsOver: YearMonth[] } | null {
  const average = threeMonthAverage(history);
  if (average === null) return null;
  const limit = cents(Math.ceil((average + 1) / 10_000) * 10_000);
  return { average, limit, monthsOver: monthsOverCap(history, limit) };
}

type MonthSpent = { month: YearMonth; spent: Cents };

/** Bars of the history chart in whole reais ("abr" … "set*", the current month marked). */
export function historyBars(history: readonly MonthSpent[]): { label: string; value: number }[] {
  return history.map((item, index) => ({
    label: `${formatDate(`${item.month}-01`, 'MMM').replace('.', '')}${index === history.length - 1 ? '*' : ''}`,
    value: Math.trunc(item.spent / 100),
  }));
}

/** Closed months that passed the cap. */
export function monthsOverCap(history: readonly MonthSpent[], limit: Cents): YearMonth[] {
  return history
    .slice(0, -1)
    .filter((item) => item.spent > limit)
    .map((item) => item.month);
}

/** Biggest month of the history (`null` without history). */
export function biggestMonth(history: readonly MonthSpent[]): MonthSpent | null {
  return history.reduce<MonthSpent | null>(
    (max, item) => (max === null || item.spent > max.spent ? item : max),
    null,
  );
}

/** "Alimentação: abril R$ 790, …, julho R$ 1.020 (estourou), setembro R$ 742 até agora". */
export function historyLabel(
  label: string,
  history: readonly MonthSpent[],
  limit: Cents | null,
): string {
  return `${label}: ${history
    .map((item, index) => {
      const suffix =
        index === history.length - 1
          ? ' até agora'
          : limit !== null && item.spent > limit
            ? ' (estourou)'
            : '';
      return `${monthName(item.month)} ${whole(item.spent)}${suffix}`;
    })
    .join(', ')}`;
}
