import type { Cents, YearMonth } from '@guara/types';
import {
  cents,
  formatCents,
  formatDate,
  formatPercent,
  normalizeForSearch,
  percentChange,
  sumCents,
} from '@guara/utils';

import {
  FIPE_TABLE,
  REAL_ESTATE_TYPES,
  REVIEW_MONTHS,
  type FipeEntry,
  type Property,
  type RealEstate,
  type Vehicle,
} from '../property-data';

/** "2026-08" + 6 → "2027-02". */
export function addMonths(month: YearMonth, count: number): YearMonth {
  const [year, index] = month.split('-').map(Number) as [number, number];
  const total = year * 12 + (index - 1) + count;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/** "agosto de 2026". */
export const monthText = (month: YearMonth) => formatDate(`${month}-01`, "MMMM 'de' yyyy");

/** "Agosto de 2026". */
export const monthTitle = (month: YearMonth) => {
  const text = monthText(month);
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
};

/** "ago/2026". */
export const shortMonthText = (month: YearMonth) => formatDate(`${month}-01`, 'MMM/yyyy');

/** "R$ 620.000". */
export const wholeReais = (value: Cents) => formatCents(value, { wholeUnits: true });

/** "+3,3%" / "−0,8%". */
export const signedPercent = (value: number) =>
  formatPercent(value, { fractionDigits: 1, signDisplay: 'always', typographicMinus: true });

export function fipeEntry(code: string): FipeEntry | null {
  return FIPE_TABLE.find((entry) => entry.code === code) ?? null;
}

/** "Chevrolet Onix LT 1.0 Turbo". */
export const fipeModel = (entry: FipeEntry) => `${entry.brand} ${entry.model}`;

/** "2022 · Gasolina". */
export const fipeYear = (entry: FipeEntry) => `${entry.year} · ${entry.fuel}`;

/** FIPE entries matching brand, model or year (accents and case ignored). */
export function searchFipe(query: string): FipeEntry[] {
  const needle = normalizeForSearch(query);
  if (!needle) return [];
  const words = needle.split(/\s+/);
  return FIPE_TABLE.filter((entry) => {
    const text = normalizeForSearch(`${fipeModel(entry)} ${entry.year} ${entry.fuel}`);
    return words.every((word) => text.includes(word));
  });
}

/** Latest value informed for a real estate (valuations are newest first). */
export const latestValuation = (property: RealEstate) => property.valuations[0] ?? null;

/** Current value: the latest estimate or the current FIPE table; null when unknown. */
export function propertyValue(property: Property): Cents | null {
  if (property.kind === 'realEstate') return latestValuation(property)?.value ?? null;
  return fipeEntry(property.fipeCode)?.history.at(-1)?.value ?? null;
}

export function propertiesTotal(properties: readonly Property[]): Cents {
  return sumCents(properties.map((property) => propertyValue(property) ?? cents(0)));
}

/** Value minus the debt ("Valor líquido"). */
export function netValue(property: Property): Cents | null {
  const value = propertyValue(property);
  if (value === null) return null;
  return cents(value - (property.financing?.balance ?? 0));
}

/** Share already paid ("Já é seu 65%"), in whole percent. */
export function ownedShare(property: Property): number | null {
  const value = propertyValue(property);
  const net = netValue(property);
  if (value === null || net === null || value === 0) return null;
  return Math.round((net / value) * 100);
}

/** Next value review of a real estate: 6 months after the latest estimate. */
export function nextReview(property: RealEstate): YearMonth | null {
  const latest = latestValuation(property);
  return latest ? addMonths(latest.on, REVIEW_MONTHS) : null;
}

export interface ValuationRow {
  on: YearMonth;
  value: Cents;
  label: string;
  /** Change from the previous estimate; null for the first one. */
  change: number | null;
}

/** "Histórico de valor": newest first, each with the change from the one before. */
export function valuationRows(property: RealEstate): ValuationRow[] {
  return property.valuations.map((valuation, index) => {
    const previous = property.valuations[index + 1];
    return {
      on: valuation.on,
      value: valuation.value,
      label: valuation.kind === 'registration' ? 'Cadastro do imóvel' : 'Estimativa sua',
      change: previous ? percentChange(previous.value, valuation.value) : null,
    };
  });
}

export interface FipeChange {
  amount: Cents;
  percent: number;
}

/** Change of the FIPE value over the last `months` months. */
export function fipeChange(entry: FipeEntry, months: number): FipeChange | null {
  const last = entry.history.at(-1);
  const first = entry.history.at(-1 - months);
  if (!last || !first) return null;
  return {
    amount: cents(last.value - first.value),
    percent: percentChange(first.value, last.value) ?? 0,
  };
}

/** Share of the net worth, in percent with one place ("10,5% do total"). */
export function shareOfTotal(value: Cents | null, total: Cents): string {
  if (value === null || total === 0) return '—';
  const share = (value / total) * 100;
  return `${formatPercent(share, { fractionDigits: share >= 20 ? 0 : 1 })} do total`;
}

/** Second line of the Investimentos card: "Imóvel · saldo devedor R$ 214.300". */
export function propertyDetail(property: Property): string {
  const kind = property.kind === 'realEstate' ? 'Imóvel' : 'Veículo';
  return property.financing
    ? `${kind} · saldo devedor ${wholeReais(property.financing.balance)}`
    : `${kind} · quitado`;
}

/** Third line: where the value comes from. */
export function propertySource(property: Property): string {
  if (property.kind === 'realEstate') {
    const latest = latestValuation(property);
    return latest
      ? `Valor estimado por você em ${shortMonthText(latest.on)}`
      : 'Sem valor informado';
  }
  const entry = fipeEntry(property.fipeCode);
  const last = entry?.history.at(-1);
  const change = entry ? fipeChange(entry, 1) : null;
  if (!last) return 'Fora da Tabela FIPE';
  const month = formatDate(`${last.month}-01`, 'MMMM');
  return change
    ? `Tabela FIPE de ${month} · ${signedPercent(change.percent)} no mês`
    : `Tabela FIPE de ${month}`;
}

/** Hero line of a real estate: "Imóvel · 72 m² · São Paulo". */
export function realEstateSummary(property: RealEstate): string {
  const parts = ['Imóvel'];
  if (property.area) parts.push(`${property.area.toLocaleString('pt-BR')} m²`);
  if (property.city) parts.push(property.city.split(',')[0]!.trim());
  if (parts.length === 1) {
    parts.push(REAL_ESTATE_TYPES.find((item) => item.key === property.type)!.label);
  }
  return parts.join(' · ');
}

/** Hero line of a vehicle: "Veículo · quitado". */
export const vehicleSummary = (property: Vehicle) =>
  `Veículo · ${property.financing ? 'financiado' : 'quitado'}`;

/** "78 mil" for chart ticks. */
export const thousandsLabel = (value: Cents) =>
  `${Math.round(value / 100_000).toLocaleString('pt-BR')} mil`;
