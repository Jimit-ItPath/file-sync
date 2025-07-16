import React, { useCallback, useMemo, useState } from 'react';
import { ICONS } from '../../../assets/icons';
import { Menu, Table } from '../../../components';
import { ActionIcon, Avatar, Group, Text } from '@mantine/core';
import type { FileType } from '../use-dashboard';

type FileRow = {
  id: string;
  name: string;
  icon: (size: number) => React.ReactNode;
  owner: { name: string; avatar: string | null; initials: string };
  lastModified: string;
  size: string;
  actions?: React.ReactNode;
};

const MENU_ITEMS = [
  // { id: 'download', label: 'Download', icon: ICONS.IconDownload },
  // { id: 'share', label: 'Share', icon: ICONS.IconShare },
  { id: 'delete', label: 'Delete', icon: ICONS.IconTrash },
];

type FileTableProps = {
  files: FileType[];
  iconSize?: number;
  selectedIds: string[];
  handleSelect: (id: string, event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleSelectAll: () => void;
  handleUnselectAll: () => void;
};

const FileTable: React.FC<FileTableProps> = ({
  files,
  iconSize = 24,
  handleSelect = () => {},
  handleKeyDown = () => {},
  selectedIds = [],
  handleSelectAll = () => {},
  handleUnselectAll = () => {},
}) => {
  // State for selected rows
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Handle row selection
  const onSelectRow = useCallback(
    (id: string, checked: boolean, event?: React.MouseEvent) => {
      setSelectedRows(prev =>
        checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
      );
      // if (event && (event.ctrlKey || event.metaKey)) {
      //   handleSelect(id, event);
      // } else {
      //   // Simulate a click event with no ctrl/meta for single select
      //   handleSelect(id, {
      //     ctrlKey: false,
      //     shiftKey: false,
      //     metaKey: false,
      //   } as any);
      // }
    },
    [handleSelect]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      // setSelectedRows(checked ? files.map(file => file.id) : []);
      if (checked) {
        handleSelectAll();
      } else {
        handleUnselectAll();
      }
    },
    [handleSelectAll, handleUnselectAll]
  );

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
            {row.icon(iconSize)}
            <Text fw={600} fz={'sm'} truncate>
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
    [handleMenuItemClick, iconSize, selectedIds]
  );

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
      <Table
        // title="All Files"
        data={files}
        columns={columns}
        selectedRows={selectedRows}
        // selectedRows={selectedIds}
        // onSelectRow={onSelectRow}
        onSelectAll={onSelectAll}
        onSelectRow={(id, checked, event) => onSelectRow(id, checked, event)}
        idKey="id"
        emptyMessage="No files available. Please upload files to see them here."
      />
    </div>
  );
};

export default FileTable;
