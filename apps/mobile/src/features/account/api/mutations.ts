import type { ApiBody } from '@guara/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_ROOTS } from '@/constants/query-keys';
import { apiRequest } from '@/lib/api';
import { invalidateRoots } from '@/lib/query-client';

import { accountKeys } from './keys';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'me.update'>) => apiRequest('me.update', { body }),
    onSuccess: (user) => queryClient.setQueryData(accountKeys.me, user),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'me.updateNotificationPreferences'>) =>
      apiRequest('me.updateNotificationPreferences', { body }),
    onSuccess: (preferences) =>
      queryClient.setQueryData(accountKeys.notificationPreferences, preferences),
  });
}

/** Answers the questionnaire; the target allocation depends on the resulting profile. */
export function useSubmitInvestorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApiBody<'investorProfile.submit'>) =>
      apiRequest('investorProfile.submit', { body }),
    onSuccess: (profile) => {
      queryClient.setQueryData(accountKeys.investorProfile, profile);
      return invalidateRoots(queryClient, [QUERY_ROOTS.allocation]);
    },
  });
}
