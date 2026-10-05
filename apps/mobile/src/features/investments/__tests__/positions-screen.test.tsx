import { act, fireEvent, render, screen, within } from '@testing-library/react-native';

import { toast } from '@/components/feedback';

import { PositionsCard } from '../components';
import { PositionsScreen } from '../screens';
import { useInvestmentsStore } from '../store';

const mockNavigate = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: mockNavigate, back: jest.fn(), canGoBack: () => true }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => useInvestmentsStore.getState().reset());
});

const rowLinks = () => screen.getAllByRole('link', { name: /da carteira, hoje/ });

describe('Posições', () => {
  it('groups the twelve positions by class', () => {
    render(<PositionsScreen />);
    expect(screen.getByText('12 posições · atualizado às 14:30')).toBeOnTheScreen();
    expect(screen.getAllByRole('header').map((item) => item.props.children[0])).toEqual(
      expect.arrayContaining(['Renda fixa', 'Internacional']),
    );
    expect(screen.getByText(' · 6 posições')).toBeOnTheScreen();
    expect(rowLinks()).toHaveLength(12);
    expect(screen.getByText('Petrobras PN · 200 ações')).toBeOnTheScreen();
    expect(
      screen.getByRole('link', { name: /^Tesouro Selic 2029, .*32,9% da carteira, hoje \+0,04%$/ }),
    ).toBeOnTheScreen();
  });

  it('filters by origin and searches', () => {
    render(<PositionsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Open Finance' }));
    expect(rowLinks()).toHaveLength(2);
    fireEvent.press(screen.getByRole('button', { name: 'Todas as origens' }));
    fireEvent.changeText(
      screen.getByLabelText('Buscar por nome ou código (ex.: HGLG11)'),
      'pátria',
    );
    expect(rowLinks()).toHaveLength(1);
    expect(screen.getByRole('link', { name: /^HGLG11/ })).toBeOnTheScreen();
  });

  it('offers to register an asset the search did not find', () => {
    render(<PositionsScreen />);
    fireEvent.changeText(screen.getByLabelText('Buscar por nome ou código (ex.: HGLG11)'), 'itsa4');
    expect(screen.getByRole('header', { name: 'Nenhuma posição com “ITSA4”' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Adicionar ITSA4' }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/new-manual-asset',
      params: { ticker: 'ITSA4' },
    });
  });

  it('sorts and lists without classes', () => {
    render(<PositionsScreen />);
    fireEvent.press(screen.getByRole('tab', { name: 'Lista' }));
    fireEvent.press(screen.getByRole('button', { name: 'Ordenar posições: Maior valor' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Menor valor' }));
    expect(rowLinks()[0]).toHaveProp('accessibilityLabel', expect.stringMatching(/^GOGL34/));
  });

  it('adjusts the risk of a position', () => {
    const success = jest.spyOn(toast, 'success');
    render(<PositionsScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Risco Alto. Ajustar risco de PETR4' }));
    fireEvent.press(screen.getByRole('radio', { name: /^Médio/ }));
    expect(success).toHaveBeenCalledWith('Risco de PETR4 ajustado para médio');
    expect(
      screen.getByRole('button', { name: 'Risco Médio. Ajustar risco de PETR4' }),
    ).toBeOnTheScreen();
  });

  it('opens asset pages and explains the ones still missing', () => {
    const info = jest.spyOn(toast, 'info');
    render(<PositionsScreen />);
    fireEvent.press(screen.getByRole('link', { name: /^PETR4/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/investments/asset/[ticker]',
      params: { ticker: 'PETR4' },
    });
    fireEvent.press(screen.getByRole('link', { name: /^IVVB11/ }));
    expect(info).toHaveBeenCalledWith('A página de IVVB11 chega com as cotações da API.');
  });

  it('keeps the same features on tablets, as a table', () => {
    mockBreakpoint = 'tablet';
    render(<PositionsScreen />);
    expect(screen.getByRole('header', { name: 'Todas as posições' })).toBeOnTheScreen();
    expect(
      screen.getByText(/^12 posições · R\$.48\.310,90 · cotações das 14:30$/),
    ).toBeOnTheScreen();
    const table = screen.getByLabelText('Posições da carteira');
    fireEvent(table, 'layout', { nativeEvent: { layout: { width: 700, height: 900 } } });
    expect(within(table).getByText('% carteira')).toBeOnTheScreen();
    expect(within(table).getAllByRole('link', { name: /da carteira, hoje/ })).toHaveLength(12);
    fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/new-manual-asset');
  });
});

describe('Posições no card de Investimentos', () => {
  it('shows the six biggest, sums the rest and opens the page', () => {
    render(<PositionsCard />);
    expect(screen.getByText('Outras 6 posições')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: /^Ver as 12/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/positions');
  });
});
