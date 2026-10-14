import { colors } from '@guara/ui-tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { StateSlot, useScreenState } from '@/components/feedback';
import { MataSurface } from '@/components/illustrations';
import { SkeletonScope, Text } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface GoalHeroProps {
  /** "Guardado nas metas". */
  label: string;
  /** Right of the label (state pill). */
  aside?: ReactNode;
  /** Big number (and "de R$ 30.000"). */
  value: ReactNode;
  /** Bar and caption under the number. */
  children?: ReactNode;
  /** Gap between the lines (design: 6 on the list, 10 on a goal). */
  gap?: 6 | 10;
}

/** Mata card with the saved amount (Suas metas and the goal page). */
export function GoalHero({ label, aside, value, children, gap = 6 }: GoalHeroProps) {
  const loading = useScreenState().status === 'loading';
  return (
    <SkeletonScope active={loading}>
      <MataSurface
        veil={[0.85, 0.55, 0.1]}
        className={cn(
          'rounded-24 border border-border-strong bg-hero p-5',
          gap === 6 ? 'gap-1.5' : 'gap-2.5',
        )}
      >
        <StateSlot compact>
          <View className="flex-row items-center gap-2.5">
            <Text size={14} className="flex-1" style={{ color: colors.hero.label }}>
              {label}
            </Text>
            {aside}
          </View>
          {value}
          {children}
        </StateSlot>
      </MataSurface>
    </SkeletonScope>
  );
}

/** Caption over the Mata ("Depósitos planejados: R$ 2.300/mês…"). */
export function HeroCaption({ children }: { children: ReactNode }) {
  return (
    <Text size={14} leading={1.5} style={{ color: colors.hero.caption }}>
      {children}
    </Text>
  );
}

/** Strong part of a hero caption, in white. */
export function HeroStrong({ children }: { children: ReactNode }) {
  return (
    <Text size={14} weight="bold" style={{ color: colors.hero.foreground }}>
      {children}
    </Text>
  );
}
