import { QUERY_ROOTS } from '@/constants/query-keys';

export const bankConnectionKeys = {
  all: [QUERY_ROOTS.bankConnections] as const,
  list: () => [...bankConnectionKeys.all, 'list'] as const,
  detail: (connectionId: string) => [...bankConnectionKeys.all, 'detail', connectionId] as const,
  accounts: [QUERY_ROOTS.accounts] as const,
};
