import type { Cents, YearMonth } from '@guara/types';
import { cents } from '@guara/utils';

/** Reference month of the design's data ("Tabela FIPE de setembro/2026"). */
export const PROPERTIES_MONTH: YearMonth = '2026-09';

/** Months between value reviews of a real estate ("próxima revisão em fevereiro de 2027"). */
export const REVIEW_MONTHS = 6;

export const REAL_ESTATE_TYPES = [
  { key: 'apartment', label: 'Apartamento' },
  { key: 'house', label: 'Casa' },
  { key: 'land', label: 'Terreno' },
  { key: 'commercial', label: 'Comercial' },
  { key: 'other', label: 'Outro' },
] as const;
export type RealEstateType = (typeof REAL_ESTATE_TYPES)[number]['key'];

export const VEHICLE_TYPES = [
  { key: 'car', label: 'Carro' },
  { key: 'motorcycle', label: 'Moto' },
  { key: 'truck', label: 'Caminhão' },
] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number]['key'];

/** Debt of a financed asset, as the user informed it. */
export interface Financing {
  balance: Cents;
  informedOn: YearMonth;
  bank: string | null;
}

/** A value the user informed for a real estate (newest first in the list). */
export interface Valuation {
  on: YearMonth;
  value: Cents;
  kind: 'registration' | 'estimate';
}

export interface RealEstate {
  id: string;
  kind: 'realEstate';
  name: string;
  type: RealEstateType;
  /** Area in m². */
  area: number | null;
  /** "São Paulo, SP". */
  city: string | null;
  valuations: Valuation[];
  financing: Financing | null;
}

export interface Vehicle {
  id: string;
  kind: 'vehicle';
  name: string;
  /** Entry of the FIPE table; the value follows it every month. */
  fipeCode: string;
  plate: string | null;
  financing: Financing | null;
}

export type Property = RealEstate | Vehicle;

export interface FipeEntry {
  code: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  /** Monthly values, oldest first (the last one is the current table). */
  history: { month: YearMonth; value: Cents }[];
}

/**
 * Tabela FIPE as our API will serve it. Only the vehicle of the design is here; the search
 * shows an empty state for the others.
 */
export const FIPE_TABLE: FipeEntry[] = [
  {
    code: 'chevrolet-onix-lt-1.0t-2022-gasolina',
    type: 'car',
    brand: 'Chevrolet',
    model: 'Onix LT 1.0 Turbo',
    year: 2022,
    fuel: 'Gasolina',
    history: [
      { month: '2026-04', value: cents(8_090_000) },
      { month: '2026-05', value: cents(8_030_000) },
      { month: '2026-06', value: cents(7_980_000) },
      { month: '2026-07', value: cents(7_940_000) },
      { month: '2026-08', value: cents(7_913_000) },
      { month: '2026-09', value: cents(7_850_000) },
    ],
  },
];

/** "Imóveis e outros bens" of the design. */
export const PROPERTIES: Property[] = [
  {
    id: 'apto',
    kind: 'realEstate',
    name: 'Apartamento em Pinheiros',
    type: 'apartment',
    area: 72,
    city: 'São Paulo, SP',
    valuations: [
      { on: '2026-08', value: cents(62_000_000), kind: 'estimate' },
      { on: '2026-02', value: cents(60_000_000), kind: 'estimate' },
      { on: '2025-09', value: cents(58_500_000), kind: 'registration' },
    ],
    financing: { balance: cents(21_430_000), informedOn: '2026-08', bank: null },
  },
  {
    id: 'onix',
    kind: 'vehicle',
    name: 'Onix LT 2022',
    fipeCode: 'chevrolet-onix-lt-1.0t-2022-gasolina',
    plate: null,
    financing: null,
  },
];
