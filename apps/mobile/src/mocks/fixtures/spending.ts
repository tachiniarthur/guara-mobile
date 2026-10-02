/**
 * Six months of transactions for the complete scenario: salary early in the month, rent and
 * bills, Pix, card purchases, subscriptions (one price increase, one apparently unused),
 * a 10x installment purchase and purchases out of the usual pattern. Fictional merchants only.
 */
import type {
  BillingCycle,
  CategoryId,
  IsoDate,
  TransactionDirection,
  TransactionType,
  UnusualReason,
  UnusualStatus,
} from '@guara/types';
import { cents, splitCents } from '@guara/utils';

import { addMonths, dayIn, daysInMonth, instantAt, monthOf } from '../clock';
import type { SubscriptionRecord, TransactionRecord, UnusualRecord } from '../db';
import type { Random } from '../random';

import { ACCOUNTS } from './banks';

interface Draft {
  date: IsoDate;
  time: string;
  accountId: string;
  direction: TransactionDirection;
  type: TransactionType;
  amount: number;
  merchantName: string | null;
  description?: string;
  categoryId: CategoryId;
  /** Category the classifier got wrong (the user fixed it to `categoryId`). */
  autoCategoryId?: CategoryId;
  installment?: { current: number; total: number };
  unusual?: { reasons: UnusualReason[]; status: UnusualStatus };
}

interface SubscriptionDef {
  id: string;
  merchantName: string;
  amount: number;
  /** New amount from `increasedFrom` on (price increase). */
  increase?: { amount: number; from: IsoDate };
  day: number;
  cycle: BillingCycle;
  /** Yearly subscriptions: month of the charge ("06"). */
  chargeMonth?: string;
  categoryId: CategoryId;
  accountId: string;
  apparentlyUnused?: boolean;
  since: IsoDate;
}

export const SUBSCRIPTIONS: SubscriptionDef[] = [
  {
    id: 'sub_streamplus',
    merchantName: 'StreamPlus',
    amount: 3_990,
    increase: { amount: 4_490, from: '2026-09-08' },
    day: 8,
    cycle: 'monthly',
    categoryId: 'subscriptions',
    accountId: ACCOUNTS.auroraCard,
    since: '2025-02-08',
  },
  {
    id: 'sub_musicaja',
    merchantName: 'MúsicaJá',
    amount: 2_190,
    day: 14,
    cycle: 'monthly',
    categoryId: 'subscriptions',
    accountId: ACCOUNTS.auroraCard,
    since: '2024-11-14',
  },
  {
    id: 'sub_nuvemcofre',
    merchantName: 'NuvemCofre',
    amount: 990,
    day: 3,
    cycle: 'monthly',
    categoryId: 'subscriptions',
    accountId: ACCOUNTS.auroraCard,
    apparentlyUnused: true,
    since: '2025-06-03',
  },
  {
    id: 'sub_academia',
    merchantName: 'Academia Movimento',
    amount: 11_990,
    day: 2,
    cycle: 'monthly',
    categoryId: 'health',
    accountId: ACCOUNTS.jangadaCard,
    since: '2025-08-02',
  },
  {
    id: 'sub_jornal',
    merchantName: 'Jornal Diário Digital',
    amount: 2_990,
    day: 22,
    cycle: 'monthly',
    categoryId: 'subscriptions',
    accountId: ACCOUNTS.auroraCard,
    since: '2026-01-22',
  },
  {
    id: 'sub_escudo',
    merchantName: 'Escudo Antivírus',
    amount: 19_900,
    day: 17,
    cycle: 'yearly',
    chargeMonth: '06',
    categoryId: 'subscriptions',
    accountId: ACCOUNTS.auroraCard,
    since: '2024-06-17',
  },
];

const MERCHANTS = {
  groceries: [
    'Mercado Bom Preço',
    'Supermercado Pomar',
    'Hortifruti Verde Vale',
    'Atacado Economia',
  ],
  restaurants: [
    'Padaria Trigo Dourado',
    'Sabor Delivery',
    'Cantina da Vila',
    'Café Bem-te-vi',
    'Lanchonete da Esquina',
  ],
  leisure: ['CineLuz', 'Teatro Aberto', 'Parque Aventura'],
  shopping: ['Loja Vitrine', 'Moda Ventura', 'Casa & Cia Utilidades'],
  personalCare: ['Barbearia Navalha', 'Salão Bela Flor'],
} as const;

