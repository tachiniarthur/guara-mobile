/**
 * The standard states of the main screens (Fundamentos · Estados): loading, connection error
 * with retry, offline with the last update, and the empty states.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { AlertsScreen } from '@/features/alerts';
import { DashboardScreen } from '@/features/dashboard';
import { GoalDetailScreen } from '@/features/goals';
import { AssetDetailScreen, InvestmentsScreen } from '@/features/investments';
import { NotificationsScreen } from '@/features/notifications';
import { ReportsScreen } from '@/features/reports';
import { SpendingScreen, TransactionDetailScreen } from '@/features/spending';
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

const SCREENS: [
  name: string,
  element: () => ReactElement,
  error: string,
  params?: Record<string, string>,
][] = [
  ['Início', () => <DashboardScreen />, 'Não deu para carregar o seu resumo'],
  ['Gastos', () => <SpendingScreen />, 'Não deu para carregar seus gastos'],
  ['Investimentos', () => <InvestmentsScreen />, 'Não deu para carregar seus investimentos'],
  [
    'Ativo',
    () => <AssetDetailScreen />,
    'Não deu para carregar os dados do PETR4',
    { ticker: 'PETR4' },
  ],
  ['Relatório', () => <ReportsScreen />, 'Não deu para carregar o relatório'],
  ['Alertas', () => <AlertsScreen />, 'Não deu para carregar seus alertas'],
  ['Assinaturas', () => <SubscriptionsScreen />, 'Não deu para carregar suas assinaturas'],
  ['Notificações', () => <NotificationsScreen />, 'Não deu para carregar suas notificações'],
  ['Meta', () => <GoalDetailScreen />, 'Não deu para carregar a meta', { goalId: 'reserva' }],
  [
    'Lançamento',
    () => <TransactionDetailScreen />,
    'Não deu para carregar o lançamento',
    { transactionId: 'tx-eletronicos' },
  ],
];

afterEach(() => {
  mockOnline = true;
  act(() => useScreenPreview.getState().setPreview('auto'));
});

describe.each(SCREENS)('%s', (_name, element, error, params = {}) => {
  beforeEach(() => {
    mockParams = params;
  });

  it('shows loading', () => {
    act(() => useScreenPreview.getState().setPreview('loading'));
    render(element());
    expect(screen.getByText('Carregando…')).toBeOnTheScreen();
  });

  it('shows the connection error and goes back on retry', () => {
    act(() => useScreenPreview.getState().setPreview('error'));
    render(element());
    expect(screen.getByText(error)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(screen.queryByText(error)).toBeNull();
  });

  it('keeps the last data while offline', () => {
    mockOnline = false;
    render(element());
    expect(
      screen.getByText(/Mostrando os dados da última atualização, 23\/09, 14:30\./),
    ).toBeOnTheScreen();
  });
});

describe('empty states', () => {
  it('Ativo without a position', () => {
    mockParams = { ticker: 'PETR4' };
    act(() => useScreenPreview.getState().setPreview('empty'));
    render(<AssetDetailScreen />);
    expect(screen.getByText('Você ainda não tem PETR4')).toBeOnTheScreen();
  });

  it('Meta without deposits', () => {
    mockParams = { goalId: 'aposentadoria' };
    render(<GoalDetailScreen />);
    expect(screen.getByText('Aposentadoria ainda sem depósitos')).toBeOnTheScreen();
  });

  it('Alertas by filter', () => {
    render(<AlertsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Pausados' }));
    expect(screen.getByText('Nenhum alerta pausado')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.queryByText('Nenhum alerta pausado')).toBeNull();
  });

  it('Assinaturas by search', () => {
    render(<SubscriptionsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar assinatura'), 'Disney');
    expect(screen.getByText('Nenhuma assinatura com “Disney”')).toBeOnTheScreen();
    expect(
      screen.getByText('Suas 4 assinaturas são Spotify, Netflix, Amazon Prime e iCloud+.'),
    ).toBeOnTheScreen();
  });

  it('Relatório without movements', () => {
    act(() => useScreenPreview.getState().setPreview('empty'));
    render(<ReportsScreen />);
    expect(screen.getByText('Sem movimentos no período')).toBeOnTheScreen();
  });
});
