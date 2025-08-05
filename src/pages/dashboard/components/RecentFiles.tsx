import { Group, Box, Text, Stack, ActionIcon } from '@mantine/core';
import { Card, Menu, Tooltip } from '../../../components';
import type { FileType } from '../use-dashboard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ICONS } from '../../../assets/icons';

const FILE_CARD_HEIGHT = 200;
const MIN_CARD_WIDTH = 200;

interface RecentFileProps {
  recentFiles: FileType[];
  isXs: boolean;
  isSm: boolean;
  getIndexById: (id: string) => number;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLastSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedIds: string[];
  handleSelect: (id: string, event: React.MouseEvent) => void;
  handleUnselectAll: () => void;
  isMoveMode: boolean;
  allIds: string[];
  lastSelectedIndex: number | null;
  displayDownloadIcon: boolean;
  handleMenuItemClick: (actionId: string, row: FileType) => void;
  displayShareIcon: boolean;
}

const selectedCardStyle = {
  border: '2px solid #3b82f6',
  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
};

const MENU_ITEMS: [
  { id: string; label: string; icon: React.FC; color?: string },
] = [{ id: 'rename', label: 'Rename', icon: ICONS.IconEdit }];

const RecentFiles = ({
  recentFiles = [],
  isXs,
  isSm,
  getIndexById = () => 0,
  setSelectedIds = () => {},
  setLastSelectedIndex = () => {},
  selectedIds = [],
  handleSelect = () => {},
  handleUnselectAll = () => {},
  isMoveMode = false,
  allIds = [],
  lastSelectedIndex = null,
  displayDownloadIcon = true,
  handleMenuItemClick = () => {},
  displayShareIcon = true,
}: RecentFileProps) => {
  const responsiveIconSize = isXs ? 16 : isSm ? 20 : 24;
  const responsiveFontSize = isXs ? 'xs' : 'sm';

  const [visibleFiles, setVisibleFiles] = useState<FileType[]>([]);
  const [columnsCount, setColumnsCount] = useState(2);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisibleFiles = () => {
      if (stackRef.current) {
        const containerWidth = stackRef.current.offsetWidth;
        let cardsPerRow = Math.max(
          2,
          Math.floor(containerWidth / MIN_CARD_WIDTH)
        );
        setColumnsCount(cardsPerRow);
        setVisibleFiles(recentFiles.slice(0, cardsPerRow));
      }
    };

    updateVisibleFiles();
    window.addEventListener('resize', updateVisibleFiles);
    return () => window.removeEventListener('resize', updateVisibleFiles);
  }, [recentFiles]);

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

  const filteredMenuItems = useMemo(() => {
    const menuItems = [...MENU_ITEMS];
    if (displayDownloadIcon) {
      menuItems.push({
        id: 'download',
        label: 'Download',
        icon: ICONS.IconDownload,
      });
    }
    if (displayShareIcon) {
      menuItems.push({
        id: 'share',
        label: 'Share',
        icon: ICONS.IconShare,
      });
    }
    menuItems.push({
      id: 'delete',
      label: 'Delete',
      icon: ICONS.IconTrash,
      color: 'red',
    });
    return menuItems;
  }, [displayDownloadIcon, displayShareIcon]);

  return (
    <Stack
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
      onClick={handleStackClick}
      ref={stackRef}
      mt={10}
    >
      <Box mt={10} mb={32}>
        <Group justify="space-between" mb={16}>
          <Text fw={700} fz="md" c="gray.9">
            Recent Files
          </Text>
          {/* <Button
        variant="subtle"
        color="blue"
        size="xs"
        style={{ fontWeight: 500 }}
      >
        View All
      </Button> */}
        </Group>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: '20px',
          }}
          mt={20}
        >
          {visibleFiles.map(file => (
            <Card
              key={file.id}
              radius="md"
              shadow="sm"
              p="md"
              style={{
                // flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#f6faff',
                border: '1px solid #e5e7eb',
                height: FILE_CARD_HEIGHT,
                ...(selectedIds.includes(file.id) ? selectedCardStyle : {}),
                transition: 'box-shadow 0.2s ease',
                userSelect: 'none',
                ...(isMoveMode
                  ? {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    }
                  : {}),
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (!isMoveMode) {
                  handleSelect(file.id, e);
                }
              }}
              onDoubleClick={(e: any) => {
                e.stopPropagation();
                // if (!isMoveMode) {
                //   handleRowDoubleClick(file);
                // }
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
                    <Text
                      fw={600}
                      fz={responsiveFontSize}
                      flex={1}
                      truncate
                      miw={0}
                    >
                      {file.name}
                    </Text>
                  </Tooltip>
                </Group>
                <Menu
                  items={filteredMenuItems}
                  onItemClick={actionId => handleMenuItemClick(actionId, file)}
                  width={120}
                  styles={{
                    dropdown: {
                      padding: 0,
                    },
                    item: {
                      fontSize: 13,
                    },
                  }}
                >
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    style={{ flexShrink: 0 }}
                  >
                    <ICONS.IconDotsVertical size={16} />
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
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default RecentFiles;
