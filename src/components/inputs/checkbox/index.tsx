import {
  Checkbox as MantineCheckbox,
  type CheckboxProps as MantineCheckboxProps,
} from '@mantine/core';

type CheckboxProps = {
  field: any;
  [key: string]: any;
} & MantineCheckboxProps;

const Checkbox = ({ field, ...props }: CheckboxProps) => {
  const { value, onChange, onBlur, ref } = field;
  return (
    <MantineCheckbox
      {...{ onBlur, ref }}
      checked={value}
      onChange={e => onChange(e.currentTarget.checked)}
      {...props}
    />
  );
};

export default Checkbox;
