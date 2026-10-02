import { z } from 'zod';

import { IsoDateTimeSchema } from './common';

export const InvestorProfileTypeSchema = z.enum(['conservative', 'moderate', 'aggressive']);
export type InvestorProfileType = z.infer<typeof InvestorProfileTypeSchema>;

/** The six questions of the suitability questionnaire (texts live in the app). */
export const INVESTOR_PROFILE_QUESTIONS = [
  'objective',
  'horizon',
  'experience',
  'loss_tolerance',
  'income_share',
  'liquidity_needs',
] as const;

export const InvestorProfileQuestionIdSchema = z.enum(INVESTOR_PROFILE_QUESTIONS);
export type InvestorProfileQuestionId = z.infer<typeof InvestorProfileQuestionIdSchema>;

/** Options go from the most conservative (`a`) to the most aggressive (`d`). */
export const InvestorProfileOptionSchema = z.enum(['a', 'b', 'c', 'd']);
export type InvestorProfileOption = z.infer<typeof InvestorProfileOptionSchema>;

export const InvestorProfileAnswerSchema = z.object({
  questionId: InvestorProfileQuestionIdSchema,
  optionId: InvestorProfileOptionSchema,
});
export type InvestorProfileAnswer = z.infer<typeof InvestorProfileAnswerSchema>;

/** Exactly one answer per question. */
export const InvestorProfileAnswersSchema = z
  .array(InvestorProfileAnswerSchema)
  .length(INVESTOR_PROFILE_QUESTIONS.length)
  .refine(
    (answers) => new Set(answers.map((answer) => answer.questionId)).size === answers.length,
    {
      message: 'Each question must be answered once',
    },
  );

export const InvestorProfileSchema = z.object({
  type: InvestorProfileTypeSchema,
  answers: InvestorProfileAnswersSchema,
  answeredAt: IsoDateTimeSchema,
});
export type InvestorProfile = z.infer<typeof InvestorProfileSchema>;

export const SubmitInvestorProfileBodySchema = z.object({ answers: InvestorProfileAnswersSchema });
export type SubmitInvestorProfileBody = z.infer<typeof SubmitInvestorProfileBodySchema>;
