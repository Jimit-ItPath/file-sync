import { useState, useCallback, useRef, useEffect } from 'react';

interface DragDropState {
  isDragging: boolean;
  dragCounter: number;
}

interface UseDragDropOptions {
  onFileDrop: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

const useDragDrop = ({
  onFileDrop,
  acceptedFileTypes,
  maxFileSize,
}: UseDragDropOptions) => {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    dragCounter: 0,
  });

  const dragRef = useRef<HTMLDivElement>(null);

  // Prevent default drag behaviors
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only count drag enters from outside the component
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setDragState(prev => ({
        isDragging: true,
        dragCounter: prev.dragCounter + 1,
      }));
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragState(prev => {
      const newCounter = prev.dragCounter - 1;
      return {
        isDragging: newCounter > 0,
        dragCounter: newCounter,
      };
    });
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file type
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;

        const isValidType = acceptedFileTypes.some(
          type => type === mimeType || type === fileExtension || type === '*'
        );

        if (!isValidType) {
          console.warn(`File type not accepted: ${file.name}`);
          return false;
        }
      }

      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        console.warn(`File too large: ${file.name} (${file.size} bytes)`);
        return false;
      }

      return true;
    },
    [acceptedFileTypes, maxFileSize]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({
        isDragging: false,
        dragCounter: 0,
      });

      const files = Array.from(e.dataTransfer?.files || []);
      const validFiles = files.filter(validateFile);

      if (validFiles.length > 0) {
        onFileDrop(validFiles);
      }
    },
    [onFileDrop, validateFile]
  );

  // Set up event listeners
  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);

    return () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDragEnter, handleDragLeave, handleDrop]);

  return {
    dragRef,
    isDragging: dragState.isDragging,
    dragCounter: dragState.dragCounter,
  };
};

export default useDragDrop;
