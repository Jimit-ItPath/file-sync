import {
  Switch as MantineSwitch,
  type SwitchProps as MantineSwitchProps,
} from '@mantine/core';

type SwitchProps = {
  field: any;
  [key: string]: any;
} & MantineSwitchProps;

const Switch = ({ field, ...props }: SwitchProps) => {
  const { value, onChange, onBlur, ref } = field;
  return (
    <MantineSwitch
      {...{ onBlur, ref }}
      checked={value}
      onChange={e => onChange(e.currentTarget.checked)}
      {...props}
    />
  );
};

export default Switch;
