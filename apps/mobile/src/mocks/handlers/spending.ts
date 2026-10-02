import type { CategoryId, YearMonth } from '@guara/types';
import { cents, sumCents } from '@guara/utils';

import { addMonths, dayIn, daysInMonth, monthOf } from '../clock';
import type { MockDb, SubscriptionRecord } from '../db';
import { mockError, notFound } from '../errors';
import { categoryKind, categoryLabel } from '../fixtures/categories';
import { inRange, resolvePeriod } from '../logic/period';
import { nextId, normalize, paginate, touch } from '../logic/records';
import {
  buildBudget,
  currentMonth,
  firstDataMonth,
  hasAccounts,
  previousMonths,
  spentIn,
  today,
} from '../logic/spending';

import type { MockHandlers } from './types';

function findTransaction(db: MockDb, id: string) {
  const tx = db.transactions.find((item) => item.id === id);
  if (!tx) throw notFound('Lançamento não encontrado.');
  return tx;
}

function findSubscription(db: MockDb, id: string) {
  const subscription = db.subscriptions.find((item) => item.id === id);
  if (!subscription) throw notFound('Assinatura não encontrada.');
  return subscription;
}

function findBudget(db: MockDb, id: string) {
  const budget = db.budgets.find((item) => item.id === id);
  if (!budget) throw notFound('Teto de gasto não encontrado.');
  return budget;
}

function unusualView(db: MockDb, record: MockDb['unusual'][number]) {
  return {
    transaction: findTransaction(db, record.transactionId),
    reasons: record.reasons,
    status: record.status,
    detectedAt: record.detectedAt,
  };
}

/** Normalised monthly cost of a subscription. */
function monthlyCost(subscription: SubscriptionRecord): number {
  switch (subscription.cycle) {
    case 'weekly':
      return Math.round((subscription.amount * 52) / 12);
    case 'monthly':
      return subscription.amount;
    case 'quarterly':
      return Math.round(subscription.amount / 3);
    case 'yearly':
      return Math.round(subscription.amount / 12);
  }
}

/** Charges of a subscription that fall in `month`. */
function chargesIn(subscription: SubscriptionRecord, month: YearMonth) {
  const anchor = subscription.nextChargeOn ?? subscription.lastChargedOn;
  if (!anchor) return [];
  const day = Number(anchor.slice(8, 10));
  const charge = (date: string) => ({
    date,
    subscriptionId: subscription.id,
    merchantName: subscription.merchantName,
    amount: subscription.amount,
  });
  switch (subscription.cycle) {
    case 'monthly':
      return [charge(dayIn(month, day))];
    case 'yearly':
      return anchor.slice(5, 7) === month.slice(5, 7) ? [charge(dayIn(month, day))] : [];
    case 'quarterly': {
      const distance = (Number(month.slice(5, 7)) - Number(anchor.slice(5, 7)) + 12) % 3;
      return distance === 0 ? [charge(dayIn(month, day))] : [];
    }
    case 'weekly': {
      const charges = [];
      for (let date = ((day - 1) % 7) + 1; date <= daysInMonth(month); date += 7) {
        charges.push(charge(dayIn(month, date)));
      }
      return charges;
    }
  }
}

