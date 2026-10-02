import type { IsoDate } from '@guara/types';
import { cents, multiplyCentsByDecimal } from '@guara/utils';

import { addDays, addMonths, instantAt, monthOf } from '../clock';
import type {
  AssetRecord,
  DuplicateRecord,
  PositionRecord,
  PriceAlertRecord,
  PropertyRecord,
  WealthHistory,
} from '../db';
import type { Random } from '../random';

import { INSTITUTIONS } from './banks';
import { priceOf } from './market';

type ListedInput = Pick<PositionRecord, 'id' | 'class' | 'risk' | 'origin' | 'country'> & {
  ticker: string;
  name: string;
  type: PositionRecord['instrument']['type'];
  quantity: string;
  averagePrice: number;
  institution?: { name: string; connectionId: string };
  createdOn: IsoDate;
};

/**
 * Portfolio of the complete scenario: the four classes, Brazil and abroad, Open Finance and
 * manual positions — and PETR4 reported twice (Open Finance + typed in by hand).
 */
export function buildPositions(assets: AssetRecord[], nowIso: string): PositionRecord[] {
  const quotedAt = assets[0]!.quote.quotedAt;
  const listed = (input: ListedInput): PositionRecord => {
    const price = cents(priceOf(assets, input.ticker));
    const createdAt = instantAt(input.createdOn, '10:00');
    return {
      id: input.id,
      class: input.class,
      instrument: { name: input.name, ticker: input.ticker, type: input.type },
      risk: input.risk,
      quantity: input.quantity,
      averagePrice: input.averagePrice,
      investedAmount: multiplyCentsByDecimal(cents(input.averagePrice), input.quantity),
      currentValue: multiplyCentsByDecimal(price, input.quantity),
      origin: input.origin,
      country: input.country,
      institutionName: input.institution?.name ?? null,
      connectionId: input.institution?.connectionId ?? null,
      valueUpdatedAt: quotedAt,
      createdAt,
      updatedAt: quotedAt ?? createdAt,
    };
  };
  const aurora = { name: INSTITUTIONS.aurora.name, connectionId: 'conn_aurora' };
  const ipe = { name: INSTITUTIONS.ipe.name, connectionId: 'conn_ipe' };
  const syncedAt = new Date(Date.parse(nowIso) - 2 * 3_600_000).toISOString();

  const byValue = (
    fields: Omit<
      PositionRecord,
      'valueUpdatedAt' | 'createdAt' | 'updatedAt' | 'connectionId' | 'institutionName'
    > & {
      institution: { name: string; connectionId: string } | null;
      createdOn: IsoDate;
    },
  ): PositionRecord => {
    const { institution, createdOn, ...rest } = fields;
    return {
      ...rest,
      institutionName: institution?.name ?? null,
      connectionId: institution?.connectionId ?? null,
      valueUpdatedAt: syncedAt,
      createdAt: instantAt(createdOn, '10:00'),
      updatedAt: syncedAt,
    };
  };

  return [
    byValue({
      id: 'pos_cdb_aurora',
      class: 'fixed_income',
      instrument: { name: 'CDB Banco Aurora 110% CDI', ticker: null, type: 'cdb' },
      risk: 'low',
      quantity: null,
      averagePrice: null,
      investedAmount: 2_000_000,
      currentValue: 2_318_450,
      origin: 'open_finance',
      country: 'BR',
      institution: aurora,
      createdOn: '2025-02-03',
    }),
    byValue({
      id: 'pos_tesouro_ipca',
      class: 'fixed_income',
      instrument: { name: 'Tesouro IPCA+ 2035', ticker: null, type: 'treasury' },
      risk: 'low',
      quantity: '6.42',
      averagePrice: 265_000,
      investedAmount: multiplyCentsByDecimal(cents(265_000), '6.42'),
      currentValue: multiplyCentsByDecimal(cents(284_312), '6.42'),
      origin: 'open_finance',
      country: 'BR',
      institution: ipe,
      createdOn: '2025-05-12',
    }),
    byValue({
      id: 'pos_lci_ipe',
      class: 'fixed_income',
      instrument: { name: 'LCI Banco Ipê 95% CDI', ticker: null, type: 'lci' },
      risk: 'low',
      quantity: null,
      averagePrice: null,
      investedAmount: 1_000_000,
      currentValue: 1_067_820,
      origin: 'open_finance',
      country: 'BR',
      institution: ipe,
      createdOn: '2026-01-15',
    }),
    listed({
      id: 'pos_petr4_of',
      class: 'equities',
      ticker: 'PETR4',
      name: 'Petrobras PN',
      type: 'stock',
      risk: 'high',
      quantity: '200',
      averagePrice: 3_105,
      origin: 'open_finance',
      country: 'BR',
      institution: aurora,
      createdOn: '2025-08-20',
    }),
    listed({
      id: 'pos_petr4_manual',
      class: 'equities',
      ticker: 'PETR4',
      name: 'Petrobras PN',
      type: 'stock',
      risk: 'high',
      quantity: '200',
      averagePrice: 3_110,
      origin: 'manual',
      country: 'BR',
      createdOn: '2025-03-02',
    }),
    listed({
      id: 'pos_itub4',
      class: 'equities',
      ticker: 'ITUB4',
      name: 'Itaú Unibanco PN',
      type: 'stock',
      risk: 'high',
      quantity: '300',
      averagePrice: 2_890,
      origin: 'open_finance',
      country: 'BR',
      institution: aurora,
      createdOn: '2025-08-20',
    }),
    listed({
      id: 'pos_wege3',
      class: 'equities',
      ticker: 'WEGE3',
      name: 'WEG ON',
      type: 'stock',
      risk: 'high',
      quantity: '80',
      averagePrice: 3_650,
      origin: 'manual',
      country: 'BR',
      createdOn: '2025-11-04',
    }),
    listed({
      id: 'pos_ivvb11',
      class: 'equities',
      ticker: 'IVVB11',
      name: 'iShares S&P 500 ETF',
      type: 'etf',
      risk: 'medium',
      quantity: '25',
      averagePrice: 31_200,
      origin: 'open_finance',
      country: 'abroad',
      institution: aurora,
      createdOn: '2025-08-20',
    }),
    listed({
      id: 'pos_hglg11',
      class: 'real_estate',
      ticker: 'HGLG11',
      name: 'CSHG Logística FII',
      type: 'fii',
      risk: 'medium',
      quantity: '40',
      averagePrice: 15_100,
      origin: 'open_finance',
      country: 'BR',
      institution: aurora,
      createdOn: '2025-08-20',
    }),
    listed({
      id: 'pos_mxrf11',
      class: 'real_estate',
      ticker: 'MXRF11',
      name: 'Maxi Renda FII',
      type: 'fii',
      risk: 'medium',
      quantity: '500',
      averagePrice: 1_010,
      origin: 'open_finance',
      country: 'BR',
      institution: aurora,
      createdOn: '2025-08-20',
    }),
    listed({
      id: 'pos_btc',
      class: 'alternatives',
      ticker: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      risk: 'high',
      quantity: '0.0315',
      averagePrice: 29_800_000,
      origin: 'manual',
      country: null,
      createdOn: '2025-04-10',
    }),
    byValue({
      id: 'pos_fund_mm',
      class: 'alternatives',
      instrument: { name: 'Fundo Multimercado Horizonte FIC', ticker: null, type: 'fund' },
      risk: 'medium',
      // Quota value has sub-cent precision, so there is no average price in cents.
      quantity: '1392.11806',
      averagePrice: null,
      investedAmount: 300_000,
      currentValue: 341_270,
      origin: 'open_finance',
      country: 'BR',
      institution: ipe,
      createdOn: '2025-09-01',
    }),
  ];
}

