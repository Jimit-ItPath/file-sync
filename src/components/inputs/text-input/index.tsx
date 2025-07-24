import {
  Group,
  Input,
  TextInput as MantineTextInput,
  rem,
  Text,
  type TextInputProps as MantineTextInputProps,
} from '@mantine/core';

type TextInputProps = {
  field: any;
  clearable?: boolean;
  label?: string;
  withAsterisk?: boolean;
  maxCharCount?: number;
  [key: string]: any;
} & MantineTextInputProps;

const TextInput = ({
  field,
  clearable,
  label,
  withAsterisk,
  maxCharCount,
  isXs,
  isSm,
  isMd,
  ...props
}: TextInputProps) => {
  const { value, onChange, onBlur, ref } = field;

  const isMaxCharCount = Boolean(maxCharCount);
  const isLabel = Boolean(label);

  const isLimitReached = value?.length === maxCharCount;

  return (
    <MantineTextInput
      {...{ value, onBlur, ref }}
      onChange={e => {
        onChange(e.target.value);
      }}
      {...(clearable && {
        rightSection:
          value !== '' ? (
            <Input.ClearButton onClick={() => onChange('')} />
          ) : undefined,
      })}
      rightSectionPointerEvents="auto"
      {...(isLabel && {
        label: (
          <Group justify="space-between">
            <Input.Label w="auto" required={withAsterisk}>
              {label}
            </Input.Label>
            {isMaxCharCount && (
              <Text size={rem(11)} c={isLimitReached ? 'red' : 'gray'}>
                {value?.length || 0}/{maxCharCount}
              </Text>
            )}
          </Group>
        ),
      })}
      fz={isMd ? rem(14) : rem(16)}
      {...(isMaxCharCount && { maxLength: maxCharCount })}
      styles={{ label: { width: '100%', fontSize: isMd ? rem(14) : rem(16) } }}
      {...props}
    />
  );
};

export default TextInput;
