import type { DateRange } from '@guara/types';
import { cents, percentChange, sharesOf, sumCents } from '@guara/utils';

import { addDays, lastDayOf } from '../clock';
import type { MockDb } from '../db';
import { categoryKind } from '../fixtures/categories';
import { bucketsOf, granularityFor, previousRange, resolvePeriod } from '../logic/period';
import { nextId, nowIso, touch } from '../logic/records';
import {
  balanceAt,
  buildBudget,
  consolidatedBalance,
  currentMonth,
  hasAccounts,
  isExpense,
  monthRange,
  today,
  totalsOf,
  transactionsIn,
} from '../logic/spending';
import { notFound } from '../errors';

import type { MockHandlers } from './types';

const ALERT_TYPES = new Set([
  'budget_warning',
  'budget_exceeded',
  'price_alert',
  'unusual_transaction',
  'consent_expiring',
]);

const round2 = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100);

function reportSummary(db: MockDb, range: DateRange, granularity = granularityFor(range)) {
  const transactions = transactionsIn(db, range);
  const previous = previousRange(range);
  const totals = totalsOf(transactions);
  const previousTotals = totalsOf(transactionsIn(db, previous));
  const buckets = bucketsOf(range, granularity);

  const expenses = transactions.filter(isExpense);
  const categories = [...new Set(expenses.map((tx) => tx.categoryId ?? 'other'))];
  const amounts = categories.map((categoryId) =>
    sumCents(
      expenses
        .filter((tx) => (tx.categoryId ?? 'other') === categoryId)
        .map((tx) => cents(tx.amount)),
    ),
  );
  const shares = sharesOf(amounts);

  return {
    range,
    granularity,
    cashFlow: buckets.map((bucket) => ({
      start: bucket.start,
      ...totalsOf(transactionsIn(db, { from: bucket.start, to: bucket.end })),
    })),
    totals,
    previous: { range: previous, totals: previousTotals },
    change: {
      income: round2(percentChange(cents(previousTotals.income), cents(totals.income))),
      expenses: round2(percentChange(cents(previousTotals.expenses), cents(totals.expenses))),
    },
    balanceOverTime: hasAccounts(db)
      ? buckets.map((bucket) => ({ date: bucket.end, balance: balanceAt(db, bucket.end)! }))
      : [],
    expensesByCategory: categories
      .map((categoryId, index) => ({
        categoryId,
        amount: amounts[index]!,
        percent: shares[index]!,
      }))
      .sort((a, b) => b.amount - a.amount),
    topMovements: transactions
      .filter((tx) => categoryKind(tx.categoryId) !== 'transfer')
      .sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
      .slice(0, 5),
  };
}

export const overviewHandlers = {
  'dashboard.get': (_request, { db }) => {
    const month = currentMonth(db);
    const connected = hasAccounts(db);
    const totals = totalsOf(transactionsIn(db, monthRange(month, db)));
    const balance = consolidatedBalance(db);
    const todayDate = today(db);
    // Forecast (simplified): today's balance minus subscriptions still to be charged this month.
    const upcoming = sumCents(
      db.subscriptions
        .filter(
          (sub) =>
            sub.status === 'active' &&
            sub.nextChargeOn !== null &&
            sub.nextChargeOn > todayDate &&
            sub.nextChargeOn <= lastDayOf(month),
        )
        .map((sub) => cents(sub.amount)),
    );
    const budgets = db.budgets
      .map((record) => buildBudget(db, record, month))
      .sort((a, b) => b.usedPercent - a.usedPercent);
    const alerts = db.notifications.filter((notification) => ALERT_TYPES.has(notification.type));

    return {
      month,
      consolidatedBalance: balance,
      monthIncome: connected ? totals.income : null,
      monthExpenses: connected ? totals.expenses : null,
      monthEndForecast: balance === null ? null : cents(balance - upcoming),
      budgets: {
        total: budgets.length,
        warning: budgets.filter((budget) => budget.status === 'warning').length,
        exceeded: budgets.filter((budget) => budget.status === 'exceeded').length,
        top: budgets.slice(0, 3).map((budget) => ({
          budgetId: budget.id,
          categoryId: budget.categoryId,
          limit: budget.limit,
          spent: budget.spent,
          usedPercent: budget.usedPercent,
          status: budget.status,
        })),
      },
      recentAlerts: alerts.slice(0, 3),
      unreadNotifications: db.notifications.filter((notification) => notification.readAt === null)
        .length,
      updatedAt: nowIso(db),
    };
  },

  'reports.summary': ({ query }, { db }) => {
    const range = resolvePeriod(query, today(db));
    return reportSummary(db, range, query.granularity);
  },

  'reports.createExport': ({ body }, { db }) => {
    const range =
      typeof body.period === 'string'
        ? resolvePeriod({ period: body.period }, today(db))
        : body.period;
    const record = {
      id: nextId(db, 'exp'),
      format: body.format,
      delivery: body.delivery,
      range,
      status: 'processing' as const,
      requestedAt: touch(db),
      completedAt: null,
      downloadUrl: null,
      expiresAt: null,
      email: body.delivery === 'email' ? db.user.email : null,
    };
    db.exports.push(record);
    return record;
  },

  /** Exports finish on the first status check after the request (simulated processing). */
  'reports.getExport': ({ params }, { db }) => {
    const record = db.exports.find((item) => item.id === params.exportId);
    if (!record) throw notFound('Exportação não encontrada.');
    if (record.status === 'processing') {
      const completedAt = touch(db);
      record.status = record.delivery === 'email' ? 'sent' : 'ready';
      record.completedAt = completedAt;
      if (record.delivery === 'download') {
        record.downloadUrl = `https://files.example.com/exports/${record.id}.${record.format}`;
        record.expiresAt = new Date(Date.parse(addDays(completedAt.slice(0, 10), 7))).toISOString();
      }
    }
    return record;
  },
} satisfies Partial<MockHandlers<MockDb>>;
