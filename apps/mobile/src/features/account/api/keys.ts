import { QUERY_ROOTS } from '@/constants/query-keys';

export const accountKeys = {
  me: [QUERY_ROOTS.me] as const,
  plan: [QUERY_ROOTS.plan] as const,
  notificationPreferences: [QUERY_ROOTS.notificationPreferences] as const,
  investorProfile: [QUERY_ROOTS.investorProfile] as const,
};
