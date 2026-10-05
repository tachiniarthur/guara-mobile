import { Checkbox, type CheckboxProps } from './Checkbox';

export interface SwitchProps extends Omit<CheckboxProps, 'checked' | 'onChange' | 'role'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** On/off setting. The design draws it as a checkbox row announced as a switch. */
export function Switch({ value, onValueChange, ...props }: SwitchProps) {
  return <Checkbox role="switch" checked={value} onChange={onValueChange} {...props} />;
}
