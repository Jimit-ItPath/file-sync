import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionIcon, Avatar, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  checkOneDriveAccess,
  createOneDriveFolder,
  fetchOneDriveFiles,
  removeOneDriveFiles,
  uploadOneDriveFiles,
} from '../../store/slices/onedrive.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  decodeToken,
  formatDate,
  formatFileSize,
  getMimeTypeFromExtension,
} from '../../utils/helper';
import { Menu } from '../../components';
import { ICONS } from '../../assets/icons';

type FileRow = {
  id: string;
  name: string;
  webUrl: string;
  icon: React.ReactNode;
  owner: {
    displayName: string;
    email: string;
  };
  lastModifiedDateTime: string;
  size: number;
  '.tag': 'file' | 'folder';
  downloadUrl?: string;
  mimeType?: string;
};

// Constants
const MENU_ITEMS = [
  { id: 'view', label: 'View', icon: ICONS.IconEye },
  { id: 'download', label: 'Download', icon: ICONS.IconDownload },
  { id: 'share', label: 'Share', icon: ICONS.IconShare },
  { id: 'delete', label: 'Delete', icon: ICONS.IconTrash },
];

const folderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required'),
});

type FolderFormData = z.infer<typeof folderSchema>;

const useOneDrive = () => {
  const dispatch = useAppDispatch();
  const { hasAccess, isLoading, files, nextLink } = useAppSelector(
    state => state.oneDrive
  );

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'files'>('folder');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileRow | null>(null);

  // Form handling
  const folderMethods = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    mode: 'onChange',
    defaultValues: {
      folderName: '',
    },
  });

  const { reset: resetFolderForm } = folderMethods;

  // Initialization and connection
  const initializeOneDrive = useCallback(async () => {
    const resultAction = await dispatch(checkOneDriveAccess());
    if (resultAction?.payload?.data?.hasAccess) {
      await dispatch(fetchOneDriveFiles({}));
    }
  }, [dispatch]);

  const [onInitialize, loading] = useAsyncOperation(initializeOneDrive);

  useEffect(() => {
    onInitialize({});
  }, []);

  const loadMoreFiles = useCallback(() => {
    if (nextLink && !isLoading) {
      dispatch(fetchOneDriveFiles({ nextLink }));
    }
  }, [nextLink, isLoading, dispatch]);

  const connectWithOneDrive = useCallback(async () => {
    const token = localStorage.getItem('token');
    const decodedData: any = decodeToken(token);
    window.open(
      `${import.meta.env.VITE_REACT_APP_BASE_URL}/onedrive/auth?email=${decodedData?.user?.email}`,
      '_self'
    );
  }, []);

  // File icon handling
  const getFileIcon = (mimeType: string) => {
    const iconSize = 20;

    switch (true) {
      case mimeType === 'folder':
        return <ICONS.IconFolder size={iconSize} color="#38bdf8" />;
      case mimeType?.startsWith('image/'):
        return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
      case mimeType === 'application/pdf':
        return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
      case [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/rtf',
      ].includes(mimeType):
        return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
      case [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(mimeType):
        return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
      case [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ].includes(mimeType):
        return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
      case ['text/plain', 'text/markdown'].includes(mimeType):
        return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
      case mimeType === 'text/csv':
        return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
      case ['application/zip', 'application/x-zip-compressed'].includes(
        mimeType
      ):
        return <ICONS.IconFileTypeZip size={iconSize} color="#7c3aed" />;
      case mimeType?.startsWith('audio/'):
        return <ICONS.IconDeviceAudioTape size={iconSize} color="#9333ea" />;
      case mimeType?.startsWith('video/'):
        return <ICONS.IconVideo size={iconSize} color="#dc2626" />;
      case [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
      ].includes(mimeType):
        return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
      default:
        return <ICONS.IconFile size={iconSize} color="#64748b" />;
    }
  };

  // File data transformation
  const transformFiles = useCallback((files: any[]) => {
    return files.map(file => {
      const isFolder = 'folder' in file;
      const mimeType = isFolder
        ? 'folder'
        : file.file?.mimeType ||
          getMimeTypeFromExtension(file.name.split('.').pop());

      return {
        id: file.id,
        name: file.name,
        webUrl: file.webUrl,
        icon: getFileIcon(mimeType),
        owner: {
          displayName: file.lastModifiedBy?.user?.displayName || 'You',
          email: file.lastModifiedBy?.user?.email || '',
        },
        lastModifiedDateTime:
          file.lastModifiedDateTime ||
          file.fileSystemInfo?.lastModifiedDateTime,
        size: file.size || 0,
        '.tag': isFolder ? 'folder' : 'file',
        downloadUrl: file['@microsoft.graph.downloadUrl'],
        mimeType: mimeType,
      } as FileRow;
    });
  }, []);

  const transformedFiles = useMemo(
    () => (files?.length ? transformFiles(files) : []),
    [files, transformFiles]
  );

  // File actions
  const handleMenuItemClick = (actionId: string, row: FileRow) => {
    if (actionId === 'download' && row.downloadUrl) {
      // Direct download for OneDrive files
      window.open(row.downloadUrl, '_blank');
    } else if (actionId === 'view') {
      // Open in OneDrive web interface
      window.open(row.webUrl, '_blank');
    } else if (actionId === 'share') {
      // OneDrive sharing link
      window.open(`${row.webUrl}?web=1`, '_blank');
    } else if (actionId === 'delete') {
      setItemToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  // Folder creation functionality
  const [createFolder, createFolderLoading] = useAsyncOperation(
    async (folderName: string) => {
      try {
        await dispatch(
          createOneDriveFolder({ folder_name: folderName })
        ).unwrap();
        resetFolderForm();
        await dispatch(fetchOneDriveFiles({}));
        setModalOpen(false);
      } catch (error) {
        notifications.show({
          message: 'Failed to create folder',
          color: 'red',
        });
      }
    }
  );

  const handleCreateFolder = folderMethods.handleSubmit(data => {
    createFolder(data.folderName);
  });

  // File upload functionality
  const [uploadFiles, uploadFilesLoading] = useAsyncOperation(
    async (files: File[]) => {
      try {
        const formData = new FormData();
        files.forEach(file => formData.append('file', file));
        await dispatch(uploadOneDriveFiles(formData)).unwrap();
        await dispatch(fetchOneDriveFiles({}));
        setUploadedFiles([]);
        setModalOpen(false);
      } catch (error) {
        notifications.show({
          message: 'Failed to upload files',
          color: 'red',
        });
      }
    }
  );

  const handleFileUpload = useCallback(() => {
    if (uploadedFiles.length > 0) {
      uploadFiles(uploadedFiles);
    }
  }, [uploadFiles, uploadedFiles]);

  // File deletion functionality
  const [removeFile, removeFileLoading] = useAsyncOperation(
    async (fileId: string) => {
      try {
        const res = await dispatch(
          removeOneDriveFiles({ id: fileId })
        ).unwrap();
        await dispatch(fetchOneDriveFiles({}));
        notifications.show({
          message:
            res?.message ||
            (itemToDelete?.['.tag'] === 'folder'
              ? 'Folder deleted successfully'
              : 'File deleted successfully'),
          color: 'green',
        });
        setDeleteModalOpen(false);
      } catch (error) {
        notifications.show({
          message:
            itemToDelete?.['.tag'] === 'folder'
              ? 'Failed to delete folder'
              : 'Failed to delete file',
          color: 'red',
        });
      }
    }
  );

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete?.id) {
      removeFile(itemToDelete.id);
    }
  }, [itemToDelete, removeFile]);

  // Selection handling
  const onSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedRows(prev =>
      checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
    );
  }, []);

  const onSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedRows(checked ? transformedFiles.map(file => file.id) : []);
    },
    [transformedFiles]
  );

  // Modal handling
  const openModal = useCallback((type: 'folder' | 'files') => {
    setModalType(type);
    setModalOpen(true);
    setUploadedFiles([]);
    resetFolderForm();
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: '30%',
        render: (row: FileRow) => (
          <Group gap={8} wrap="nowrap">
            {row.icon}
            <Text fw={600}>{row.name}</Text>
          </Group>
        ),
      },
      {
        key: 'owner',
        label: 'Owner',
        width: '20%',
        render: (row: FileRow) => (
          <Group gap={8} wrap="nowrap">
            <Avatar radius="xl" size="sm" color="blue">
              {row.owner.displayName.charAt(0)}
            </Avatar>
            <Text size="sm" truncate>
              {row.owner.displayName}
            </Text>
          </Group>
        ),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        width: '20%',
        render: (row: FileRow) => (
          <Text size="sm">{formatDate(row.lastModifiedDateTime, true)}</Text>
        ),
      },
      {
        key: 'size',
        label: 'Size',
        width: '15%',
        render: (row: FileRow) => (
          <Text size="sm">
            {row['.tag'] === 'folder'
              ? '–-'
              : formatFileSize(row?.size ? String(row.size) : '')}
          </Text>
        ),
      },
      {
        key: 'actions',
        label: '',
        width: 40,
        render: (row: FileRow) => (
          <Menu
            items={MENU_ITEMS}
            onItemClick={actionId => handleMenuItemClick(actionId, row)}
          >
            <ActionIcon variant="subtle" color="gray">
              <ICONS.IconDotsVertical size={18} />
            </ActionIcon>
          </Menu>
        ),
      },
    ],
    [handleMenuItemClick]
  );

  return {
    isLoading: isLoading || loading,
    files: transformedFiles,
    hasAccess,
    connectWithOneDrive,
    columns,
    selectedRows,
    onSelectRow,
    onSelectAll,
    modalType,
    uploadedFiles,
    setUploadedFiles,
    folderMethods,
    createFolderLoading,
    uploadFilesLoading,
    handleCreateFolder,
    handleFileUpload,
    modalOpen,
    openModal,
    closeModal,
    getFileIcon,
    deleteModalOpen,
    setDeleteModalOpen,
    handleDeleteConfirm,
    itemToDelete,
    removeFileLoading,
    loadMoreFiles,
    nextLink,
  };
};

export default useOneDrive;
