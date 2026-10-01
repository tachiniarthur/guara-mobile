import type { ISODateTime } from './common';

export type InvestorProfileType = 'conservative' | 'moderate' | 'aggressive';

export interface InvestorProfileAnswer {
  questionId: string;
  optionId: string;
}

export interface InvestorProfile {
  type: InvestorProfileType;
  answers: InvestorProfileAnswer[];
  answeredAt: ISODateTime;
}
