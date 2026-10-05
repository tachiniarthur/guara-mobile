import { useLocalSearchParams } from 'expo-router';

import type { SavedSimulation, SavedSimulationInput, SimulationKind } from '../data';
import { useSimulationsStore } from '../store';

/**
 * The saved simulation opened from "Simulações salvas" (`?saved=<id>`), when it is of this kind.
 * Screens use its premises as the initial values.
 */
export function useSavedPremises<K extends SimulationKind>(
  kind: K,
): { simulation: SavedSimulation; input: Extract<SavedSimulationInput, { kind: K }> } | null {
  const { saved: id } = useLocalSearchParams<{ saved?: string }>();
  const simulation = useSimulationsStore((state) =>
    id ? state.saved.find((item) => item.id === id) : undefined,
  );
  if (!simulation || simulation.input.kind !== kind) return null;
  return {
    simulation,
    input: simulation.input as Extract<SavedSimulationInput, { kind: K }>,
  };
}
