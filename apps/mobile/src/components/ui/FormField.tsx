import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from './Input';
import { MoneyInput, type MoneyInputProps } from './MoneyInput';

type ControlledProps = 'value' | 'onChangeText' | 'onChangeValue' | 'onBlur' | 'errorMessage';

interface BaseFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  control: Control<T>;
  name: N;
}

export type FormFieldProps<T extends FieldValues, N extends FieldPath<T>> = BaseFieldProps<T, N> &
  (
    | ({ type?: 'text' } & Omit<InputProps, ControlledProps>)
    | ({ type: 'money' } & Omit<MoneyInputProps, ControlledProps>)
  );

/**
 * Binds an `Input` or `MoneyInput` to react-hook-form and shows the validation
 * message (e.g. from a zod schema via `zodResolver`).
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>(
  props: FormFieldProps<T, N>,
) {
  const { control, name } = props;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message;
        if (props.type === 'money') {
          const { control: _c, name: _n, type: _t, ...inputProps } = props;
          return (
            <MoneyInput
              {...inputProps}
              ref={field.ref}
              value={field.value ?? null}
              onChangeValue={field.onChange}
              onBlur={field.onBlur}
              errorMessage={errorMessage}
            />
          );
        }
        const { control: _c, name: _n, type: _t, ...inputProps } = props;
        return (
          <Input
            {...inputProps}
            ref={field.ref}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={errorMessage}
          />
        );
      }}
    />
  );
}