/** Bank-statement style text: upper case, no accents. */
function statement(prefix: string, merchant: string): string {
  const plain = merchant.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  return `${prefix} ${plain}`;
}

const DESCRIPTION_PREFIX: Record<TransactionType, string> = {
  pix: 'PIX ENVIADO',
  debit_card: 'COMPRA DEBITO',
  credit_card: 'COMPRA CARTAO',
  boleto: 'PAGTO BOLETO',
  transfer: 'TED',
  direct_debit: 'DEB AUTOMATICO',
  fee: 'TARIFA',
  other: 'LANCAMENTO',
};

function describe(draft: Draft): string {
  if (draft.description) return draft.description;
  const prefix =
    draft.type === 'pix' && draft.direction === 'in'
      ? 'PIX RECEBIDO'
      : DESCRIPTION_PREFIX[draft.type];
  return statement(prefix, draft.merchantName ?? 'SEM IDENTIFICACAO');
}

const time = (random: Random, from: number, to: number) =>
  `${String(random.int(from, to)).padStart(2, '0')}:${String(random.int(0, 59)).padStart(2, '0')}`;

/** Monthly charge amount of a subscription on a given date. */
function chargeAmount(def: SubscriptionDef, date: IsoDate): number {
  return def.increase && date >= def.increase.from ? def.increase.amount : def.amount;
}

function monthDrafts(random: Random, month: string, lastDay: number): Draft[] {
  const drafts: Draft[] = [];
  const add = (day: number, draft: Omit<Draft, 'date'>) => {
    if (day <= lastDay) drafts.push({ ...draft, date: dayIn(month, day) });
  };
  const randomDay = () => random.int(1, lastDay);
  const card = () => random.pick([ACCOUNTS.auroraCard, ACCOUNTS.auroraCard, ACCOUNTS.jangadaCard]);

  // Income: salary on the 5th, freelance Pix in some months.
  add(5, {
    time: '07:42',
    accountId: ACCOUNTS.auroraChecking,
    direction: 'in',
    type: 'transfer',
    amount: 920_000,
    merchantName: null,
    description: 'PAGTO SALARIO HORIZONTE DIGITAL LTDA',
    categoryId: 'salary',
  });
  if (random.chance(0.5)) {
    add(random.int(15, 24), {
      time: time(random, 10, 18),
      accountId: ACCOUNTS.jangadaChecking,
      direction: 'in',
      type: 'pix',
      amount: random.amount(1_200, 2_500),
      merchantName: 'Estúdio Criativo Ponto',
      categoryId: 'other_income',
    });
  }

  // Money moved between the user's own places (not spending).
  add(6, {
    time: '09:15',
    accountId: ACCOUNTS.auroraChecking,
    direction: 'out',
    type: 'transfer',
    amount: 100_000,
    merchantName: null,
    description: 'TED CORRETORA ATIVA INVESTIMENTOS',
    categoryId: 'investments',
  });
  add(6, {
    time: '09:20',
    accountId: ACCOUNTS.auroraChecking,
    direction: 'out',
    type: 'pix',
    amount: 50_000,
    merchantName: null,
    description: 'PIX ENVIADO MARINA COSTA - POUPANCA',
    categoryId: 'transfers',
  });
  add(6, {
    time: '09:20',
    accountId: ACCOUNTS.ipeSavings,
    direction: 'in',
    type: 'pix',
    amount: 50_000,
    merchantName: null,
    description: 'PIX RECEBIDO MARINA COSTA',
    categoryId: 'transfers',
  });

  // Housing and bills.
  const bill = (
    day: number,
    merchantName: string,
    amount: number,
    categoryId: CategoryId,
    type: TransactionType,
  ) =>
    add(day, {
      time: time(random, 6, 9),
      accountId: ACCOUNTS.auroraChecking,
      direction: 'out',
      type,
      amount,
      merchantName,
      categoryId,
    });
  bill(10, 'Imobiliária Lar Doce', 235_000, 'housing', 'boleto');
  bill(10, 'Condomínio Edifício Jacarandá', 68_000, 'housing', 'boleto');
  bill(12, 'Conecta Fibra', 11_990, 'bills', 'direct_debit');
  bill(15, 'Luz Paulista Energia', random.amount(160, 290), 'bills', 'direct_debit');
  bill(18, 'Fala Mais Telecom', 5_990, 'bills', 'direct_debit');
  bill(20, 'Águas da Serra', random.amount(70, 110), 'bills', 'direct_debit');

  // Day-to-day spending.
  const purchases = (
    count: number,
    merchants: readonly string[],
    range: [number, number],
    categoryId: CategoryId,
    hours: [number, number] = [8, 21],
  ) => {
    for (let index = 0; index < count; index++) {
      const usePix = random.chance(0.25);
      add(randomDay(), {
        time: time(random, hours[0], hours[1]),
        accountId: usePix ? ACCOUNTS.auroraChecking : card(),
        direction: 'out',
        type: usePix ? 'pix' : 'credit_card',
        amount: random.amount(range[0], range[1]),
        merchantName: random.pick(merchants),
        categoryId,
      });
    }
  };
  purchases(random.int(5, 7), MERCHANTS.groceries, [60, 420], 'groceries');
  purchases(random.int(8, 12), MERCHANTS.restaurants, [18, 160], 'restaurants', [7, 22]);
  purchases(random.int(5, 9), ['VaiJá Mobilidade'], [12, 48], 'transport', [7, 23]);
  purchases(2, ['Posto Estrela Guia'], [180, 260], 'transport');
  purchases(random.int(1, 3), ['Farmácia Saúde Mais'], [25, 140], 'health');
  purchases(random.int(1, 3), MERCHANTS.leisure, [40, 180], 'leisure', [14, 22]);
  purchases(random.int(1, 3), MERCHANTS.shopping, [60, 380], 'shopping');
  purchases(random.int(0, 1), MERCHANTS.personalCare, [45, 120], 'personal_care');
  purchases(1, ['Pet Feliz'], [90, 220], 'pets');

  return drafts;
}

