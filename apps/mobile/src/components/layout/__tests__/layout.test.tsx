import { fireEvent, render, screen } from '@testing-library/react-native';

import { Text } from '@/components/ui/Text';

import { ResponsiveGrid } from '../ResponsiveGrid';
import { Section } from '../Section';
import { TopBar } from '../TopBar';

const mockRouter = { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => mockRouter,
}));

let mockBreakpoint: 'phone' | 'tablet' | 'desktop' = 'phone';
jest.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({ breakpoint: mockBreakpoint, isTablet: mockBreakpoint !== 'phone' }),
}));

const cells = ['A', 'B', 'C'].map((label) => <Text key={label}>{label}</Text>);

describe('ResponsiveGrid', () => {
  it('uses one column on phones', () => {
    mockBreakpoint = 'phone';
    const { toJSON } = render(<ResponsiveGrid>{cells}</ResponsiveGrid>);
    // 3 rows with a single cell each.
    expect((toJSON() as { children: unknown[] }).children).toHaveLength(3);
  });

  it('uses two columns on tablets and pads the last row', () => {
    mockBreakpoint = 'tablet';
    const { toJSON } = render(<ResponsiveGrid>{cells}</ResponsiveGrid>);
    const rows = (toJSON() as { children: { children: unknown[] }[] }).children;
    expect(rows).toHaveLength(2);
    expect(rows[1]?.children).toHaveLength(2); // "C" + spacer
  });

  it('keeps the tablet columns on large tablets (landscape)', () => {
    mockBreakpoint = 'desktop';
    const { toJSON } = render(<ResponsiveGrid columns={{ tablet: 2 }}>{cells}</ResponsiveGrid>);
    expect((toJSON() as { children: unknown[] }).children).toHaveLength(2);
  });
});

describe('Section', () => {
  it('renders the title as a header and the aside', () => {
    render(
      <Section
        title="Tetos de gasto"
        description="Como está o seu mês"
        aside={<Text>Ver tudo</Text>}
      >
        <Text>conteúdo</Text>
      </Section>,
    );
    expect(screen.getByRole('header', { name: 'Tetos de gasto' })).toBeOnTheScreen();
    expect(screen.getByText('Ver tudo')).toBeOnTheScreen();
  });
});

describe('TopBar', () => {
  it('goes back with an accessible button', () => {
    render(<TopBar title="Teto de gasto" />);
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();
    expect(screen.getByRole('header', { name: 'Teto de gasto' })).toBeOnTheScreen();
  });

  it('falls back to a route when there is no history', () => {
    mockRouter.canGoBack.mockReturnValueOnce(false);
    render(<TopBar title="Ativo" fallbackHref="/investments" />);
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/investments');
  });

  it('closes forms and hides the button when asked', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <TopBar title="Novo teto" leading="close" onLeadingPress={onClose} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
    rerender(<TopBar title="Gastos" leading="none" />);
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
  });
});
