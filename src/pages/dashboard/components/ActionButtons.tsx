import { Group } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Button } from '../../../components';
import type React from 'react';

const ActionButtons: React.FC<{
  openModal: (type: 'folder' | 'files') => void;
}> = ({ openModal }) => {
  return (
    <Group gap={8} mb={16} wrap="wrap">
      <Button
        leftSection={<ICONS.IconUpload size={16} color="#2563eb" />}
        onClick={() => openModal('files')}
        radius="md"
        size="sm"
        px={16}
        style={{
          height: 40,
          fontWeight: 500,
          fontSize: 13,
          backgroundColor: '#fff',
          color: '#1e293b',
          border: '1px solid #e5e7eb',
        }}
      >
        Upload Files
      </Button>
      <Button
        leftSection={<ICONS.IconFolderPlus size={16} color="#2563eb" />}
        onClick={() => openModal('folder')}
        radius="md"
        size="sm"
        px={16}
        style={{
          height: 40,
          fontWeight: 500,
          fontSize: 13,
          backgroundColor: '#fff',
          color: '#1e293b',
          border: '1px solid #e5e7eb',
        }}
      >
        New Folder
      </Button>
    </Group>
  );
};

export default ActionButtons;
