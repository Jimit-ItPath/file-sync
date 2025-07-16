import { useCallback, useEffect, useMemo, useState } from 'react';
import { ICONS } from '../../assets/icons';
import { getLocalStorage, setLocalStorage } from '../../utils/helper';

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
    id: '3',
    name: 'Photos',
    type: 'folder',
    icon: (size: number) => <ICONS.IconFolder size={size} color="#38bdf8" />,
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 10, 2023',
    size: '–',
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

const useDashboard = () => {
  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const savedLayout = getLocalStorage('dashboardLayout');
    return savedLayout ? savedLayout : 'list';
  });
  const [files, setFiles] = useState<FileType[]>(initialFiles);

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

  return {
    layout,
    switchLayout,
    files,
    setFiles,
    folders,
    regularFiles,
  };
};

export default useDashboard;
