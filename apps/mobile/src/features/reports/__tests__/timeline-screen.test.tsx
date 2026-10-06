import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReportTimelineScreen } from '../screens';

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
});

describe('Linha do tempo', () => {
  it('summarizes the month and the balance of each day', () => {
    render(<ReportTimelineScreen />);
    expect(screen.getByText(/^R\$.10\.192,79$/)).toBeOnTheScreen();
    expect(screen.getByText(/^\+R\$.8\.200,00$/)).toBeOnTheScreen();
    expect(screen.getByText(/^−R\$.5\.912,47$/)).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '23 SET · QUA' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: '15 A 17 SET' })).toBeOnTheScreen();
    expect(screen.getByText(/^Dias 2 a 4, 6 a 9 e 11 a 14 agrupados/)).toBeOnTheScreen();
  });

  it('opens a lançamento and expands the groups', () => {
    render(<ReportTimelineScreen />);
    fireEvent.press(screen.getByRole('link', { name: /^Loja de eletrônicos online/ }));
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/spending/[transactionId]',
      params: { transactionId: 'tx-eletronicos' },
    });
    fireEvent.press(screen.getByRole('button', { name: 'Mostrar todos os dias' }));
    expect(screen.getByRole('header', { name: '11 A 14 SET' })).toBeOnTheScreen();
    expect(screen.queryByText('Mais 3 lançamentos')).toBeNull();
  });

  it('filters and shows other periods as empty', () => {
    render(<ReportTimelineScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Fora do padrão' }));
    expect(screen.getByRole('header', { name: '23 SET · QUA' })).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: '22 SET · TER' })).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: '3 meses' }));
    expect(screen.getByRole('header', { name: 'Sem esse período ainda' })).toBeOnTheScreen();
  });
});
