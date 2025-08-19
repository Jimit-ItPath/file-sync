import {
  Table as MantineTable,
  ScrollArea,
  Group,
  Text,
  Checkbox,
  Box,
  TableThead,
  TableTr,
  TableTh,
  TableTbody,
  TableTd,
} from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../card';

type Column<T> = {
  key: keyof T | string;
  label: React.ReactNode;
  width?: string | number;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onSelectRow?: (id: string, checked: boolean, e?: any) => void;
  onSelectAll?: (checked: boolean) => void;
  onRowDoubleClick?: (
    row: T,
    e?: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  selectedRows?: string[];
  title?: string;
  idKey: keyof T; // key to identify row id
  emptyMessage?: string;
  isMoveMode?: boolean;
  filesToMove?: string[];
  parentId?: string | null;
};

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onSelectRow,
  onSelectAll,
  selectedRows = [],
  title = '',
  idKey,
  emptyMessage = 'No data available',
  onRowDoubleClick,
  isMoveMode = false,
  filesToMove = [],
  parentId = null,
}: TableProps<T>) {
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setAllChecked(data.length > 0 && selectedRows.length === data.length);
  }, [selectedRows, data]);

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked);
    onSelectAll?.(checked);
  };

  const minTableWidth = useMemo(() => {
    return columns.reduce(
      (acc, col: any) => {
        if (col.grow) {
          return acc + 200; // min 200px for name
        }
        return acc + (Number(col.width) || 100); // fallback
      },
      onSelectRow ? 60 : 0
    );
  }, [columns, onSelectRow]);

  return (
    <Box>
      {title ? (
        <Group justify="space-between" mb="xs">
          <Text fw={600} fz="lg">
            {title}
          </Text>
          {/* Add your filter/search UI here if needed */}
        </Group>
      ) : null}
      <Card>
        <ScrollArea offsetScrollbars type="auto">
          <Box
            // style={{ minWidth: '100%', overflowX: 'auto' }}
            style={{ minWidth: minTableWidth }}
          >
            {data?.length ? (
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
                    {onSelectRow && (
                      <TableTh style={{ width: 48, minWidth: 48 }}>
                        <Checkbox
                          checked={allChecked}
                          onChange={e =>
                            handleAllCheck(e.currentTarget.checked)
                          }
                          aria-label="Select all"
                        />
                      </TableTh>
                    )}
                    {columns.map(({ label, width, grow }: any, idx) => (
                      <TableTh
                        key={idx}
                        // style={{ width }}
                        style={{
                          width: grow ? 'auto' : width,
                          minWidth: grow ? '200px' : width,
                        }}
                      >
                        {typeof label === 'string' ? (
                          <Group gap={4}>
                            {label}
                            {/* <ICONS.IconChevronDown size={14} color="#9ca3af" /> */}
                          </Group>
                        ) : (
                          label
                        )}
                      </TableTh>
                    ))}
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {data.map(row => (
                    <TableTr
                      key={row[idKey] as string}
                      onDoubleClick={e => onRowDoubleClick?.(row, e)}
                      style={{
                        cursor: onRowDoubleClick ? 'pointer' : 'default',
                        ...(isMoveMode &&
                        (filesToMove.includes(row.id) ||
                          row.type === 'file' ||
                          parentId === row.id)
                          ? {
                              cursor: 'not-allowed',
                            }
                          : {}),
                      }}
                    >
                      {onSelectRow && (
                        <TableTd style={{ width: 48, minWidth: 48 }}>
                          <Checkbox
                            checked={selectedRows.includes(
                              row[idKey] as string
                            )}
                            onChange={e => {
                              if (
                                isMoveMode &&
                                (filesToMove.includes(row.id) ||
                                  row.type === 'file' ||
                                  parentId === row.id)
                              )
                                return;
                              onSelectRow?.(
                                row[idKey] as string,
                                e.currentTarget.checked,
                                e
                              );
                            }}
                            disabled={
                              isMoveMode &&
                              (filesToMove.includes(row.id) ||
                                row.type === 'file' ||
                                parentId === row.id)
                            }
                            aria-label="Select row"
                          />
                        </TableTd>
                      )}
                      {columns.map(({ key, render, width, grow }: any, idx) => (
                        <TableTd
                          key={idx}
                          style={{
                            // width,
                            // maxWidth: width,
                            width: grow ? 'auto' : width,
                            maxWidth: grow ? '100%' : width,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {render ? render(row) : String(row[key as keyof T])}
                        </TableTd>
                      ))}
                    </TableTr>
                  ))}
                </TableTbody>
              </MantineTable>
            ) : (
              <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
                {emptyMessage}
              </Text>
            )}
          </Box>
        </ScrollArea>
      </Card>
    </Box>
  );
}
