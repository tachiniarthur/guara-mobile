import { cents } from '@guara/utils';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar, getInitials } from '../Avatar';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { ListItem } from '../ListItem';
import { MoneyText } from '../MoneyText';
import { ProgressBar, getProgressState } from '../ProgressBar';
import { Text } from '../Text';

describe('ProgressBar', () => {
  // Budget of R$ 1.000,00 with warnings at R$ 500,00 and R$ 700,00.
  const max = cents(100_000);
  const markers = [cents(50_000), cents(70_000)];

  it('positions markers by their proportion of the limit', () => {
    render(<ProgressBar value={cents(30_000)} max={max} markers={markers} />);
    expect(screen.getByTestId('progress-marker-0')).toHaveStyle({ left: '50%' });
    expect(screen.getByTestId('progress-marker-1')).toHaveStyle({ left: '70%' });
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '30%' });
  });

  it('turns yellow at the last marker and red when over the limit', () => {
    expect(getProgressState(30_000, 100_000, { markers })).toBe('normal');
    expect(getProgressState(72_000, 100_000, { markers })).toBe('warning');
    expect(getProgressState(85_000, 100_000)).toBe('warning');
    expect(getProgressState(100_000, 100_000)).toBe('warning');
    expect(getProgressState(100_001, 100_000)).toBe('over');
    expect(getProgressState(10, 0)).toBe('over');
  });

  it('caps the fill at 100% and exposes the real percentage', () => {
    render(<ProgressBar value={cents(125_000)} max={max} accessibilityLabel="Mercado" />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('progress-fill').props.className).toContain('bg-negative');
    expect(screen.getByRole('progressbar', { name: 'Mercado' }).props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 125,
    });
  });
});

describe('Avatar', () => {
  it('derives initials from the first and last words', () => {
    expect(getInitials('Banco do Brasil')).toBe('BB');
    expect(getInitials('Nubank')).toBe('N');
    expect(getInitials('  maria  de souza ')).toBe('MS');
  });

  it('falls back to initials without an image', () => {
    render(<Avatar name="Itaú Unibanco" />);
    expect(screen.getByRole('image', { name: 'Itaú Unibanco' })).toBeOnTheScreen();
    expect(screen.getByText('IU')).toBeOnTheScreen();
  });
});

describe('Card, ListItem and Badge', () => {
  it('Card becomes a button when pressable', () => {
    const onPress = jest.fn();
    render(
      <Card onPress={onPress} accessibilityLabel="Abrir teto">
        <Text>Mercado</Text>
      </Card>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Abrir teto' }));
    expect(onPress).toHaveBeenCalled();
  });

  it('ListItem renders title, subtitle and trailing value', () => {
    const onPress = jest.fn();
    render(
      <ListItem
        title="Supermercado"
        subtitle="Cartão final 1234"
        trailing={<MoneyText value={cents(-8_990)} colorBySign />}
        trailingCaption="Hoje"
        showChevron
        onPress={onPress}
      />,
    );
    expect(screen.getByText('Supermercado')).toBeOnTheScreen();
    expect(screen.getByText('Hoje')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('Badge uses the tinted background of its tone', () => {
    render(<Badge label="Expirando" tone="warning" />);
    expect(screen.getByLabelText('Expirando').props.className).toContain('bg-warning-muted');
  });
});
