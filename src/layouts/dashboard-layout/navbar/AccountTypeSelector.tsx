import { Box, Group, Input, Text, UnstyledButton } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

const AccountTypeSelector = ({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
  error?: string;
}) => {
  const options = [
    {
      value: 'google_drive',
      label: 'Google Drive',
      icon: (
        <ICONS.IconBrandGoogle
          size={22}
          color="#ef4444"
          stroke={1.25}
          fill="#ef4444"
        />
      ),
    },
    {
      value: 'dropbox',
      label: 'Dropbox',
      icon: (
        <ICONS.IconDroplets
          size={22}
          color="#007ee5"
          stroke={1.25}
          fill="#007ee5"
        />
      ),
    },
    {
      value: 'onedrive',
      label: 'OneDrive',
      icon: (
        <ICONS.IconBrandOnedrive
          size={22}
          color="#0078d4"
          stroke={1.25}
          fill="#0078d4"
        />
      ),
    },
  ];

  const handleAccountClick = (val: string) => {
    if (val === value) {
      onChange(null);
    } else {
      onChange(val);
    }
  };

  return (
    <Box>
      <Input.Label w="auto" required>
        Select Account
      </Input.Label>
      <Group mt="xs">
        {options.map(({ value: val, label, icon }) => {
          const selected = val === value;
          return (
            <UnstyledButton
              key={val}
              onClick={() => handleAccountClick(val)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: `1px solid ${selected ? '#2C2E33' : '#DEE2E6'}`,
                backgroundColor: selected ? '#2C2E33' : 'white',
                color: selected ? 'white' : '#495057',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {icon}
              <span>{label}</span>
            </UnstyledButton>
          );
        })}
      </Group>
      {error && (
        <Text mt="xs" c="red" fz="sm">
          {error}
        </Text>
      )}
    </Box>
  );
};

export default AccountTypeSelector;
