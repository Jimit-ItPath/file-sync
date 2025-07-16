import { useCallback, useEffect, useMemo, useState } from 'react';
import { ICONS } from '../../assets/icons';
import {
  formatFileSize,
  getLocalStorage,
  setLocalStorage,
} from '../../utils/helper';
import { useMediaQuery } from '@mantine/hooks';
import useDragDrop from '../../components/inputs/dropzone/use-drag-drop';

const initialFiles = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    icon: (size: number) => <ICONS.IconFolder size={size} color="#38bdf8" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 15, 2023',
    size: '–',
  },
  {
    id: '2',
    name: 'Photos',
    type: 'folder',
    icon: (size: number) => <ICONS.IconFolder size={size} color="#38bdf8" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 10, 2023',
    size: '–',
  },
  {
    id: '3',
    name: 'Project_Report.pdf',
    type: 'file',
    icon: (size: number) => (
      <ICONS.IconFileTypePdf size={size} color="#ef4444" />
    ),
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 27, 2023',
    size: '4.2 MB',
    preview:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // Example preview
  },
  {
    id: '4',
    name: 'Resume.docx',
    type: 'file',
    icon: (size: number) => (
      <ICONS.IconFileTypeDoc size={size} color="#2563eb" />
    ),
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 20, 2023',
    size: '1.1 MB',
    preview:
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '5',
    name: 'Financial_Data.xlsx',
    type: 'file',
    icon: (size: number) => (
      <ICONS.IconFileTypeXls size={size} color="#22c55e" />
    ),
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 25, 2023',
    size: '2.8 MB',
    preview:
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '6',
    name: 'Marketing_Strategy.pptx',
    type: 'file',
    icon: (size: number) => (
      <ICONS.IconFileTypePpt size={size} color="#f59e0b" />
    ),
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 30, 2023',
    size: '3.5 MB',
    preview:
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '7',
    name: 'Design_Mockup.png',
    type: 'file',
    icon: (size: number) => <ICONS.IconPhoto size={size} color="#a78bfa" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 28, 2023',
    size: '8.5 MB',
    preview:
      'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=400&q=80',
  },
];

