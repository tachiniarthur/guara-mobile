import type {
  InvestorProfileOption,
  InvestorProfileQuestionId,
  InvestorProfileType,
  IsoDate,
} from '@guara/types';

/** One option of a question; `id` goes from the most conservative (`a`) to the boldest (`d`). */
export interface ProfileOption {
  id: InvestorProfileOption;
  label: string;
  /** Short form for "Suas respostas" ("3 a 10 anos"). */
  short: string;
}

export interface ProfileQuestion {
  id: InvestorProfileQuestionId;
  title: string;
  /** Label in "Suas respostas" ("Queda de 15%"). */
  summary: string;
  /** "Por que perguntamos isso?" */
  why: string;
  options: readonly ProfileOption[];
}

/** The six questions in the order of the design (the contract ids are order-free). */
export const PROFILE_QUESTIONS: readonly ProfileQuestion[] = [
  {
    id: 'objective',
    title: 'Qual é o seu principal objetivo ao investir?',
    summary: 'Objetivo',
    why: 'O objetivo define quanto risco faz sentido. Quem quer proteger o dinheiro precisa de mais renda fixa; quem pensa em décadas pode aceitar mais oscilação.',
    options: [
      { id: 'a', label: 'Proteger o que já tenho', short: 'Proteger o que já tem' },
      {
        id: 'b',
        label: 'Juntar para um objetivo nos próximos anos',
        short: 'Juntar para um objetivo',
      },
      {
        id: 'c',
        label: 'Fazer o patrimônio crescer no longo prazo',
        short: 'Crescer no longo prazo',
      },
      { id: 'd', label: 'Ter uma renda extra todo mês', short: 'Renda extra todo mês' },
    ],
  },
  {
    id: 'horizon',
    title: 'Por quanto tempo você pretende deixar o dinheiro investido?',
    summary: 'Prazo',
    why: 'Quanto mais longo o prazo, mais tempo o investimento tem para se recuperar de quedas. Prazos curtos pedem aplicações que não oscilam.',
    options: [
      { id: 'a', label: 'Menos de 1 ano', short: 'Menos de 1 ano' },
      { id: 'b', label: 'De 1 a 3 anos', short: '1 a 3 anos' },
      { id: 'c', label: 'De 3 a 10 anos', short: '3 a 10 anos' },
      { id: 'd', label: 'Mais de 10 anos', short: 'Mais de 10 anos' },
    ],
  },
  {
    id: 'loss_tolerance',
    title: 'Se seus investimentos caíssem 15% em um mês, o que você faria?',
    summary: 'Queda de 15%',
    why: 'Seu perfil ajuda a montar simulações que combinam com você. Ele vale só para Investimentos e pode ser refeito quando quiser em Meu perfil.',
    options: [
      { id: 'a', label: 'Venderia tudo para não perder mais', short: 'Venderia tudo' },
      { id: 'b', label: 'Venderia uma parte', short: 'Venderia uma parte' },
      { id: 'c', label: 'Manteria e esperaria recuperar', short: 'Manteria e esperaria' },
      { id: 'd', label: 'Aproveitaria para investir mais', short: 'Investiria mais' },
    ],
  },
  {
    id: 'experience',
    title: 'Quanto você conhece de investimentos?',
    summary: 'Experiência',
    why: 'Ajuda a explicar as coisas no nível certo e a não sugerir produtos que você ainda não conhece. Quem já investe em estruturados e alternativos pode ter o perfil Sofisticado.',
    options: [
      { id: 'a', label: 'Nunca investi', short: 'Nunca investiu' },
      {
        id: 'b',
        label: 'Conheço poupança e renda fixa (CDB, Tesouro)',
        short: 'Poupança e renda fixa',
      },
      {
        id: 'c',
        label: 'Invisto em renda fixa e fundos, e um pouco em ações',
        short: 'Renda fixa, fundos e um pouco de ações',
      },
      {
        id: 'd',
        label: 'Invisto há anos em vários tipos, inclusive exterior, cripto e estruturados',
        short: 'Vários tipos, inclusive exterior, cripto e estruturados',
      },
    ],
  },
  {
    id: 'income_share',
    title: 'Quanto da sua renda mensal você consegue investir?',
    summary: 'Parte da renda',
    why: 'Quem investe uma parte maior da renda tem mais folga para enfrentar oscilações. Usamos isso só para calibrar o perfil, não para julgar seus gastos.',
    options: [
      { id: 'a', label: 'Nada por enquanto', short: 'Nada por enquanto' },
      { id: 'b', label: 'Até 10%', short: 'Até 10%' },
      { id: 'c', label: 'De 10% a 25%', short: '10% a 25%' },
      { id: 'd', label: 'Mais de 25%', short: 'Mais de 25%' },
    ],
  },
  {
    id: 'liquidity_needs',
    title:
      'Se precisar de dinheiro de repente, quanto do que investiu você talvez tenha que resgatar?',
    summary: 'Resgate de surpresa',
    why: 'Dinheiro que pode ser resgatado a qualquer momento precisa ficar em aplicações com liquidez diária. Isso muda a divisão da carteira.',
    options: [
      { id: 'a', label: 'Quase tudo', short: 'Quase tudo' },
      { id: 'b', label: 'Mais da metade', short: 'Mais da metade' },
      { id: 'c', label: 'Uma parte pequena', short: 'Uma parte pequena' },
      { id: 'd', label: 'Nada, tenho uma reserva separada', short: 'Nada, tem reserva separada' },
    ],
  },
];

export type ProfileAnswers = Partial<Record<InvestorProfileQuestionId, InvestorProfileOption>>;

export const PROFILE_LABELS: Record<InvestorProfileType, string> = {
  conservative: 'Conservador',
  moderate: 'Moderado',
  aggressive: 'Arrojado',
  sophisticated: 'Sofisticado',
};

/** Profile of the user in the design (Meu perfil: "Respondido em 23 set 2026"). */
export const SAVED_PROFILE: {
  type: InvestorProfileType;
  answers: Required<ProfileAnswers>;
  answeredOn: IsoDate;
} = {
  type: 'moderate',
  answers: {
    objective: 'b',
    horizon: 'c',
    loss_tolerance: 'c',
    experience: 'c',
    income_share: 'c',
    liquidity_needs: 'c',
  },
  answeredOn: '2026-09-23',
};
