/** Inputs of the simulator as shown in the design (static until the API exists). */

/** The simulations start in October 2026 (first deposit on the 5th, with the salary). */
export const START = { year: 2026, month: 9 } as const;

export const HOUSEHOLD = {
  /** Entradas de setembro. */
  income: 8200,
  /** Entradas menos saídas, média do mês. */
  surplus: 2287.53,
  profile: 'Moderado',
  /** Carteira de investimentos ("Já investido"). */
  invested: 48310.9,
  /** Imóveis cadastrados (entram só se marcados). */
  properties: 698500,
} as const;

export const RETIREMENT_DEFAULTS = {
  years: 25,
  income: 10000,
  rate: 4,
  withdrawal: 4,
} as const;

export const RETIREMENT_PROFILES = [
  { key: 'conservative', label: 'Conservador', rate: 3 },
  { key: 'moderate', label: 'Moderado', rate: 4 },
  { key: 'bold', label: 'Arrojado', rate: 5 },
] as const;

/** Wealth steps of "Marcos do caminho" (only those below the goal are shown). */
export const RETIREMENT_MILESTONES = [
  { value: 500_000, caption: 'primeiro meio milhão' },
  { value: 1_000_000, caption: 'primeiro milhão' },
  { value: 2_000_000, caption: 'metade do caminho em valor' },
] as const;

export const RETIREMENT_INCLUDES = [
  { key: 'pension', label: 'Previdência privada' },
  { key: 'inss', label: 'INSS estimado' },
  { key: 'properties', label: 'Imóveis' },
] as const;

export const GOAL_DEFAULTS = {
  name: 'Viagem para o Japão',
  cost: 30000,
  months: 18,
  saved: 4000,
  place: 'cdb',
} as const;

/**
 * Where to keep the money, with the net monthly yield. The design gives 0,9% for the CDB 110%
 * CDI; the others follow the CDI (100%).
 */
export const GOAL_PLACES = [
  { key: 'cdb', label: 'CDB 110% CDI', monthlyRate: 0.009 },
  { key: 'selic', label: 'Tesouro Selic', monthlyRate: 0.0082 },
  { key: 'savings-box', label: 'Caixinha do banco', monthlyRate: 0.0082 },
] as const;

/** Monthly deposit of the emergency reserve (Onça), to add up with the trip. */
export const RESERVE = {
  saved: 15892,
  target: 30000,
  monthly: 990,
  place: 'Tesouro Selic',
} as const;

export const CUT_CATEGORIES = [
  { key: 'ride-hailing', label: 'Transporte por app', name: 'transporte por app', average: 390 },
  { key: 'delivery', label: 'Delivery', name: 'delivery', average: null },
  { key: 'subscriptions', label: 'Assinaturas', name: 'assinaturas', average: null },
  { key: 'online-shopping', label: 'Compras online', name: 'compras online', average: null },
] as const;

export const CUT_DEFAULTS = {
  category: 'ride-hailing',
  percent: 80,
  rate: 4,
  destination: 'retirement',
} as const;

export const CUT_DESTINATIONS = [
  { key: 'retirement', label: 'Aposentadoria' },
  { key: 'trip', label: 'Viagem para o Japão' },
  { key: 'reserve', label: 'Reserva' },
] as const;

/** "Outros cortes possíveis" found by the Tamanduá. */
export const OTHER_CUTS = [
  { title: 'Amazon Prime', caption: 'sem compras ligadas nos últimos 60 dias', value: 'R$ 19,90' },
  {
    title: 'Delivery no fim de semana',
    caption: 'sexta e sábado somam 36% dos gastos',
    value: '≈ R$ 260',
  },
  { title: 'Gastos pequenos', caption: '24 compras abaixo de R$ 30 em setembro', value: 'R$ 612' },
] as const;

export const OTHER_CUTS_TOTAL = 'R$ 1.200 por mês';

export const QUESTIONS = {
  retirement: [
    'Como chegar lá sem apertar tanto o mês?',
    'Vale incluir previdência privada?',
    'Qual carteira combina com essa meta?',
  ],
  goal: [
    'Consigo viajar antes de 2028?',
    'Onde é melhor guardar esse dinheiro?',
    'Dá para juntar a reserva e a viagem ao mesmo tempo?',
  ],
  cut: [
    'Quais gastos mais cresceram este ano?',
    'O que acontece se eu passar do teto?',
    'Quanto gasto com delivery por mês?',
  ],
} as const;
