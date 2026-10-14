import type { CategoryMonthSummary, IsoDate, UnusualReason, YearMonth } from '@guara/types';
import { EMPTY, formatCents, formatDate, formatTime, sumCents } from '@guara/utils';
import { addDays } from 'date-fns';

import { budgetStateLabel } from '@/components/ui';

import { CATEGORY_LABELS, SUBCATEGORY_LABELS, categoryLabel } from '../categories';
import {
  SPENDING_BANKS,
  type CategoryBudget,
  type LedgerAccount,
  type LedgerTransaction,
} from '../data';

import { previousMonth, type LedgerFilters } from './ledger';

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
}

/** "domingo", "sexta" (without "-feira"). */
function weekday(date: IsoDate): string {
  return formatDate(date, 'EEEE').split('-')[0] ?? '';
}

function shiftDay(date: IsoDate, days: number): IsoDate {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  const shifted = addDays(new Date(Date.UTC(year, month - 1, day, 12)), days);
  return shifted.toISOString().slice(0, 10);
}

/** Day header of the lists: "Hoje · 23 de setembro", "Domingo · 21 de setembro". */
export function dayLabel(date: IsoDate, today: IsoDate): string {
  const relative =
    date === today ? 'Hoje' : date === shiftDay(today, -1) ? 'Ontem' : capitalize(weekday(date));
  return `${relative} · ${formatDate(date, "d 'de' MMMM")}`;
}

/** Short date of the Gastos list: "Hoje, 02:14", "Ontem", "18 set". */
export function shortDayLabel(tx: LedgerTransaction, today: IsoDate): string {
  if (tx.date === today) return tx.occurredAt ? `Hoje, ${formatTime(tx.occurredAt)}` : 'Hoje';
  if (tx.date === shiftDay(today, -1)) return 'Ontem';
  return formatDate(tx.date, 'dd MMM').replace('.', '');
}

export function bankLabel(bank: LedgerAccount['bank']): string {
  return SPENDING_BANKS.find((item) => item.id === bank)?.label ?? EMPTY;
}

/** "Nubank crédito", "Itaú débito", "Pix recebido · Itaú". */
export function accountLabel(tx: LedgerTransaction, account: LedgerAccount | undefined): string {
  if (!account) return EMPTY;
  const bank = bankLabel(account.bank);
  switch (tx.type) {
    case 'credit_card':
      return `${bank} crédito`;
    case 'debit_card':
      return `${bank} débito`;
    case 'pix':
      return `${tx.direction === 'in' ? 'Pix recebido' : 'Pix enviado'} · ${bank}`;
    default:
      return bank;
  }
}

