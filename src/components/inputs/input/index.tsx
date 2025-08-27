import { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import Select from '../select';
import PasswordInput from '../password-input';
import TextInput from '../text-input';
import Checkbox from '../checkbox';
import Switch from '../switch';
import CheckboxGroup from '../checkbox-group';
import { Dropzone } from '../dropzone';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Textarea from '../text-area';
import PhoneNumberInput from '../phone-number-input';

type InputProps = {
  name: string;
  type?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: string;
  withAsterisk?: boolean;
  withErrorStyles?: boolean;
  data?: any[];
  focus?: boolean;
  loading?: boolean;
  getData?: any;
  returnObject?: boolean;
  nothingFoundMessage?: string;
  onChange?: (value: any) => void;
  files?: File[];
  [key: string]: any;
};

export const Input = ({
  name,
  type = 'text',
  label,
  placeholder,
  disabled = false,
  size = 'sm',
  withAsterisk = false,
  withErrorStyles = false,
  data = [], // [{ value: 'react', label: 'React library' }],
  focus = false,
  onFilesSelected,
  getFileIcon,
  files = [],
  ...props
}: InputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
  });

  const { setFocus } = useFormContext();

  const errorMessage = error?.message || '';

  const theme = useMantineTheme();
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const renderInput = (type: string) => {
    switch (type) {
      case 'password-input':
        return (
          <PasswordInput
            {...{
              name,
              label,
              placeholder,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      case 'select':
        return (
          <Select
            {...{
              name,
              label,
              placeholder,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              data,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      case 'switch':
        return (
          <Switch
            {...{
              name,
              label,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            {...{
              name,
              label,
              error: errorMessage,
              disabled,
              size,
              field,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      case 'checkbox-group':
        return (
          <CheckboxGroup
            {...{
              name,
              label,
              error: errorMessage,
              disabled,
              size,
              field,
              data,
              withAsterisk,
              ...props,
            }}
          />
        );
      case 'dropzone':
        return (
          <Dropzone
            {...{
              onFilesSelected,
              getFileIcon,
              files,
              ...props,
            }}
          />
        );
      case 'phone-number':
        return (
          <PhoneNumberInput
            {...{
              name,
              label,
              placeholder,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      case 'textarea':
        return (
          <Textarea
            {...{
              name,
              label,
              placeholder,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
      default:
        return (
          <TextInput
            {...{
              name,
              label,
              placeholder,
              error: errorMessage,
              disabled,
              withAsterisk,
              withErrorStyles,
              size,
              field,
              type,
              isXs,
              isSm,
              isMd,
              ...props,
            }}
          />
        );
    }
  };

  useEffect(() => {
    if (focus) {
      setFocus(name);
    }
  }, [focus, name, setFocus]);

  return renderInput(type);
};
