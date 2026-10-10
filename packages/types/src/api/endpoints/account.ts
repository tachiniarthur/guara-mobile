import { z } from 'zod';

import {
  AccountPlanSchema,
  InvestorProfileSchema,
  NotificationPreferencesSchema,
  SubmitInvestorProfileBodySchema,
  UpdateProfileBodySchema,
  UserSchema,
} from '../../domain';
import { NoContentSchema, defineEndpoints } from '../define';

/** Profile, plan, notification channels, investor profile and LGPD requests of the user. */
export const accountEndpoints = defineEndpoints({
  'me.get': { method: 'GET', path: '/v1/me', summary: 'Current user', response: UserSchema },
  'me.update': {
    method: 'PATCH',
    path: '/v1/me',
    summary: 'Update profile',
    body: UpdateProfileBodySchema,
    response: UserSchema,
  },
  'me.plan': {
    method: 'GET',
    path: '/v1/me/plan',
    summary: 'Plan and usage',
    response: AccountPlanSchema,
  },
  'me.notificationPreferences': {
    method: 'GET',
    path: '/v1/me/notification-preferences',
    summary: 'Notification channels per type',
    response: NotificationPreferencesSchema,
  },
  'me.updateNotificationPreferences': {
    method: 'PUT',
    path: '/v1/me/notification-preferences',
    summary: 'Replace notification channels',
    body: NotificationPreferencesSchema,
    response: NotificationPreferencesSchema,
  },
  'me.exportData': {
    method: 'POST',
    path: '/v1/me/data-export',
    summary: 'LGPD: e-mail a copy of all the user data',
    response: z.object({ email: z.email() }),
  },
  'me.delete': {
    method: 'DELETE',
    path: '/v1/me',
    summary:
      'Delete the account (LGPD): revokes the bank consents, cancels the plan and erases the data within 30 days',
    response: NoContentSchema,
  },
  'investorProfile.get': {
    method: 'GET',
    path: '/v1/me/investor-profile',
    summary: 'Investor profile (null until the questionnaire is answered)',
    response: InvestorProfileSchema.nullable(),
  },
  'investorProfile.submit': {
    method: 'PUT',
    path: '/v1/me/investor-profile',
    summary: 'Answer the questionnaire; the API computes the profile',
    body: SubmitInvestorProfileBodySchema,
    response: InvestorProfileSchema,
  },
});