export const spendingHandlers = {
  'categories.list': (_request, { db }) => db.categories,

  'transactions.list': ({ query }, { db }) => {
    const hasPeriod = query.period || query.from || query.to;
    const range = hasPeriod ? resolvePeriod(query, today(db)) : null;
    const search = query.search ? normalize(query.search) : null;
    const items = db.transactions
      .filter(
        (tx) =>
          (!range || inRange(tx.date, range)) &&
          (!query.accountId || tx.accountId === query.accountId) &&
          (!query.categoryId || tx.categoryId === query.categoryId) &&
          (!query.direction || tx.direction === query.direction) &&
          (!query.unusualOnly || tx.isUnusual) &&
          (!search || normalize(`${tx.description} ${tx.merchantName ?? ''}`).includes(search)),
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          (b.occurredAt ?? '').localeCompare(a.occurredAt ?? '') ||
          b.id.localeCompare(a.id),
      );
    return paginate(items, query.cursor, query.limit);
  },

  'transactions.get': ({ params }, { db }) => findTransaction(db, params.transactionId),

  'transactions.correctCategory': ({ params, body }, { db }) => {
    const target = findTransaction(db, params.transactionId);
    const updatedAt = touch(db);
    const affected =
      body.applyToSimilar && target.merchantName
        ? db.transactions.filter((tx) => tx.merchantName === target.merchantName)
        : [target];
    for (const tx of affected) {
      tx.userCategoryId = body.categoryId;
      tx.categoryId = body.categoryId;
      tx.updatedAt = updatedAt;
    }
    return target;
  },

  'unusual.list': ({ query }, { db }) =>
    db.unusual
      .filter((record) => !query.status || record.status === query.status)
      .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
      .map((record) => unusualView(db, record)),

  'unusual.acknowledge': ({ params }, { db }) => {
    const record = db.unusual.find((item) => item.transactionId === params.transactionId);
    if (!record) throw notFound('Compra fora do padrão não encontrada.');
    record.status = 'acknowledged';
    touch(db);
    return unusualView(db, record);
  },

  'subscriptions.list': (_request, { db }) => {
    const items = [...db.subscriptions].sort(
      (a, b) =>
        Number(a.status !== 'active') - Number(b.status !== 'active') ||
        (a.nextChargeOn ?? '9999').localeCompare(b.nextChargeOn ?? '9999'),
    );
    const active = items.filter((subscription) => subscription.status === 'active');
    return { items, monthlyTotal: sumCents(active.map((sub) => cents(monthlyCost(sub)))) };
  },

  'subscriptions.calendar': ({ query }, { db }) => {
    const month = query.month ?? currentMonth(db);
    const charges = db.subscriptions
      .filter((subscription) => subscription.status === 'active')
      .flatMap((subscription) => chargesIn(subscription, month))
      .sort((a, b) => a.date.localeCompare(b.date) || a.merchantName.localeCompare(b.merchantName));
    return { month, charges, total: sumCents(charges.map((charge) => cents(charge.amount))) };
  },

  'subscriptions.get': ({ params }, { db }) => findSubscription(db, params.subscriptionId),

  'subscriptions.markNotSubscription': ({ params }, { db }) => {
    const subscription = findSubscription(db, params.subscriptionId);
    subscription.status = 'not_subscription';
    subscription.updatedAt = touch(db);
    return subscription;
  },

  'budgets.list': ({ query }, { db }) => {
    const month = query.month ?? currentMonth(db);
    const items = db.budgets
      .map((record) => buildBudget(db, record, month))
      .sort((a, b) => b.usedPercent - a.usedPercent || a.categoryId.localeCompare(b.categoryId));
    return {
      month,
      items,
      totalLimit: sumCents(items.map((item) => cents(item.limit))),
      totalSpent: sumCents(items.map((item) => cents(item.spent))),
    };
  },

  'budgets.preview': ({ query }, { db }) => {
    if (!hasAccounts(db)) {
      return {
        categoryId: query.categoryId,
        currentSpent: null,
        threeMonthAverage: null,
        highestMonth: null,
        monthsOverLimit: [],
      };
    }
    const first = firstDataMonth(db);
    const history = previousMonths(db, 6)
      .filter((month) => first !== null && month >= first)
      .map((month) => ({ month, spent: spentIn(db, query.categoryId, month) }));
    const lastThree = history.slice(-3);
    const highest = history.reduce<(typeof history)[number] | null>(
      (max, item) => (max === null || item.spent > max.spent ? item : max),
      null,
    );
    return {
      categoryId: query.categoryId,
      currentSpent: spentIn(db, query.categoryId, currentMonth(db)),
      threeMonthAverage: lastThree.length
        ? Math.round(lastThree.reduce((sum, item) => sum + item.spent, 0) / lastThree.length)
        : null,
      highestMonth: highest,
      monthsOverLimit: query.limit
        ? history.filter((item) => item.spent > query.limit!).map((item) => item.month)
        : [],
    };
  },

  'budgets.get': ({ params, query }, { db }) => {
    const record = findBudget(db, params.budgetId);
    const month = query.month ?? currentMonth(db);
    const first = firstDataMonth(db);
    const createdMonth = monthOf(record.createdAt.slice(0, 10));
    const history = Array.from({ length: 6 }, (_, index) => addMonths(month, index - 6))
      .filter((item) => first !== null && item >= first)
      .map((item) => ({
        month: item,
        spent: spentIn(db, record.categoryId, item),
        limit: item >= createdMonth ? record.limit : null,
      }));
    return { budget: buildBudget(db, record, month), history };
  },

  'budgets.create': ({ body }, { db }) => {
    if (categoryKind(body.categoryId) !== 'expense') {
      throw mockError('bad_request', 'Tetos só valem para categorias de gasto.');
    }
    if (db.budgets.some((budget) => budget.categoryId === body.categoryId)) {
      throw mockError('conflict', `Já existe um teto para ${categoryLabel(body.categoryId)}.`);
    }
    const createdAt = touch(db);
    const record = {
      id: nextId(db, 'bud'),
      categoryId: body.categoryId as CategoryId,
      limit: body.limit,
      warningThresholds: body.warningThresholds,
      createdAt,
      updatedAt: createdAt,
    };
    db.budgets.push(record);
    return buildBudget(db, record, currentMonth(db));
  },

  'budgets.update': ({ params, body }, { db }) => {
    const record = findBudget(db, params.budgetId);
    if (body.limit !== undefined) record.limit = body.limit;
    if (body.warningThresholds !== undefined) record.warningThresholds = body.warningThresholds;
    record.updatedAt = touch(db);
    return buildBudget(db, record, currentMonth(db));
  },

  'budgets.delete': ({ params }, { db }) => {
    findBudget(db, params.budgetId);
    db.budgets = db.budgets.filter((budget) => budget.id !== params.budgetId);
    touch(db);
  },
} satisfies Partial<MockHandlers<MockDb>>;
