import { POSITIONS } from '../data';
import { POSITION_DUPLICATES } from '../duplicate-data';
import { useInvestmentsStore } from '../store';

/** Duplicates still waiting for a decision, with the Open Finance position they repeat. */
export function usePositionDuplicates() {
  const resolved = useInvestmentsStore((state) => state.resolvedDuplicates);
  const pending = POSITION_DUPLICATES.filter((duplicate) => !(duplicate.id in resolved));
  return {
    pending,
    find: (id: string | undefined) => {
      const duplicate = POSITION_DUPLICATES.find((item) => item.id === id);
      const position = POSITIONS.find((item) => item.id === duplicate?.positionId);
      return duplicate && position ? { duplicate, position } : null;
    },
  };
}
