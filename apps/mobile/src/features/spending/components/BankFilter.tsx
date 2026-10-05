import { colors } from '@guara/ui-tokens';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { Chip, Icon, Text } from '@/components/ui';

import { SPENDING_BANKS, type SpendingBankId } from '../data';

export interface BankFilterProps {
  value: SpendingBankId;
  onChange: (value: SpendingBankId) => void;
  /** Wrap instead of scrolling horizontally (tablet). */
  wrap?: boolean;
}

/** Bank chips ("Todos os bancos", "Nubank", "Itaú") plus a dashed "Conectar". */
export function BankFilter({ value, onChange, wrap = false }: BankFilterProps) {
  const router = useRouter();
  const chips = (
    <>
      {SPENDING_BANKS.map((bank) => (
        <Chip
          key={bank.id}
          label={bank.label}
          size={36}
          appearance="filled"
          icon={bank.id === 'all' ? 'grid' : undefined}
          selected={value === bank.id}
          onPress={() => onChange(bank.id)}
          className="h-9 px-3.5"
        />
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Conectar banco"
        onPress={() => router.navigate('/connect-bank')}
        className="h-9 flex-row items-center gap-1.5 rounded-full border border-dashed border-border-strong px-3 active:bg-surface-pressed"
      >
        <Icon name="plus" size={16} color={colors.foreground.muted} />
        <Text size={14} tone="muted">
          Conectar
        </Text>
      </Pressable>
    </>
  );

  if (wrap) {
    return (
      <ScrollView
        horizontal
        scrollEnabled={false}
        accessibilityLabel="Filtrar por banco"
        contentContainerClassName="flex-row flex-wrap items-center gap-2"
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Filtrar por banco"
      contentContainerClassName="items-center gap-2"
      className="-mx-4"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {chips}
    </ScrollView>
  );
}
