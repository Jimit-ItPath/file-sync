import { Group, Text, ActionIcon, Box } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { Tooltip } from '../tooltip';

const iconStyle = {
  borderRadius: 999,
  transition: 'background 0.2s',
  padding: 4,
  '&:hover': {
    background: '#e0e7ff',
  },
};

export const SelectionBar = ({
  count,
  onCancel,
  onDelete,
  onDownload,
  onShare,
}: {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
}) => (
  <Box
    bg="#f3f4f6"
    p={12}
    pl={20}
    w={'100%'}
    style={{
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    }}
  >
    <Group gap={16}>
      <Text fw={600}>{count} selected</Text>
      <Tooltip label="Download" fz={'xs'}>
        <ActionIcon style={iconStyle} onClick={onDownload}>
          <ICONS.IconDownload size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Share" fz={'xs'}>
        <ActionIcon style={iconStyle} onClick={onShare}>
          <ICONS.IconShare size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete" fz={'xs'}>
        <ActionIcon style={iconStyle} color="red" onClick={onDelete}>
          <ICONS.IconTrash size={20} />
        </ActionIcon>
      </Tooltip>
    </Group>
    <ActionIcon style={iconStyle} onClick={onCancel}>
      <ICONS.IconX size={20} />
    </ActionIcon>
  </Box>
);
