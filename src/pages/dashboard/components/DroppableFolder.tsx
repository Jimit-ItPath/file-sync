import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mantine/core';

interface DroppableFolderProps {
  folderId: string;
  children: React.ReactNode;
  canDrop: boolean;
  isDragActive: boolean;
  width?: number;
}

export const DroppableFolder: React.FC<DroppableFolderProps> = ({
  folderId,
  children,
  canDrop,
  isDragActive,
  width = '100%',
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folderId}`,
    disabled: !canDrop,
  });

  const dropStyle = {
    backgroundColor:
      isOver && canDrop && isDragActive
        ? 'rgba(37, 99, 235, 0.1)'
        : 'transparent',
    border: isOver && canDrop && isDragActive ? '2px dashed #2563eb' : 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <Box ref={setNodeRef} style={dropStyle}>
      {children}
    </Box>
  );
};
