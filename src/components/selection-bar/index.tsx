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
  onMove,
  onPaste,
  isMoveMode,
  isPasteEnabled = true,
}: {
  count: number;
  onCancel: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
  onMove: () => void;
  onPaste: () => void;
  isMoveMode: boolean;
  isPasteEnabled: boolean;
}) => (
  <Box
    bg="#f3f4f6"
    py={7}
    px={16}
    // flex={1}
    // w="100%"
    style={{
      borderRadius: 8,
      flexGrow: 1,
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
      {!isMoveMode ? (
        <>
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
          <Tooltip label="Move" fz="xs">
            <ActionIcon style={iconStyle} onClick={onMove}>
              <ICONS.IconFolderShare size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete" fz="xs">
            <ActionIcon style={iconStyle} color="red" onClick={onDelete}>
              <ICONS.IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </>
      ) : (
        <Tooltip label="Paste here" fz="xs">
          <ActionIcon
            style={iconStyle}
            disabled={!isPasteEnabled}
            onClick={onPaste}
          >
            <ICONS.IconClipboard size={18} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
    <ActionIcon style={iconStyle} onClick={onCancel}>
      <ICONS.IconX size={18} />
    </ActionIcon>
  </Box>
);
