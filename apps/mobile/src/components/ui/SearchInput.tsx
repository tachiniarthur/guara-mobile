import { SearchIcon, XIcon } from 'lucide-react-native';

import { IconButton } from './IconButton';
import { Input, type InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightElement'> {
  value: string;
  onChangeText: (text: string) => void;
  /** Called after the clear button empties the field. */
  onClear?: () => void;
}

/** Search field with a magnifier icon and a clear button. */
export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar',
  ...props
}: SearchInputProps) {
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      accessibilityLabel={props.accessibilityLabel ?? props.label ?? placeholder}
      leftIcon={SearchIcon}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
      rightElement={
        value ? (
          <IconButton
            icon={XIcon}
            size="sm"
            accessibilityLabel="Limpar busca"
            onPress={() => {
              onChangeText('');
              onClear?.();
            }}
          />
        ) : null
      }
      {...props}
    />
  );
}