export function buildDuplicates(nowIso: string): DuplicateRecord[] {
  return [
    {
      id: 'dup_petr4',
      positionIds: ['pos_petr4_of', 'pos_petr4_manual'],
      status: 'pending',
      resolution: null,
      detectedAt: new Date(Date.parse(nowIso) - 3 * 86_400_000).toISOString(),
      resolvedAt: null,
      snapshot: null,
    },
  ];
}

/** 24 months of returns, CDI and contributions (R$ 1.000 per month). */
export function buildWealthHistory(random: Random, today: IsoDate): WealthHistory {
  const current = monthOf(today);
  const months = Array.from({ length: 24 }, (_, index) => addMonths(current, index - 23));
  return {
    months,
    returns: months.map(() => Math.round((random.next() * 2.6 - 0.7) * 100) / 100),
    cdi: months.map(() => Math.round((0.8 + random.next() * 0.15) * 100) / 100),
    contributions: months.map((_, index) => (index === 0 ? 0 : 100_000)),
  };
}

export function buildProperties(today: IsoDate): PropertyRecord[] {
  const updatedAt = instantAt(addDays(today, -2), '09:00');
  return [
    {
      id: 'prop_apartment',
      kind: 'real_estate',
      name: 'Apartamento Vila Mariana',
      declaredValue: 68_000_000,
      outstandingDebt: 31_245_000,
      address: 'Rua das Acácias, 120 — São Paulo/SP',
      createdAt: instantAt('2026-03-20', '21:10'),
      updatedAt,
    },
    {
      id: 'prop_car',
      kind: 'vehicle',
      name: 'Carro da família',
      fipeCode: '005340-6',
      fipeValue: 6_489_000,
      fipeReferenceMonth: monthOf(today),
      modelYear: 2021,
      outstandingDebt: null,
      createdAt: instantAt('2026-03-20', '21:15'),
      updatedAt,
    },
  ];
}

export function buildPriceAlerts(today: IsoDate): PriceAlertRecord[] {
  return [
    {
      id: 'alert_petr4_sell',
      ticker: 'PETR4',
      side: 'sell',
      targetPrice: 4_200,
      status: 'active',
      createdAt: instantAt(addDays(today, -23), '18:40'),
      triggeredAt: null,
      triggeredPrice: null,
    },
    {
      id: 'alert_itub4_buy',
      ticker: 'ITUB4',
      side: 'buy',
      targetPrice: 3_200,
      status: 'active',
      createdAt: instantAt(addDays(today, -12), '09:05'),
      triggeredAt: null,
      triggeredPrice: null,
    },
    {
      id: 'alert_wege3_buy',
      ticker: 'WEGE3',
      side: 'buy',
      targetPrice: 3_950,
      status: 'triggered',
      createdAt: instantAt(addDays(today, -40), '20:12'),
      triggeredAt: instantAt(addDays(today, -9), '11:31'),
      triggeredPrice: 3_948,
    },
    {
      id: 'alert_mxrf11_sell',
      ticker: 'MXRF11',
      side: 'sell',
      targetPrice: 1_050,
      status: 'cancelled',
      createdAt: instantAt(addDays(today, -70), '08:50'),
      triggeredAt: null,
      triggeredPrice: null,
    },
  ];
}
