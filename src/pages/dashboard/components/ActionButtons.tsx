import { Group, Stack, Text } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Button } from '../../../components';
import type React from 'react';

const ActionButtons: React.FC<{
  openModal: (type: 'folder' | 'files') => void;
  handleSyncStorage: () => void;
  onActionComplete?: () => void;
}> = ({
  openModal = () => {},
  handleSyncStorage = () => {},
  onActionComplete = () => {},
}) => {
  const handleAction = (action: () => void) => {
    action();
    onActionComplete();
  };

  return (
    <Group gap={16} wrap="wrap">
      <Button
        onClick={() => handleAction(() => openModal('files'))}
        radius="md"
        px={24}
        py={16}
        style={{
          height: 80,
          minWidth: 100,
          fontWeight: 500,
          fontSize: 13,
          // backgroundColor: '#1e7ae8',
          backgroundColor: '#ffffff',
          // color: '#ffffff',
          color: '#374151',
          border: '1.5px solid #e5e7eb',
          // boxShadow: '0 2px 8px rgba(30, 122, 232, 0.2)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        // onMouseEnter={e => {
        //   e.currentTarget.style.backgroundColor = '#1968d1';
        //   e.currentTarget.style.transform = 'translateY(-2px)';
        //   e.currentTarget.style.boxShadow =
        //     '0 4px 12px rgba(30, 122, 232, 0.3)';
        // }}
        // onMouseLeave={e => {
        //   e.currentTarget.style.backgroundColor = '#1e7ae8';
        //   e.currentTarget.style.transform = 'translateY(0px)';
        //   e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 122, 232, 0.2)';
        // }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Stack gap={10} align="center">
          <ICONS.IconUpload size={20} color="#0284c7" />
          <Text size="xs" fw={500}>
            Upload Files
          </Text>
        </Stack>
      </Button>

      <Button
        onClick={() => handleAction(() => openModal('folder'))}
        radius="md"
        px={24}
        py={16}
        style={{
          height: 80,
          minWidth: 100,
          fontWeight: 500,
          fontSize: 13,
          backgroundColor: '#ffffff',
          color: '#374151',
          border: '1.5px solid #e5e7eb',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Stack gap={10} align="center">
          <ICONS.IconFolderPlus size={20} color="#0284c7" />
          <Text size="xs" fw={500}>
            New Folder
          </Text>
        </Stack>
      </Button>

      <Button
        onClick={() => handleAction(handleSyncStorage)}
        radius="md"
        px={24}
        py={16}
        style={{
          height: 80,
          minWidth: 100,
          fontWeight: 500,
          fontSize: 13,
          backgroundColor: '#ffffff',
          color: '#374151',
          border: '1.5px solid #e5e7eb',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.transform = 'translateY(0px)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Stack gap={10} align="center">
          <ICONS.IconRefresh size={20} color="#0284c7" />
          <Text size="xs" fw={500}>
            Sync
          </Text>
        </Stack>
      </Button>
    </Group>
  );
};

export default ActionButtons;
