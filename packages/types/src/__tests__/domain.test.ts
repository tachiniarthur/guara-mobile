import {
  BudgetChannelsSchema,
  BudgetWarningsSchema,
  ChatStreamEventSchema,
  InvestorProfileAnswersSchema,
  PropertySchema,
  ResolveDuplicateBodySchema,
  RunSimulationBodySchema,
  TransactionSchema,
} from '../index';

const transaction = {
  id: 'tx_1',
  accountId: 'acc_1',
  amount: 4590,
  currency: 'BRL',
  direction: 'out',
  type: 'pix',
  source: 'open_finance',
  date: '2026-09-20',
  occurredAt: '2026-09-20T15:30:00.000Z',
  description: 'PIX ENVIADO PADARIA',
  merchantName: 'Padaria Trigo Dourado',
  autoCategoryId: 'food',
  userCategoryId: null,
  categoryId: 'food',
  subcategoryId: 'bakery',
  installment: null,
  invoice: null,
  isUnusual: false,
  markedDuplicate: false,
  hiddenFromReports: false,
  note: null,
  createdAt: '2026-09-20T15:31:00.000Z',
  updatedAt: '2026-09-20T15:31:00.000Z',
};

describe('domain schemas', () => {
  it('transactions are positive with a direction and an effective category', () => {
    expect(TransactionSchema.safeParse(transaction).success).toBe(true);
    expect(TransactionSchema.safeParse({ ...transaction, amount: -4590 }).success).toBe(false);
    expect(TransactionSchema.safeParse({ ...transaction, amount: 45.9 }).success).toBe(false);
    // The user correction wins over the automatic category.
    expect(TransactionSchema.safeParse({ ...transaction, userCategoryId: 'leisure' }).success).toBe(
      false,
    );
    expect(
      TransactionSchema.safeParse({
        ...transaction,
        userCategoryId: 'leisure',
        categoryId: 'leisure',
        subcategoryId: null,
      }).success,
    ).toBe(true);
  });

  it('the subcategory belongs to the effective category', () => {
    expect(
      TransactionSchema.safeParse({
        ...transaction,
        userCategoryId: 'leisure',
        categoryId: 'leisure',
      }).success,
    ).toBe(false);
    expect(
      TransactionSchema.safeParse({ ...transaction, subcategoryId: 'groceries' }).success,
    ).toBe(true);
  });

  it('budget warnings are ascending amounts and channels do not repeat', () => {
    expect(BudgetWarningsSchema.safeParse([50_000, 70_000]).success).toBe(true);
    expect(BudgetWarningsSchema.safeParse([70_000, 50_000]).success).toBe(false);
    expect(BudgetWarningsSchema.safeParse([0]).success).toBe(false);
    expect(BudgetChannelsSchema.safeParse(['push', 'email']).success).toBe(true);
    expect(BudgetChannelsSchema.safeParse([]).success).toBe(false);
    expect(BudgetChannelsSchema.safeParse(['push', 'push']).success).toBe(false);
  });

  it('the investor questionnaire has six distinct answers', () => {
    const answers = [
      'objective',
      'horizon',
      'experience',
      'loss_tolerance',
      'income_share',
      'liquidity_needs',
    ].map((questionId) => ({ questionId, optionId: 'b' }));
    expect(InvestorProfileAnswersSchema.safeParse(answers).success).toBe(true);
    expect(InvestorProfileAnswersSchema.safeParse(answers.slice(1)).success).toBe(false);
    expect(InvestorProfileAnswersSchema.safeParse([...answers.slice(1), answers[1]]).success).toBe(
      false,
    );
  });

  it('delete_one requires the position to delete', () => {
    expect(ResolveDuplicateBodySchema.safeParse({ resolution: 'sum' }).success).toBe(true);
    expect(ResolveDuplicateBodySchema.safeParse({ resolution: 'delete_one' }).success).toBe(false);
    expect(
      ResolveDuplicateBodySchema.safeParse({ resolution: 'delete_one', deletePositionId: 'pos_1' })
        .success,
    ).toBe(true);
  });

  it('simulation inputs depend on the mode', () => {
    expect(
      RunSimulationBodySchema.safeParse({
        mode: 'cut_expense',
        inputs: { categoryId: 'food', monthlyCut: 30000, months: 24, annualReturn: 4 },
      }).success,
    ).toBe(true);
    expect(
      RunSimulationBodySchema.safeParse({
        mode: 'retirement',
        inputs: { categoryId: 'food', monthlyCut: 30000, months: 24, annualReturn: 4 },
      }).success,
    ).toBe(false);
  });

  it('properties are discriminated by kind', () => {
    const base = { id: 'prop_1', name: 'Carro', createdAt: transaction.createdAt };
    const vehicle = {
      ...base,
      kind: 'vehicle',
      fipeCode: '005340-6',
      fipeValue: 7850000,
      fipeReferenceMonth: '2026-09',
      modelYear: 2021,
      outstandingDebt: null,
      updatedAt: transaction.updatedAt,
    };
    expect(PropertySchema.safeParse(vehicle).success).toBe(true);
    expect(PropertySchema.safeParse({ ...vehicle, fipeCode: '5340' }).success).toBe(false);
  });

  it('chat stream events', () => {
    expect(ChatStreamEventSchema.safeParse({ type: 'delta', text: 'Olá' }).success).toBe(true);
    expect(
      ChatStreamEventSchema.safeParse({
        type: 'card',
        block: {
          type: 'budget_bar',
          budgetId: null,
          categoryId: 'food',
          limit: 100000,
          spent: 5000,
        },
      }).success,
    ).toBe(true);
    expect(
      ChatStreamEventSchema.safeParse({ type: 'card', block: { type: 'text', text: 'x' } }).success,
    ).toBe(false);
  });
});
