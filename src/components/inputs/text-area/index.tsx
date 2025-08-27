import {
  Group,
  Input,
  Text,
  Textarea as MantineTextarea,
  rem,
  type TextareaProps as MantineTextareaProps,
} from '@mantine/core';

type TextareaProps = {
  field: any;
  clearable?: boolean;
  label?: string;
  withAsterisk?: boolean;
  maxCharCount?: number;
  [key: string]: any;
} & MantineTextareaProps;

const Textarea = ({
  field,
  clearable,
  label,
  withAsterisk,
  maxCharCount = 2000,
  isXs,
  isSm,
  isMd,
  ...props
}: TextareaProps) => {
  const { value, onChange, onBlur, ref } = field;

  const isMaxCharCount = Boolean(maxCharCount);
  const isLabel = Boolean(label);

  const isLimitReached = value?.length === maxCharCount;

  return (
    <MantineTextarea
      {...{ value, onBlur, ref }}
      onChange={e => {
        const newValue = e.currentTarget.value;
        if (!isMaxCharCount || newValue.length <= (maxCharCount ?? 0)) {
          onChange(newValue);
        }
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
      autosize
      minRows={2}
      resize="vertical"
      {...props}
    />
  );
};

export default Textarea;
