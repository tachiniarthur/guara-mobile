import type { Cents, DuplicateResolution, IsoDate } from '@guara/types';
import { cents } from '@guara/utils';

/**
 * The same investment reported twice: a position that came through Open Finance and an entry the
 * user typed in. Until the user decides, only the bank's value counts in the portfolio (the manual
 * entry is not among the positions).
 */
export interface PositionDuplicate {
  id: string;
  /** The Open Finance position (in `POSITIONS`). */
  positionId: string;
  bank: string;
  manual: { value: Cents; quantity: string | null; registeredOn: IsoDate };
}

export const POSITION_DUPLICATES: PositionDuplicate[] = [
  {
    id: 'dup-selic',
    positionId: 'selic',
    bank: 'Itaú',
    manual: { value: cents(1_560_000), quantity: null, registeredOn: '2026-03-10' },
  },
];

/** Choices of the screen, in the design's order (the contract's `DuplicateResolution`). */
export type DuplicateChoice = 'delete_manual' | 'keep_separate' | 'sum';

export const CHOICE_RESOLUTION: Record<DuplicateChoice, DuplicateResolution> = {
  delete_manual: 'delete_one',
  keep_separate: 'keep_separate',
  sum: 'sum',
};
