import { zodResolver } from '@hookform/resolvers/zod';
import type { Cents } from '@guara/types';
import { cents, NBSP } from '@guara/utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Chip } from '../Chip';
import { FormField } from '../FormField';
import { MoneyInput, digitsToCents } from '../MoneyInput';
import { RadioGroup } from '../RadioGroup';
import { SearchInput } from '../SearchInput';
import { SegmentedControl } from '../SegmentedControl';
import { Switch } from '../Switch';

const brl = (text: string) => text.replace(/ /g, NBSP);

describe('Button', () => {
  it('calls onPress when enabled', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Salvar</Button>);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['disabled', { disabled: true }],
    ['loading', { loading: true }],
  ])('blocks presses when %s', (_state, props) => {
    const onPress = jest.fn();
    render(
      <Button onPress={onPress} {...props}>
        Salvar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Salvar' });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('marks loading as busy and shows a spinner', () => {
    render(<Button loading>Salvar</Button>);
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeBusy();
    expect(screen.getByLabelText('Carregando')).toBeOnTheScreen();
  });

  it('gets a 44dp touch target even when small', () => {
    render(<Button size="sm">Ok</Button>);
    expect(screen.getByRole('button', { name: 'Ok' }).props.hitSlop).toEqual({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
    });
  });
});

describe('MoneyInput', () => {
  function Harness({ onValue }: { onValue: (value: Cents | null) => void }) {
    const [value, setValue] = useState<Cents | null>(null);
    return (
      <MoneyInput
        label="Valor"
        value={value}
        onChangeValue={(next) => {
          setValue(next);
          onValue(next);
        }}
      />
    );
  }

  it('fills from the right in integer cents', () => {
    const onValue = jest.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Valor');

    fireEvent.changeText(input, '5');
    expect(onValue).toHaveBeenLastCalledWith(5);
    expect(input.props.value).toBe(brl('R$ 0,05'));

    fireEvent.changeText(input, `${input.props.value}0`);
    expect(onValue).toHaveBeenLastCalledWith(50);

    fireEvent.changeText(input, `${input.props.value}0`);
    fireEvent.changeText(input, `${screen.getByLabelText('Valor').props.value}0`);
    expect(onValue).toHaveBeenLastCalledWith(5000);
    expect(screen.getByLabelText('Valor').props.value).toBe(brl('R$ 50,00'));
    expect(Number.isInteger(onValue.mock.calls.at(-1)?.[0])).toBe(true);
  });

  it('backspace shifts digits and deleting everything returns null', () => {
    const onValue = jest.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Valor');

    fireEvent.changeText(input, '1234');
    expect(onValue).toHaveBeenLastCalledWith(1234);
    fireEvent.changeText(input, brl('R$ 12,3'));
    expect(onValue).toHaveBeenLastCalledWith(123);
    fireEvent.changeText(input, brl('R$ 0,0'));
    expect(onValue).toHaveBeenLastCalledWith(null);
    expect(screen.getByLabelText('Valor').props.value).toBe('');
  });

  it('digitsToCents parses digit strings without floats and caps the length', () => {
    expect(digitsToCents('R$ 1.234,56')).toBe(123456);
    expect(digitsToCents('000')).toBeNull();
    expect(digitsToCents('12345678901234')).toBe('overflow');
  });

  it('announces the amount in words', () => {
    render(<MoneyInput label="Valor" value={cents(123456)} onChangeValue={jest.fn()} />);
    expect(screen.getByLabelText('Valor').props.accessibilityValue).toEqual({
      text: '1.234 reais e 56 centavos',
    });
  });
});

describe('FormField', () => {
  const schema = z.object({
    name: z.string().min(1, 'Informe um nome'),
    limit: z.number({ error: 'Informe o valor do teto' }).int().positive(),
  });
  type Values = z.infer<typeof schema>;

  function BudgetForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
    const { control, handleSubmit } = useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: { name: '' },
    });
    return (
      <>
        <FormField control={control} name="name" label="Nome" />
        <FormField control={control} name="limit" type="money" label="Teto" />
        <Button onPress={handleSubmit(onSubmit)}>Criar</Button>
      </>
    );
  }

  it('shows the zod error messages', async () => {
    const onSubmit = jest.fn();
    render(<BudgetForm onSubmit={onSubmit} />);
    fireEvent.press(screen.getByRole('button', { name: 'Criar' }));
    expect(await screen.findByText('Informe um nome')).toBeOnTheScreen();
    expect(screen.getByText('Informe o valor do teto')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits integer cents from the money field', async () => {
    const onSubmit = jest.fn();
    render(<BudgetForm onSubmit={onSubmit} />);
    fireEvent.changeText(screen.getByLabelText('Nome'), 'Mercado');
    fireEvent.changeText(screen.getByLabelText('Teto'), '100000');
    fireEvent.press(screen.getByRole('button', { name: 'Criar' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ name: 'Mercado', limit: 100000 }, undefined),
    );
  });
});

describe('selection controls', () => {
  it('RadioGroup selects one option and exposes checked state', () => {
    const onChange = jest.fn();
    render(
      <RadioGroup
        accessibilityLabel="Por quanto tempo pretende investir?"
        value="short"
        onChange={onChange}
        options={[
          { value: 'short', label: 'Até 1 ano' },
          { value: 'long', label: 'Mais de 5 anos' },
        ]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Até 1 ano' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Mais de 5 anos' })).not.toBeChecked();
    fireEvent.press(screen.getByRole('radio', { name: 'Mais de 5 anos' }));
    expect(onChange).toHaveBeenCalledWith('long');
    fireEvent.press(screen.getByRole('radio', { name: 'Até 1 ano' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Chip toggles and exposes selected state', () => {
    const onPress = jest.fn();
    const { rerender } = render(<Chip label="Mercado" selected={false} onPress={onPress} />);
    expect(screen.getByRole('button', { name: 'Mercado' })).not.toBeSelected();
    fireEvent.press(screen.getByRole('button', { name: 'Mercado' }));
    expect(onPress).toHaveBeenCalled();
    rerender(<Chip label="Mercado" selected onPress={onPress} />);
    expect(screen.getByRole('button', { name: 'Mercado' })).toBeSelected();
  });

  it('SegmentedControl changes value and marks the selected tab', () => {
    const onChange = jest.fn();
    render(
      <SegmentedControl
        value="6m"
        onChange={onChange}
        options={[
          { value: '6m', label: '6M', accessibilityLabel: '6 meses' },
          { value: '12m', label: '12M', accessibilityLabel: '12 meses' },
          { value: 'all', label: 'Tudo' },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: '6 meses' })).toBeSelected();
    fireEvent.press(screen.getByRole('tab', { name: '12 meses' }));
    expect(onChange).toHaveBeenCalledWith('12m');
    fireEvent.press(screen.getByRole('tab', { name: '6 meses' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Checkbox and Switch toggle with checked state', () => {
    const onCheck = jest.fn();
    const onSwitch = jest.fn();
    render(
      <>
        <Checkbox label="Nubank" checked={false} onChange={onCheck} />
        <Switch label="E-mail" value onValueChange={onSwitch} />
      </>,
    );
    fireEvent.press(screen.getByRole('checkbox', { name: 'Nubank' }));
    expect(onCheck).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch', { name: 'E-mail' })).toBeChecked();
    fireEvent.press(screen.getByRole('switch', { name: 'E-mail' }));
    expect(onSwitch).toHaveBeenCalledWith(false);
  });

  it('SearchInput clears its value', () => {
    const onChangeText = jest.fn();
    render(<SearchInput value="ifood" onChangeText={onChangeText} />);
    fireEvent.press(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
