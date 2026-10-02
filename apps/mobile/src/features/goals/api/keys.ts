import { QUERY_ROOTS } from '@/constants/query-keys';

export const goalKeys = {
  all: [QUERY_ROOTS.goals] as const,
  list: () => [...goalKeys.all, 'list'] as const,
  detail: (goalId: string) => [...goalKeys.all, 'detail', goalId] as const,
};
