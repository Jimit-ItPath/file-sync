import { Group, Box, Text, Stack } from '@mantine/core';
import { Card, Tooltip } from '../../../components';
import type { FileType } from '../use-dashboard';
import { useEffect, useRef, useState } from 'react';

const FILE_CARD_HEIGHT = 200;
const MIN_CARD_WIDTH = 200;

interface RecentFileProps {
  recentFiles: FileType[];
  isXs: boolean;
  isSm: boolean;
}

const RecentFiles = ({ recentFiles, isXs, isSm }: RecentFileProps) => {
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

  return (
    <Stack
      tabIndex={0}
      // onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
      // onClick={handleStackClick}
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
            // gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_CARD_WIDTH}px, 1fr))`,
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
                // ...(selectedIds.includes(file.id) ? selectedCardStyle : {}),
                transition: 'box-shadow 0.2s ease',
                userSelect: 'none',
                // ...(isMoveMode
                //   ? {
                //       opacity: 0.5,
                //       cursor: 'not-allowed',
                //     }
                //   : {}),
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                // if (!isMoveMode) {
                //   handleSelect(file.id, e);
                // }
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
                {/* <Menu
              items={MENU_ITEMS}
              onItemClick={actionId => handleMenuItemClick(actionId, file)}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                style={{ flexShrink: 0 }}
              >
                <ICONS.IconDotsVertical size={18} />
              </ActionIcon>
            </Menu> */}
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
