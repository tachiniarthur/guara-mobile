import type { Cents, YearMonth } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Icon, MoneyInput, SelectField, Sheet, Text, type IconName } from '@/components/ui';
import { haptics } from '@/lib/haptics';

import { PROPERTIES_MONTH } from '../../property-data';
import { addMonths, monthTitle } from '../../lib/properties';

/** The last 12 months, newest first ("Setembro de 2026"). */
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const month = addMonths(PROPERTIES_MONTH, -index);
  return { value: month, label: monthTitle(month) };
});

/** "Atualizar valor": a new estimate for a real estate. */
export function UpdateValueSheet({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: Cents | null;
  onClose: () => void;
  onSave: (value: Cents, on: YearMonth) => void;
}) {
  const [value, setValue] = useState<Cents | null>(current);
  const [month, setMonth] = useState<YearMonth>(PROPERTIES_MONTH);
  return (
    <Sheet open={open} onClose={onClose} title="Atualizar valor">
      <MoneyInput
        label="Valor estimado"
        value={value}
        onChangeValue={setValue}
        size={64}
        display
        rounded="16"
        helperText="Quanto você acha que ele vale hoje. Pode ser uma estimativa."
      />
      <SelectField
        label="Data da estimativa"
        value={month}
        onChange={setMonth}
        options={MONTH_OPTIONS}
      />
      <Button
        variant="primary"
        fullWidth
        disabled={!value}
        onPress={() => {
          if (!value) return;
          onSave(value, month);
          onClose();
        }}
      >
        Salvar valor
      </Button>
    </Sheet>
  );
}

/** "Atualizar saldo": the debt left, from the latest statement of the financing. */
export function UpdateDebtSheet({
  open,
  current,
  onClose,
  onSave,
  onPaidOff,
}: {
  open: boolean;
  current: Cents | null;
  onClose: () => void;
  onSave: (balance: Cents) => void;
  onPaidOff: () => void;
}) {
  const [balance, setBalance] = useState<Cents | null>(current);
  return (
    <Sheet open={open} onClose={onClose} title="Atualizar saldo">
      <MoneyInput
        label="Saldo devedor"
        value={balance}
        onChangeValue={setBalance}
        helperText="O quanto falta pagar, conforme o último extrato do financiamento"
      />
      <Button
        variant="primary"
        fullWidth
        disabled={!balance}
        onPress={() => {
          if (!balance) return;
          onSave(balance);
          onClose();
        }}
      >
        Salvar saldo
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onPress={() => {
          onPaidOff();
          onClose();
        }}
      >
        Financiamento quitado
      </Button>
    </Sheet>
  );
}

export interface PropertyMenuItem {
  key: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
}

/** "Mais opções do bem". */
export function PropertyMenuSheet({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: PropertyMenuItem[];
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Opções do bem">
      <View>
        {items.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            onPress={() => {
              haptics.selection();
              onClose();
              item.onPress();
            }}
            className="min-h-12 flex-row items-center gap-3 rounded-14 px-3 active:bg-surface-pressed"
          >
            <Icon
              name={item.icon}
              size={20}
              color={item.destructive ? colors.negative.DEFAULT : colors.foreground.muted}
            />
            <Text size={15} weight="medium" tone={item.destructive ? 'negative' : 'default'}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
