import { MOCK_NOW } from '../clock';
import type { MockDb } from '../db';

import { emptyDb } from './base';

/** Just signed up: no banks, no transactions, no portfolio, questionnaire not answered. */
export function buildNewUserDb(nowIso: string = MOCK_NOW): MockDb {
  return emptyDb(nowIso, {
    createdAt: new Date(Date.parse(nowIso) - 20 * 60_000).toISOString(),
    name: null,
    authProvider: 'email',
  });
}
