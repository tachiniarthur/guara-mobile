import { useSimulationsStore } from '../store';

/** `error`: the list could not be loaded (comes with the API). */
export type SavedSimulationsStatus = 'ready' | 'error';

/** Saved simulations. Static data today; a TanStack query when the API exists (same shape). */
export function useSavedSimulations() {
  const saved = useSimulationsStore((state) => state.saved);
  // Widened on purpose: the API also answers with `error`.
  const status = 'ready' as SavedSimulationsStatus;
  return {
    status,
    saved,
    /** Reloads the list (the API's refetch; nothing to do with static data). */
    refetch: () => undefined,
  };
}