export type FileType = (typeof initialFiles)[number];

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return (size: number) => (
        <ICONS.IconFileTypePdf size={size} color="#ef4444" />
      );
    case 'doc':
    case 'docx':
      return (size: number) => (
        <ICONS.IconFileTypeDoc size={size} color="#2563eb" />
      );
    case 'xls':
    case 'xlsx':
      return (size: number) => (
        <ICONS.IconFileTypeXls size={size} color="#22c55e" />
      );
    case 'ppt':
    case 'pptx':
      return (size: number) => (
        <ICONS.IconFileTypePpt size={size} color="#f59e0b" />
      );
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return (size: number) => <ICONS.IconPhoto size={size} color="#a78bfa" />;
    case 'txt':
      return (size: number) => (
        <ICONS.IconFileTypeDoc size={size} color="#64748b" />
      );
    default:
      return (size: number) => <ICONS.IconFile size={size} color="#64748b" />;
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const useDashboard = () => {
  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const savedLayout = getLocalStorage('dashboardLayout');
    return savedLayout ? savedLayout : 'list';
  });
  const [files, setFiles] = useState<FileType[]>(initialFiles);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: { name: string; size: string };
  }>({});

  const [cancelledUploads, setCancelledUploads] = useState<Set<string>>(
    new Set()
  );

  const isXs = useMediaQuery('(max-width: 575px)');
  const isSm = useMediaQuery('(min-width: 576px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 991px)');

  const gridColumns = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4;

  const handleFileUpload = useCallback(
    (uploadedFiles: File[]) => {
      const newFiles: FileType[] = [];

      uploadedFiles.forEach(file => {
        const fileId = generateId();

        // Add to uploading files state
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            name: file.name,
            size: formatFileSize(file.size?.toString()),
          },
        }));

        // Initialize progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Create file object
        const fileObj: FileType = {
          id: fileId,
          name: file.name,
          type: 'file',
          icon: getFileIcon(file.name),
          owner: { name: 'You', avatar: null, initials: 'JS' },
          lastModified: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          size: formatFileSize(file.size?.toString()),
          preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        };

        newFiles.push(fileObj);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          // Check if upload was cancelled
          if (cancelledUploads.has(fileId)) {
            clearInterval(interval);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
            setUploadingFiles(prev => {
              const newUploading = { ...prev };
              delete newUploading[fileId];
              return newUploading;
            });
            setCancelledUploads(prev => {
              const newCancelled = new Set(prev);
              newCancelled.delete(fileId);
              return newCancelled;
            });
            return;
          }

          // Simulate realistic upload progress
          const increment = Math.random() * 15 + 5; // 5-20% increments
          progress = Math.min(progress + increment, 100);

          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Remove from progress after a delay to show completion
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
              });
              setUploadingFiles(prev => {
                const newUploading = { ...prev };
                delete newUploading[fileId];
                return newUploading;
              });
            }, 2000); // Keep completed state for 2 seconds
          }

          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }, 300); // Update every 300ms for smooth progress
      });

      // Add files to the main list immediately (they'll show with progress)
      setFiles(prev => [...newFiles, ...prev]);
    },
    [cancelledUploads]
  );

  const handleCancelUpload = useCallback((fileId: string) => {
    setCancelledUploads(prev => new Set(prev).add(fileId));

    // Remove the file from the files list
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Drag and drop functionality
  const { dragRef, isDragging } = useDragDrop({
    onFileDrop: handleFileUpload,
    acceptedFileTypes: ['*'], // Accept all file types
    maxFileSize: 100 * 1024 * 1024, // 100MB limit
  });

  useEffect(() => {
    setLocalStorage('dashboardLayout', layout);
  }, [layout]);

  const switchLayout = useCallback((type: 'list' | 'grid') => {
    setLayout(type);
  }, []);

  const folders = useMemo(
    () => files.filter(f => f.type === 'folder'),
    [files]
  );
  const regularFiles = useMemo(
    () => files.filter(f => f.type === 'file'),
    [files]
  );

  const allIds = useMemo(() => files.map(f => f.id), [files]);

  // Helper to get index by id
  const getIndexById = useCallback(
    (id: string) => allIds.findIndex(i => i === id),
    [allIds]
  );

  // Multi-select handler
  const handleSelect = useCallback(
    (id: string, event: React.MouseEvent) => {
      const idx = getIndexById(id);

      // Check if this is a checkbox click (no need for modifier keys)
      const isCheckboxClick = (event.target as HTMLElement).closest(
        '[type="checkbox"]'
      );

      if (isCheckboxClick) {
        // For checkbox clicks, simply toggle the selection
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else if (event.shiftKey && lastSelectedIndex !== null) {
        // Range selection for row clicks with shift key
        const start = Math.min(lastSelectedIndex, idx);
        const end = Math.max(lastSelectedIndex, idx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])));
      } else if (event.ctrlKey || event.metaKey) {
        // Multi-selection for row clicks with ctrl/cmd key
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else {
        // Single selection for regular row clicks
        setSelectedIds([id]);
        setLastSelectedIndex(idx);
      }
    },
    [allIds, lastSelectedIndex, getIndexById]
  );

  // Shift+arrow key selection
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!selectedIds.length) return;

      const currentIdx =
        lastSelectedIndex ?? getIndexById(selectedIds[selectedIds.length - 1]);
      let nextIdx = currentIdx;

      if (event.shiftKey) {
        if (event.key === 'ArrowDown') {
          nextIdx = Math.min(currentIdx + gridColumns, allIds.length - 1);
        } else if (event.key === 'ArrowUp') {
          nextIdx = Math.max(currentIdx - gridColumns, 0);
        } else if (event.key === 'ArrowRight') {
          nextIdx = Math.min(currentIdx + 1, allIds.length - 1);
        } else if (event.key === 'ArrowLeft') {
          nextIdx = Math.max(currentIdx - 1, 0);
        }
        if (nextIdx !== currentIdx) {
          const rangeStart =
            selectedIds.length === 1
              ? currentIdx
              : getIndexById(selectedIds[0]);
          const start = Math.min(rangeStart, nextIdx);
          const end = Math.max(rangeStart, nextIdx);
          const rangeIds = allIds.slice(start, end + 1);
          setSelectedIds(rangeIds);
          setLastSelectedIndex(nextIdx);
        }
      }
    },
    [selectedIds, lastSelectedIndex, allIds, getIndexById, gridColumns]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(files.map(f => f.id));
  }, [files]);

  const handleUnselectAll = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }, []);

  // Handle row selection
  const onSelectRow = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds(prev =>
        checked ? [...prev, id] : prev.filter(i => i !== id)
      );
      setLastSelectedIndex(getIndexById(id));
    },
    [getIndexById]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        handleSelectAll();
      } else {
        handleUnselectAll();
      }
    },
    [handleSelectAll, handleUnselectAll]
  );

  // Actions for selected items
  const handleDeleteSelected = useCallback(() => {
    setFiles(prev => prev.filter(f => !selectedIds.includes(f.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const handleDownloadSelected = useCallback(() => {}, [selectedIds]);

  const handleShareSelected = useCallback(() => {}, [selectedIds]);

  return {
    layout,
    switchLayout,
    files,
    setFiles,
    folders,
    regularFiles,
    selectedIds,
    setSelectedIds,
    setLastSelectedIndex,
    handleSelect,
    handleKeyDown,
    handleSelectAll,
    handleUnselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    handleShareSelected,
    getIndexById,
    onSelectAll,
    onSelectRow,
    dragRef,
    isDragging,
    handleFileUpload,
    uploadProgress,
    uploadingFiles,
    handleCancelUpload
  };
};

export default useDashboard;
