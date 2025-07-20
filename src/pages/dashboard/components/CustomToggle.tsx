import React from 'react';
import { Box, Stack, Tooltip } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface CustomToggleProps {
  value: 'list' | 'grid';
  onChange: (value: 'list' | 'grid') => void;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ value, onChange }) => {
  return (
    <Stack
      gap={5}
      style={{
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: '4px',
        height: '40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // width: '100px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Tooltip label="List View" withArrow fz="xs">
        <Box
          onClick={() => onChange('list')}
          style={{
            height: '32px',
            width: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            backgroundColor: value === 'list' ? '#1c7ed6' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          <ICONS.IconList
            size={18}
            color={value === 'list' ? '#ffffff' : '#1c7ed6'}
          />
        </Box>
      </Tooltip>

      {/* Border between the two icons */}
      <Box
        style={{
          height: '24px',
          width: '1px',
          backgroundColor: '#e5e7eb',
          transition: 'background-color 0.2s ease',
        }}
      />

      <Tooltip label="Grid View" withArrow fz="xs">
        <Box
          onClick={() => onChange('grid')}
          style={{
            height: '32px',
            width: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            backgroundColor: value === 'grid' ? '#1c7ed6' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          <ICONS.IconGridDots
            size={18}
            color={value === 'grid' ? '#ffffff' : '#1c7ed6'}
          />
        </Box>
      </Tooltip>
    </Stack>
  );
};

export default CustomToggle;
