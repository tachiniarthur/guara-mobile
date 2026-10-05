import type { Cents } from '@guara/types';
import { cents } from '@guara/utils';

import type { BadgeTone } from '@/components/ui';

export interface SubscriptionItem {
  id: string;
  name: string;
  mark: string;
  /** "Música · Nubank crédito". */
  detail: string;
  /** Day of the next charge in October. */
  day: number;
  amount: Cents;
  flag?: { label: string; tone: BadgeTone };
}

/** Assinaturas as shown in the design (static until the API exists). */
export const SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    mark: 'S',
    detail: 'Música · Nubank crédito',
    day: 2,
    amount: cents(2_190),
  },
  {
    id: 'netflix',
    name: 'Netflix',
    mark: 'N',
    detail: 'Streaming · Nubank crédito',
    day: 8,
    amount: cents(4_490),
    flag: { label: 'Subiu de R$ 39,90', tone: 'warning' },
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    mark: 'A',
    detail: 'Compras e streaming · Itaú crédito',
    day: 12,
    amount: cents(1_990),
    flag: { label: 'Sem uso aparente há 60 dias', tone: 'negative' },
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    mark: 'i',
    detail: 'Armazenamento · Itaú débito',
    day: 15,
    amount: cents(1_490),
  },
];

export const SUBSCRIPTIONS_TOTAL = cents(10_160);
export const SUBSCRIPTIONS_YEARLY = cents(121_920);
export const PRIME_YEARLY_SAVING = cents(23_880);
export const CALENDAR = { monthName: 'outubro', title: 'Cobranças de outubro', days: 31 };
