import type { InvestorProfileOption } from '@guara/types';
import { useState } from 'react';

import { PROFILE_QUESTIONS, type ProfileAnswers } from '../data';
import { estimateProfile } from '../lib/profile';

/** Step through the six questions; step 6 is the result. */
export function useQuestionnaire(initial: ProfileAnswers = {}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswers>(initial);
  const total = PROFILE_QUESTIONS.length;
  const question = step < total ? PROFILE_QUESTIONS[step]! : null;

  return {
    step,
    total,
    question,
    answers,
    /** Answer of the current question. */
    answer: question ? (answers[question.id] ?? null) : null,
    isResult: step >= total,
    complete: PROFILE_QUESTIONS.every((item) => answers[item.id]),
    type: estimateProfile(answers),
    select: (option: InvestorProfileOption) => {
      if (question) setAnswers({ ...answers, [question.id]: option });
    },
    next: () => setStep(Math.min(total, step + 1)),
    /** `false` on the first question (the screen leaves). */
    back: () => {
      if (step === 0) return false;
      setStep(step - 1);
      return true;
    },
    restart: () => setStep(0),
  };
}
