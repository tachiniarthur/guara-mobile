import { fontFor, typography } from '@guara/ui-tokens';
import { cents, MINUS_SIGN, NBSP } from '@guara/utils';
import { render, screen } from '@testing-library/react-native';

import { DeltaBadge } from '../DeltaBadge';
import { EmptyValue } from '../EmptyValue';
import { MoneyText } from '../MoneyText';
import { PercentText } from '../PercentText';
import { Text } from '../Text';

const brl = (text: string) => text.replace(/ /g, NBSP);

describe('Text', () => {
  it('applies variant, tone and the token-based font scaling cap', () => {
    render(
      <Text variant="title" tone="muted" testID="t">
        Olá
      </Text>,
    );
    const text = screen.getByTestId('t');
    expect(text.props.className).toContain('text-foreground-muted');
    expect(text).toHaveStyle({
      fontFamily: fontFor(typography.title.weight, { serif: typography.title.serif }),
    });
    expect(text).toHaveStyle({ fontSize: typography.title.fontSize });
    expect(text.props.maxFontSizeMultiplier).toBe(typography.title.maxFontSizeMultiplier);
  });
});

describe('EmptyValue', () => {
  it('renders "—" with a spoken label', () => {
    render(<EmptyValue />);
    expect(screen.getByText('—')).toBeOnTheScreen();
    expect(screen.getByLabelText('sem informação')).toBeOnTheScreen();
  });
});

describe('MoneyText', () => {
  it('formats cents in pt-BR with tabular digits', () => {
    render(<MoneyText value={cents(123456)} testID="m" />);
    const money = screen.getByTestId('m');
    expect(money).toHaveTextContent(brl('R$ 1.234,56'));
    expect(money.props.style).toEqual(expect.arrayContaining([{ fontVariant: ['tabular-nums'] }]));
    expect(money.props.accessibilityLabel).toBe('1.234 reais e 56 centavos');
  });

  it('shows the sign and colors by sign', () => {
    render(
      <>
        <MoneyText value={cents(5000)} showSign colorBySign testID="in" />
        <MoneyText value={cents(-5000)} colorBySign testID="out" />
        <MoneyText value={cents(0)} colorBySign testID="zero" />
      </>,
    );
    expect(screen.getByTestId('in')).toHaveTextContent(brl('+R$ 50,00'));
    expect(screen.getByTestId('in').props.className).toContain('text-positive');
    expect(screen.getByTestId('in').props.accessibilityLabel).toBe('mais 50 reais');
    expect(screen.getByTestId('out')).toHaveTextContent(brl(`${MINUS_SIGN}R$ 50,00`));
    expect(screen.getByTestId('out').props.className).toContain('text-negative');
    expect(screen.getByTestId('zero').props.className).toContain('text-foreground');
  });

  it('renders "—" for null (never R$ 0,00)', () => {
    render(<MoneyText value={null} />);
    expect(screen.getByText('—')).toBeOnTheScreen();
    expect(screen.queryByText(/R\$/)).toBeNull();
  });

  it('supports compact and masked modes', () => {
    render(
      <>
        <MoneyText value={cents(123456)} compact testID="c" />
        <MoneyText value={cents(123456)} masked testID="h" />
      </>,
    );
    expect(screen.getByTestId('c')).toHaveTextContent(brl('R$ 1,2 mil'));
    expect(screen.getByTestId('c').props.accessibilityLabel).toBe('1.234 reais e 56 centavos');
    expect(screen.getByTestId('h')).toHaveTextContent('R$ •••');
    expect(screen.getByTestId('h').props.accessibilityLabel).toBe('valor oculto');
  });
});

describe('PercentText', () => {
  it('formats, colors (optionally inverted) and handles missing values', () => {
    render(
      <>
        <PercentText value={12.5} showSign colorBySign testID="p" />
        <PercentText value={12.5} colorBySign invertColors testID="inv" />
        <PercentText value={null} />
      </>,
    );
    expect(screen.getByTestId('p')).toHaveTextContent('+12,50%');
    expect(screen.getByTestId('p').props.className).toContain('text-positive');
    expect(screen.getByTestId('p').props.accessibilityLabel).toBe('mais 12,50 por cento');
    expect(screen.getByTestId('inv').props.className).toContain('text-negative');
    expect(screen.getByText('—')).toBeOnTheScreen();
  });
});

describe('DeltaBadge', () => {
  it('describes the variation for screen readers', () => {
    render(<DeltaBadge value={2.3} label="vs mês anterior" />);
    expect(screen.getByText('+2,3%')).toBeOnTheScreen();
    expect(screen.getByLabelText('mais 2,3 por cento vs mês anterior')).toBeOnTheScreen();
  });

  it('treats a rounded zero as neutral', () => {
    render(<DeltaBadge value={0.01} />);
    expect(screen.getByText('0,0%').props.className).toContain('text-foreground');
  });
});
