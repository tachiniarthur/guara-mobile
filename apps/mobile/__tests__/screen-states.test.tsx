/**
 * The standard states of the main screens ("Guará · Estados das telas"): each state is a
 * variation of the screen itself — blocks while loading, the error in each container with a
 * red notification, the last data with a yellow one while offline, and "—" or the next step
 * when empty.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { AlertsScreen } from '@/features/alerts';
import { DashboardScreen } from '@/features/dashboard';
import { GoalDetailScreen, GoalsScreen } from '@/features/goals';
import { AssetDetailScreen, InvestmentsScreen, PositionsScreen } from '@/features/investments';
import { NotificationsScreen } from '@/features/notifications';
import { ReportsScreen } from '@/features/reports';
import { SavedSimulationsScreen } from '@/features/simulator';
import { SpendingScreen, TransactionDetailScreen, TransactionsScreen } from '@/features/spending';
import { SubscriptionsScreen } from '@/features/subscriptions';
import { useScreenPreview } from '@/stores/screen-preview';

let mockParams: Record<string, string> = {};
let mockOnline = true;

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => mockParams,
  usePathname: () => '/',
}));

jest.mock('@/hooks/useOnline', () => ({ useOnline: () => mockOnline }));

const SCREENS: [name: string, element: () => ReactElement, params?: Record<string, string>][] = [
  ['Início', () => <DashboardScreen />],
  ['Gastos', () => <SpendingScreen />],
  ['Investimentos', () => <InvestmentsScreen />],
  ['Ativo', () => <AssetDetailScreen />, { ticker: 'PETR4' }],
  ['Relatório', () => <ReportsScreen />],
  ['Alertas', () => <AlertsScreen />],
  ['Assinaturas', () => <SubscriptionsScreen />],
  ['Notificações', () => <NotificationsScreen />],
  ['Meta', () => <GoalDetailScreen />, { goalId: 'reserva' }],
  ['Lançamento', () => <TransactionDetailScreen />, { transactionId: 'tx-eletronicos' }],
  ['Lançamentos', () => <TransactionsScreen />],
  ['Metas', () => <GoalsScreen />],
  ['Posições', () => <PositionsScreen />],
  ['Simulações', () => <SavedSimulationsScreen />],
];

afterEach(() => {
  mockOnline = true;
  act(() => useScreenPreview.getState().setPreview('auto'));
});

describe.each(SCREENS)('%s', (_name, element, params = {}) => {
  beforeEach(() => {
    mockParams = params;
  });

  it('draws the layout as blocks while loading', () => {
    act(() => useScreenPreview.getState().setPreview('loading'));
    render(element());
    expect(screen.getByText('Carregando…')).toBeOnTheScreen();
  });

  it('shows the error in each container and goes back on retry', () => {
    act(() => useScreenPreview.getState().setPreview('error'));
    render(element());
    expect(screen.getByText('Não deu para atualizar agora')).toBeOnTheScreen();
    expect(screen.getAllByText('Não deu para carregar').length).toBeGreaterThan(0);
    fireEvent.press(screen.getAllByRole('button', { name: 'Tentar de novo' })[0]!);
    expect(screen.queryByText('Não deu para atualizar agora')).toBeNull();
    expect(screen.queryByText('Não deu para carregar')).toBeNull();
  });

  it('keeps the last data while offline', () => {
    mockOnline = false;
    render(element());
    expect(screen.getByText('Sem internet')).toBeOnTheScreen();
    expect(
      screen.getByText('Mostrando os dados de 23/09, 14:30. Atualizamos quando a conexão voltar.'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByText('Sem internet')).toBeNull();
  });

  it('shows the empty state of the screen', () => {
    act(() => useScreenPreview.getState().setPreview('empty'));
    render(element());
    expect(screen.queryByText('Não deu para carregar')).toBeNull();
    expect(screen.getAllByRole('header').length).toBeGreaterThan(0);
  });
});

describe('empty states', () => {
  beforeEach(() => act(() => useScreenPreview.getState().setPreview('empty')));

  it('Início: "—" in each card and the bank to connect', () => {
    render(<DashboardScreen />);
    expect(screen.getByText('Nenhum banco conectado')).toBeOnTheScreen();
    expect(screen.getAllByText('Aparece aqui quando houver dados.').length).toBeGreaterThan(1);
  });

  it('Ativo without data from Brapi', () => {
    mockParams = { ticker: 'PETR4' };
    render(<AssetDetailScreen />);
    expect(screen.getByText('Sem dados deste ativo')).toBeOnTheScreen();
    // Static information about the company stays.
    expect(screen.getByText('Sobre a empresa')).toBeOnTheScreen();
  });

  it('Lists show one message in place of the list', () => {
    render(<SavedSimulationsScreen />);
    expect(screen.getByText('Nenhuma simulação salva')).toBeOnTheScreen();
    expect(screen.queryByRole('link', { name: /Salva em/ })).toBeNull();
  });
});

describe('real empty and filtered states', () => {
  it('Meta without deposits', () => {
    mockParams = { goalId: 'aposentadoria' };
    render(<GoalDetailScreen />);
    expect(screen.getByText('Ainda sem depósitos')).toBeOnTheScreen();
  });

  it('Alertas by filter', () => {
    render(<AlertsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Pausados' }));
    expect(screen.getByText('Nada com esse filtro')).toBeOnTheScreen();
    expect(
      screen.getByText('Nenhum alerta de preço pausado. Todos os seus estão ativos.'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.queryByText('Nada com esse filtro')).toBeNull();
  });

  it('Assinaturas by search', () => {
    render(<SubscriptionsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar assinatura'), 'Disney');
    expect(
      screen.getByText(
        'Nenhuma assinatura com “Disney”. As suas são Spotify, Netflix, Amazon Prime e iCloud+.',
      ),
    ).toBeOnTheScreen();
  });
});
