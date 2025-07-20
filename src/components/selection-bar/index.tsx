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
    p={8}
    pl={16}
    w="100%"
    style={{
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
    }}
  >
    <Group gap={12}>
      <Text fw={500} size="sm">
        {count} selected
      </Text>
      <Tooltip label="Download" fz="xs">
        <ActionIcon style={iconStyle} onClick={onDownload}>
          <ICONS.IconDownload size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Share" fz="xs">
        <ActionIcon style={iconStyle} onClick={onShare}>
          <ICONS.IconShare size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete" fz="xs">
        <ActionIcon style={iconStyle} color="red" onClick={onDelete}>
          <ICONS.IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
    <ActionIcon style={iconStyle} onClick={onCancel}>
      <ICONS.IconX size={18} />
    </ActionIcon>
  </Box>
);
