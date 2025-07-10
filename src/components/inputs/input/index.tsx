import { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import Select from '../select';
import PasswordInput from '../password-input';
import TextInput from '../text-input';
import Checkbox from '../checkbox';
import Switch from '../switch';
import CheckboxGroup from '../checkbox-group';
import { Dropzone } from '../dropzone';

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
