import { colors, fontFamily } from '@guara/ui-tokens';
import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'editable'> {
  ref?: Ref<TextInput>;
  label?: string;
  /** Hint shown below the field (hidden while there is an error). */
  helperText?: string;
  /** Hint line with a leading element (e.g. a green check: "Petrobras PN · cotação…"). */
  helper?: ReactNode;
  /** Error message (e.g. from zod). Turns the border red and is announced. */
  errorMessage?: string;
  leftIcon?: IconName;
  /** Element at the right edge (clear button, unit…). */
  rightElement?: ReactNode;
  /** Bold value ("PETR4"). */
  strong?: boolean;
  /** Field height in dp (design: 52 in forms, 44–48 in search bars, 64 for the main amount). */
  size?: 44 | 46 | 48 | 52 | 64;
  /** Big Fraunces amount (the main value of a form). */
  display?: boolean;
  /** Corner radius: pill (default) or 16 (tablet amount field). */
  rounded?: 'full' | '16';
  disabled?: boolean;
  /** Classes for the outer wrapper (label + field + messages). */
  containerClassName?: string;
  className?: string;
}

/** Pill text field (52 tall, 16 text) with label, helper/error, icon, focus and disabled. */
export function Input({
  label,
  helperText,
  helper,
  errorMessage,
  leftIcon,
  rightElement,
  strong = false,
  size = 52,
  display = false,
  rounded = 'full',
  disabled = false,
  containerClassName,
  className,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorMessage);

  return (
    <View className={cn('gap-2', containerClassName)}>
      {label ? (
        <Text variant="label" tone={disabled ? 'subtle' : 'default'}>
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center gap-2.5 border bg-surface-input px-3.5',
          rounded === 'full' ? 'rounded-full' : 'rounded-16',
          focused ? 'border-border-focus' : 'border-border-strong',
          hasError && 'border-negative',
          disabled && 'border-transparent bg-disabled-background',
        )}
        style={{ height: size }}
      >
        {leftIcon ? (
          <Icon
            name={leftIcon}
            size={20}
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
            'h-full flex-1',
            disabled ? 'text-disabled-foreground' : 'text-foreground',
            className,
          )}
          style={[
            display
              ? {
                  fontFamily: fontFamily.serifExtrabold,
                  fontSize: 30,
                  fontVariant: ['tabular-nums'],
                }
              : {
                  fontFamily: strong ? fontFamily.bold : fontFamily.regular,
                  fontSize: size >= 52 ? 16 : 15,
                },
            style,
          ]}
          {...props}
        />
        {rightElement}
      </View>
      {hasError ? (
        <Text variant="caption" tone="negative" accessibilityLiveRegion="polite" role="alert">
          {errorMessage}
        </Text>
      ) : helper ? (
        <View className="flex-row items-center gap-1.5">{helper}</View>
      ) : helperText ? (
        <Text variant="caption" tone="muted">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
