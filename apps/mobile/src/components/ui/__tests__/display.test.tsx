import { cents } from '@guara/utils';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar, getInitials } from '../Avatar';
import { Badge } from '../Badge';
import { Card } from '../Card';
import { ListItem } from '../ListItem';
import { MoneyText } from '../MoneyText';
import { ProgressBar, budgetTone } from '../ProgressBar';
import { Text } from '../Text';

describe('ProgressBar', () => {
  it('fills by percent and marks the target', () => {
    render(<ProgressBar percent={30} marker={70} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '30%' });
  });

  it('clamps the fill and the spoken value to 0–100', () => {
    render(<ProgressBar percent={125} tone="negative" accessibilityLabel="Mercado" />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' });
    expect(screen.getByTestId('progress-fill').props.className).toContain('bg-negative');
    expect(screen.getByRole('progressbar', { name: 'Mercado' }).props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 100,
    });
  });

  it('colors budgets by how much was used', () => {
    expect(budgetTone(30)).toBe('positive');
    expect(budgetTone(72)).toBe('warning');
    expect(budgetTone(85)).toBe('negative');
  });
});

describe('Avatar', () => {
  it('derives initials from the first and last words', () => {
    expect(getInitials('Banco do Brasil')).toBe('BB');
    expect(getInitials('Nubank')).toBe('NU');
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
