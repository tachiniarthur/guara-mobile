import type { InvestorProfileType, IsoDate } from '@guara/types';
import { todayISODate } from '@guara/utils';
import { create } from 'zustand';

import { SAVED_PROFILE, type ProfileAnswers } from './data';

export interface SavedProfile {
  type: InvestorProfileType;
  answers: Required<ProfileAnswers>;
  answeredOn: IsoDate;
}

interface InvestorProfileState {
  profile: SavedProfile;
  /** Saves a full questionnaire (the API's `investorProfile.submit`). */
  save: (type: InvestorProfileType, answers: Required<ProfileAnswers>) => void;
  reset: () => void;
}

export const useInvestorProfileStore = create<InvestorProfileState>()((set) => ({
  profile: SAVED_PROFILE,
  save: (type, answers) => set({ profile: { type, answers, answeredOn: todayISODate() } }),
  reset: () => set({ profile: SAVED_PROFILE }),
}));
