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

export interface RiskPillProps {
  risk: RiskLevel;
  /** Makes the pill a button with a chevron (adjust the risk). */
  onPress?: () => void;
}

/** Risk level with a colored dot: Baixo (Folha), Médio (Tucano), Alto (Urucum). */
export function RiskPill({ risk, onPress }: RiskPillProps) {
  const style = RISK_STYLE[risk];
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
      accessibilityLabel={`Risco ${risk}. Ajustar risco`}
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
