import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import {
  SubscriptionDetailScreen,
  SubscriptionsCalendarScreen,
  SubscriptionsScreen,
} from '../screens';
import { useSubscriptionsStore } from '../store';

const mockNavigate = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: mockBack,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  act(() => useSubscriptionsStore.getState().reset());
});

const text = (pattern: RegExp) => screen.getByText(pattern);

describe('Assinaturas', () => {
  it('sums the subscriptions and opens one', () => {
    render(<SubscriptionsScreen />);
    expect(text(/por ano · 4 assinaturas$/)).toBeOnTheScreen();
    expect(text(/^Você não comprou na Amazon nos últimos 60 dias\./)).toBeOnTheScreen();
    expect(text(/^Subiu de R\$.39,90$/)).toBeOnTheScreen();
    expect(text(/^Próxima cobrança em 08 out$/)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: 'Netflix' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/spending/subscriptions/[subscriptionId]',
      params: { subscriptionId: 'netflix' },
    });
    fireEvent.press(screen.getByRole('link', { name: 'Cobranças de outubro' }));
    expect(mockNavigate).toHaveBeenCalledWith('/spending/subscriptions/calendar');
  });

  it('takes a charge out of the list', () => {
    const success = jest.spyOn(toast, 'success');
    render(<SubscriptionsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'iCloud+ não é assinatura' }));
    fireEvent.press(screen.getByRole('button', { name: 'Remover da lista' }));
    expect(success).toHaveBeenCalledWith('iCloud+ saiu das assinaturas');
    expect(text(/por ano · 3 assinaturas$/)).toBeOnTheScreen();
  });
});

describe('Netflix', () => {
  it('shows the price increase, the charges and how to cancel', () => {
    mockParams = { subscriptionId: 'netflix' };
    render(<SubscriptionDetailScreen />);
    expect(text(/^Streaming · Nubank crédito · todo dia 8$/)).toBeOnTheScreen();
    expect(text(/^Subiu R\$.5,00$/)).toBeOnTheScreen();
    expect(text(/^a partir de outubro$/)).toBeOnTheScreen();
    expect(text(/^08\/10\/2026$/)).toBeOnTheScreen();
    expect(text(/^R\$.538,80$/)).toBeOnTheScreen();
    expect(
      text(/por mês \(\+12,5%\)\. A primeira cobrança com o preço novo é a de 08\/10\/2026\.$/),
    ).toBeOnTheScreen();
    expect(text(/^No ano, são R\$.60,00 a mais do que você pagava\.$/)).toBeOnTheScreen();
    expect(
      text(/^Com o aumento, as 4 assinaturas passam a somar R\$.101,60 por mês\./),
    ).toBeOnTheScreen();
    expect(text(/^Últimos 6 meses · R\$.239,40$/)).toBeOnTheScreen();
    expect(screen.getAllByText('Cobrança mensal')).toHaveLength(4);
    expect(text(/Não dá para saber pelo banco se você tem assistido\.$/)).toBeOnTheScreen();
    expect(text(/^1\. Abra o app ou o site da Netflix e entre na sua conta\.$/)).toBeOnTheScreen();
    expect(text(/^3\. Cancele antes de 08\/10 para não pagar outubro\.$/)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Simular corte' }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/simulator/cut-expense');
  });

  it('removes it from the subscriptions', () => {
    mockParams = { subscriptionId: 'netflix' };
    render(<SubscriptionDetailScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Não é assinatura' }));
    fireEvent.press(screen.getByRole('button', { name: 'Remover da lista' }));
    expect(mockBack).toHaveBeenCalled();
    expect(useSubscriptionsStore.getState().items.map((item) => item.id)).not.toContain('netflix');
  });
});

describe('Calendário de cobranças', () => {
  it('shows the month of the next charges and moves between months', () => {
    render(<SubscriptionsCalendarScreen />);
    expect(screen.getByRole('header', { name: 'Outubro de 2026' })).toBeOnTheScreen();
    expect(screen.getByLabelText('8 de outubro: Netflix, R$ 44,90')).toBeOnTheScreen();
    expect(text(/^4 assinaturas · R\$.101,60$/)).toBeOnTheScreen();
    expect(text(/^Hoje é 23\/09\./)).toBeOnTheScreen();
    expect(text(/^Todas vencem até o dia 15: R\$.66,80 até o dia 8/)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Setembro' }));
    expect(screen.getByRole('header', { name: 'Setembro de 2026' })).toBeOnTheScreen();
    expect(screen.getByLabelText('8 de setembro: Netflix, R$ 39,90')).toBeOnTheScreen();
  });
});
