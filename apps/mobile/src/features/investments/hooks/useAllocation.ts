import type { InvestorProfileType } from '@guara/types';

// Straight to the files: the investor-profile index imports Investimentos back.
import { PROFILE_LABELS } from '@/features/investor-profile/data';
import { useInvestorProfileStore } from '@/features/investor-profile/store';

import { allocationByGroup, biggestGap, outOfTarget } from '../lib/allocation';

import { usePositions } from './usePositions';

/**
 * The portfolio in the 5 groups against the target of a profile (the user's saved profile by
 * default).
 */
export function useAllocation(profileType?: InvestorProfileType) {
  const saved = useInvestorProfileStore((state) => state.profile);
  const { positions } = usePositions();
  const type = profileType ?? saved.type;
  const { total, groups } = allocationByGroup(positions, type);
  return {
    type,
    label: PROFILE_LABELS[type],
    /** When the questionnaire defined the saved profile. */
    answeredOn: saved.answeredOn,
    savedType: saved.type,
    total,
    groups,
    out: outOfTarget(groups),
    biggest: biggestGap(groups),
    positionsCount: positions.length,
  };
}
