import { colors, iconSize } from '@guara/ui-tokens';
import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'editable'> {
  ref?: Ref<TextInput>;
  label?: string;
  /** Hint shown below the field (hidden while there is an error). */
  helperText?: string;
  /** Error message (e.g. from zod). Turns the border red and is announced. */
  errorMessage?: string;
  leftIcon?: LucideIcon;
  /** Element at the right edge (clear button, unit…). */
  rightElement?: ReactNode;
  disabled?: boolean;
  /** Classes for the outer wrapper (label + field + messages). */
  containerClassName?: string;
  className?: string;
}

/** Text field with label, helper/error message, icon, focus and disabled states. */
export function Input({
  label,
  helperText,
  errorMessage,
  leftIcon: LeftIcon,
  rightElement,
  disabled = false,
  containerClassName,
  className,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text variant="label" tone={disabled ? 'subtle' : 'muted'}>
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'h-control-md flex-row items-center gap-2 rounded-lg border bg-surface px-3',
          focused ? 'border-border-focus' : 'border-border',
          hasError && 'border-negative',
          disabled && 'border-transparent bg-disabled-background',
        )}
      >
        {LeftIcon ? (
          <LeftIcon
            size={iconSize.md}
            color={disabled ? colors.disabled.foreground : colors.foreground.subtle}
          />
        ) : null}
        <TextInput
          editable={!disabled}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={errorMessage ?? accessibilityHint ?? helperText}
          accessibilityState={{ disabled }}
          placeholderTextColor={colors.foreground.subtle}
          selectionColor={colors.brand.DEFAULT}
          cursorColor={colors.brand.DEFAULT}
          maxFontSizeMultiplier={1.6}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            'h-full flex-1 font-sans text-body',
            disabled ? 'text-disabled-foreground' : 'text-foreground',
            className,
          )}
          {...props}
        />
        {rightElement}
      </View>
      {hasError ? (
        <Text variant="caption" tone="negative" accessibilityLiveRegion="polite" role="alert">
          {errorMessage}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="subtle">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
