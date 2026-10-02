import { dayOf } from '../clock';
import type { MockDb } from '../db';
import { CATEGORIES } from '../fixtures/categories';
import { buildAssets } from '../fixtures/market';
import { PLAN, buildPreferences, buildUser } from '../fixtures/user';

/** Data every scenario shares: user, plan, categories and public market data. */
export function emptyDb(
  nowIso: string,
  user: Partial<MockDb['user']> & Pick<MockDb['user'], 'createdAt'>,
): MockDb {
  const fullUser = buildUser(user);
  return {
    clock: Date.parse(nowIso),
    sequence: 100,
    user: fullUser,
    plan: PLAN,
    aiMessagesThisMonth: 0,
    notificationPreferences: buildPreferences(fullUser.email),
    investorProfile: null,
    categories: CATEGORIES,
    connections: [],
    accounts: [],
    transactions: [],
    unusual: [],
    subscriptions: [],
    budgets: [],
    exports: [],
    assets: buildAssets(dayOf(nowIso), nowIso),
    positions: [],
    duplicates: [],
    wealthHistory: null,
    properties: [],
    priceAlerts: [],
    simulations: [],
    goals: [],
    conversations: [],
    messages: [],
    notifications: [],
  };
}
