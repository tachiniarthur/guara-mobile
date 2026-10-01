import { View, type ViewProps } from 'react-native';

import { useBreakpoint } from '@/hooks/useBreakpoint';

/**
 * Centers content and caps its width on tablets. Same features on every size —
 * only the layout adapts.
 */
export function ResponsiveContainer({ style, ...props }: ViewProps) {
  const { contentMaxWidth } = useBreakpoint();
  return (
    <View
      style={[{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }, style]}
      {...props}
    />
  );
}
