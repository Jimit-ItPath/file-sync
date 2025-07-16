import {
  Group,
  Text,
  Grid,
  ActionIcon,
  Box,
  Image,
  Stack,
  ScrollArea,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import type { FileType } from '../use-dashboard';
import { Card, Menu, Tooltip } from '../../../components';
import React, { useRef } from 'react';

type FileGridProps = {
  folders: FileType[];
  files: FileType[];
  iconSize?: number;
  selectedIds: string[];
  handleSelect: (id: string, event: React.MouseEvent) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleUnselectAll: () => void;
};

const MENU_ITEMS = [{ id: 'delete', label: 'Delete', icon: ICONS.IconTrash }];

const FOLDER_CARD_HEIGHT = 70;
// const FILE_CARD_WIDTH = 260;
// const FILE_CARD_HEIGHT = 260;

const selectedCardStyle = {
  border: '2px solid #2563eb',
  background: '#e0e7ff',
};

const FileGrid: React.FC<FileGridProps> = ({
  folders,
  files,
  iconSize = 24,
  handleSelect = () => {},
  handleKeyDown = () => {},
  selectedIds = [],
  handleUnselectAll = () => {},
}) => {
  const stackRef = useRef<HTMLDivElement>(null);

  const handleStackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === stackRef.current) {
      handleUnselectAll();
    }
    if (
      (e.target as HTMLElement).classList.contains('mantine-Grid-root') ||
      (e.target as HTMLElement).classList.contains('mantine-Grid-col')
    ) {
      handleUnselectAll();
    }
  };

  return (
    <>
      {!files?.length && !folders?.length ? (
        <Box>
          <Card>
            <ScrollArea>
              <Box>
                <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
                  No files available. Please upload files to see them here.
                </Text>
              </Box>
            </ScrollArea>
          </Card>
        </Box>
      ) : null}
      <Stack
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none' }}
        //   onClick={handleStackClick}
        onClickCapture={handleStackClick}
        ref={stackRef}
      >
        {/* Folders */}
        <Grid gutter={20}>
          {folders.map(folder => (
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
                }}
                onClick={(e: React.MouseEvent) => handleSelect(folder.id, e)}
              >
                <Group gap={12} style={{ width: '100%' }}>
                  {folder.icon(iconSize)}
                  <Tooltip label={folder.name} withArrow={false} fz={'xs'}>
                    <Text fw={600} fz="sm" truncate style={{ flex: 1 }}>
                      {folder.name}
                    </Text>
                  </Tooltip>
                  <Menu items={MENU_ITEMS} onItemClick={() => {}}>
                    <ActionIcon variant="subtle" color="gray">
                      <ICONS.IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
        {/* Files */}
        <Grid gutter={20} mt={folders.length > 0 ? 12 : 0}>
          {files.map(file => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
              <Card
                radius="md"
                shadow="sm"
                p="md"
                // w={FILE_CARD_WIDTH}
                // h={FILE_CARD_HEIGHT}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#f6faff',
                  border: '1px solid #e5e7eb',
                  ...(selectedIds.includes(file.id) ? selectedCardStyle : {}),
                  cursor: 'pointer',
                }}
                onClick={(e: React.MouseEvent) => handleSelect(file.id, e)}
              >
                <Group justify="space-between" mb={8}>
                  <Group gap={8}>
                    {file.icon(iconSize)}
                    <Tooltip label={file.name} withArrow={false} fz={'xs'}>
                      <Text fw={600} fz="sm" truncate>
                        {file.name}
                      </Text>
                    </Tooltip>
                  </Group>
                  <Menu items={MENU_ITEMS} onItemClick={() => {}}>
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
                  {file.preview ? (
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
                  )}
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
    </>
  );
};

export default FileGrid;
