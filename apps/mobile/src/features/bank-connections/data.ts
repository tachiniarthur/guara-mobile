import type { IsoDate } from '@guara/types';

import type { IconName } from '@/components/ui/Icon';

/** Banks offered on Conectar bancos (static until the API exists). */
export interface BankOptionData {
  id: string;
  name: string;
  /** Letters on the logo tile. */
  mark: string;
}

export const SUPPORTED_BANKS: BankOptionData[] = [
  { id: 'nubank', name: 'Nubank', mark: 'N' },
  { id: 'itau', name: 'Itaú', mark: 'I' },
  { id: 'bradesco', name: 'Bradesco', mark: 'B' },
  { id: 'bb', name: 'Banco do Brasil', mark: 'BB' },
  { id: 'caixa', name: 'Caixa', mark: 'C' },
  { id: 'inter', name: 'Inter', mark: 'In' },
  { id: 'c6', name: 'C6 Bank', mark: 'C6' },
  { id: 'santander', name: 'Santander', mark: 'S' },
];

/** Plan of the user and the connections it allows. */
export const PLAN = { name: 'Completo', bankLimit: 3 } as const;

export const ACCESS_ITEMS = [
  { allowed: true, label: 'Vemos: Saldos e extratos' },
  { allowed: true, label: 'Vemos: Cartões e faturas' },
  { allowed: true, label: 'Vemos: Investimentos' },
  { allowed: false, label: 'Nunca: Sua senha do banco' },
  { allowed: false, label: 'Nunca: Fazer pagamentos ou Pix' },
] as const;

export interface BankConnection {
  id: string;
  name: string;
  initial: string;
  /** `expiring`: the consent ends soon and should be renewed (the API decides). */
  status: 'ok' | 'expiring';
  /** What the Guará reads from the bank. */
  scopes: string[];
  /** "Hoje, 14:30" (last sync, as the API labels it). */
  updatedAt: string;
  /** Last day of the Open Finance consent. */
  authorizedUntil: IsoDate;
}

/** Banks connected by the user in the design (Meu perfil). */
export const BANK_CONNECTIONS: BankConnection[] = [
  {
    id: 'nubank',
    name: 'Nubank',
    initial: 'N',
    status: 'ok',
    scopes: ['Conta', 'Cartão de crédito', 'Investimentos'],
    updatedAt: 'Hoje, 14:30',
    authorizedUntil: '2027-09-23',
  },
  {
    id: 'itau',
    name: 'Itaú',
    initial: 'I',
    status: 'expiring',
    scopes: ['Conta', 'Cartão de crédito', 'Investimentos'],
    updatedAt: 'Hoje, 14:28',
    authorizedUntil: '2026-10-26',
  },
];

// --- Malvo (Open Finance) -----------------------------------------------------------------------

/** How long a new consent lasts. */
export const CONSENT_MONTHS = 12;
export const CONSENT_PURPOSE = 'Organizar gastos e investimentos';
export const CONSENT_VIA = 'Malvo · Open Finance Brasil';

export const MALVO_SCOPES: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: 'user',
    title: 'Dados cadastrais',
    detail: 'Nome e CPF, para confirmar que a conta é sua',
  },
  { icon: 'wallet', title: 'Contas', detail: 'Saldos e extratos dos últimos 12 meses' },
  { icon: 'tag', title: 'Cartões de crédito', detail: 'Faturas, limites e lançamentos' },
  { icon: 'trendingUp', title: 'Investimentos', detail: 'Posições, aplicações e rendimentos' },
];

/** What the Malvo found in each bank (only the Itaú is in the design: others show "—"). */
export interface MalvoFindings {
  /** While importing ("2 contas e 1 cartão encontrados"). */
  foundSummary: string;
  accounts: string;
  cards: string;
  investments: string;
  transactions: string;
  /** Investment also typed in manually: asked later in Investimentos. */
  duplicateNotice: string | null;
}

export const MALVO_FINDINGS: Partial<Record<string, MalvoFindings>> = {
  itau: {
    foundSummary: '2 contas e 1 cartão encontrados',
    accounts: '2 · corrente e poupança',
    cards: '1 · Itaú Click',
    investments: '1 · Tesouro Selic 2029',
    transactions: '64 organizados',
    duplicateNotice:
      'O Tesouro Selic 2029 do Itaú também está no seu cadastro manual. Vamos perguntar em Investimentos se você quer somar ou manter separado.',
  },
};

/** Why a connection may fail, with the code the Malvo returns for support. */
export const MALVO_ERROR = {
  code: 'MLV-401',
  reasons: [
    {
      icon: 'close' as IconName,
      title: (bank: string) => `Você tocou em “Cancelar” no app do ${bank}`,
      detail: 'Nada foi compartilhado. É só tentar de novo quando quiser.',
    },
    {
      icon: 'wifiOff' as IconName,
      title: (bank: string) => `O ${bank} não respondeu a tempo`,
      detail: 'Acontece quando o banco está instável. Tente em alguns minutos.',
    },
  ],
};
