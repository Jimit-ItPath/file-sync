import React, { useEffect, useRef, useState } from 'react';
import { Box, Group, Skeleton, Stack } from '@mantine/core';
import { Card } from '../card';
import useResponsive from '../../hooks/use-responsive';

const FILE_CARD_HEIGHT = 220;
const MIN_CARD_WIDTH = 240;

const FileGridSkeleton: React.FC = () => {
  const stackRef = useRef<HTMLDivElement>(null);
  const [columnsCount, setColumnsCount] = useState(2);
  const { isXs, isSm } = useResponsive();

  useEffect(() => {
    const updateColumnsCount = () => {
      if (stackRef.current) {
        const containerWidth = stackRef.current.offsetWidth;
        const newColumnsCount = Math.max(
          2,
          Math.floor(containerWidth / MIN_CARD_WIDTH)
        );
        setColumnsCount(newColumnsCount);
      }
    };

    updateColumnsCount();
    window.addEventListener('resize', updateColumnsCount);
    return () => window.removeEventListener('resize', updateColumnsCount);
  }, []);

  // Generate skeleton items (3 folders + 6 files)
  const folderSkeletons = Array.from({ length: 3 }, (_, i) => i);
  const fileSkeletons = Array.from({ length: 6 }, (_, i) => i);

  return (
    <Stack ref={stackRef}>
      <Card>
        {/* Folder Skeletons */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: '20px',
          }}
        >
          {folderSkeletons.map(index => (
            <Card
              key={`folder-skeleton-${index}`}
              radius="md"
              shadow="sm"
              p="md"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f6faff',
                border: '1px solid #e5e7eb',
                height: 64,
                userSelect: 'none',
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  flexWrap: 'nowrap',
                }}
              >
                <Skeleton
                  height={isXs ? 16 : isSm ? 20 : 24}
                  width={isXs ? 16 : isSm ? 20 : 24}
                  radius="sm"
                />
                <Skeleton height={16} style={{ flex: 1 }} radius="sm" />
                <Skeleton
                  height={18}
                  width={18}
                  radius="sm"
                  style={{ flexShrink: 0 }}
                />
              </Box>
            </Card>
          ))}
        </Box>

        {/* File Skeletons */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
            gap: '20px',
          }}
          mt={20}
        >
          {fileSkeletons.map(index => (
            <Card
              key={`file-skeleton-${index}`}
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
                userSelect: 'none',
              }}
            >
              {/* Header */}
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  flexWrap: 'nowrap',
                }}
              >
                <Group
                  style={{
                    display: 'flex',
                    // gap: 10,
                    flex: 1,
                    minWidth: 0,
                    alignItems: 'center',
                  }}
                >
                  <Skeleton
                    height={isXs ? 16 : isSm ? 20 : 24}
                    width={isXs ? 16 : isSm ? 20 : 24}
                    radius="sm"
                  />
                  <Skeleton height={16} style={{ flex: 0.92 }} radius="sm" />
                </Group>
                <Skeleton
                  height={18}
                  width={18}
                  radius="sm"
                  style={{ flexShrink: 0 }}
                />
              </Box>

              {/* Center Icon */}
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
                <Skeleton
                  height={isXs ? 50 : 60}
                  width={isXs ? 50 : 60}
                  radius="sm"
                />
              </Box>

              {/* Footer */}
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 8,
                }}
              >
                <Skeleton height={12} width={60} radius="sm" />
                <Skeleton height={12} width={40} radius="sm" />
              </Box>
            </Card>
          ))}
        </Box>
      </Card>
    </Stack>
  );
};

export default FileGridSkeleton;
