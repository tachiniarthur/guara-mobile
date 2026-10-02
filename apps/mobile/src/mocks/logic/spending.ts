import type { BudgetStatus, CategoryId, DateRange, IsoDate, YearMonth } from '@guara/types';
import { cents, sumCents } from '@guara/utils';

import { addMonths, dayOf, lastDayOf, monthOf } from '../clock';
import type { BudgetRecord, MockDb, TransactionRecord } from '../db';
import { categoryKind } from '../fixtures/categories';

import { nowIso } from './records';

export function today(db: MockDb): IsoDate {
  return dayOf(nowIso(db));
}

export function currentMonth(db: MockDb): YearMonth {
  return monthOf(today(db));
}

/** Spending = money out in an expense category (or uncategorised). Transfers do not count. */
export function isExpense(tx: TransactionRecord): boolean {
  return tx.direction === 'out' && categoryKind(tx.categoryId) === 'expense';
}

/** Income = money in under an income category. */
export function isIncome(tx: TransactionRecord): boolean {
  return tx.direction === 'in' && categoryKind(tx.categoryId) === 'income';
}

const accountType = (db: MockDb, accountId: string) =>
  db.accounts.find((account) => account.id === accountId)?.type;

/** True when the user has at least one account to read data from. */
export function hasAccounts(db: MockDb): boolean {
  return db.accounts.length > 0;
}

export function transactionsIn(db: MockDb, range: DateRange): TransactionRecord[] {
  return db.transactions.filter((tx) => tx.date >= range.from && tx.date <= range.to);
}

export function totalsOf(transactions: readonly TransactionRecord[]) {
  const income = sumCents(transactions.filter(isIncome).map((tx) => cents(tx.amount)));
  const expenses = sumCents(transactions.filter(isExpense).map((tx) => cents(tx.amount)));
  return { income, expenses, net: cents(income - expenses) };
}

export function monthRange(month: YearMonth, db: MockDb): DateRange {
  const to = month === currentMonth(db) ? today(db) : lastDayOf(month);
  return { from: `${month}-01`, to };
}

export function spentIn(db: MockDb, categoryId: CategoryId, month: YearMonth): number {
  return sumCents(
    db.transactions
      .filter((tx) => tx.categoryId === categoryId && isExpense(tx) && monthOf(tx.date) === month)
      .map((tx) => cents(tx.amount)),
  );
}

/** Checking + savings balance (credit cards excluded), or `null` without accounts. */
export function consolidatedBalance(db: MockDb): number | null {
  const accounts = db.accounts.filter((account) => account.type !== 'credit_card');
  if (accounts.length === 0) return null;
  return sumCents(accounts.map((account) => cents(account.balance ?? 0)));
}

/**
 * Consolidated balance at the end of `date`: today's balance minus everything that moved
 * checking/savings accounts after that day.
 */
export function balanceAt(db: MockDb, date: IsoDate): number | null {
  const current = consolidatedBalance(db);
  if (current === null) return null;
  const later = db.transactions.filter(
    (tx) => tx.date > date && accountType(db, tx.accountId) !== 'credit_card',
  );
  const net = later.reduce((sum, tx) => sum + (tx.direction === 'in' ? tx.amount : -tx.amount), 0);
  return cents(current - net);
}

// --- Budgets ---------------------------------------------------------------------------------

export function usedPercent(spent: number, limit: number): number {
  return Math.round((spent * 10_000) / limit) / 100;
}

export function budgetStatus(percent: number, thresholds: readonly number[]): BudgetStatus {
  if (percent >= 100) return 'exceeded';
  if (thresholds.length > 0 && percent >= thresholds[0]!) return 'warning';
  return 'ok';
}

export function buildBudget(db: MockDb, record: BudgetRecord, month: YearMonth) {
  const spent = spentIn(db, record.categoryId, month);
  const percent = usedPercent(spent, record.limit);
  const triggered = record.warningThresholds.filter((threshold) => percent >= threshold);
  return {
    id: record.id,
    categoryId: record.categoryId,
    month,
    limit: record.limit,
    warningThresholds: record.warningThresholds,
    spent,
    usedPercent: percent,
    status: budgetStatus(percent, record.warningThresholds),
    triggeredWarnings: percent >= 100 ? [...triggered, 100] : triggered,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/** Last `count` full months before the current one, oldest first. */
export function previousMonths(db: MockDb, count: number): YearMonth[] {
  const month = currentMonth(db);
  return Array.from({ length: count }, (_, index) => addMonths(month, index - count));
}

/** First month with any transaction, or `null`. */
export function firstDataMonth(db: MockDb): YearMonth | null {
  const dates = db.transactions.map((tx) => tx.date).sort();
  return dates[0] ? monthOf(dates[0]) : null;
}
