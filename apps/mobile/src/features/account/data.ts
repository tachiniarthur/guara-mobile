import type { IconName } from '@/components/ui/Icon';
import type { NoticeKind } from '@/stores/ui-preferences';

export { CURRENT_USER } from '@/constants/current-user';

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
