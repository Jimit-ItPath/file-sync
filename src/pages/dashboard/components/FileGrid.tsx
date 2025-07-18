import React, { useRef } from 'react';
import { Group, Text, Grid, ActionIcon, Box, Stack } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import type { FileType } from '../use-dashboard';
import { Card, Menu, Tooltip } from '../../../components';

const FOLDER_CARD_HEIGHT = 70;
const FILE_CARD_HEIGHT = 220;

const selectedCardStyle = {
  border: '2px solid #3b82f6',
  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
};

type FileGridProps = {
  folders: FileType[];
  files: FileType[];
  iconSize?: number;
  selectedIds: string[];
  handleSelect: (id: string, event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleUnselectAll: () => void;
  handleMenuItemClick: (actionId: string, row: FileType) => void;
  handleRowDoubleClick: (
    row: FileType,
    e?: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
};

const MENU_ITEMS = [
  { id: 'rename', label: 'Rename', icon: ICONS.IconEdit },
  { id: 'delete', label: 'Delete', icon: ICONS.IconTrash },
];

const FileGrid: React.FC<FileGridProps> = ({
  folders,
  files,
  iconSize = 24,
  handleSelect = () => {},
  handleKeyDown = () => {},
  selectedIds = [],
  handleUnselectAll = () => {},
  handleMenuItemClick = () => {},
  handleRowDoubleClick = () => {},
}) => {
  const stackRef = useRef<HTMLDivElement>(null);

  // const handleStackClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   if (e.target === stackRef.current) {
  //     handleUnselectAll();
  //   }
  //   if (
  //     (e.target as HTMLElement).classList.contains('mantine-Grid-root') ||
  //     (e.target as HTMLElement).classList.contains('mantine-Grid-col')
  //   ) {
  //     handleUnselectAll();
  //   }
  // };

  const handleStackClick = (_: React.MouseEvent<HTMLDivElement>) => {
    handleUnselectAll();
  };

  return (
    <Stack
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
      onClick={handleStackClick}
      ref={stackRef}
      mt={10}
    >
      {!folders?.length && !files?.length && (
        <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
          No files available. Please upload files to see them here.
        </Text>
      )}
      {/* Folders */}
      <Grid gutter={20}>
        {folders?.map(folder => (
          <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={folder.id}>
            <Card
              radius="md"
              shadow="sm"
              p="md"
              h={FOLDER_CARD_HEIGHT}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f6faff',
                border: '1px solid #e5e7eb',
                ...(selectedIds.includes(folder.id) ? selectedCardStyle : {}),
                cursor: 'pointer',
                userSelect: 'none',
              }}
              // onClick={(e: React.MouseEvent) => handleSelect(folder.id, e)}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // <-- Prevents Stack's onClickCapture
                handleSelect(folder.id, e);
              }}
              onDoubleClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleRowDoubleClick(folder);
              }}
            >
              <Group gap={12} style={{ width: '100%' }}>
                {folder?.icon(iconSize)}
                <Tooltip label={folder.name} withArrow={false} fz={'xs'}>
                  <Text fw={600} fz="sm" truncate style={{ flex: 1 }}>
                    {folder.name}
                  </Text>
                </Tooltip>
                <Menu
                  items={MENU_ITEMS}
                  onItemClick={actionId =>
                    handleMenuItemClick(actionId, folder)
                  }
                >
                  <ActionIcon variant="subtle" color="gray">
                    <ICONS.IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter={20} mt={folders.length > 0 ? 12 : 0}>
        {files.map(file => (
          <Grid.Col
            key={file.id}
            span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            style={{ display: 'flex' }}
          >
            <Card
              radius="md"
              shadow="sm"
              p="md"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#f6faff',
                border: '1px solid #e5e7eb',
                height: FILE_CARD_HEIGHT,
                ...(selectedIds.includes(file.id) ? selectedCardStyle : {}),
                cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
                userSelect: 'none',
              }}
              // onClick={(e: React.MouseEvent) => handleSelect(file.id, e)}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // <-- Prevents Stack's onClickCapture
                handleSelect(file.id, e);
              }}
              onDoubleClick={(e: any) => {
                e.stopPropagation();
                handleRowDoubleClick(file);
              }}
            >
              <Group justify="space-between" mb={8}>
                <Group gap={8} w={'80%'}>
                  {file.icon(iconSize)}
                  <Tooltip label={file.name} withArrow={false} fz={'xs'}>
                    <Text fw={600} fz="sm" truncate w={'80%'}>
                      {file.name}
                    </Text>
                  </Tooltip>
                </Group>
                <Menu
                  items={MENU_ITEMS}
                  onItemClick={actionId => handleMenuItemClick(actionId, file)}
                >
                  <ActionIcon variant="subtle" color="gray">
                    <ICONS.IconDotsVertical size={18} />
                  </ActionIcon>
                </Menu>
              </Group>
              <Box
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  marginTop: 8,
                }}
              >
                {file.icon(80)}
                {/* {file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.name}
                    radius="md"
                    fit="cover"
                    h={180}
                    w="100%"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    style={{
                      width: '100%',
                      height: 120,
                      background: '#e5e7eb',
                      borderRadius: 8,
                    }}
                  />
                )} */}
              </Box>
              <Group justify="space-between" mt={8}>
                <Text size="xs" c="gray.6">
                  {file.lastModified}
                </Text>
                <Text size="xs" c="gray.6">
                  {file.size}
                </Text>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

export default FileGrid;
