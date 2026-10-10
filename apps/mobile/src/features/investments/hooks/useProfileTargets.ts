import { classTargets } from '@/constants/target-allocations';
// Straight to the files: the investor-profile index imports Investimentos back.
import { PROFILE_LABELS } from '@/features/investor-profile/data';
import { useInvestorProfileStore } from '@/features/investor-profile/store';

/** The user's investor profile and its target share of each class of Investimentos. */
export function useProfileTargets() {
  const type = useInvestorProfileStore((state) => state.profile.type);
  return { type, label: PROFILE_LABELS[type], targets: classTargets(type) };
}
