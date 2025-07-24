import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Anchor, Text } from '@mantine/core';

interface DroppableBreadcrumbProps {
  item: { id?: string | null; name: string };
  isLast: boolean;
  canDrop: boolean;
  isDragActive: boolean;
  onNavigate: (folderId?: string | null) => void;
}

export const DroppableBreadcrumb: React.FC<DroppableBreadcrumbProps> = ({
  item,
  isLast,
  canDrop,
  isDragActive,
  onNavigate,
}) => {
  const dropId = item.id === null ? 'breadcrumb-root' : `breadcrumb-${item.id}`;

  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    disabled: !canDrop || isLast,
  });

  const dropStyle = {
    backgroundColor:
      isOver && canDrop && isDragActive ? 'rgba(37, 99, 235, 0.1)' : '#f8f9fa',
    border:
      isOver && canDrop && isDragActive
        ? '2px dashed #2563eb'
        : '2px solid transparent',
    borderRadius: '8px',
    padding: '6px 12px',
    transition: 'all 0.2s ease',
  };

  return (
    <Anchor
      ref={setNodeRef}
      onClick={() => {
        window.getSelection()?.removeAllRanges();
        onNavigate(item?.id);
      }}
      style={{
        cursor: 'pointer',
        fontWeight: isLast ? 700 : 500,
        color: isLast ? '#212529' : '#495057',
        whiteSpace: 'nowrap',
        maxWidth: 150,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...dropStyle,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#1c7ed6')}
      onMouseLeave={e =>
        (e.currentTarget.style.color = isLast ? '#212529' : '#495057')
      }
    >
      <Text size="sm" fw={isLast ? 700 : 500} lineClamp={1}>
        {item.name}
      </Text>
    </Anchor>
  );
};
