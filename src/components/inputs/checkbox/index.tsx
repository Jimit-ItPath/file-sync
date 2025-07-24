import {
  Checkbox as MantineCheckbox,
  rem,
  type CheckboxProps as MantineCheckboxProps,
} from '@mantine/core';

type CheckboxProps = {
  field: any;
  [key: string]: any;
} & MantineCheckboxProps;

const Checkbox = ({ field, isXs, isSm, isMd, ...props }: CheckboxProps) => {
  const { value, onChange, onBlur, ref } = field;
  return (
    <MantineCheckbox
      {...{ onBlur, ref }}
      checked={value}
      onChange={e => onChange(e.currentTarget.checked)}
      styles={{
        label: {
          fontSize: isMd ? rem(14) : rem(16),
        },
        input: {
          width: isMd ? 22 : 24,
          height: isMd ? 22 : 24,
        },
      }}
      {...props}
    />
  );
};

export default Checkbox;
