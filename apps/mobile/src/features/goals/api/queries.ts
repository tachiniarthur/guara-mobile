import { useQuery } from '@tanstack/react-query';

import { apiRequest } from '@/lib/api';

import { goalKeys } from './keys';

export function useGoals() {
  return useQuery({
    queryKey: goalKeys.list(),
    queryFn: ({ signal }) => apiRequest('goals.list', { signal }),
  });
}

export function useGoal(goalId: string) {
  return useQuery({
    queryKey: goalKeys.detail(goalId),
    queryFn: ({ signal }) => apiRequest('goals.get', { params: { goalId }, signal }),
  });
}
