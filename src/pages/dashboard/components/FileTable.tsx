import React, { useEffect, useMemo, useRef } from 'react';
import { ICONS } from '../../../assets/icons';
import { Menu, Table, Tooltip } from '../../../components';
import { ActionIcon, Avatar, Group, Text } from '@mantine/core';
import type { FileType } from '../use-dashboard';
import { PREVIEW_FILE_TYPES } from '../../../utils/constants';

const MENU_ITEMS: [
  { id: string; label: string; icon: React.FC; color?: string },
] = [{ id: 'rename', label: 'Rename', icon: ICONS.IconEdit }];

type FileTableProps = {
  files: FileType[];
  iconSize?: number;
  handleSelect: (id: string, event: React.MouseEvent) => void;
  // handleKeyDown: (event: React.KeyboardEvent) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  selectedIds: string[];
  currentPath: {
    id?: string;
    name: string;
  }[];
  handleMenuItemClick: (actionId: string, row: FileType) => void;
  handleRowDoubleClick: (
    row: FileType,
    e?: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  handleUnselectAll: () => void;
  isMoveMode: boolean;
  filesToMove: string[];
  parentId?: string | null;
  checkLocation: boolean;
  folderId?: string | null;
};

const FileTable: React.FC<FileTableProps> = ({
  files,
  iconSize = 24,
  // handleKeyDown = () => {},
  onSelectAll = () => {},
  onSelectRow = () => {},
  selectedIds = [],
  handleMenuItemClick = () => {},
  handleRowDoubleClick = () => {},
  handleUnselectAll = () => {},
  isMoveMode = false,
  filesToMove = [],
  parentId = null,
  checkLocation = false,
  folderId = null,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        tableRef.current &&
        !tableRef.current.contains(event.target as Node) &&
        !target.closest('.stickey-box')
      ) {
        handleUnselectAll();
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleUnselectAll]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: '30%',
        render: (row: FileType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'70%'}
            style={{ overflow: 'hidden' }}
          >
            {row.icon(iconSize)}
            <Tooltip label={row.name} fz={'xs'}>
              <Text
                fw={600}
                fz={'sm'}
                truncate
                style={{ maxWidth: 'calc(100% - 40px)' }}
              >
                {row.name}
              </Text>
            </Tooltip>
          </Group>
        ),
      },
      {
        key: 'owner',
        label: 'Owner',
        // width: '15%',
        render: (row: FileType) => (
          <Group
            gap={8}
            wrap="nowrap"
            //  style={{ maxWidth: '200px' }}
          >
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
        // width: '20%',
        render: (row: FileType) => <Text size="sm">{row.lastModified}</Text>,
      },
      {
        key: 'size',
        label: 'Size',
        // width: '10%',
        render: (row: FileType) => <Text size="sm">{row.size || '-'}</Text>,
      },
      {
        key: 'actions',
        label: '',
        // width: '10%',
        render: (row: FileType) => {
          const menuItems = [...MENU_ITEMS];
          if (row.type === 'file') {
            menuItems.push({
              id: 'download',
              label: 'Download',
              icon: ICONS.IconDownload,
            });
            if (
              row.fileExtension &&
              PREVIEW_FILE_TYPES.includes(row.fileExtension)
            ) {
              menuItems.push({
                id: 'preview',
                label: 'Preview',
                icon: ICONS.IconLiveView,
              });
            }
          }
          if (row.web_view_url) {
            menuItems.push({
              id: 'share',
              label: 'Share',
              icon: ICONS.IconShare,
            });
          }
          if (row.type === 'file' || checkLocation || folderId) {
            menuItems.push({
              id: 'move',
              label: 'Move',
              icon: ICONS.IconFolderShare,
            });
          }
          menuItems.push({
            id: 'delete',
            label: 'Delete',
            icon: ICONS.IconTrash,
            color: 'red',
          });

          return (
            <Menu
              items={menuItems}
              onItemClick={actionId => handleMenuItemClick(actionId, row)}
            >
              <ActionIcon variant="subtle" color="gray">
                <ICONS.IconDotsVertical size={18} />
              </ActionIcon>
            </Menu>
          );
        },
      },
    ],
    [handleMenuItemClick, iconSize]
  );

  return (
    <div
      tabIndex={0}
      ref={tableRef}
      // onKeyDown={handleKeyDown}
      style={{ outline: 'none', marginTop: '10px' }}
    >
      <Table
        // title={
        //   currentPath.length
        //     ? currentPath[currentPath.length - 1].name
        //     : 'All Files'
        // }
        data={files}
        columns={columns}
        selectedRows={selectedIds}
        onSelectRow={onSelectRow}
        onSelectAll={onSelectAll}
        isMoveMode={isMoveMode}
        filesToMove={filesToMove}
        parentId={parentId}
        onRowDoubleClick={(row, e) => {
          e?.stopPropagation();
          // handleRowDoubleClick(row);
          if (
            !isMoveMode ||
            (row.type === 'folder' && !filesToMove.includes(row.id))
          ) {
            handleRowDoubleClick(row);
          }
        }}
        idKey="id"
        emptyMessage="No files available. Please upload files to see them here."
      />
    </div>
  );
};

export default FileTable;
