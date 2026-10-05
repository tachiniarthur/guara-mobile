import { todayISODate } from '@guara/utils';
import { create } from 'zustand';

import { SAVED_SIMULATIONS, type SavedSimulation, type SavedSimulationInput } from './data';

interface SimulationsState {
  saved: SavedSimulation[];
  /** Last deleted simulation and its position, for "Desfazer". */
  removed: { simulation: SavedSimulation; index: number } | null;
  /** Saves the premises as a new simulation (newest first) and returns its id. */
  save: (name: string, input: SavedSimulationInput) => string;
  remove: (id: string) => void;
  undoRemove: () => void;
  reset: () => void;
}

/**
 * Saved simulations. Local until the API exists; then `save`/`remove` become mutations and
 * `undoRemove` a re-create.
 */
export const useSimulationsStore = create<SimulationsState>()((set) => ({
  saved: SAVED_SIMULATIONS,
  removed: null,
  save: (name, input) => {
    const id = `sim-${Date.now()}`;
    set(({ saved }) => ({
      saved: [{ id, name, savedOn: todayISODate(), goalId: null, input }, ...saved],
    }));
    return id;
  },
  remove: (id) =>
    set(({ saved }) => {
      const index = saved.findIndex((simulation) => simulation.id === id);
      if (index < 0) return {};
      return {
        saved: saved.filter((simulation) => simulation.id !== id),
        removed: { simulation: saved[index]!, index },
      };
    }),
  undoRemove: () =>
    set(({ saved, removed }) => {
      if (!removed) return {};
      const next = [...saved];
      next.splice(removed.index, 0, removed.simulation);
      return { saved: next, removed: null };
    }),
  reset: () => set({ saved: SAVED_SIMULATIONS, removed: null }),
}));
