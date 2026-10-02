import {
  AppNotificationSchema,
  BankAccountSchema,
  ChatMessageSchema,
  ConversationSchema,
  ENDPOINT_NAMES,
  GoalSchema,
  PropertySchema,
  SimulationSchema,
  SubscriptionSchema,
  TransactionSchema,
  UserSchema,
  streamEndpoints,
} from '@guara/types';
import { type z } from 'zod';

import type { ApiTransport } from '@/lib/api/transport';

import { MOCK_SCENARIOS } from '../config';
import { handlers, streamHandlers } from '../handlers';
import { buildCompleteDb } from '../scenarios/complete';
import { SCENARIOS } from '../scenarios';

import { allTransactions, fractionalMoney, mockApi } from './helpers';

type Api = ApiTransport;

/** Every read endpoint, with valid params for the complete scenario. */
async function readEverything(api: Api) {
  return {
    me: await api.request('me.get'),
    plan: await api.request('me.plan'),
    preferences: await api.request('me.notificationPreferences'),
    profile: await api.request('investorProfile.get'),
    connections: await api.request('bankConnections.list'),
    accounts: await api.request('accounts.list'),
    categories: await api.request('categories.list'),
    transactions: await api.request('transactions.list', { query: { limit: 100 } }),
    unusual: await api.request('unusual.list'),
    subscriptions: await api.request('subscriptions.list'),
    calendar: await api.request('subscriptions.calendar'),
    budgets: await api.request('budgets.list'),
    preview: await api.request('budgets.preview', {
      query: { categoryId: 'leisure', limit: 20_000 },
    }),
    dashboard: await api.request('dashboard.get'),
    report: await api.request('reports.summary', { query: { period: 'last_6_months' } }),
    wealth: await api.request('wealth.overview'),
    evolution: await api.request('wealth.evolution', { query: { range: 'all' } }),
    positions: await api.request('positions.list'),
    allocation: await api.request('allocation.get'),
    exposure: await api.request('exposure.get'),
    duplicates: await api.request('duplicates.list'),
    asset: await api.request('assets.get', { params: { ticker: 'PETR4' } }),
    index: await api.request('assets.get', { params: { ticker: 'IBOV' } }),
    history: await api.request('assets.history', {
      params: { ticker: 'HGLG11' },
      query: { range: '1y' },
    }),
    search: await api.request('assets.search', { query: { q: 'petro' } }),
    properties: await api.request('properties.list'),
    alerts: await api.request('priceAlerts.list'),
    simulations: await api.request('simulations.list'),
    goals: await api.request('goals.list'),
    conversations: await api.request('chat.listConversations'),
    notifications: await api.request('notifications.list', { query: { limit: 100 } }),
    unread: await api.request('notifications.unreadCount'),
  };
}

describe('mock scenarios', () => {
  it('cover every endpoint of the contract', () => {
    expect(Object.keys(handlers).sort()).toEqual([...ENDPOINT_NAMES].sort());
    expect(Object.keys(streamHandlers).sort()).toEqual(Object.keys(streamEndpoints).sort());
  });

  it('are deterministic', () => {
    expect(buildCompleteDb()).toEqual(buildCompleteDb());
  });

  describe.each(MOCK_SCENARIOS.filter((name) => name !== 'errors'))('%s', (scenario) => {
    it('stores records that pass the schemas', () => {
      const db = SCENARIOS[scenario].build();
      const check = (schema: z.ZodType, items: unknown[]) =>
        items.forEach((item) => expect(() => schema.parse(item)).not.toThrow());
      check(UserSchema, [db.user]);
      check(BankAccountSchema, db.accounts);
      check(TransactionSchema, db.transactions);
      check(SubscriptionSchema, db.subscriptions);
      check(PropertySchema, db.properties);
      check(SimulationSchema, db.simulations);
      check(GoalSchema, db.goals);
      check(ConversationSchema, db.conversations);
      check(ChatMessageSchema, db.messages);
      check(AppNotificationSchema, db.notifications);
    });

    it('answers every read endpoint within the contract, with integer money', async () => {
      const responses = await readEverything(mockApi(scenario));
      expect(fractionalMoney(responses)).toEqual([]);
    });
  });
});

