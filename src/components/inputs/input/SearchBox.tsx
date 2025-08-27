import { ActionIcon, TextInput } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import React from 'react';

const SearchBox = React.memo(
  ({
    value,
    onChange,
    onClear,
    placeholder,
    maw,
  }: {
    value: string | undefined;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    maw?: number | string;
  }) => (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      rightSection={
        value ? (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => onClear()}
            style={{ cursor: 'pointer' }}
          >
            <ICONS.IconX size={14} />
          </ActionIcon>
        ) : null
      }
      w="100%"
      size="sm"
      maw={maw}
    />
  )
);

export default SearchBox;
