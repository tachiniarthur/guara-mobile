import { fireEvent, render, screen } from '@testing-library/react-native';

import { Text } from '@/components/ui/Text';

import { Header } from '../Header';
import { ResponsiveGrid } from '../ResponsiveGrid';
import { Section } from '../Section';

const mockRouter = { back: jest.fn(), canGoBack: jest.fn(() => true) };
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
});

describe('Section', () => {
  it('renders the title as a header and the "Ver tudo" link', () => {
    const onPress = jest.fn();
    render(
      <Section title="Tetos de gasto" action={{ label: 'Ver tudo', onPress }}>
        <Text>conteúdo</Text>
      </Section>,
    );
    expect(screen.getByRole('header', { name: 'Tetos de gasto' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('link', { name: 'Ver tudo: Tetos de gasto' }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Header', () => {
  it('goes back with an accessible button', () => {
    render(<Header title="Teto de gasto" />);
    fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();
    expect(screen.getByRole('header', { name: 'Teto de gasto' })).toBeOnTheScreen();
  });

  it('hides the back button when there is nowhere to go', () => {
    mockRouter.canGoBack.mockReturnValueOnce(false);
    render(<Header title="Gastos" large />);
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
  });
});
