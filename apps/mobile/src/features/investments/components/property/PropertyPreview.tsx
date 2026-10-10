import type { Cents } from '@guara/types';
import { colors } from '@guara/ui-tokens';
import { addCents, cents } from '@guara/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionCard } from '@/components/layout';
import { DataRow, Icon, MoneyText, Text } from '@/components/ui';

import { useProfileTargets } from '../../hooks/useProfileTargets';

import { profileAllocationLabel } from './PropertyCards';

export interface PropertyPreviewProps {
  /** Net worth without this property. */
  today: Cents;
  /** Value of the property (`null` while empty). */
  value: Cents | null;
  /** Debt line(s) between "Este bem soma" and the profile allocation. */
  debtRow: ReactNode;
  /** Card padding (tablet form: 22). */
  padding?: 16 | 22;
  /** Notes at the end of the card. */
  children?: ReactNode;
}

/** "Prévia no patrimônio": the net worth today and with this property. */
export function PropertyPreview({
  today,
  value,
  debtRow,
  padding = 16,
  children,
}: PropertyPreviewProps) {
  const after = addCents(today, value ?? cents(0));
  const profile = useProfileTargets();
  return (
    <SectionCard
      title="Prévia no patrimônio"
      description="Bens entram no patrimônio total, não na alocação do perfil"
      titleSize={17}
      padding={padding}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="min-w-0 flex-1 gap-0.5 rounded-14 bg-surface-input p-3">
          <Text size={12} tone="subtle">
            Patrimônio total hoje
          </Text>
          <MoneyText value={today} weight="bold" numberOfLines={1} adjustsFontSizeToFit />
        </View>
        <Icon name="arrowRight" size={18} color={colors.foreground.subtle} />
        <View className="min-w-0 flex-1 gap-0.5 rounded-14 bg-positive-muted p-3">
          <Text size={12} tone="positive">
            Com este bem
          </Text>
          <MoneyText value={after} weight="bold" numberOfLines={1} adjustsFontSizeToFit />
        </View>
      </View>
      <View>
        <DataRow
          label="Este bem soma"
          value={value ? <MoneyText value={value} showSign wholeUnits weight="semibold" /> : '—'}
        />
        {debtRow}
        <DataRow
          label={profileAllocationLabel(profile.label)}
          value="não muda · só investimentos"
        />
      </View>
      {children}
    </SectionCard>
  );
}
