import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';
import { STALE_TIME } from '@/lib/query-client';

import { accountKeys } from './keys';

export function useMe() {
  return useQuery({
    queryKey: accountKeys.me,
    queryFn: ({ signal }) => apiRequest('me.get', { signal }),
    staleTime: STALE_TIME.profile,
  });
}

/** Plan limits and usage (bank connections, AI messages). */
export function usePlan() {
  return useQuery({
    queryKey: accountKeys.plan,
    queryFn: ({ signal }) => apiRequest('me.plan', { signal }),
    staleTime: STALE_TIME.profile,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: accountKeys.notificationPreferences,
    queryFn: ({ signal }) => apiRequest('me.notificationPreferences', { signal }),
    staleTime: STALE_TIME.profile,
  });
}

/** `data === null` until the questionnaire is answered. */
export function useInvestorProfile() {
  return useQuery({
    queryKey: accountKeys.investorProfile,
    queryFn: ({ signal }) => apiRequest('investorProfile.get', { signal }),
    staleTime: STALE_TIME.profile,
  });
}