describe('complete scenario', () => {
  let api: Api;
  beforeEach(() => {
    api = mockApi('complete');
  });

  it('has the planned content', async () => {
    const data = await readEverything(api);
    expect(data.connections).toHaveLength(3);
    expect(data.connections.filter((c) => c.status === 'expiring')).toHaveLength(1);
    const transactions = await allTransactions(api);
    expect(new Set(transactions.map((tx) => tx.date.slice(0, 7))).size).toBe(6);
    expect(new Set(transactions.map((tx) => tx.id)).size).toBe(transactions.length);
    expect(data.budgets.items).toHaveLength(4);
    expect(data.budgets.items.filter((b) => b.status === 'warning')).toHaveLength(1);
    expect(data.budgets.items.filter((b) => b.status === 'exceeded')).toHaveLength(1);
    expect(data.subscriptions.items.some((s) => s.priceIncrease !== null)).toBe(true);
    expect(data.subscriptions.items.some((s) => s.apparentlyUnused)).toBe(true);
    expect(data.unusual.length).toBeGreaterThanOrEqual(3);
    expect(new Set(data.positions.items.map((p) => p.class)).size).toBe(4);
    expect(data.duplicates.filter((d) => d.status === 'pending')).toHaveLength(1);
    expect(data.properties.items.map((p) => p.kind).sort()).toEqual(['real_estate', 'vehicle']);
    expect(new Set(data.alerts.map((a) => a.side))).toEqual(new Set(['buy', 'sell']));
    expect(data.goals).toHaveLength(2);
    expect(data.simulations).toHaveLength(2);
    const messages = await api.request('chat.listMessages', {
      params: { conversationId: 'conv_investments' },
    });
    expect(messages.items.flatMap((m) => m.blocks.map((b) => b.type))).toEqual(
      expect.arrayContaining(['position_summary', 'mini_chart']),
    );
    const read = data.notifications.items.filter((n) => n.readAt !== null).length;
    expect(read).toBeGreaterThan(0);
    expect(data.unread.count).toBeGreaterThan(0);
  });

  it('budget spending equals the sum of the month transactions of the category', async () => {
    const budgets = await api.request('budgets.list');
    const month = await api.request('transactions.list', {
      query: { period: 'this_month', limit: 100 },
    });
    const categories = await api.request('categories.list');
    const expense = new Set(categories.filter((c) => c.kind === 'expense').map((c) => c.id));
    for (const budget of budgets.items) {
      const sum = month.items
        .filter(
          (tx) =>
            tx.direction === 'out' &&
            tx.categoryId === budget.categoryId &&
            expense.has(budget.categoryId),
        )
        .reduce((total, tx) => total + tx.amount, 0);
      expect([budget.categoryId, budget.spent]).toEqual([budget.categoryId, sum]);
    }
  });

  it('portfolio and allocation shares sum to exactly 100%', async () => {
    const hundred = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 100);
    const positions = await api.request('positions.list');
    expect(hundred(positions.items.map((p) => p.portfolioPercent ?? 0))).toBe(10_000);
    const allocation = await api.request('allocation.get');
    expect(hundred(allocation.slices.map((s) => s.currentPercent))).toBe(10_000);
    expect(hundred(allocation.slices.map((s) => s.targetPercent ?? 0))).toBe(10_000);
    const exposure = await api.request('exposure.get');
    expect(hundred(exposure.items.map((i) => i.percent))).toBe(10_000);
  });

  it('net worth is invested + properties − debts, and the evolution ends at today', async () => {
    const wealth = await api.request('wealth.overview');
    const positions = await api.request('positions.list');
    expect(wealth.invested).toBe(positions.total);
    expect(wealth.total).toBe(wealth.invested! + wealth.properties! - wealth.debts!);
    const evolution = await api.request('wealth.evolution', { query: { range: '12m' } });
    expect(evolution.points).toHaveLength(13);
    expect(evolution.points.at(-1)!.value).toBe(positions.total);
    expect(evolution.points[0]!.cumulativeReturn).toBe(0);
  });

  it('asset quotes agree with their price history', async () => {
    const detail = await api.request('assets.get', { params: { ticker: 'PETR4' } });
    const history = await api.request('assets.history', {
      params: { ticker: 'PETR4' },
      query: { range: '1y' },
    });
    expect(history.points.at(-1)!.close).toBe(detail.asset.price);
    const closes = history.points.map((p) => p.close!);
    expect(Math.min(...closes)).toBeGreaterThanOrEqual(detail.asset.yearLow!);
    expect(Math.max(...closes)).toBeLessThanOrEqual(detail.asset.yearHigh!);
    expect(detail.userIncome?.allTime).toBeGreaterThan(0);
  });
});

describe('new_user scenario', () => {
  it('is empty, with nulls instead of zeros', async () => {
    const data = await readEverything(mockApi('new_user'));
    expect(data.profile).toBeNull();
    expect(data.connections).toEqual([]);
    expect(data.transactions.items).toEqual([]);
    expect(data.positions.items).toEqual([]);
    expect(data.dashboard).toMatchObject({
      consolidatedBalance: null,
      monthIncome: null,
      monthExpenses: null,
    });
    expect(data.wealth).toMatchObject({ invested: null, total: null });
    expect(data.allocation.rebalance).toBeNull();
    expect(data.preview).toMatchObject({ currentSpent: null, threeMonthAverage: null });
    expect(data.notifications.items).toEqual([]);
  });
});

describe('errors scenario', () => {
  it('fails some endpoints with ApiError and times out one', async () => {
    const api = mockApi('errors');
    await expect(api.request('dashboard.get')).rejects.toMatchObject({
      code: 'internal',
      status: 500,
    });
    await expect(api.request('budgets.list')).rejects.toMatchObject({ code: 'unavailable' });
    await expect(api.request('transactions.list')).rejects.toMatchObject({ code: 'timeout' });
    await expect(
      api.request('budgets.create', {
        body: { categoryId: 'leisure', limit: 30_000, warningThresholds: [80] },
      }),
    ).rejects.toMatchObject({
      code: 'plan_limit_reached',
      message: 'Seu plano permite até 4 tetos de gasto.',
    });
    await expect(api.request('positions.list')).resolves.toBeDefined();
  });
});
