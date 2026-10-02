/**
 * First segment of every query key, one per data domain. Feature key factories
 * (`src/features/<x>/api/keys.ts`) build on these; mutations invalidate other domains through
 * them, so features never import each other's internals.
 */
export const QUERY_ROOTS = {
  me: 'me',
  plan: 'plan',
  notificationPreferences: 'notification-preferences',
  investorProfile: 'investor-profile',
  bankConnections: 'bank-connections',
  accounts: 'accounts',
  categories: 'categories',
  transactions: 'transactions',
  unusual: 'unusual',
  subscriptions: 'subscriptions',
  budgets: 'budgets',
  dashboard: 'dashboard',
  reports: 'reports',
  wealth: 'wealth',
  positions: 'positions',
  allocation: 'allocation',
  exposure: 'exposure',
  duplicates: 'duplicates',
  assets: 'assets',
  properties: 'properties',
  priceAlerts: 'price-alerts',
  simulations: 'simulations',
  goals: 'goals',
  chat: 'chat',
  notifications: 'notifications',
} as const;

export type QueryRoot = (typeof QUERY_ROOTS)[keyof typeof QUERY_ROOTS];
