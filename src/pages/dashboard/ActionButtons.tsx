import { Group } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { Button } from '../../components';

const actionButtons = [
  {
    icon: ICONS.IconUpload,
    label: 'Upload Files',
    color: 'blue',
    variant: 'filled',
    isPrimary: true,
  },
  {
    icon: ICONS.IconFolderPlus,
    label: 'New Folder',
  },
  {
    icon: ICONS.IconDownload,
    label: 'Download',
  },
  {
    icon: ICONS.IconShare,
    label: 'Share',
  },
  {
    icon: ICONS.IconRefresh,
    label: 'Sync',
  },
];

const ActionButtons = () => {
  return (
    <Group gap={12} mb={32} wrap="wrap">
      {actionButtons.map(({ icon: Icon, label, isPrimary }) => (
        <Button
          key={label}
          leftSection={
            <Icon
              size={20}
              color={isPrimary ? '#fff' : '#2563eb'} // blue-600 for icons
            />
          }
          radius="md"
          size="md"
          px={20}
          style={{
            minWidth: 130,
            height: 48,
            fontWeight: 500,
            fontSize: 14,
            backgroundColor: isPrimary ? '#2563eb' : '#fff',
            color: isPrimary ? '#fff' : '#1e293b',
            border: isPrimary ? 'none' : '1px solid #e5e7eb',
            boxShadow: isPrimary ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {label}
        </Button>
      ))}
    </Group>
  );
};

export default ActionButtons;
