import type { IconName } from '@/components/ui/Icon';
import type { NoticeKind } from '@/stores/ui-preferences';

/** Signed-in user as shown in the design (static until the API exists). */
export const CURRENT_USER = {
  name: 'Arthur',
  initials: 'AR',
  email: 'arthur@exemplo.com',
  banksConnected: 2,
  banksAllowed: 3,
} as const;

export const banksConnectedLabel = `${CURRENT_USER.banksConnected} de ${CURRENT_USER.banksAllowed} bancos conectados`;

export const INVESTOR_PROFILE = {
  name: 'Moderado',
  answered: 'Respondido em 23 set 2026 · vale só para Investimentos',
} as const;

export interface BankConnection {
  id: string;
  name: string;
  initial: string;
  status: 'ok' | 'expiring';
  /** What the Guará reads from the bank. */
  scopes: string[];
  updatedAt: string;
  authorizedUntil: string;
  /** "26 de outubro" (only when expiring). */
  expiresOn?: string;
}

export const BANK_CONNECTIONS: BankConnection[] = [
  {
    id: 'nubank',
    name: 'Nubank',
    initial: 'N',
    status: 'ok',
    scopes: ['Conta', 'Cartão de crédito', 'Investimentos'],
    updatedAt: 'Hoje, 14:30',
    authorizedUntil: '23/09/2027',
  },
  {
    id: 'itau',
    name: 'Itaú',
    initial: 'I',
    status: 'expiring',
    scopes: ['Conta', 'Cartão de crédito', 'Investimentos'],
    updatedAt: 'Hoje, 14:28',
    authorizedUntil: '26/10/2026',
    expiresOn: '26 de outubro',
  },
];

export const NOTICE_KINDS: { key: NoticeKind; label: string }[] = [
  { key: 'budgets', label: 'Tetos de gasto' },
  { key: 'priceAlerts', label: 'Alertas de preço' },
  { key: 'unusualPurchases', label: 'Compras fora do padrão' },
];

export const DEVICES: {
  id: string;
  name: string;
  detail: string;
  lastSeen: string;
  current: boolean;
  icon: IconName;
}[] = [
  {
    id: 'phone',
    name: 'iPhone 16',
    detail: 'Este aparelho · São Paulo',
    lastSeen: 'Agora',
    current: true,
    icon: 'smartphone',
  },
  {
    id: 'laptop',
    name: 'MacBook Air',
    detail: 'Navegador · São Paulo',
    lastSeen: 'Ontem, 21:40',
    current: false,
    icon: 'laptop',
  },
];
