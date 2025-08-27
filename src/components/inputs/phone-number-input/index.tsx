import {
  Group,
  Input,
  Text,
  rem,
  TextInput as MantineTextInput,
} from '@mantine/core';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

type PhoneNumberInputProps = {
  field: any;
  label?: string;
  withAsterisk?: boolean;
  clearable?: boolean;
  maxCharCount?: number;
  [key: string]: any;
};

const PhoneNumberInput = ({
  field,
  label,
  withAsterisk,
  clearable,
  maxCharCount,
  isXs,
  isSm,
  isMd,
  ...props
}: PhoneNumberInputProps) => {
  const { value, onChange, onBlur, ref } = field;

  const isMaxCharCount = Boolean(maxCharCount);
  const isLabel = Boolean(label);
  const isLimitReached = value?.length === maxCharCount;

  return (
    <>
      <MantineTextInput
        component={PhoneInput as any}
        {...{ value, onBlur, ref }}
        onChange={(val: any) => {
          if (!isMaxCharCount || (val?.length ?? 0) <= (maxCharCount ?? 0)) {
            onChange(val);
          }
        }}
        {...(clearable && {
          rightSection: value ? (
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
        styles={{
          input: { fontSize: isMd ? rem(14) : rem(16) },
          label: { width: '100%', fontSize: isMd ? rem(14) : rem(16) },
        }}
        {...props}
      />
      <style>
        {`
          .PhoneInput {
            padding-right: 4px;
          }
          .PhoneInputInput, .PhoneInputInput:focus-visible {
            border: none;
            outline: none;
          }
          .PhoneInputInput {
            padding-left: 10px;
          }  
          .PhoneInputInput::placeholder {
            color: #adb5bd;
          }
          .PhoneInputCountry {
            border-right: 1px solid #ced4da;
            padding-right: 10px;
            margin-right: 0px;
            // margin-right: 10px;
          }
          .PhoneInputCountry .PhoneInputCountrySelectArrow {
            margin-left: 10px;
          }  
        `}
      </style>
    </>
  );
};

export default PhoneNumberInput;
