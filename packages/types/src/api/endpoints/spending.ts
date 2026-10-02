import { z } from 'zod';

import {
  BudgetDetailSchema,
  BudgetIdSchema,
  BudgetListSchema,
  BudgetPreviewQuerySchema,
  BudgetPreviewSchema,
  BudgetSchema,
  CategorySchema,
  CorrectCategoryBodySchema,
  CreateBudgetBodySchema,
  SubscriptionCalendarSchema,
  SubscriptionIdSchema,
  SubscriptionListSchema,
  SubscriptionSchema,
  TransactionIdSchema,
  TransactionListQuerySchema,
  TransactionSchema,
  UnusualStatusSchema,
  UnusualTransactionSchema,
  UpdateBudgetBodySchema,
  YearMonthSchema,
  paginated,
} from '../../domain';
import { NoContentSchema, defineEndpoints } from '../define';

const transactionParams = z.object({ transactionId: TransactionIdSchema });
const subscriptionParams = z.object({ subscriptionId: SubscriptionIdSchema });
const budgetParams = z.object({ budgetId: BudgetIdSchema });
/** Omit `month` to get the current month (São Paulo). */
const monthQuery = z.object({ month: YearMonthSchema.optional() });

/** Transactions, categories, unusual purchases, subscriptions and spending caps. */
export const spendingEndpoints = defineEndpoints({
  'categories.list': {
    method: 'GET',
    path: '/v1/categories',
    summary: 'Fixed list of categories',
    response: z.array(CategorySchema),
  },
  'transactions.list': {
    method: 'GET',
    path: '/v1/transactions',
    summary: 'Transactions, newest first (cursor pagination)',
    query: TransactionListQuerySchema,
    response: paginated(TransactionSchema),
  },
  'transactions.get': {
    method: 'GET',
    path: '/v1/transactions/:transactionId',
    summary: 'One transaction',
    params: transactionParams,
    response: TransactionSchema,
  },
  'transactions.correctCategory': {
    method: 'PATCH',
    path: '/v1/transactions/:transactionId/category',
    summary: 'Set the category chosen by the user',
    params: transactionParams,
    body: CorrectCategoryBodySchema,
    response: TransactionSchema,
  },
  'unusual.list': {
    method: 'GET',
    path: '/v1/unusual-transactions',
    summary: 'Purchases out of the usual pattern, newest first',
    query: z.object({ status: UnusualStatusSchema.optional() }),
    response: z.array(UnusualTransactionSchema),
  },
  'unusual.acknowledge': {
    method: 'POST',
    path: '/v1/unusual-transactions/:transactionId/acknowledge',
    summary: 'The user confirms the purchase was theirs',
    params: transactionParams,
    response: UnusualTransactionSchema,
  },
  'subscriptions.list': {
    method: 'GET',
    path: '/v1/subscriptions',
    summary: 'Detected subscriptions and their monthly total',
    response: SubscriptionListSchema,
  },
  'subscriptions.calendar': {
    method: 'GET',
    path: '/v1/subscriptions/calendar',
    summary: 'Expected charges of a month (register before /:subscriptionId in NestJS)',
    query: monthQuery,
    response: SubscriptionCalendarSchema,
  },
  'subscriptions.get': {
    method: 'GET',
    path: '/v1/subscriptions/:subscriptionId',
    summary: 'One subscription',
    params: subscriptionParams,
    response: SubscriptionSchema,
  },
  'subscriptions.markNotSubscription': {
    method: 'POST',
    path: '/v1/subscriptions/:subscriptionId/not-subscription',
    summary: 'Mark a recurring charge as "not a subscription"',
    params: subscriptionParams,
    response: SubscriptionSchema,
  },
  'budgets.list': {
    method: 'GET',
    path: '/v1/budgets',
    summary: 'Spending caps with the spending of a month',
    query: monthQuery,
    response: BudgetListSchema,
  },
  'budgets.preview': {
    method: 'GET',
    path: '/v1/budgets/preview',
    summary: 'History of a category before creating a cap (register before /:budgetId)',
    query: BudgetPreviewQuerySchema,
    response: BudgetPreviewSchema,
  },
  'budgets.get': {
    method: 'GET',
    path: '/v1/budgets/:budgetId',
    summary: 'One cap with its monthly history',
    params: budgetParams,
    query: monthQuery,
    response: BudgetDetailSchema,
  },
  'budgets.create': {
    method: 'POST',
    path: '/v1/budgets',
    summary: 'Create a cap (one per category)',
    body: CreateBudgetBodySchema,
    response: BudgetSchema,
  },
  'budgets.update': {
    method: 'PATCH',
    path: '/v1/budgets/:budgetId',
    summary: 'Change the cap or its warnings',
    params: budgetParams,
    body: UpdateBudgetBodySchema,
    response: BudgetSchema,
  },
  'budgets.delete': {
    method: 'DELETE',
    path: '/v1/budgets/:budgetId',
    summary: 'Delete a cap',
    params: budgetParams,
    response: NoContentSchema,
  },
});
