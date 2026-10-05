/** Banks offered on the Open Finance step (static until the API exists). */
export interface BankOptionData {
  id: string;
  name: string;
  /** Letters on the logo tile. */
  mark: string;
}

export const ONBOARDING_BANKS: BankOptionData[] = [
  { id: 'nubank', name: 'Nubank', mark: 'N' },
  { id: 'itau', name: 'Itaú', mark: 'I' },
  { id: 'bradesco', name: 'Bradesco', mark: 'B' },
  { id: 'bb', name: 'Banco do Brasil', mark: 'BB' },
  { id: 'caixa', name: 'Caixa', mark: 'C' },
  { id: 'inter', name: 'Inter', mark: 'In' },
  { id: 'c6', name: 'C6 Bank', mark: 'C6' },
  { id: 'santander', name: 'Santander', mark: 'S' },
];

/** Connections allowed by the plan. */
export const PLAN_BANK_LIMIT = 3;

export const ACCESS_ITEMS = [
  { allowed: true, label: 'Vemos: Saldos e extratos' },
  { allowed: true, label: 'Vemos: Cartões e faturas' },
  { allowed: true, label: 'Vemos: Investimentos' },
  { allowed: false, label: 'Nunca: Sua senha do banco' },
  { allowed: false, label: 'Nunca: Fazer pagamentos ou Pix' },
] as const;

export const RISK_QUESTION = {
  index: 3,
  total: 6,
  title: 'Se seus investimentos caíssem 15% em um mês, o que você faria?',
  options: [
    { value: 'sell_all', label: 'Venderia tudo para não perder mais' },
    { value: 'sell_part', label: 'Venderia uma parte' },
    { value: 'hold', label: 'Manteria e esperaria recuperar' },
    { value: 'buy_more', label: 'Aproveitaria para investir mais' },
  ],
} as const;

export type RiskAnswer = (typeof RISK_QUESTION.options)[number]['value'];
