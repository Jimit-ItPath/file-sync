import React from 'react';
import {
  Box,
  Skeleton,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
  Table as MantineTable,
  ScrollArea,
  Group,
} from '@mantine/core';
import { Card } from '../card';

const FileTableSkeleton: React.FC = () => {
  // Generate skeleton rows (3 folders + 6 files)
  const skeletonRows = Array.from({ length: 9 }, (_, i) => i);

  const columns = [
    { key: 'checkbox', label: '', width: 48 },
    { key: 'name', label: 'Name', grow: true },
    { key: 'owner', label: 'Owner', width: 100 },
    { key: 'lastModified', label: 'Last Modified', width: 140 },
    { key: 'size', label: 'Size', width: 100 },
    { key: 'actions', label: '', width: 60 },
  ];

  const minTableWidth = columns.reduce((acc, col: any) => {
    if (col.grow) {
      return acc + 200; // min 200px for name
    }
    return acc + (Number(col.width) || 100);
  }, 0);

  return (
    <Box>
      <Card>
        <ScrollArea offsetScrollbars type="auto">
          <Box style={{ minWidth: minTableWidth }}>
            <MantineTable
              verticalSpacing="sm"
              highlightOnHover
              withColumnBorders={false}
              striped
              style={{ tableLayout: 'fixed', width: '100%' }}
              styles={{
                th: { padding: '12px 16px', whiteSpace: 'nowrap' },
                td: { padding: '12px 16px', whiteSpace: 'nowrap' },
              }}
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: 48, minWidth: 48 }}>
                    <Skeleton height={16} width={16} radius="sm" />
                  </TableTh>
                  <TableTh style={{ width: 'auto', minWidth: '200px' }}>
                    <Group gap={4}>
                      <Skeleton height={16} width={40} radius="sm" />
                    </Group>
                  </TableTh>
                  <TableTh style={{ width: 100 }}>
                    <Skeleton height={16} width={50} radius="sm" />
                  </TableTh>
                  <TableTh style={{ width: 140 }}>
                    <Skeleton height={16} width={90} radius="sm" />
                  </TableTh>
                  <TableTh style={{ width: 100 }}>
                    <Skeleton height={16} width={30} radius="sm" />
                  </TableTh>
                  <TableTh style={{ width: 60 }}>
                    <Skeleton height={16} width={16} radius="sm" />
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {skeletonRows.map(index => (
                  <TableTr key={`skeleton-row-${index}`}>
                    {/* Checkbox */}
                    <TableTd style={{ width: 48, minWidth: 48 }}>
                      <Skeleton height={16} width={16} radius="sm" />
                    </TableTd>

                    {/* Name */}
                    <TableTd style={{ width: 'auto', maxWidth: '100%' }}>
                      <Group
                        gap={8}
                        wrap="nowrap"
                        style={{ overflow: 'hidden' }}
                      >
                        <Skeleton
                          height={24}
                          width={24}
                          radius="sm"
                          style={{ flexShrink: 0 }}
                        />
                        <Skeleton
                          height={16}
                          width={`${Math.random() * 40 + 60}%`}
                          radius="sm"
                          style={{ maxWidth: '100%' }}
                        />
                      </Group>
                    </TableTd>

                    {/* Owner */}
                    <TableTd style={{ width: 100 }}>
                      <Group gap={8} wrap="nowrap">
                        <Skeleton
                          height={32}
                          width={32}
                          radius="xl"
                          style={{ flexShrink: 0 }}
                        />
                        <Skeleton height={14} width={60} radius="sm" />
                      </Group>
                    </TableTd>

                    {/* Last Modified */}
                    <TableTd style={{ width: 140 }}>
                      <Skeleton height={14} width={80} radius="sm" />
                    </TableTd>

                    {/* Size */}
                    <TableTd style={{ width: 100 }}>
                      <Skeleton height={14} width={50} radius="sm" />
                    </TableTd>

                    {/* Actions */}
                    <TableTd style={{ width: 60 }}>
                      <Skeleton height={18} width={18} radius="sm" />
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </MantineTable>
          </Box>
        </ScrollArea>
      </Card>
    </Box>
  );
};

export default FileTableSkeleton;
