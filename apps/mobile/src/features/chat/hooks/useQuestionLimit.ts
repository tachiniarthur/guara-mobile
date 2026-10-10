import { usePlan, useSubscriptionStore } from '@/stores';

/**
 * Monthly questions of the plan. The count restarts on the renewal day ("Elas voltam no dia 10").
 */
export function useQuestionLimit() {
  const plan = usePlan();
  const used = useSubscriptionStore((state) => state.questionsUsed);
  const renewsOn = useSubscriptionStore((state) => state.renewsOn);
  return {
    used,
    limit: plan.questions,
    planName: plan.name,
    reached: used >= plan.questions,
    /** Day of the month the questions come back. */
    resetDay: Number(renewsOn.slice(8, 10)),
  };
}
