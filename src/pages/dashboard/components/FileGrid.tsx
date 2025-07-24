import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Group,
  Text,
  ActionIcon,
  Box,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import type { FileType } from '../use-dashboard';
import { Card, Menu, Tooltip } from '../../../components';
import { useMediaQuery } from '@mantine/hooks';
import { DroppableFolder } from './DroppableFolder';
import { DraggableItem } from './DraggableItem';

const FILE_CARD_HEIGHT = 220;
const MIN_CARD_WIDTH = 240;

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
  handleUnselectAll: () => void;
  handleMenuItemClick: (actionId: string, row: FileType) => void;
  handleRowDoubleClick: (
    row: FileType,
    e?: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  allIds: string[];
  lastSelectedIndex: number | null;
  getIndexById: (id: string) => number;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLastSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  canDropOnFolder: (folderId: string) => boolean;
  isDragActive: boolean;
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
  selectedIds = [],
  handleUnselectAll = () => {},
  handleMenuItemClick = () => {},
  handleRowDoubleClick = () => {},
  allIds = [],
  lastSelectedIndex = null,
  getIndexById = () => {},
  setSelectedIds = () => {},
  setLastSelectedIndex = () => {},
  canDropOnFolder = () => true,
  isDragActive = false,
}) => {
  const stackRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(MIN_CARD_WIDTH);

  const [columnsCount, setColumnsCount] = useState(2);

  const theme = useMantineTheme();
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  useEffect(() => {
    const updateColumnsCount = () => {
      if (stackRef.current) {
        // const containerWidth = stackRef.current.offsetWidth;
        // const newColumnsCount = Math.max(
        //   2,
        //   Math.floor(containerWidth / MIN_CARD_WIDTH)
        // );
        // setColumnsCount(newColumnsCount);
        // const newCardWidth = `${(containerWidth - (newColumnsCount - 1) * 20) / newColumnsCount}px`;
        // setCardWidth(newCardWidth);
        const containerWidth = stackRef.current.offsetWidth;
        const gap = 20; // Gap between cards
        const newColumnsCount = Math.floor(
          (containerWidth + gap) / (MIN_CARD_WIDTH + gap)
        );
        setColumnsCount(newColumnsCount);
        const newCardWidth =
          (containerWidth - (newColumnsCount - 1) * gap) / newColumnsCount;
        setCardWidth(newCardWidth);
      }
    };

    updateColumnsCount();
    window.addEventListener('resize', updateColumnsCount);
    return () => window.removeEventListener('resize', updateColumnsCount);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        stackRef.current &&
        !stackRef.current.contains(target) &&
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

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!selectedIds.length) return;

      const currentIdx =
        lastSelectedIndex ?? getIndexById(selectedIds[selectedIds.length - 1]);
      let nextIdx = currentIdx;

      if (event.shiftKey) {
        if (event.key === 'ArrowDown') {
          nextIdx = Math.min(
            Number(currentIdx) + columnsCount,
            allIds.length - 1
          );
        } else if (event.key === 'ArrowUp') {
          nextIdx = Math.max(Number(currentIdx) - columnsCount, 0);
        } else if (event.key === 'ArrowRight') {
          nextIdx = Math.min(Number(currentIdx) + 1, allIds.length - 1);
        } else if (event.key === 'ArrowLeft') {
          nextIdx = Math.max(Number(currentIdx) - 1, 0);
        }
        if (nextIdx !== currentIdx) {
          const rangeStart =
            selectedIds.length === 1
              ? currentIdx
              : getIndexById(selectedIds[0]);
          const start = Math.min(Number(rangeStart), Number(nextIdx));
          const end = Math.max(Number(rangeStart), Number(nextIdx));
          const rangeIds = allIds.slice(start, end + 1);
          setSelectedIds(rangeIds);
          setLastSelectedIndex(Number(nextIdx));
        }
      }
    },
    [selectedIds, lastSelectedIndex, allIds, getIndexById, columnsCount]
  );

  const handleStackClick = (_: React.MouseEvent<HTMLDivElement>) => {
    handleUnselectAll();
  };

  const responsiveIconSize = isXs ? 16 : isSm ? 20 : iconSize;
  const responsiveFontSize = isXs ? 'xs' : 'sm';

  const renderFolderCard = (folder: FileType) => (
    <Card
      radius="md"
      shadow="sm"
      p="md"
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
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        handleSelect(folder.id, e);
      }}
      onDoubleClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        handleRowDoubleClick(folder);
      }}
    >
      <Group
        gap={12}
        align="center"
        style={{ width: '100%', flexWrap: 'nowrap' }}
      >
        {folder?.icon(responsiveIconSize)}
        <Tooltip label={folder.name} withArrow={false} fz={'xs'}>
          <Text fw={600} fz={responsiveFontSize} truncate miw={0} flex={1}>
            {folder.name}
          </Text>
        </Tooltip>
        <Menu
          items={MENU_ITEMS}
          onItemClick={actionId => handleMenuItemClick(actionId, folder)}
        >
          <ActionIcon variant="subtle" color="gray" style={{ flexShrink: 0 }}>
            <ICONS.IconDotsVertical size={18} />
          </ActionIcon>
        </Menu>
      </Group>
    </Card>
  );

  // Render file card content
  const renderFileCard = (file: FileType) => (
    <Card
      radius="md"
      shadow="sm"
      p="md"
      style={{
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
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        handleSelect(file.id, e);
      }}
      onDoubleClick={(e: any) => {
        e.stopPropagation();
        handleRowDoubleClick(file);
      }}
    >
      <Group
        justify="space-between"
        align="center"
        mb={8}
        style={{ flexWrap: 'nowrap' }}
      >
        <Group gap={8} flex={1} miw={0} align="center">
          {file.icon(responsiveIconSize)}
          <Tooltip label={file.name} withArrow={false} fz={'xs'}>
            <Text fw={600} fz={responsiveFontSize} flex={1} truncate miw={0}>
              {file.name}
            </Text>
          </Tooltip>
        </Group>
        <Menu
          items={MENU_ITEMS}
          onItemClick={actionId => handleMenuItemClick(actionId, file)}
        >
          <ActionIcon variant="subtle" color="gray" style={{ flexShrink: 0 }}>
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
        {file.icon(isXs ? 50 : 60)}
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
  );

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
        <Card>
          <Box style={{ minWidth: '100%', overflowX: 'auto' }}>
            <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
              No files available. Please upload files to see them here.
            </Text>
          </Box>
        </Card>
      )}

      {/* Folders Grid */}
      {folders?.length > 0 && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: '20px',
          }}
        >
          {folders.map(folder => (
            <DroppableFolder
              key={folder.id}
              folderId={folder.id}
              canDrop={canDropOnFolder(folder.id)}
              isDragActive={isDragActive}
              width={cardWidth}
            >
              <DraggableItem file={folder} width={cardWidth}>
                {renderFolderCard(folder)}
              </DraggableItem>
            </DroppableFolder>
          ))}
        </Box>
      )}

      {/* Files Grid */}
      {files?.length > 0 && (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: '20px',
          }}
        >
          {files.map(file => (
            <DraggableItem key={file.id} file={file} width={cardWidth}>
              {renderFileCard(file)}
            </DraggableItem>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default FileGrid;
