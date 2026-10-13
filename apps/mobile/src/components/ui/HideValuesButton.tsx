import { haptics } from '@/lib/haptics';
import { useUiPreferences } from '@/stores/ui-preferences';

import { IconButton, type IconButtonProps } from './IconButton';

/** "Ocultar valores" / "Mostrar valores": privacy mode for every amount of the app. */
export function HideValuesButton(props: Pick<IconButtonProps, 'variant' | 'size' | 'className'>) {
  const hidden = useUiPreferences((state) => state.hideBalances);
  const toggle = useUiPreferences((state) => state.toggleHideBalances);
  return (
    <IconButton
      icon={hidden ? 'eyeOff' : 'eye'}
      accessibilityLabel={hidden ? 'Mostrar valores' : 'Ocultar valores'}
      accessibilityState={{ selected: hidden }}
      onPress={() => {
        haptics.selection();
        toggle();
      }}
      {...props}
    />
  );
}
