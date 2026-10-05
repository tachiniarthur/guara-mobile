import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import {
  CategoryTransactionsScreen,
  TransactionDetailScreen,
  TransactionsScreen,
} from '../screens';
import { useSpendingStore } from '../store';

const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockBreakpoint = 'phone';
  act(() => useSpendingStore.getState().reset());
});

describe('Todos os lançamentos', () => {
  it('shows the month by day with the totals of the design', () => {
    render(<TransactionsScreen />);
    expect(screen.getByRole('header', { name: 'Lançamentos' })).toBeOnTheScreen();
    expect(screen.getByText('118 lançamentos em setembro · Nubank e Itaú')).toBeOnTheScreen();
    expect(screen.getByText('R$ 8.200,00')).toBeOnTheScreen();
    expect(screen.getByText('R$ 5.912,47')).toBeOnTheScreen();
    expect(screen.getByText('HOJE · 23 DE SETEMBRO')).toBeOnTheScreen();
    expect(screen.getByText('−R$ 1.259,40')).toBeOnTheScreen();
    expect(screen.getByText('+R$ 907,70')).toBeOnTheScreen();
    expect(screen.getByText('02:14 · Nubank crédito · Eletrônicos')).toBeOnTheScreen();
    expect(screen.getByLabelText('Fora do padrão')).toBeOnTheScreen();
    // Older days come with "Carregar dias anteriores".
    expect(screen.queryByText('Mercado do mês')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Carregar dias anteriores' }));
    expect(screen.getByText('Mercado do mês')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Carregar dias anteriores' })).toBeNull();
  });

  it('filters by text and bank and explains an empty result', () => {
    render(<TransactionsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar lançamento'), 'japones');
    expect(screen.getByText('Delivery japonês')).toBeOnTheScreen();
    expect(screen.queryByText('Hamburgueria')).toBeNull();
    // Figures of a filtered list are not in the design: "—".
    expect(screen.getAllByLabelText('sem informação')).toHaveLength(2);

    fireEvent.changeText(screen.getByLabelText('Buscar lançamento'), 'academia');
    fireEvent.press(screen.getByRole('button', { name: 'Nubank' }));
    expect(screen.getByRole('header', { name: 'Nada encontrado' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Nenhum lançamento com “academia” no Nubank em setembro. Tente outro período ou todos os bancos.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByText('Loja de eletrônicos online')).toBeOnTheScreen();
  });

  it('opens a category from the route and a transaction from the list', () => {
    mockParams = { categoryId: 'food' };
    render(<TransactionsScreen />);
    expect(screen.getByRole('button', { name: 'Categoria: Alimentação' })).toBeOnTheScreen();
    expect(screen.queryByText('Loja de eletrônicos online')).toBeNull();
    fireEvent.press(screen.getByText('Café da esquina'));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/spending/[transactionId]',
      params: { transactionId: 'tx-cafe' },
    });
  });

  it('keeps the same features on tablets', () => {
    mockBreakpoint = 'tablet';
    render(<TransactionsScreen />);
    expect(screen.getByRole('header', { name: 'Todos os lançamentos' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Exportar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/export-report');
    expect(screen.getByLabelText('Buscar lançamento')).toBeOnTheScreen();
  });
});

describe('Lançamentos de uma categoria', () => {
  it('shows the month, the cap and the Tamanduá reading of Alimentação', () => {
    mockParams = { categoryId: 'food' };
    render(<CategoryTransactionsScreen />);
    expect(screen.getByRole('header', { name: 'Alimentação' })).toBeOnTheScreen();
    expect(screen.getByText('Alimentação em setembro · 31 lançamentos')).toBeOnTheScreen();
    expect(screen.getByText('R$ 742,18')).toBeOnTheScreen();
    expect(screen.getByText('74% · atenção')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Avisos de R$ 500 e R$ 700 já enviados · no ritmo atual, fecha perto de R$ 960',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Tamanduá: Restaurantes e delivery/)).toBeOnTheScreen();
    expect(screen.getByText('Restaurantes e delivery')).toBeOnTheScreen();
    expect(screen.getByText('08:40 · Nubank crédito')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Ver os 31 lançamentos' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/spending/transactions',
      params: { categoryId: 'food' },
    });
    fireEvent.press(screen.getByRole('button', { name: 'Editar teto de Alimentação' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/new-budget',
      params: { categoryId: 'food' },
    });
  });

  it('searches inside the category', () => {
    mockParams = { categoryId: 'food' };
    render(<CategoryTransactionsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar em Alimentação'), 'pizza');
    expect(screen.getByText('Delivery de pizza')).toBeOnTheScreen();
    expect(screen.queryByText('Padaria Central')).toBeNull();
  });

  it('shows "—" for a category without month figures', () => {
    mockParams = { categoryId: 'leisure' };
    render(<CategoryTransactionsScreen />);
    expect(screen.getByText('Lazer em setembro')).toBeOnTheScreen();
    expect(screen.getByLabelText('sem informação')).toBeOnTheScreen();
    expect(screen.getByText('Cine Max')).toBeOnTheScreen();
  });
});

describe('Detalhe do lançamento', () => {
  it('shows the fields of the purchase and asks the Quero-quero question', () => {
    const success = jest.spyOn(toast, 'success');
    mockParams = { transactionId: 'tx-eletronicos' };
    render(<TransactionDetailScreen />);
    expect(screen.getByText('−R$ 1.249,90')).toBeOnTheScreen();
    expect(screen.getByLabelText('Fatura: Outubro · vence em 10/10')).toBeOnTheScreen();
    expect(screen.getByLabelText('Descrição no banco: LOJAELETRON*ONLINE SP')).toBeOnTheScreen();
    expect(
      screen.getByText('Compra às 02:14, bem acima do seu costume em eletrônicos. Foi você?'),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('Esta compra não entra em nenhum teto. Você não tem teto para Eletrônicos.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Fui eu' }));
    expect(success).toHaveBeenCalledWith('Obrigado! O Quero-quero vai lembrar disso.');
    expect(screen.queryByRole('button', { name: 'Fui eu' })).toBeNull();
    expect(screen.queryByLabelText('Fora do padrão')).toBeNull();
  });

  it('recategorises for the store and updates the cap of the category', () => {
    mockParams = { transactionId: 'tx-app' };
    render(<TransactionDetailScreen />);
    expect(
      screen.getByText(
        'Esta compra entra no teto de Transporte: R$ 386 de R$ 450 (86% · apertado).',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', { name: /Usar “Transporte” para esta loja/ }),
    ).toBeChecked();
    fireEvent.press(screen.getByRole('button', { name: 'Lazer' }));
    expect(screen.getByRole('button', { name: 'Lazer' })).toBeSelected();
    expect(
      screen.getByText('Esta compra não entra em nenhum teto. Você não tem teto para Lazer.'),
    ).toBeOnTheScreen();
    // Every "Transporte por app" left the cap: 386,40 − 97,40.
    const budget = useSpendingStore.getState().edits.merchantRules['transporte por app'];
    expect(budget).toBe('leisure');
  });

  it('marks as duplicate after confirming and keeps a note', () => {
    mockParams = { transactionId: 'tx-cafe' };
    render(<TransactionDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Marcar como duplicado' }));
    fireEvent.press(screen.getByRole('button', { name: 'Marcar' }));
    expect(screen.getByLabelText('Duplicado')).toBeOnTheScreen();
    expect(
      screen.getByText('Marcado como duplicado: não entra nos totais nem nos tetos.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Adicionar observação' }));
    fireEvent.changeText(screen.getByLabelText('Observação'), 'Café com a equipe');
    fireEvent.press(screen.getByRole('button', { name: 'Salvar observação' }));
    expect(screen.getByLabelText('Observação: Café com a equipe')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Esconder dos relatórios' }));
    expect(screen.getByRole('button', { name: 'Mostrar nos relatórios' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Não é assinatura' }));
    expect(screen.getByRole('button', { name: 'Não é assinatura' })).toBeDisabled();
  });

  it('a purchase not recognised is reported after confirming', () => {
    mockParams = { transactionId: 'tx-eletronicos' };
    render(<TransactionDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Não reconheço' }));
    expect(screen.getByText('Não reconhece esta compra?')).toBeOnTheScreen();
    // The dialog's confirm button is the last "Não reconheço" on the screen.
    fireEvent.press(screen.getAllByRole('button', { name: 'Não reconheço' }).at(-1)!);
    expect(screen.getByText(/Compra marcada como não reconhecida/)).toBeOnTheScreen();
  });

  it('the list reflects the edits (duplicate leaves the day total)', () => {
    act(() => useSpendingStore.getState().setDuplicate('tx-cafe', true));
    render(<TransactionsScreen />);
    // Day total = only the electronics purchase, same as its row.
    expect(screen.getAllByText('−R$ 1.249,90')).toHaveLength(2);
    expect(screen.getByText('R$ 5.902,97')).toBeOnTheScreen();
  });

  it('shows a friendly state for an unknown transaction', () => {
    mockParams = { transactionId: 'nao-existe' };
    render(<TransactionDetailScreen />);
    expect(screen.getByRole('header', { name: 'Lançamento não encontrado' })).toBeOnTheScreen();
  });
});
