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
