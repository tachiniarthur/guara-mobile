import type { IsoDate, YearMonth } from '@guara/types';
import { create } from 'zustand';

import { planById, type Plan, type PlanId } from '@/constants/plans';

export type Billing = 'monthly' | 'yearly';

interface SubscriptionState {
  planId: PlanId;
  billing: Billing;
  /** End of the paid period ("renova em 10/10/2026"). */
  renewsOn: IsoDate;
  /** Questions to the assistants in the month of `usageMonth`. */
  questionsUsed: number;
  usageMonth: YearMonth;
  /**
   * Change that happens on `renewsOn` (a downgrade or a cancellation): the current plan is
   * worth until the end of the paid period. `keepBankId` stays connected when the new plan
   * allows fewer banks; the others pause.
   */
  scheduled: { planId: PlanId; keepBankId: string | null } | null;
  /** Upgrades and billing changes happen now (paying the prorated difference). */
  setPlan: (planId: PlanId, billing: Billing) => void;
  schedule: (planId: PlanId, keepBankId: string | null) => void;
  /** Keeps the current plan (undoes a scheduled change or cancellation). */
  keepPlan: () => void;
  /** One more question to the assistants this month. */
  countQuestion: () => void;
  reset: () => void;
}

const INITIAL: Pick<
  SubscriptionState,
  'planId' | 'billing' | 'renewsOn' | 'questionsUsed' | 'usageMonth' | 'scheduled'
> = {
  planId: 'complete',
  billing: 'monthly',
  renewsOn: '2026-10-10',
  questionsUsed: 112,
  usageMonth: '2026-09',
  scheduled: null,
};

/**
 * Plan of the user (Planos, Meu perfil, bank limits). Local until the API exists; then it comes
 * from `subscription.get` and the actions become mutations (the store handles the payment).
 */
export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  ...INITIAL,
  setPlan: (planId, billing) => set({ planId, billing, scheduled: null }),
  schedule: (planId, keepBankId) => set({ scheduled: { planId, keepBankId } }),
  keepPlan: () => set({ scheduled: null }),
  countQuestion: () => set(({ questionsUsed }) => ({ questionsUsed: questionsUsed + 1 })),
  reset: () => set(INITIAL),
}));

/** The current plan (limits and name). */
export function usePlan(): Plan {
  return planById(useSubscriptionStore((state) => state.planId));
}
