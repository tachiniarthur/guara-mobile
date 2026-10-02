import type { YearMonth } from '@guara/types';

import { QUERY_ROOTS } from '@/constants/query-keys';

export const subscriptionKeys = {
  all: [QUERY_ROOTS.subscriptions] as const,
  list: () => [...subscriptionKeys.all, 'list'] as const,
  detail: (subscriptionId: string) => [...subscriptionKeys.all, 'detail', subscriptionId] as const,
  calendar: (month?: YearMonth) =>
    [...subscriptionKeys.all, 'calendar', month ?? 'current'] as const,
};
