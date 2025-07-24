import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box } from '@mantine/core';
import type { FileType } from '../use-dashboard';

interface DraggableItemProps {
  file: FileType;
  children: React.ReactNode;
  disabled?: boolean;
  width?: number;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  file,
  children,
  disabled = false,
  width = '100%',
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: file.id,
      disabled,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <Box ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </Box>
  );
};
