import { colors } from '@guara/ui-tokens';
import { Fragment } from 'react';

import { InfoNote, Span, Text } from '@/components/ui';

import { directionText, outOfTarget, type GroupRow } from '../../lib/allocation';

/**
 * "Sua carteira está fora do alvo em 3 de 5 grupos: Renda variável Brasil 17,2 p.p. acima, …"
 */
export function OutOfTargetNote({
  groups,
  suffix,
}: {
  groups: readonly GroupRow[];
  /** Sentence after the list ("O Pacu pode sugerir como ajustar…"). */
  suffix?: string;
}) {
  const out = outOfTarget(groups);
  return (
    <InfoNote icon="alertTriangle" tone="warning" size={13} iconColor={colors.brand.DEFAULT}>
      <Text size={13} leading={1.5}>
        {out.length ? (
          <>
            {`Sua carteira está fora do alvo em ${out.length} de ${groups.length} grupos: `}
            {out.map((group, index) => (
              <Fragment key={group.key}>
                <Span weight="bold">{group.label}</Span>
                {` ${directionText(group.difference)}`}
                {index === out.length - 1 ? '.' : index === out.length - 2 ? ' e ' : ', '}
              </Fragment>
            ))}
          </>
        ) : (
          'Sua carteira está perto do alvo em todos os grupos.'
        )}
        {suffix ? ` ${suffix}` : ''}
      </Text>
    </InfoNote>
  );
}