/** Second line of a row: "02:14 · Nubank crédito · Eletrônicos". */
export function rowDetail(
  tx: LedgerTransaction,
  account: LedgerAccount | undefined,
  { showTime, showCategory }: { showTime: boolean; showCategory: boolean },
): string {
  return [
    showTime && tx.occurredAt ? formatTime(tx.occurredAt) : null,
    accountLabel(tx, account),
    showCategory ? categoryLabel(tx.categoryId) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

const ACCOUNT_TYPE: Record<LedgerAccount['type'], string> = {
  credit_card: 'cartão de crédito',
  checking: 'conta corrente',
  savings: 'poupança',
};

const PAYMENT_TYPE: Record<LedgerTransaction['type'], string> = {
  pix: 'Pix',
  debit_card: 'Débito',
  credit_card: 'À vista',
  boleto: 'Boleto',
  transfer: 'Transferência',
  direct_debit: 'Débito automático',
  fee: 'Tarifa',
  other: 'Outra',
};

export interface DetailRow {
  label: string;
  value: string;
}

/** "Data", "Conta ou cartão", "Fatura", "Forma", "Descrição no banco", "Origem". */
export function detailRows(tx: LedgerTransaction, account: LedgerAccount | undefined): DetailRow[] {
  const date = `${capitalize(weekday(tx.date))}, ${formatDate(tx.date)}`;
  const rows: DetailRow[] = [
    { label: 'Data', value: tx.occurredAt ? `${date} · ${formatTime(tx.occurredAt)}` : date },
    {
      label: 'Conta ou cartão',
      value: account ? `${bankLabel(account.bank)} · ${ACCOUNT_TYPE[account.type]}` : EMPTY,
    },
  ];
  if (tx.type === 'credit_card') {
    rows.push({
      label: 'Fatura',
      value: tx.invoice
        ? `${capitalize(formatDate(`${tx.invoice.month}-01`, 'MMMM'))} · vence em ${formatDate(tx.invoice.dueOn, 'dd/MM')}`
        : EMPTY,
    });
  }
  rows.push(
    {
      label: 'Forma',
      value: tx.installment
        ? `Parcela ${tx.installment.current} de ${tx.installment.total}`
        : PAYMENT_TYPE[tx.type],
    },
    { label: 'Descrição no banco', value: tx.description },
    {
      label: 'Origem',
      value:
        tx.source === 'open_finance'
          ? `Open Finance · ${account ? bankLabel(account.bank) : EMPTY}`
          : 'Cadastro manual',
    },
  );
  if (tx.note) rows.push({ label: 'Observação', value: tx.note });
  return rows;
}

function monthName(month: YearMonth): string {
  return formatDate(`${month}-01`, 'MMMM');
}

function joinWords(words: readonly string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} e ${words.at(-1)}`;
}

/** "Avisos de R$ 500 e R$ 700 já enviados · no ritmo atual, fecha perto de R$ 960". */
export function budgetCaption(budget: NonNullable<CategoryMonthSummary['budget']>): string {
  const whole = (value: number) => formatCents(value, { wholeUnits: true });
  const parts: string[] = [];
  const sent = budget.warningsSent;
  if (sent.length > 0) {
    parts.push(
      sent.length === 1
        ? `Aviso de ${whole(sent[0]!)} já enviado`
        : `Avisos de ${joinWords(sent.map(whole))} já enviados`,
    );
  } else if (budget.warnings.length > 0) {
    parts.push(`Avisos em ${joinWords(budget.warnings.map(whole))}`);
  }
  if (budget.projectedSpent !== null) {
    parts.push(`no ritmo atual, fecha perto de ${whole(budget.projectedSpent)}`);
  }
  return parts.join(' · ');
}

/** "74% · atenção" */
export function budgetStateText(usedPercent: number): string {
  const percent = Math.round(usedPercent);
  return `${percent}% · ${budgetStateLabel(percent)}`;
}

/** Previous month of the summary in words ("agosto"). */
export function previousMonthName(summary: CategoryMonthSummary): string {
  return monthName(previousMonth(summary.month));
}

const WEEKEND = ['sexta', 'sábado', 'domingo'];

/**
 * Tamanduá's reading of a category: which subcategory and which days pushed the month up.
 * `null` when there is nothing to explain (no history or no increase).
 */
export function categoryInsight(
  summary: CategoryMonthSummary,
  transactions: readonly LedgerTransaction[],
): string | null {
  if (summary.changePercent === null) return null;
  const label = CATEGORY_LABELS[summary.categoryId];
  if (summary.changePercent <= 0) {
    return `${label} está ${Math.abs(Math.round(summary.changePercent))}% abaixo de ${previousMonthName(summary)}. Bom ritmo.`;
  }
  const top = [...summary.subcategories].sort((a, b) => b.spent - a.spent)[0];
  if (!top) return null;
  const weekendSpending = transactions.filter(
    (tx) =>
      tx.subcategoryId === top.subcategoryId &&
      tx.direction === 'out' &&
      !tx.markedDuplicate &&
      tx.date.startsWith(summary.month) &&
      WEEKEND.includes(weekday(tx.date)),
  );
  const subcategory = SUBCATEGORY_LABELS[top.subcategoryId];
  if (weekendSpending.length === 0) {
    return `${subcategory} puxou o aumento: ${formatCents(top.spent)} este mês.`;
  }
  const days = WEEKEND.filter((day) => weekendSpending.some((tx) => weekday(tx.date) === day));
  const total = sumCents(weekendSpending.map((tx) => tx.amount));
  return `${subcategory} de ${joinWords(days)} puxaram o aumento: ${formatCents(total)} este mês.`;
}

/** Quero-quero asking about a purchase out of the pattern. */
export function unusualMessage(tx: LedgerTransaction, reasons: readonly UnusualReason[]): string {
  const parts = [
    reasons.includes('unusual_time') && tx.occurredAt
      ? `Compra às ${formatTime(tx.occurredAt)}`
      : 'Compra',
  ];
  if (reasons.includes('unusual_amount')) {
    parts.push(
      `bem acima do seu costume em ${categoryLabel(tx.categoryId).toLocaleLowerCase('pt-BR')}`,
    );
  } else if (reasons.includes('unusual_location')) {
    parts.push('num lugar fora do seu costume');
  } else if (reasons.includes('new_category')) {
    parts.push('numa categoria que você não costuma usar');
  }
  return `${parts.join(', ')}. Foi você?`;
}

/** Whether the purchase counts in a cap ("Esta compra não entra em nenhum teto…"). */
export function budgetNote(
  tx: LedgerTransaction,
  budgets: readonly CategoryBudget[],
): string | null {
  if (tx.direction !== 'out') return null;
  if (tx.markedDuplicate) return 'Marcado como duplicado: não entra nos totais nem nos tetos.';
  const label = categoryLabel(tx.categoryId);
  const budget = budgets.find((item) => item.categoryId === tx.categoryId);
  if (!budget) {
    return `Esta compra não entra em nenhum teto. Você não tem teto para ${label}.`;
  }
  const whole = (value: number) => formatCents(value, { wholeUnits: true });
  const percent = (budget.spent / budget.limit) * 100;
  return `Esta compra entra no teto de ${label}: ${whole(budget.spent)} de ${whole(budget.limit)} (${budgetStateText(percent)}).`;
}

/** "Nenhum lançamento com “academia” no Nubank em setembro. Tente outro período ou todos os bancos." */
export function noResultsMessage(filters: LedgerFilters): string {
  const parts = ['Nenhum lançamento'];
  const query = filters.query.trim();
  if (query) parts.push(`com “${query}”`);
  if (filters.direction === 'in') parts.push('entre as entradas');
  if (filters.direction === 'out') parts.push('entre as saídas');
  if (filters.categoryId !== 'all') parts.push(`em ${CATEGORY_LABELS[filters.categoryId]}`);
  if (filters.bank !== 'all') parts.push(`no ${bankLabel(filters.bank)}`);
  parts.push(`em ${monthName(filters.month)}.`);
  return parts.join(' ');
}

/** "O Itaú não atualizou desde 10:05. Os lançamentos do Nubank estão em dia." */
export function staleBanksMessage(
  sync: readonly { bank: LedgerAccount['bank']; staleSince: string | null }[],
): string | null {
  const stale = sync.filter((item) => item.staleSince);
  if (stale.length === 0) return null;
  const fresh = sync.filter((item) => !item.staleSince).map((item) => bankLabel(item.bank));
  const first = stale.map(
    (item) => `O ${bankLabel(item.bank)} não atualizou desde ${formatTime(item.staleSince)}.`,
  );
  if (fresh.length > 0) {
    first.push(`Os lançamentos do ${joinWords(fresh)} estão em dia.`);
  }
  return first.join(' ');
}

export function monthLabel(month: YearMonth): string {
  return capitalize(formatDate(`${month}-01`, "MMMM 'de' yyyy"));
}

/** "Setembro 2026" (filter pill). */
export function monthPillLabel(month: YearMonth): string {
  return capitalize(formatDate(`${month}-01`, 'MMMM yyyy'));
}
