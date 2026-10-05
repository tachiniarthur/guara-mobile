import type {
  InvestorProfileOption,
  InvestorProfileQuestionId,
  InvestorProfileType,
} from '@guara/types';

import { PROFILE_LABELS, PROFILE_QUESTIONS, type ProfileAnswers } from '../data';

type Score = Record<InvestorProfileOption, number>;

/** Points of each option: from the most careful answer (1) to the boldest (4). */
const DEFAULT_SCORE: Score = { a: 1, b: 2, c: 3, d: 4 };

/**
 * Questions whose options are not in risk order on screen. Objetivo: "Renda extra todo mês"
 * is less bold than "Crescer no longo prazo".
 */
const SCORES: Partial<Record<InvestorProfileQuestionId, Score>> = {
  objective: { a: 1, b: 2, c: 4, d: 3 },
};

/** Profile bands of the total (6 to 24 points), from the lowest. */
export const PROFILE_BANDS: { type: InvestorProfileType; max: number }[] = [
  { type: 'conservative', max: 11 },
  { type: 'moderate', max: 17 },
  { type: 'aggressive', max: 21 },
  { type: 'sophisticated', max: 24 },
];

export function profileScore(answers: ProfileAnswers): number {
  return PROFILE_QUESTIONS.reduce((sum, question) => {
    const option = answers[question.id];
    return option ? sum + (SCORES[question.id] ?? DEFAULT_SCORE)[option] : sum;
  }, 0);
}

/**
 * Profile from the answers, as an estimate shown right after the questionnaire (the official
 * classification comes from the API, `investorProfile.submit`). Sum of the points:
 * Conservador up to 11, Moderado 12–17, Arrojado 18–21, Sofisticado 22–24. Sofisticado also
 * needs experience with several kinds of investment (last option of "Experiência"); without
 * it the profile stops at Arrojado.
 */
export function estimateProfile(answers: ProfileAnswers): InvestorProfileType {
  const total = profileScore(answers);
  const type = PROFILE_BANDS.find((band) => total <= band.max)?.type ?? 'sophisticated';
  if (type === 'sophisticated' && answers.experience !== 'd') return 'aggressive';
  return type;
}

export function answeredCount(answers: ProfileAnswers): number {
  return PROFILE_QUESTIONS.filter((question) => answers[question.id]).length;
}

function short(answers: ProfileAnswers, id: (typeof PROFILE_QUESTIONS)[number]['id']) {
  const question = PROFILE_QUESTIONS.find((item) => item.id === id);
  return question?.options.find((option) => option.id === answers[id])?.short ?? null;
}

const SUMMARY: Record<InvestorProfileType, { lead: string; portfolio: string }> = {
  conservative: {
    lead: 'Você prefere proteger o dinheiro e aceita ganhar menos para evitar oscilações.',
    portfolio: 'uma carteira mais protegida',
  },
  moderate: {
    lead: 'Você aceita alguma oscilação para ganhar mais que a renda fixa, mas quer a maior parte do dinheiro protegida.',
    portfolio: 'uma carteira equilibrada',
  },
  aggressive: {
    lead: 'Você aceita oscilações maiores em busca de mais retorno no longo prazo.',
    portfolio: 'uma carteira mais arrojada',
  },
  sophisticated: {
    lead: 'Você conhece bem o mercado e aceita oscilações fortes, inclusive em investimentos mais complexos, em busca de mais retorno.',
    portfolio: 'uma carteira sofisticada',
  },
};

const LIQUIDITY: Record<string, string> = {
  a: 'a chance de precisar resgatar quase tudo',
  b: 'a chance de resgatar mais da metade',
  c: 'a parte pequena que talvez precise resgatar',
  d: 'a reserva separada que você já tem',
};

/** "Você aceita alguma oscilação… Seu prazo de 3 a 10 anos e a parte pequena… combinam com…". */
export function profileDescription(type: InvestorProfileType, answers: ProfileAnswers): string {
  const { lead, portfolio } = SUMMARY[type];
  const horizon = short(answers, 'horizon')?.toLocaleLowerCase('pt-BR');
  const liquidity = answers.liquidity_needs ? LIQUIDITY[answers.liquidity_needs] : null;
  if (!horizon || !liquidity) return lead;
  return `${lead} Seu prazo de ${horizon} e ${liquidity} combinam com ${portfolio}.`;
}

/** "Suas respostas": label and short answer of each question. */
export function answersSummary(answers: ProfileAnswers) {
  return PROFILE_QUESTIONS.map((question) => ({
    label: question.summary,
    value: short(answers, question.id) ?? '—',
  }));
}

export interface AllocationClass {
  key: string;
  label: string;
  color: string;
  /** Share of the portfolio today, in percent. */
  current: number;
}

export interface AllocationRow extends AllocationClass {
  target: number;
  /** current − target, in percentage points. */
  difference: number;
}

/** Gaps of 4 p.p. or more are highlighted (below in Arara-azul, above in Urucum). */
export const NOTABLE_GAP = 4;

/** Target × portfolio of each class, plus the note about the biggest difference. */
export function compareAllocation(
  classes: readonly AllocationClass[],
  targets: Readonly<Record<string, number>>,
) {
  const rows: AllocationRow[] = classes.map((item) => ({
    ...item,
    target: targets[item.key] ?? 0,
    difference: item.current - (targets[item.key] ?? 0),
  }));
  const scale = Math.max(1, ...rows.flatMap((row) => [row.target, row.current]));
  const biggest = [...rows].sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))[0];
  const close = !biggest || Math.abs(biggest.difference) <= 5;
  return {
    rows,
    /** Bars are drawn relative to the biggest share (it fills the track). */
    scale,
    biggest:
      biggest && Math.abs(biggest.difference) > ON_TARGET
        ? {
            label: biggest.label,
            points: Math.abs(biggest.difference),
            direction: biggest.difference > 0 ? ('acima' as const) : ('abaixo' as const),
          }
        : null,
    close,
  };
}

/** Up to 1 p.p. away counts as on target (design: FIIs 14% × 15% "no alvo"). */
export const ON_TARGET = 1;

export function differenceText(difference: number): string {
  if (Math.abs(difference) <= ON_TARGET) return 'no alvo';
  return `${difference > 0 ? '+' : '−'}${Math.abs(difference)} p.p.`;
}

export function profileLabel(type: InvestorProfileType): string {
  return PROFILE_LABELS[type];
}
