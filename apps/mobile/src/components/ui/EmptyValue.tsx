import { EMPTY, EMPTY_SPOKEN } from '@guara/utils';

import { Text, type TextProps } from './Text';

/** Placeholder for a missing value ("—"). Never show 0 or R$ 0,00 for unknown data. */
export function EmptyValue({ tone = 'subtle', ...props }: Omit<TextProps, 'children'>) {
  return (
    <Text tone={tone} accessibilityLabel={EMPTY_SPOKEN} {...props}>
      {EMPTY}
    </Text>
  );
}
