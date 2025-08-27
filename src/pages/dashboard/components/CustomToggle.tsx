import React from 'react';
import { Box, Group, Tooltip } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface CustomToggleProps {
  value: 'list' | 'grid';
  onChange: (value: 'list' | 'grid') => void;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ value, onChange }) => {
  return (
    <Group
      gap={0}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: '2px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Tooltip label="List View" withArrow fz="xs">
        <Box
          onClick={() => onChange('list')}
          style={{
            height: '36px',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            backgroundColor: value === 'list' ? '#1e7ae8' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative',
          }}
          onMouseEnter={e => {
            if (value !== 'list') {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }
          }}
          onMouseLeave={e => {
            if (value !== 'list') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <ICONS.IconList
            size={18}
            color={value === 'list' ? '#ffffff' : '#6b7280'}
          />
        </Box>
      </Tooltip>

      <Tooltip label="Grid View" withArrow fz="xs">
        <Box
          onClick={() => onChange('grid')}
          style={{
            height: '36px',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            backgroundColor: value === 'grid' ? '#1e7ae8' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative',
          }}
          onMouseEnter={e => {
            if (value !== 'grid') {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
            }
          }}
          onMouseLeave={e => {
            if (value !== 'grid') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <ICONS.IconGridDots
            size={18}
            color={value === 'grid' ? '#ffffff' : '#6b7280'}
          />
        </Box>
      </Tooltip>
    </Group>
  );
};

export default CustomToggle;
