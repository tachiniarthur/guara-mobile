import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { SAVED_PROFILE } from '@/features/investor-profile/data';
import { useInvestorProfileStore } from '@/features/investor-profile/store';

import { AllocationCard } from '../components';
import { AllocationProfilesScreen, AllocationScreen } from '../screens';

const mockNavigate = jest.fn();
let mockBreakpoint: 'phone' | 'tablet' = 'phone';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({
    navigate: mockNavigate,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockBreakpoint = 'phone';
  act(() => useInvestorProfileStore.getState().reset());
});

const text = (pattern: RegExp) => screen.getByText(pattern);

describe('Card de alocação', () => {
  it('compares the portfolio with the profile in the 5 groups', () => {
    render(<AllocationCard />);
    expect(text(/^Sua carteira comparada ao perfil Moderado, em 5 grupos$/)).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Renda variável Brasil: alvo 19%, atual 36,2%, +17,2 p.p.'),
    ).toBeOnTheScreen();
    expect(
      text(/A maior diferença é Renda variável Brasil, 17,2 p\.p\. acima\./),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('link', { name: 'Ver alocação completa' }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/allocation');
  });
});

describe('Alocação', () => {
  it('shows the groups out of target, the gap in reais and the Pacu suggestion', () => {
    render(<AllocationScreen />);
    expect(text(/^Perfil Moderado · R\$.48\.310,90 investidos$/)).toBeOnTheScreen();
    expect(text(/^3 de 5 grupos$/)).toBeOnTheScreen();
    expect(text(/^Renda variável Brasil, \+17,2 p\.p\.$/)).toBeOnTheScreen();

    // The biggest gap starts open on the phone.
    expect(
      screen.getByLabelText(
        'Ações large cap, PETR4 e BOVA11 · R$ 10.691,50: alvo 10%, atual 22,1%, +12,1 p.p.',
      ),
    ).toBeOnTheScreen();

    expect(text(/^faltam R\$.967,13$/)).toBeOnTheScreen();
    expect(text(/^hoje R\$.22\.222,10 · alvo R\$.23\.189,23$/)).toBeOnTheScreen();
    expect(text(/^R\$.8\.287,03 acima$/)).toBeOnTheScreen();
    expect(
      text(
        /se os próximos aportes forem para renda fixa internacional e renda variável internacional, a parte de renda variável Brasil vai diminuindo\. Quer que eu simule com R\$.1\.500 por mês\?$/,
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Comparar os 4 perfis' }));
    expect(mockNavigate).toHaveBeenCalledWith('/investments/allocation/profiles');
    fireEvent.press(screen.getByRole('button', { name: 'Mudar perfil' }));
    expect(mockNavigate).toHaveBeenCalledWith('/account/investor-profile');
  });

  it('opens with the summary tiles on the tablet', () => {
    mockBreakpoint = 'tablet';
    render(<AllocationScreen />);
    expect(text(/^Carteira-alvo do perfil Moderado em 5 grupos$/)).toBeOnTheScreen();
    expect(text(/^definido em 23\/09\/2026$/)).toBeOnTheScreen();
    expect(text(/^12 ativos · sem os bens$/)).toBeOnTheScreen();
    expect(text(/^diferença maior que 5 p\.p\.$/)).toBeOnTheScreen();
    expect(text(/^Maior diferença$/)).toBeOnTheScreen();
    // Three groups start open on the tablet.
    expect(
      screen.getByLabelText(
        'Pós-fixada, Tesouro Selic, CDB/LCI/LCA pós, fundos DI · R$\u00a022.222,10: alvo 24%, atual 46%, +22 p.p.',
      ),
    ).toBeOnTheScreen();
  });

  it('follows the saved profile', () => {
    act(() => useInvestorProfileStore.getState().save('conservative', SAVED_PROFILE.answers));
    render(<AllocationScreen />);
    expect(text(/^Perfil Conservador · R\$.48\.310,90 investidos$/)).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Renda fixa Brasil: alvo 75%, atual 46%, −29 p.p.'),
    ).toBeOnTheScreen();
  });
});

describe('Os 4 perfis', () => {
  it('shows each target, how much would move and the subclasses', () => {
    render(<AllocationProfilesScreen />);
    expect(
      text(/O seu, definido pelo questionário em 23\/09\/2026, é o Moderado\./),
    ).toBeOnTheScreen();
    expect(screen.getByText('Seu perfil')).toBeOnTheScreen();
    expect(screen.getAllByText(/^Para ficar igual a este perfil/)).toHaveLength(4);
    expect(
      text(/^Para ficar igual a este perfil, 42% da sua carteira mudaria de grupo\.$/),
    ).toBeOnTheScreen();
    expect(
      text(/^Para ficar igual a este perfil, 22,1% da sua carteira mudaria de grupo\.$/),
    ).toBeOnTheScreen();

    expect(screen.queryByText('Crédito privado baixo risco')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Ver as 10 subclasses' }));
    expect(screen.getByText('Crédito privado baixo risco')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ver as 17 subclasses' })).toBeOnTheScreen();
  });
});