export interface SpendingFixtures {
  transactions: TransactionRecord[];
  unusual: UnusualRecord[];
  subscriptions: SubscriptionRecord[];
}

export function buildSpending(random: Random, today: IsoDate): SpendingFixtures {
  const currentMonth = monthOf(today);
  const months = Array.from({ length: 6 }, (_, index) => addMonths(currentMonth, index - 5));
  const drafts: Draft[] = [];

  for (const month of months) {
    const lastDay = month === currentMonth ? Number(today.slice(8, 10)) : daysInMonth(month);
    drafts.push(...monthDrafts(random, month, lastDay));

    for (const def of SUBSCRIPTIONS) {
      if (def.cycle === 'yearly' && month.slice(5) !== def.chargeMonth) continue;
      const date = dayIn(month, def.day);
      if (Number(date.slice(8)) > lastDay) continue;
      drafts.push({
        date,
        time: '04:30',
        accountId: def.accountId,
        direction: 'out',
        type: 'credit_card',
        amount: chargeAmount(def, date),
        merchantName: def.merchantName,
        categoryId: def.categoryId,
      });
    }
  }

  // Notebook bought in 10 installments five months ago (installments split to the cent).
  const installmentStart = addMonths(currentMonth, -4);
  const installments = splitCents(cents(420_000), 10);
  for (let index = 0; index < 5; index++) {
    drafts.push({
      date: dayIn(addMonths(installmentStart, index), 11),
      time: '15:02',
      accountId: ACCOUNTS.auroraCard,
      direction: 'out',
      type: 'credit_card',
      amount: installments[index]!,
      merchantName: 'Eletro Mundo',
      categoryId: 'shopping',
      installment: { current: index + 1, total: 10 },
    });
  }

  // A pet shop purchase the classifier got wrong; the user fixed it.
  drafts.push({
    date: dayIn(addMonths(currentMonth, -1), 9),
    time: '11:47',
    accountId: ACCOUNTS.auroraCard,
    direction: 'out',
    type: 'credit_card',
    amount: 18_790,
    merchantName: 'Mundo Animal Express',
    categoryId: 'pets',
    autoCategoryId: 'shopping',
  });

  // Purchases out of the usual pattern.
  const unusual = (date: IsoDate, draft: Omit<Draft, 'date' | 'direction' | 'type'>) =>
    drafts.push({ ...draft, date, direction: 'out', type: 'credit_card' });
  unusual(dayIn(currentMonth, 19), {
    time: '14:22',
    accountId: ACCOUNTS.auroraCard,
    amount: 289_000,
    merchantName: 'Joalheria Brilho Real',
    categoryId: 'shopping',
    unusual: { reasons: ['unusual_amount'], status: 'pending' },
  });
  unusual(dayIn(currentMonth, 21), {
    time: '03:12',
    accountId: ACCOUNTS.jangadaCard,
    amount: 18_600,
    merchantName: 'Bar Lua Cheia',
    categoryId: 'restaurants',
    unusual: { reasons: ['unusual_time'], status: 'pending' },
  });
  unusual(dayIn(currentMonth, 23), {
    time: '16:40',
    accountId: ACCOUNTS.auroraCard,
    amount: 31_240,
    merchantName: 'Lisboa Souvenirs',
    description: 'COMPRA CARTAO LISBOA SOUVENIRS LDA PT',
    categoryId: 'travel',
    unusual: { reasons: ['unusual_location', 'new_category'], status: 'pending' },
  });
  unusual(dayIn(addMonths(currentMonth, -1), 12), {
    time: '10:05',
    accountId: ACCOUNTS.jangadaCard,
    amount: 78_000,
    merchantName: 'Clínica Veterinária Patas',
    categoryId: 'pets',
    unusual: { reasons: ['unusual_amount'], status: 'acknowledged' },
  });

  drafts.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time) ||
      describe(a).localeCompare(describe(b)),
  );

  const transactions: TransactionRecord[] = [];
  const unusualRecords: UnusualRecord[] = [];
  drafts.forEach((draft, index) => {
    const id = `tx_${String(index + 1).padStart(4, '0')}`;
    const occurredAt = instantAt(draft.date, draft.time);
    const syncedAt = new Date(Date.parse(occurredAt) + 7 * 60_000).toISOString();
    const autoCategoryId = draft.autoCategoryId ?? draft.categoryId;
    const userCategoryId = draft.autoCategoryId ? draft.categoryId : null;
    transactions.push({
      id,
      accountId: draft.accountId,
      amount: draft.amount,
      currency: 'BRL',
      direction: draft.direction,
      type: draft.type,
      date: draft.date,
      occurredAt,
      description: describe(draft),
      merchantName: draft.merchantName,
      autoCategoryId,
      userCategoryId,
      categoryId: userCategoryId ?? autoCategoryId,
      installment: draft.installment ?? null,
      isUnusual: draft.unusual !== undefined,
      createdAt: syncedAt,
      updatedAt: syncedAt,
    });
    if (draft.unusual) {
      unusualRecords.push({ transactionId: id, ...draft.unusual, detectedAt: syncedAt });
    }
  });

  // Newest first, as the API lists them.
  transactions.reverse();
  unusualRecords.reverse();

  return {
    transactions,
    unusual: unusualRecords,
    subscriptions: buildSubscriptions(transactions, today),
  };
}

