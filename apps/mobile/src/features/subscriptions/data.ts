import type { Cents, IsoDate } from '@guara/types';
import { cents } from '@guara/utils';

/** Color of a subscription in the calendar (token tone). */
export type SubscriptionTone = 'info' | 'brand' | 'negative' | 'positive';

export interface SubscriptionItem {
  id: string;
  name: string;
  mark: string;
  /** Article of the name in pt-BR ("a Netflix", "o Spotify"). */
  article: 'a' | 'o';
  /** "Streaming". */
  kind: string;
  /** Bank and how it is paid ("Nubank crédito"). */
  bank: string;
  payment: 'crédito' | 'débito';
  /** Day of the month the charge happens. */
  day: number;
  /** Current monthly price. */
  amount: Cents;
  tone: SubscriptionTone;
  /** Price before an increase and the first charge with the new price. */
  increase: { previous: Cents; from: IsoDate } | null;
  /** Days without apparent use (e.g. no Amazon purchases), when the bank shows it. */
  unusedDays: number | null;
  /** The Tamanduá's reading when there is no apparent use (text before the yearly saving). */
  savingTip: string | null;
  /** What the bank cannot tell about the use ("assistido", "ouvido"…). */
  useVerb: string;
  /** Where to cancel inside the service (second step of "Como cancelar"). */
  cancelHint: string | null;
  /** Charges already made, newest first. */
  charges: { date: IsoDate; amount: Cents }[];
}

/** Assinaturas as shown in the design (static until the API exists). */
export const SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    article: 'o',
    mark: 'S',
    kind: 'Música',
    bank: 'Nubank',
    payment: 'crédito',
    day: 2,
    amount: cents(2_190),
    tone: 'info',
    increase: null,
    unusedDays: null,
    savingTip: null,
    useVerb: 'ouvido',
    cancelHint: null,
    charges: [{ date: '2026-09-02', amount: cents(2_190) }],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    article: 'a',
    mark: 'N',
    kind: 'Streaming',
    bank: 'Nubank',
    payment: 'crédito',
    day: 8,
    amount: cents(4_490),
    tone: 'brand',
    increase: { previous: cents(3_990), from: '2026-10-08' },
    unusedDays: null,
    savingTip: null,
    useVerb: 'assistido',
    cancelHint: 'Vá em Conta e escolha cancelar a assinatura.',
    charges: [
      { date: '2026-09-08', amount: cents(3_990) },
      { date: '2026-08-08', amount: cents(3_990) },
      { date: '2026-07-08', amount: cents(3_990) },
      { date: '2026-06-08', amount: cents(3_990) },
      { date: '2026-05-08', amount: cents(3_990) },
      { date: '2026-04-08', amount: cents(3_990) },
    ],
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    article: 'o',
    mark: 'A',
    kind: 'Compras e streaming',
    bank: 'Itaú',
    payment: 'crédito',
    day: 12,
    amount: cents(1_990),
    tone: 'negative',
    increase: null,
    unusedDays: 60,
    savingTip: 'Você não comprou na Amazon nos últimos 60 dias. Se cancelar o Prime, economiza',
    useVerb: 'usado',
    cancelHint: null,
    charges: [],
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    article: 'o',
    mark: 'i',
    kind: 'Armazenamento',
    bank: 'Itaú',
    payment: 'débito',
    day: 15,
    amount: cents(1_490),
    tone: 'positive',
    increase: null,
    unusedDays: null,
    savingTip: null,
    useVerb: 'usado',
    cancelHint: null,
    charges: [],
  },
];
