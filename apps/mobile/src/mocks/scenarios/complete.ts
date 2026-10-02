import { MOCK_NOW, dayOf, instantAt } from '../clock';
import type { MockDb } from '../db';
import { buildBanks } from '../fixtures/banks';
import { buildBudgets } from '../fixtures/budgets';
import { buildChat } from '../fixtures/chat';
import {
  buildDuplicates,
  buildPositions,
  buildPriceAlerts,
  buildProperties,
  buildWealthHistory,
} from '../fixtures/investments';
import { buildNotifications } from '../fixtures/notifications';
import { buildPlanning } from '../fixtures/planning';
import { buildSpending } from '../fixtures/spending';
import { moderateProfile } from '../fixtures/user';
import { createRandom } from '../random';

import { emptyDb } from './base';

/** Seed of the complete scenario. Change it and every amount changes (tests still pass). */
export const COMPLETE_SEED = 20_260_925;

/** Long-time user with three banks, six months of history and a full portfolio. */
export function buildCompleteDb(nowIso: string = MOCK_NOW): MockDb {
  const today = dayOf(nowIso);
  const random = createRandom(COMPLETE_SEED);
  const db = emptyDb(nowIso, {
    createdAt: instantAt('2026-03-14', '10:02'),
    onboardingCompletedAt: instantAt('2026-03-14', '10:40'),
  });

  db.investorProfile = moderateProfile(instantAt('2026-03-14', '10:35'));
  db.aiMessagesThisMonth = 47;
  Object.assign(db, buildBanks(today, nowIso));
  Object.assign(db, buildSpending(random, today));
  db.budgets = buildBudgets(db);
  db.positions = buildPositions(db.assets, nowIso);
  db.duplicates = buildDuplicates(nowIso);
  db.wealthHistory = buildWealthHistory(random, today);
  db.properties = buildProperties(today);
  db.priceAlerts = buildPriceAlerts(today);
  Object.assign(db, buildPlanning(today));
  Object.assign(db, buildChat(db));
  db.notifications = buildNotifications(db);
  return db;
}