function buildSubscriptions(
  transactions: TransactionRecord[],
  today: IsoDate,
): SubscriptionRecord[] {
  return SUBSCRIPTIONS.map((def) => {
    const charges = transactions.filter((tx) => tx.merchantName === def.merchantName);
    const last = charges[0] ?? null;
    const lastChargedOn = last?.date ?? null;
    const next =
      def.cycle === 'yearly'
        ? dayIn(
            `${Number(today.slice(0, 4)) + (today.slice(5, 7) >= def.chargeMonth! ? 1 : 0)}-${def.chargeMonth}`,
            def.day,
          )
        : dayIn(addMonths(monthOf(today), Number(today.slice(8, 10)) >= def.day ? 1 : 0), def.day);
    const createdAt = instantAt(def.since, '05:00');
    return {
      id: def.id,
      merchantName: def.merchantName,
      amount: last?.amount ?? def.amount,
      currency: 'BRL',
      cycle: def.cycle,
      categoryId: def.categoryId,
      accountId: def.accountId,
      lastChargedOn,
      nextChargeOn: next,
      priceIncrease: def.increase
        ? { previousAmount: def.amount, changedOn: def.increase.from }
        : null,
      apparentlyUnused: def.apparentlyUnused ?? false,
      status: 'active',
      createdAt,
      updatedAt: last?.updatedAt ?? createdAt,
    };
  });
}
