import { create } from 'zustand';

import { SUBSCRIPTIONS, type SubscriptionItem } from './data';

interface SubscriptionsState {
  items: SubscriptionItem[];
  /** "Não é assinatura": back to an ordinary expense. */
  dismiss: (id: string) => void;
  reset: () => void;
}

/** Detected subscriptions with what the user removed. Local until the API exists. */
export const useSubscriptionsStore = create<SubscriptionsState>()((set) => ({
  items: SUBSCRIPTIONS,
  dismiss: (id) => set(({ items }) => ({ items: items.filter((item) => item.id !== id) })),
  reset: () => set({ items: SUBSCRIPTIONS }),
}));
