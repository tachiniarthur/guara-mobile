import type { IsoDateTime, NotificationType } from '@guara/types';

import type { MockDb } from '../db';

export const PLAN: MockDb['plan'] = {
  id: 'plan_essencial',
  name: 'Essencial',
  limits: { bankConnections: 3, aiMessagesPerMonth: 200 },
};

export function buildUser(
  overrides: Partial<MockDb['user']> & Pick<MockDb['user'], 'createdAt'>,
): MockDb['user'] {
  return {
    id: 'usr_1',
    email: 'marina.costa@example.com',
    name: 'Marina Costa',
    avatarUrl: null,
    authProvider: 'google',
    planId: PLAN.id,
    onboardingCompletedAt: null,
    updatedAt: overrides.createdAt,
    ...overrides,
  };
}

const TYPES: NotificationType[] = [
  'budget_warning',
  'budget_exceeded',
  'price_alert',
  'unusual_transaction',
  'consent_expiring',
  'subscription_price_increase',
  'report_ready',
];

/** E-mail only for what matters most; push for everything. */
const EMAIL_TYPES = new Set<NotificationType>([
  'budget_exceeded',
  'consent_expiring',
  'report_ready',
]);

export function buildPreferences(email: string): MockDb['notificationPreferences'] {
  return {
    push: { enabled: true },
    email: { enabled: true, address: email },
    byType: Object.fromEntries(
      TYPES.map((type) => [type, { push: true, email: EMAIL_TYPES.has(type) }]),
    ) as MockDb['notificationPreferences']['byType'],
  };
}

/** Questionnaire answered with mostly middle options → moderate. */
export function moderateProfile(answeredAt: IsoDateTime): NonNullable<MockDb['investorProfile']> {
  return {
    type: 'moderate',
    answeredAt,
    answers: [
      { questionId: 'objective', optionId: 'b' },
      { questionId: 'horizon', optionId: 'c' },
      { questionId: 'experience', optionId: 'b' },
      { questionId: 'loss_tolerance', optionId: 'b' },
      { questionId: 'income_share', optionId: 'c' },
      { questionId: 'liquidity_needs', optionId: 'b' },
    ],
  };
}
