import { colors, fontFamily } from '@guara/ui-tokens';
import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';

import { CODE_LENGTH, onlyDigits } from '../lib/code';

/**
 * "Código de 6 dígitos": six boxes over one real field, so the keyboard, paste and the
 * system's code suggestion fill all digits at once.
 */
export function CodeInput({
  value,
  onChange,
  invalid = false,
  editable = true,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  editable?: boolean;
  /** Called when the 6th digit is typed. */
  onComplete?: (code: string) => void;
}) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? '');
  const focusIndex = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <Pressable accessible={false} onPress={() => inputRef.current?.focus()} className="relative">
      <View
        className="flex-row justify-between gap-2"
        importantForAccessibility="no-hide-descendants"
      >
        {digits.map((digit, index) => (
          <View
            key={index}
            className={cn(
              'h-14 w-11 items-center justify-center rounded-14 bg-surface-input',
              invalid
                ? 'border-[1.5px] border-negative'
                : index === focusIndex && editable
                  ? 'border-[1.5px] border-brand'
                  : 'border border-border-strong',
            )}
          >
            <Text serif weight="bold" size={26}>
              {digit}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const code = onlyDigits(text);
          onChange(code);
          if (code.length === CODE_LENGTH) onComplete?.(code);
        }}
        editable={editable}
        autoFocus
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        accessibilityLabel="Código de 6 dígitos"
        accessibilityHint={`${value.length} de ${CODE_LENGTH} dígitos digitados`}
        aria-invalid={invalid}
        caretHidden
        selectionColor={colors.brand.DEFAULT}
        className="absolute inset-0 text-transparent"
        style={{ fontFamily: fontFamily.regular, opacity: 0.01 }}
      />
    </Pressable>
  );
}
