import { colors } from '@guara/ui-tokens';
import Svg, { Circle, Path } from 'react-native-svg';

/** Round Brazilian flag marking assets traded in Brazil ("BRA"). Decorative. */
export function BrazilFlag({ size = 16 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Circle cx={10} cy={10} r={10} fill={colors.flag.green} />
      <Path d="M10 3.5 17.5 10 10 16.5 2.5 10z" fill={colors.flag.yellow} />
      <Circle cx={10} cy={10} r={3.6} fill={colors.flag.blue} />
    </Svg>
  );
}
