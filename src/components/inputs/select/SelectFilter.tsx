import { Select, type ComboboxData, type SelectProps } from '@mantine/core';
import React from 'react';

interface SelectFilterProps {
  data: ComboboxData;
  value: string | null;
  label: string;
  onChange?: SelectProps['onChange'];
  onClear?: SelectProps['onClear'];
  width?: number;
  placeholder?: string;
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  data,
  value,
  label,
  onChange,
  onClear,
  width = 200,
  placeholder = 'Select type',
}) => {
  return (
    <Select
      data={data}
      value={value}
      label={label}
      onChange={onChange}
      onClear={onClear}
      placeholder={placeholder}
      clearable
      w={width}
      styles={{
        input: {
          border: '1px solid #ced4da',
          backgroundColor: '#ffffff',
          zIndex: 10,
          fontSize: '14px',
          fontWeight: 500,
          color: '#374151',
          transition: 'all 0.2s ease',
          '&:focus': {
            borderColor: '#1e7ae8',
            boxShadow: '0 0 0 3px rgba(30, 122, 232, 0.1)',
          },
          '&:hover': {
            borderColor: '#d1d5db',
          },
        },
        dropdown: {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
        option: {
          padding: '6px',
          fontSize: '14px',
          borderRadius: '4px',
          margin: '2px',
          '&[data-selected]': {
            backgroundColor: '#1e7ae8',
            color: '#ffffff',
          },
          '&:hover': {
            backgroundColor: '#f1f5f9',
          },
        },
      }}
    />
  );
};

export default SelectFilter;
