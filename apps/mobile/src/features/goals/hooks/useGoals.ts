import { useGoalsStore } from '../store';

/** `error`: the goals could not be loaded (the API's error state). */
export type GoalsStatus = 'ready' | 'error';

/** Goals of the user. Static data plus local edits today; a TanStack query with the API. */
export function useGoals() {
  const goals = useGoalsStore((state) => state.goals);
  const status = 'ready' as GoalsStatus;
  return {
    status,
    goals: goals.filter((goal) => goal.status !== 'archived'),
    /** Reloads the list (nothing to do with static data). */
    refetch: () => undefined,
  };
}
