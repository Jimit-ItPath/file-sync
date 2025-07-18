import { Group } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Breadcrumbs, Button } from '../../../components';
import type React from 'react';

interface ActionBtnsProps {
  currentPath: {
    id?: string;
    name: string;
  }[];
  navigateToFolderFn: (
    folder: {
      id?: string;
      name: string;
    } | null
  ) => void;
  openModal: (type: 'folder' | 'files') => void;
}

const ActionButtons: React.FC<ActionBtnsProps> = ({
  currentPath = [],
  navigateToFolderFn = () => {},
  openModal = () => {},
}) => {
  return (
    // <Group justify="space-between" mb="md">
    <Group gap={12} mb={20} wrap="wrap">
      <Button
        leftSection={<ICONS.IconUpload size={20} color="#2563eb" />}
        onClick={() => openModal('files')}
        radius="md"
        size="md"
        px={20}
        style={{
          minWidth: 130,
          height: 48,
          fontWeight: 500,
          fontSize: 14,
          backgroundColor: '#fff',
          color: '#1e293b',
          border: '1px solid #e5e7eb',
        }}
      >
        Upload Files
      </Button>
      <Button
        leftSection={<ICONS.IconFolderPlus size={20} color="#2563eb" />}
        onClick={() => openModal('folder')}
        radius="md"
        size="md"
        px={20}
        style={{
          minWidth: 130,
          height: 48,
          fontWeight: 500,
          fontSize: 14,
          backgroundColor: '#fff',
          color: '#1e293b',
          border: '1px solid #e5e7eb',
        }}
      >
        New Folder
      </Button>
      {/* <Button
          leftSection={<ICONS.IconDownload size={20} color="#2563eb" />}
          radius="md"
          size="md"
          px={20}
          style={{
            minWidth: 130,
            height: 48,
            fontWeight: 500,
            fontSize: 14,
            backgroundColor: '#fff',
            color: '#1e293b',
            border: '1px solid #e5e7eb',
          }}
        >
          Download
        </Button> */}
    </Group>
    /* </Group> */
  );
};

export default ActionButtons;
