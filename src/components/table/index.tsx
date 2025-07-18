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
import React, { useEffect, useState } from 'react';
import { ICONS } from '../../assets/icons';
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
}: TableProps<T>) {
  const [allChecked, setAllChecked] = useState(false);

  useEffect(() => {
    setAllChecked(data.length > 0 && selectedRows.length === data.length);
  }, [selectedRows, data]);

  const handleAllCheck = (checked: boolean) => {
    setAllChecked(checked);
    onSelectAll?.(checked);
  };

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
        <ScrollArea>
          <Box style={{ minWidth: '100%', overflowX: 'auto' }}>
            {data?.length ? (
              <MantineTable
                verticalSpacing="sm"
                highlightOnHover
                withColumnBorders={false}
                striped={false}
                styles={{
                  th: { padding: '12px 16px', whiteSpace: 'nowrap' },
                  td: { padding: '12px 16px', whiteSpace: 'nowrap' },
                }}
              >
                <TableThead>
                  <TableTr>
                    {onSelectRow && (
                      <TableTh style={{ width: 40 }}>
                        <Checkbox
                          checked={allChecked}
                          onChange={e =>
                            handleAllCheck(e.currentTarget.checked)
                          }
                          aria-label="Select all"
                        />
                      </TableTh>
                    )}
                    {columns.map(({ label, width }, idx) => (
                      <TableTh key={idx} style={{ width }}>
                        {typeof label === 'string' ? (
                          <Group gap={4}>
                            {label}
                            <ICONS.IconChevronDown size={14} color="#9ca3af" />
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
                      }}
                    >
                      {onSelectRow && (
                        <TableTd>
                          <Checkbox
                            checked={selectedRows.includes(
                              row[idKey] as string
                            )}
                            onChange={e =>
                              onSelectRow?.(
                                row[idKey] as string,
                                e.currentTarget.checked,
                                e
                              )
                            }
                            aria-label="Select row"
                          />
                        </TableTd>
                      )}
                      {columns.map(({ key, render, width }, idx) => (
                        <TableTd
                          key={idx}
                          style={{
                            width,
                            maxWidth: width,
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
