import type { Href } from 'expo-router';

/** Named routes. Group segments like (app) or (tabs) do not appear in URLs. */
export const ROUTES = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  onboarding: {
    connectBanks: '/connect-banks',
    investorProfile: '/investor-profile',
    assistants: '/assistants',
  },
  dashboard: '/',
  spending: '/spending',
  subscriptions: '/spending/subscriptions',
  subscriptionsCalendar: '/spending/subscriptions/calendar',
  investments: '/investments',
  positions: '/investments/positions',
  allocation: '/investments/allocation',
  exposure: '/investments/exposure',
  properties: '/investments/properties',
  chat: '/chat',
  more: '/more',
  budgets: '/budgets',
  reports: '/reports',
  priceAlerts: '/price-alerts',
  simulator: '/simulator',
  goals: '/goals',
  notifications: '/notifications',
  account: '/account',
  banks: '/account/banks',
  modals: {
    connectBank: '/connect-bank',
    newBudget: '/new-budget',
    newPriceAlert: '/new-price-alert',
    newManualAsset: '/new-manual-asset',
    newProperty: '/new-property',
    newVehicle: '/new-vehicle',
    newGoal: '/new-goal',
    exportReport: '/export-report',
  },
} as const;

export const routeTo = {
  transaction: (transactionId: string): Href => ({
    pathname: '/spending/[transactionId]',
    params: { transactionId },
  }),
  asset: (ticker: string): Href => ({
    pathname: '/investments/asset/[ticker]',
    params: { ticker },
  }),
  conversation: (conversationId: string): Href => ({
    pathname: '/chat/[conversationId]',
    params: { conversationId },
  }),
  budget: (budgetId: string): Href => ({ pathname: '/budgets/[budgetId]', params: { budgetId } }),
  goal: (goalId: string): Href => ({ pathname: '/goals/[goalId]', params: { goalId } }),
};
