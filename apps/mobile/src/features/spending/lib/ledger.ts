import type {
  BudgetStatus,
  CategoryId,
  CategoryMonthSummary,
  Cents,
  IsoDate,
  SubcategoryId,
  TransactionSummary,
  UnusualStatus,
  YearMonth,
} from '@guara/types';
import { cents, percentChange, sharesOf, sumCents } from '@guara/utils';

import { CATEGORY_LABELS, SUBCATEGORY_LABELS } from '../categories';
import type {
  CategoryBudget,
  CategoryTotal,
  LedgerAccount,
  LedgerTransaction,
  SpendingBankId,
} from '../data';

/** What the user changed in the app (kept in the spending store until the API exists). */
export interface LedgerEdits {
  /** Category chosen for one transaction. */
  categories: Record<string, CategoryId>;
  /** "Usar para esta loja nas próximas vezes": merchant key → category. */
  merchantRules: Record<string, CategoryId>;
  duplicates: Record<string, boolean>;
  hidden: Record<string, boolean>;
  notes: Record<string, string | null>;
  unusual: Record<string, UnusualStatus>;
  /** Merchant keys the user said are not subscriptions. */
  notSubscription: Record<string, boolean>;
}

export const NO_EDITS: LedgerEdits = {
  categories: {},
  merchantRules: {},
  duplicates: {},
  hidden: {},
  notes: {},
  unusual: {},
  notSubscription: {},
};

/** Name shown in lists: the recognised merchant, or the statement text. */
export function displayName(tx: LedgerTransaction): string {
  return tx.merchantName ?? tx.description;
}

/** Same store across transactions ("Transporte por app" on different days). */
export function merchantKey(tx: LedgerTransaction): string {
  return displayName(tx).trim().toLocaleLowerCase('pt-BR');
}

/** The transaction with the user's edits applied (same shape the API would return). */
export function applyEdits(tx: LedgerTransaction, edits: LedgerEdits): LedgerTransaction {
  const chosen =
    edits.categories[tx.id] ?? edits.merchantRules[merchantKey(tx)] ?? tx.userCategoryId;
  const categoryId = chosen ?? tx.autoCategoryId;
  return {
    ...tx,
    userCategoryId: chosen,
    categoryId,
    // The subcategory only survives while the category stays the same.
    subcategoryId: categoryId === tx.categoryId ? tx.subcategoryId : null,
    markedDuplicate: edits.duplicates[tx.id] ?? tx.markedDuplicate,
    hiddenFromReports: edits.hidden[tx.id] ?? tx.hiddenFromReports,
    note: tx.id in edits.notes ? (edits.notes[tx.id] ?? null) : tx.note,
  };
}

export function signedAmount(tx: LedgerTransaction): Cents {
  return cents(tx.direction === 'out' ? -tx.amount : tx.amount);
}

/** Counts in totals and caps: outgoing and not marked as a duplicate. */
function countsAsSpending(tx: LedgerTransaction): boolean {
  return tx.direction === 'out' && !tx.markedDuplicate;
}

export type DirectionFilter = 'all' | 'out' | 'in';

export interface LedgerFilters {
  query: string;
  bank: SpendingBankId;
  categoryId: CategoryId | 'all';
  direction: DirectionFilter;
  month: YearMonth;
}

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR').trim();
}

/** Transactions matching the filters, newest first (the order of the ledger). */
export function filterLedger(
  transactions: readonly LedgerTransaction[],
  filters: LedgerFilters,
  accounts: Record<string, LedgerAccount>,
): LedgerTransaction[] {
  const query = normalize(filters.query);
  return transactions.filter((tx) => {
    if (!tx.date.startsWith(filters.month)) return false;
    if (filters.bank !== 'all' && accounts[tx.accountId]?.bank !== filters.bank) return false;
    if (filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) return false;
    if (filters.direction !== 'all' && tx.direction !== filters.direction) return false;
    if (!query) return true;
    const haystack = [
      displayName(tx),
      tx.description,
      tx.categoryId ? CATEGORY_LABELS[tx.categoryId] : '',
      tx.subcategoryId ? SUBCATEGORY_LABELS[tx.subcategoryId] : '',
    ].join(' ');
    return normalize(haystack).includes(query);
  });
}

export interface LedgerDay {
  date: IsoDate;
  /** Signed sum of the day (duplicates left out). */
  total: Cents;
  items: LedgerTransaction[];
}

/** Groups consecutive transactions by day, keeping the ledger order. */
export function groupByDay(transactions: readonly LedgerTransaction[]): LedgerDay[] {
  const days: LedgerDay[] = [];
  for (const tx of transactions) {
    const last = days.at(-1);
    if (last?.date === tx.date) last.items.push(tx);
    else days.push({ date: tx.date, total: cents(0), items: [tx] });
  }
  return days.map((day) => ({
    ...day,
    total: sumCents(day.items.filter((tx) => !tx.markedDuplicate).map(signedAmount)),
  }));
}

