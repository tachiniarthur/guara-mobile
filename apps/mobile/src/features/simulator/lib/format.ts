import { cents, formatCents, MINUS_SIGN } from '@guara/utils';

/** Reais → "R$ 5.640" (no cents). */
export const reais = (value: number) =>
  formatCents(cents(Math.round(value) * 100), { wholeUnits: true, typographicMinus: true });

/** Reais with cents → "R$ 2.287,53". */
export const reaisWithCents = (value: number) => formatCents(cents(Math.round(value * 100)));

const decimal = (value: number, digits: number) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** "R$ 1,74 mi", "R$ 3,0 mi", "R$ 1 mi" (digits = 0). */
export const millions = (value: number, digits = 2) =>
  `R$ ${decimal(value / 1_000_000, digits)} mi`;

/** "R$ 46 mil". */
export const thousands = (value: number) => `R$ ${decimal(value / 1000, 0)} mil`;

/** Large amounts in the shortest form: "R$ 500 mil", "R$ 1,29 mi". */
export const compact = (value: number, digits = 2) =>
  value >= 1_000_000 ? millions(value, digits) : thousands(value);

/** "R$ 3,0 milhões", "R$ 1,5 milhão", "R$ 800 mil". */
export function longAmount(value: number): string {
  if (value < 1_000_000) return thousands(value);
  const amount = millions(value, 1).replace(' mi', '');
  return `${amount} ${value < 2_000_000 ? 'milhão' : 'milhões'}`;
}

/** "−R$ 1.490" (or "+R$ 1.490"). */
export const signedReais = (value: number) =>
  `${value < 0 ? MINUS_SIGN : '+'}${reais(Math.abs(value))}`;

/** "4,0% a.a." */
export const yearlyPercent = (value: number) => `${decimal(value, 1)}% a.a.`;

/** 10 → "10" months; 0 → "hoje". */
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Month `offset` months after `start` ({ year, month 0–11 }) → "abr/28". */
export function shortMonth(start: { year: number; month: number }, offset: number): string {
  const index = start.month + offset;
  const year = start.year + Math.floor(index / 12);
  return `${MONTHS[((index % 12) + 12) % 12]}/${String(year).slice(-2)}`;
}

/** → "abril de 2028". */
export function longMonth(start: { year: number; month: number }, offset: number): string {
  const index = start.month + offset;
  const year = start.year + Math.floor(index / 12);
  return `${MONTH_NAMES[((index % 12) + 12) % 12]} de ${year}`;
}
