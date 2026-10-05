import { colors } from '@guara/ui-tokens';
import type { Cents } from '@guara/types';

import { MataSurface } from '@/components/illustrations';
import { MoneyText, Span, Text } from '@/components/ui';

import { positionsCountText, shareText } from '../lib/positions';

export interface PositionClassBandProps {
  label: string;
  total: Cents;
  share: number;
  /** Shows " · 2 posições" after the label (Posições page). */
  count?: number;
}

/** Mata band that opens a class: "Renda fixa · 2 posições   R$ 22.222,10 · 46,0%". */
export function PositionClassBand({ label, total, share, count }: PositionClassBandProps) {
  return (
    <MataSurface
      veil={[0.82, 0.55, 0.2]}
      style={{ borderColor: colors.avatarRing }}
      className="mt-1.5 flex-row items-baseline justify-between gap-2 rounded-14 border px-3.5 py-3"
    >
      <Text size={15} weight="bold" accessibilityRole="header" className="min-w-0 flex-shrink">
        {label}
        {count !== undefined ? (
          <Span weight="regular" tone="muted">{` · ${positionsCountText(count)}`}</Span>
        ) : null}
      </Text>
      <Text size={14} tone="soft" tabular>
        <MoneyText value={total} size={14} weight="bold" /> · {shareText(share)}
      </Text>
    </MataSurface>
  );
}
