import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui/Icon';

/** Conversation opened by "Conversar" (the latest one; static until the API exists). */
export const CURRENT_CONVERSATION_ID = 'gastos-de-setembro';

export interface ConversationOptions {
  /** Question sent as soon as the conversation opens ("Pergunte ao Pacu"). */
  ask?: string;
  /** Assistant addressed by the composer. */
  assistant?: string;
}

export const conversationHref = (
  conversationId = CURRENT_CONVERSATION_ID,
  { ask, assistant }: ConversationOptions = {},
): Href => ({
  pathname: '/chat/[conversationId]',
  params: { conversationId, ...(ask ? { ask } : {}), ...(assistant ? { assistant } : {}) },
});

export type TabKey = 'home' | 'spending' | 'chat' | 'investments' | 'assistants';

export interface Destination<K extends string> {
  key: K;
  label: string;
  icon: IconName;
  href: Href;
}

/** Phone bottom bar. "Conversar" is the highlighted Tucano action in the middle. */
export const TAB_DESTINATIONS: Destination<TabKey>[] = [
  { key: 'home', label: 'Início', icon: 'home', href: '/' },
  { key: 'spending', label: 'Gastos', icon: 'wallet', href: '/spending' },
  { key: 'chat', label: 'Conversar', icon: 'message', href: conversationHref() },
  { key: 'investments', label: 'Investir', icon: 'trendingUp', href: '/investments' },
  { key: 'assistants', label: 'Assistentes', icon: 'users', href: '/assistants' },
];

/** Which bottom-bar item is current for a path (`null`: none, e.g. Alertas). */
export function activeTab(pathname: string): TabKey | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/spending')) return 'spending';
  if (pathname.startsWith('/chat')) return 'chat';
  if (pathname.startsWith('/investments')) return 'investments';
  if (pathname.startsWith('/assistants')) return 'assistants';
  return null;
}

/** Paths where the phone bottom bar is hidden (full-screen conversation). */
export function hidesTabBar(pathname: string): boolean {
  return /^\/chat\/[^/]+/.test(pathname);
}

export type RailKey =
  'home' | 'spending' | 'subscriptions' | 'investments' | 'simulator' | 'reports' | 'alerts';

/** Tablet side rail. */
export const RAIL_DESTINATIONS: Destination<RailKey>[] = [
  { key: 'home', label: 'Início', icon: 'home', href: '/' },
  { key: 'spending', label: 'Gastos', icon: 'wallet', href: '/spending' },
  { key: 'subscriptions', label: 'Assinaturas', icon: 'repeat', href: '/spending/subscriptions' },
  { key: 'investments', label: 'Investir', icon: 'trendingUp', href: '/investments' },
  { key: 'simulator', label: 'Simular', icon: 'sprout', href: '/investments/simulator' },
  { key: 'reports', label: 'Relatórios', icon: 'barChart', href: '/reports' },
  { key: 'alerts', label: 'Alertas', icon: 'bell', href: '/alerts' },
];

export function activeRail(pathname: string): RailKey | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/spending/subscriptions')) return 'subscriptions';
  if (pathname.startsWith('/spending')) return 'spending';
  if (pathname.startsWith('/investments/simulator')) return 'simulator';
  if (pathname.startsWith('/investments') || pathname.startsWith('/new-manual-asset')) {
    return 'investments';
  }
  if (pathname.startsWith('/reports')) return 'reports';
  if (
    pathname.startsWith('/alerts') ||
    pathname.startsWith('/new-budget') ||
    pathname.startsWith('/new-price-alert')
  ) {
    return 'alerts';
  }
  return null;
}

/** Account menu (phone): pages that are not tabs. */
export const ACCOUNT_MENU: (Destination<string> & { badge?: number })[] = [
  { key: 'subscriptions', label: 'Assinaturas', icon: 'repeat', href: '/spending/subscriptions' },
  { key: 'simulator', label: 'Simulador', icon: 'sprout', href: '/investments/simulator' },
  { key: 'reports', label: 'Relatórios', icon: 'barChart', href: '/reports' },
  { key: 'alerts', label: 'Alertas', icon: 'bell', href: '/alerts', badge: 2 },
  { key: 'account', label: 'Meu perfil e configurações', icon: 'user', href: '/account' },
];
