import React, { useState, useCallback, useMemo } from 'react';
import { Table } from '../../components/table';
import { ICONS } from '../../assets/icons';
import { Menu } from '../../components';
import { ActionIcon, Avatar, Group, Text } from '@mantine/core';

type FileRow = {
  id: string;
  name: string;
  icon: React.ReactNode;
  owner: { name: string; avatar: string | null; initials: string };
  lastModified: string;
  size: string;
  actions?: React.ReactNode;
};

const files = [
  {
    id: '1',
    name: 'Documents',
    icon: <ICONS.IconFolder size={20} color="#38bdf8" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 15, 2023',
    size: '–',
  },
  {
    id: '2',
    name: 'Project_Report.pdf',
    icon: <ICONS.IconFileTypePdf size={20} color="#ef4444" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 27, 2023',
    size: '4.2 MB',
  },
];

const MENU_ITEMS = [
  { id: 'download', label: 'Download', icon: ICONS.IconDownload },
  { id: 'share', label: 'Share', icon: ICONS.IconShare },
  { id: 'delete', label: 'Delete', icon: ICONS.IconTrash },
];

const FileTable: React.FC = () => {
  // State for selected rows
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Handle row selection
  const onSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedRows(prev =>
      checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    );
  }, []);

  const onSelectAll = useCallback((checked: boolean) => {
    setSelectedRows(checked ? files.map(file => file.id) : []);
  }, []);

  // Handle menu item click
  const handleMenuItemClick = (actionId: string, _: FileRow) => {
    // Implement your logic for each action here
    if (actionId === 'download') {
      // Download logic for row
    } else if (actionId === 'share') {
      // Share logic for row
    } else if (actionId === 'delete') {
      // Delete logic for row
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: '30%',
        render: (row: FileRow) => (
          <Group gap={8} wrap="nowrap">
            {row.icon}
            <Text fw={600} truncate>
              {row.name}
            </Text>
          </Group>
        ),
      },
      {
        key: 'owner',
        label: 'Owner',
        width: '20%',
        render: (row: FileRow) => (
          <Group gap={8} wrap="nowrap">
            <Avatar src={row.owner.avatar} radius="xl" size="sm" color="blue">
              {row.owner.initials}
            </Avatar>
            <Text size="sm" truncate>
              {row.owner.name}
            </Text>
          </Group>
        ),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        width: '20%',
        render: (row: FileRow) => <Text size="sm">{row.lastModified}</Text>,
      },
      {
        key: 'size',
        label: 'Size',
        width: '15%',
        render: (row: FileRow) => <Text size="sm">{row.size}</Text>,
      },
      {
        key: 'actions',
        label: '',
        width: 40,
        render: (row: FileRow) => (
          <Menu
            items={MENU_ITEMS}
            onItemClick={actionId => handleMenuItemClick(actionId, row)}
          >
            <ActionIcon variant="subtle" color="gray">
              <ICONS.IconDotsVertical size={18} />
            </ActionIcon>
          </Menu>
        ),
      },
    ],
    [handleMenuItemClick]
  );

  return (
    <Table
      title="All Files"
      data={files}
      columns={columns}
      selectedRows={selectedRows}
      onSelectRow={onSelectRow}
      onSelectAll={onSelectAll}
      idKey="id"
    />
  );
};

export default FileTable;
