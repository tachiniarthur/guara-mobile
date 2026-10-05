import { colors } from '@guara/ui-tokens';
import { Pressable, View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import type { RiskLevel } from '../data';

const RISK_STYLE: Record<
  RiskLevel,
  { box: string; dot: string; tone: 'positive' | 'warning' | 'negative' }
> = {
  Baixo: { box: 'bg-positive-muted', dot: 'bg-positive', tone: 'positive' },
  Médio: { box: 'bg-warning-muted', dot: 'bg-warning', tone: 'warning' },
  Alto: { box: 'bg-negative-muted', dot: 'bg-negative', tone: 'negative' },
};

const RISK_COLOR = {
  positive: colors.positive.DEFAULT,
  warning: colors.warning.DEFAULT,
  negative: colors.negative.DEFAULT,
};

export interface RiskPillProps {
  risk: RiskLevel;
  /** Makes the pill a button with a chevron (adjust the risk). */
  onPress?: () => void;
  /** `sm`: 26 dp, no dot, chevron in the risk color (rows of Posições). */
  size?: 'md' | 'sm';
  /** Name of the asset, read as "Ajustar risco de PETR4". */
  assetName?: string;
}

/** Risk level with a colored dot: Baixo (Folha), Médio (Tucano), Alto (Urucum). */
export function RiskPill({ risk, onPress, size = 'md', assetName }: RiskPillProps) {
  const style = RISK_STYLE[risk];
  const label = `Risco ${risk}. Ajustar risco${assetName ? ` de ${assetName}` : ''}`;
  if (size === 'sm') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={!onPress}
        onPress={onPress}
        hitSlop={{ top: 9, bottom: 9 }}
        className={cn(
          'h-[26px] flex-row items-center gap-1 self-start rounded-full px-2 active:opacity-80',
          style.box,
        )}
      >
        <Text size={12} weight="bold" tone={style.tone} numberOfLines={1}>
          {risk}
        </Text>
        <Icon name="chevronDown" size={12} color={RISK_COLOR[style.tone]} />
      </Pressable>
    );
  }
  const content = (
    <>
      <View className={cn('h-[7px] w-[7px] rounded-full', style.dot)} />
      <Text size={13} weight="bold" tone={style.tone} numberOfLines={1}>
        {risk}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View
        accessibilityLabel={`Risco ${risk}`}
        className={cn(
          'h-[26px] flex-row items-center gap-1.5 self-start rounded-full px-2.5',
          style.box,
        )}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'mt-0.5 h-7 flex-row items-center gap-1.5 self-start rounded-full pl-2.5 pr-2',
        style.box,
      )}
    >
      {content}
      <Icon name="chevronDown" size={14} color={colors.foreground.muted} />
    </Pressable>
  );
}
