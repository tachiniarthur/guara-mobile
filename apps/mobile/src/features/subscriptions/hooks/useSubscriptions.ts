// Straight to the file: Gastos reads the subscriptions back.
import { SPENDING_TODAY } from '@/features/spending/data';

import { monthlyTotal, nextCharge } from '../lib/subscriptions';
import { useSubscriptionsStore } from '../store';

/** Detected subscriptions, next charge first. Static data today; the API later. */
export function useSubscriptions() {
  const items = useSubscriptionsStore((state) => state.items);
  const today = SPENDING_TODAY;
  const sorted = [...items].sort((a, b) =>
    nextCharge(a, today).localeCompare(nextCharge(b, today)),
  );
  return { items: sorted, today, total: monthlyTotal(items) };
}
