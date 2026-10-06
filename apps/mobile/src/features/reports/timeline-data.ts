import type { Cents, IsoDate } from '@guara/types';
import { cents } from '@guara/utils';

export interface TimelineEntry {
  id: string;
  title: string;
  /** "Nubank crédito · 02:14 · Eletrônicos". */
  detail: string;
  amount: Cents;
  direction: 'in' | 'out';
  flagged?: boolean;
  /** Lançamento in Gastos (opens its page). */
  transactionId?: string;
}

/** Several small outflows shown as one row ("Mais 3 lançamentos"). */
export interface TimelineGroup {
  count: number;
  /** "Farmácia, transporte por app e padaria". */
  labels: string;
  amount: Cents;
  /** The lançamentos behind the row, when Gastos has them ("Mostrar todos os dias"). */
  transactionIds?: string[];
}

export interface TimelineDay {
  /** First and last day (the same for a single day). */
  from: IsoDate;
  to: IsoDate;
  entries: TimelineEntry[];
  group?: TimelineGroup;
  /** Days left out of the summary ("Dias 2 a 4 … agrupados"): only their total is known. */
  hidden?: boolean;
}

/**
 * "Linha do tempo" of September as the design shows it (static until the API exists). Balances,
 * totals and filters are computed from the opening balance and these movements.
 */
export const TIMELINE_MONTH: {
  month: string;
  today: IsoDate;
  opening: Cents;
  scope: string;
  days: TimelineDay[];
} = {
  month: '2026-09',
  today: '2026-09-23',
  opening: cents(1_019_279),
  scope: 'todos os bancos',
  days: [
    {
      from: '2026-09-23',
      to: '2026-09-23',
      entries: [
        {
          id: 'tl-eletronicos',
          title: 'Loja de eletrônicos online',
          detail: 'Nubank crédito · 02:14 · Eletrônicos',
          amount: cents(124_990),
          direction: 'out',
          flagged: true,
          transactionId: 'tx-eletronicos',
        },
        {
          id: 'tl-cafe',
          title: 'Café da esquina',
          detail: 'Nubank crédito · Alimentação',
          amount: cents(950),
          direction: 'out',
          transactionId: 'tx-cafe',
        },
      ],
    },
    {
      from: '2026-09-22',
      to: '2026-09-22',
      entries: [
        {
          id: 'tl-casa-bela',
          title: 'Presentes Casa Bela',
          detail: 'Nubank crédito · Compras',
          amount: cents(22_000),
          direction: 'out',
          transactionId: 'tx-casa-bela',
        },
        {
          id: 'tl-sabor',
          title: 'Restaurante Sabor da Vila',
          detail: 'Nubank crédito · Alimentação',
          amount: cents(16_310),
          direction: 'out',
          transactionId: 'tx-sabor-da-vila',
        },
      ],
      group: {
        count: 3,
        labels: 'Farmácia, transporte por app e padaria',
        amount: cents(12_990),
        transactionIds: ['tx-farmacia', 'tx-app', 'tx-padaria'],
      },
    },
    {
      from: '2026-09-21',
      to: '2026-09-21',
      entries: [],
      group: {
        count: 3,
        labels: 'Delivery, cinema e transporte por app',
        amount: cents(16_610),
        transactionIds: ['tx-pizza', 'tx-cinema', 'tx-app-21'],
      },
    },
    {
      from: '2026-09-20',
      to: '2026-09-20',
      entries: [],
      group: {
        count: 3,
        labels: 'Bar, mercado e transporte por app',
        amount: cents(19_840),
        transactionIds: ['tx-bar', 'tx-mercado-bairro', 'tx-app-20'],
      },
    },
    {
      from: '2026-09-19',
      to: '2026-09-19',
      entries: [],
      group: {
        count: 2,
        labels: 'Delivery e hamburgueria',
        amount: cents(15_462),
        transactionIds: ['tx-japones', 'tx-hamburgueria'],
      },
    },
    {
      from: '2026-09-18',
      to: '2026-09-18',
      entries: [
        {
          id: 'tl-freela',
          title: 'Freela · site institucional',
          detail: 'Pix recebido · Itaú · Entrada',
          amount: cents(100_000),
          direction: 'in',
          transactionId: 'tx-freela',
        },
        {
          id: 'tl-posto',
          title: 'Posto de combustível',
          detail: 'Itaú débito · Transporte',
          amount: cents(9_230),
          direction: 'out',
          transactionId: 'tx-posto',
        },
      ],
    },
    {
      from: '2026-09-15',
      to: '2026-09-17',
      entries: [],
      group: { count: 7, labels: 'iCloud+, mercado, transporte e almoço', amount: cents(16_820) },
    },
    {
      from: '2026-09-11',
      to: '2026-09-14',
      entries: [],
      group: { count: 0, labels: '', amount: cents(44_545) },
      hidden: true,
    },
    {
      from: '2026-09-10',
      to: '2026-09-10',
      entries: [
        {
          id: 'tl-mercado',
          title: 'Mercado do mês',
          detail: 'Itaú débito · Alimentação',
          amount: cents(31_120),
          direction: 'out',
          transactionId: 'tx-mercado',
        },
        {
          id: 'tl-app-10',
          title: 'Transporte por app',
          detail: 'Nubank crédito · Transporte',
          amount: cents(2_240),
          direction: 'out',
        },
      ],
    },
    {
      from: '2026-09-06',
      to: '2026-09-09',
      entries: [],
      group: { count: 0, labels: '', amount: cents(29_390) },
      hidden: true,
    },
    {
      from: '2026-09-05',
      to: '2026-09-05',
      entries: [
        {
          id: 'tl-salario',
          title: 'Salário',
          detail: 'Crédito em conta · Itaú · Entrada',
          amount: cents(720_000),
          direction: 'in',
        },
        {
          id: 'tl-aluguel',
          title: 'Aluguel',
          detail: 'Pix enviado · Itaú · Moradia',
          amount: cents(210_000),
          direction: 'out',
        },
      ],
    },
    {
      from: '2026-09-02',
      to: '2026-09-04',
      entries: [],
      group: { count: 0, labels: '', amount: cents(11_280) },
      hidden: true,
    },
    {
      from: '2026-09-01',
      to: '2026-09-01',
      entries: [
        {
          id: 'tl-mercado-bairro',
          title: 'Mercado do bairro',
          detail: 'Itaú débito · Alimentação',
          amount: cents(4_630),
          direction: 'out',
        },
        {
          id: 'tl-app-01',
          title: 'Transporte por app',
          detail: 'Nubank crédito · Transporte',
          amount: cents(2_840),
          direction: 'out',
        },
      ],
    },
  ],
};
