import { useCallback, useState } from 'react';

const initialFiles = [
  {
    id: '1',
    name: 'Documents',
    icon: 'folder',
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 15, 2023',
    size: '–',
  },
  {
    id: '2',
    name: 'Project_Report.pdf',
    icon: 'pdf',
    owner: { name: 'You', avatar: null, initials: 'JS' },
    lastModified: 'Jun 27, 2023',
    size: '4.2 MB',
  },
];

export type FileType = (typeof initialFiles)[number];

const useDashboard = () => {
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const [files, setFiles] = useState<FileType[]>(initialFiles);

  const switchLayout = useCallback((type: 'list' | 'grid') => {
    setLayout(type);
  }, []);

  return {
    layout,
    switchLayout,
    files,
    setFiles,
  };
};

export default useDashboard;
