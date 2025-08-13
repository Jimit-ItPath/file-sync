import { Group, Pagination as MantinePagination, Select } from '@mantine/core';
import type React from 'react';
import { Card } from '../card';

interface CustomPaginationProps {
  total: number;
  current: number;
  onChange: (page: number) => void;
  customStyle?: React.CSSProperties;
  limit: number;
  handleLimitChange: (limit: number) => void;
}

export const Pagination = ({
  total,
  current,
  onChange,
  customStyle,
  limit,
  handleLimitChange,
}: CustomPaginationProps) => {
  return (
    <Card style={customStyle}>
      <Group gap={20} justify="center">
        <Select
          value={limit.toString()}
          onChange={value => value && handleLimitChange(Number(value))}
          data={[
            { value: '10', label: '10 per page' },
            { value: '20', label: '20 per page' },
            { value: '50', label: '50 per page' },
          ]}
          w={150}
        />

        <MantinePagination
          total={total}
          value={current}
          onChange={onChange}
          siblings={1}
          boundaries={1}
          size="sm"
          withEdges={true}
        />
      </Group>
    </Card>
  );
};