/** Month header after the edits: duplicates leave the totals. */
export function adjustSummary(
  base: TransactionSummary | null,
  ledger: readonly LedgerTransaction[],
  edits: LedgerEdits,
): TransactionSummary | null {
  if (!base) return null;
  let totalIn: number = base.totalIn;
  let totalOut: number = base.totalOut;
  for (const tx of ledger) {
    const edited = applyEdits(tx, edits);
    if (edited.markedDuplicate === tx.markedDuplicate) continue;
    const change = edited.markedDuplicate ? -tx.amount : tx.amount;
    if (tx.direction === 'in') totalIn += change;
    else totalOut += change;
  }
  return {
    count: base.count,
    totalIn: cents(Math.max(0, totalIn)),
    totalOut: cents(Math.max(0, totalOut)),
  };
}

/**
 * How much the edits moved a category (or one of its subcategories): spending that entered
 * minus spending that left, and the same for the number of transactions.
 */
export function categoryDelta(
  ledger: readonly LedgerTransaction[],
  edits: LedgerEdits,
  categoryId: CategoryId,
  subcategoryId?: SubcategoryId,
): { spent: number; count: number } {
  const belongs = (tx: LedgerTransaction) =>
    countsAsSpending(tx) &&
    tx.categoryId === categoryId &&
    (subcategoryId === undefined || tx.subcategoryId === subcategoryId);
  let spent = 0;
  let count = 0;
  for (const tx of ledger) {
    const before = belongs(tx);
    const after = belongs(applyEdits(tx, edits));
    if (before === after) continue;
    spent += after ? tx.amount : -tx.amount;
    count += after ? 1 : -1;
  }
  return { spent, count };
}

function withDelta(value: Cents, delta: number): Cents {
  return cents(Math.max(0, value + delta));
}

export function budgetsWithEdits(
  budgets: readonly CategoryBudget[],
  ledger: readonly LedgerTransaction[],
  edits: LedgerEdits,
): CategoryBudget[] {
  return budgets.map((budget) => ({
    ...budget,
    spent: withDelta(budget.spent, categoryDelta(ledger, edits, budget.categoryId).spent),
  }));
}

export function categoryTotalsWithEdits(
  totals: readonly CategoryTotal[],
  ledger: readonly LedgerTransaction[],
  edits: LedgerEdits,
): CategoryTotal[] {
  return totals.map((item) => {
    const delta = categoryDelta(ledger, edits, item.id);
    return {
      ...item,
      total: withDelta(item.total, delta.spent),
      count: Math.max(0, item.count + delta.count),
    };
  });
}

function budgetStatus(usedPercent: number, warnings: readonly Cents[], limit: Cents): BudgetStatus {
  if (usedPercent >= 100) return 'exceeded';
  const first = warnings[0];
  if (first !== undefined && usedPercent >= (first / limit) * 100) return 'warning';
  return 'ok';
}

export function previousMonth(month: YearMonth): YearMonth {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export interface CategorySummarySource {
  month: YearMonth;
  totals: readonly CategoryTotal[];
  budgets: readonly CategoryBudget[];
  details: Partial<
    Record<
      CategoryId,
      {
        previousMonthSpent: Cents | null;
        projectedSpent: Cents | null;
        subcategories: { id: SubcategoryId; spent: Cents; count: number }[];
      }
    >
  >;
  /** All outflows of the month (before edits). */
  totalOut: Cents;
  ledger: readonly LedgerTransaction[];
  edits: LedgerEdits;
}

/**
 * Header of a category (same shape as `categories.summary`), or `null` when the month totals
 * of the category are unknown.
 */
export function categorySummary(
  categoryId: CategoryId,
  source: CategorySummarySource,
): CategoryMonthSummary | null {
  const base = source.totals.find((item) => item.id === categoryId);
  if (!base) return null;
  const { ledger, edits } = source;
  const delta = categoryDelta(ledger, edits, categoryId);
  const spent = withDelta(base.total, delta.spent);
  const totalOut =
    adjustSummary({ count: 0, totalIn: cents(0), totalOut: source.totalOut }, ledger, edits)
      ?.totalOut ?? source.totalOut;
  const details = source.details[categoryId];
  const previous = details?.previousMonthSpent ?? null;
  const budget = source.budgets.find((item) => item.categoryId === categoryId);
  const subcategories = (details?.subcategories ?? []).map((item) => {
    const change = categoryDelta(ledger, edits, categoryId, item.id);
    return {
      subcategoryId: item.id,
      spent: withDelta(item.spent, change.spent),
      count: Math.max(0, item.count + change.count),
    };
  });
  const shares = sharesOf(subcategories.map((item) => item.spent));

  let budgetSummary: CategoryMonthSummary['budget'] = null;
  if (budget) {
    const usedPercent = (spent / budget.limit) * 100;
    const warnings = [...budget.milestones].sort((a, b) => a - b);
    budgetSummary = {
      limit: budget.limit,
      usedPercent,
      status: budgetStatus(usedPercent, warnings, budget.limit),
      warnings: warnings,
      warningsSent: warnings.filter((value) => spent >= value),
      projectedSpent: details?.projectedSpent ?? null,
    };
  }

  return {
    categoryId,
    month: source.month,
    spent: spent,
    count: Math.max(0, base.count + delta.count),
    shareOfOutflows: totalOut > 0 ? (spent / totalOut) * 100 : 0,
    previousMonthSpent: previous,
    changePercent: previous === null ? null : percentChange(previous, spent),
    budget: budgetSummary,
    subcategories: subcategories.map((item, index) => ({
      ...item,
      spent: item.spent,
      share: shares[index] ?? 0,
    })),
  };
}
