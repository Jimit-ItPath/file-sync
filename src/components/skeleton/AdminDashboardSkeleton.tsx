import { SimpleGrid, Skeleton, Stack } from '@mantine/core';
import { Card } from '../card';
import type React from 'react';

interface AdminDashboardSkeletonProps {
  cards?: number;
}

const AdminDashboardSkeleton: React.FC<AdminDashboardSkeletonProps> = ({
  cards,
}) => {
  const skeletonCards = Array(typeof cards === 'number' ? cards : 4).fill(null);

  return (
    <SimpleGrid
      spacing="lg"
      mb={20}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      }}
    >
      {skeletonCards.map((_, index) => (
        <Card
          key={index}
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
          }}
        >
          <Stack gap="xs" align="center" w="100%">
            <Skeleton height={24} width="40%" radius="sm" />
            <Skeleton height={16} width="60%" radius="sm" />
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default AdminDashboardSkeleton;
