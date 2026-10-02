import type { InvestorProfileType } from '@guara/types';

import { lastDayOf } from '../clock';
import type { MockDb } from '../db';
import { touch } from '../logic/records';
import { currentMonth } from '../logic/spending';

import type { MockHandlers } from './types';

const OPTION_SCORE = { a: 0, b: 1, c: 2, d: 3 } as const;

/** 6 answers × 0–3 points: up to 5 conservative, up to 11 moderate, above that aggressive. */
function profileFor(score: number): InvestorProfileType {
  if (score <= 5) return 'conservative';
  if (score <= 11) return 'moderate';
  return 'aggressive';
}

export const accountHandlers = {
  'me.get': (_request, { db }) => db.user,

  'me.update': ({ body }, { db }) => {
    db.user = { ...db.user, name: body.name, updatedAt: touch(db) };
    return db.user;
  },

  'me.plan': (_request, { db }) => ({
    plan: db.plan,
    usage: {
      bankConnections: db.connections.filter((connection) => connection.status !== 'revoked')
        .length,
      aiMessagesThisMonth: db.aiMessagesThisMonth,
      cycleEndsOn: lastDayOf(currentMonth(db)),
    },
  }),

  'me.notificationPreferences': (_request, { db }) => db.notificationPreferences,

  'me.updateNotificationPreferences': ({ body }, { db }) => {
    db.notificationPreferences = body;
    touch(db);
    return db.notificationPreferences;
  },

  'investorProfile.get': (_request, { db }) => db.investorProfile,

  'investorProfile.submit': ({ body }, { db }) => {
    const score = body.answers.reduce((sum, answer) => sum + OPTION_SCORE[answer.optionId], 0);
    db.investorProfile = { type: profileFor(score), answers: body.answers, answeredAt: touch(db) };
    return db.investorProfile;
  },
} satisfies Partial<MockHandlers<MockDb>>;
