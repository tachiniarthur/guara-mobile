import type { IconName } from '@/components/ui/Icon';
import type { NoticeKind } from '@/stores/ui-preferences';

/** Signed-in user as shown in the design (static until the API exists). */
export const CURRENT_USER = {
  name: 'Arthur',
  initials: 'AR',
  email: 'arthur@exemplo.com',
  banksAllowed: 3,
} as const;

export const INVESTOR_PROFILE = {
  name: 'Moderado',
  answered: 'Respondido em 23 set 2026 · vale só para Investimentos',
} as const;

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
