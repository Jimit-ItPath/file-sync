import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionIcon, Avatar, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  checkGoogleDriveAccess,
  createGoogleDriveFolder,
  fetchGoogleDriveFiles,
  removeGoogleDriveFiles,
  renameGoogleDriveFile,
  uploadGoogleDriveFiles,
} from '../../store/slices/google-drive.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { useAppDispatch, useAppSelector } from '../../store';
import { formatDate, formatFileSize } from '../../utils/helper';
import { Menu } from '../../components';
import { ICONS } from '../../assets/icons';

// Type definitions
type FileRow = {
  id: string;
  name: string;
  icon: React.ReactNode;
  owner: { name: string; avatar: string | null; initials: string };
  lastModified: string;
  size: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
};

// Constants
const MENU_ITEMS = [
  { id: 'view', label: 'View', icon: ICONS.IconEye },
  { id: 'rename', label: 'Rename', icon: ICONS.IconEdit },
  { id: 'download', label: 'Download', icon: ICONS.IconDownload },
  { id: 'share', label: 'Share', icon: ICONS.IconShare },
  { id: 'delete', label: 'Delete', icon: ICONS.IconTrash },
];

const folderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required'),
});

const renameSchema = z.object({
  newName: z.string().min(1, 'New name is required'),
});

type FolderFormData = z.infer<typeof folderSchema>;

type RenameFormData = z.infer<typeof renameSchema>;

const useGoogleDrive = () => {
  const dispatch = useAppDispatch();
  const { hasAccess, isLoading, files, pageToken } = useAppSelector(
    state => state.googleDrive
  );

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'files'>('folder');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileRow | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileRow | null>(null);

  // Form handling
  const folderMethods = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    mode: 'onChange',
    defaultValues: {
      folderName: '',
    },
  });

  const renameMethods = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    mode: 'onChange',
  });

  const { reset: resetFolderForm } = folderMethods;
  const { reset: resetRenameForm } = renameMethods;

  // Initialization and connection
  const initializeGoogleDrive = useCallback(async () => {
    const resultAction = await dispatch(checkGoogleDriveAccess());
    if (resultAction?.payload?.data?.hasAccess) {
      await dispatch(fetchGoogleDriveFiles({}));
    }
  }, [dispatch]);

  const [onInitialize, loading] = useAsyncOperation(initializeGoogleDrive);

  useEffect(() => {
    onInitialize({});
  }, []);

  const loadMoreFiles = useCallback(() => {
    if (pageToken && !isLoading) {
      dispatch(fetchGoogleDriveFiles({ pageToken }));
    }
  }, [pageToken, isLoading, dispatch]);

  const connectWithGoogleDrive = useCallback(() => {
    window.open(
      `${import.meta.env.VITE_REACT_APP_BASE_URL}/google/drive/auth`,
      '_self'
    );
  }, []);

  // File icon handling
  const getFileIcon = (mimeType: string) => {
    const iconSize = 20;

    switch (true) {
      case mimeType === 'application/vnd.google-apps.folder':
        return <ICONS.IconFolder size={iconSize} color="#38bdf8" />;
      case mimeType?.startsWith('image/'):
        return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
      case mimeType === 'application/pdf':
        return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
      case [
        'application/vnd.google-apps.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/rtf',
        'text/rtf',
      ].includes(mimeType):
        return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
      case [
        'application/vnd.google-apps.spreadsheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.spreadsheet',
      ].includes(mimeType):
        return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
      case [
        'application/vnd.google-apps.presentation',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
      ].includes(mimeType):
        return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
      case ['text/plain', 'text/markdown', 'text/x-markdown'].includes(
        mimeType
      ):
        return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
      case mimeType === 'text/csv':
        return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
      case [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-tar',
        'application/gzip',
      ].includes(mimeType):
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
        'application/xml',
        'text/x-python',
        'text/x-java-source',
        'text/x-c',
        'text/x-c++',
        'text/x-php',
        'text/x-ruby',
        'text/x-shellscript',
        'application/x-httpd-php',
        'application/x-sh',
        'application/x-typescript',
      ].includes(mimeType):
        return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
      case [
        'application/x-sql',
        'application/sql',
        'application/x-sqlite3',
        'application/x-mdb',
      ].includes(mimeType):
        return <ICONS.IconDatabase size={iconSize} color="#10b981" />;
      case [
        'application/x-msdownload',
        'application/x-ms-dos-executable',
        'application/x-executable',
        'application/x-mach-binary',
      ].includes(mimeType):
        return <ICONS.IconBinary size={iconSize} color="#6b7280" />;
      case [
        'application/epub+zip',
        'application/x-mobipocket-ebook',
        'application/vnd.amazon.ebook',
      ].includes(mimeType):
        return <ICONS.IconBook size={iconSize} color="#14b8a6" />;
      default:
        return <ICONS.IconFile size={iconSize} color="#64748b" />;
    }
  };

  // File data transformation
  const transformFiles = useCallback((files: any[]) => {
    return files.map(file => ({
      id: file.id,
      name: file.name,
      icon: getFileIcon(file.mimeType),
      owner: {
        name: 'You',
        avatar: null,
        initials: 'Y',
      },
      lastModified: formatDate(file.modifiedTime, true),
      size:
        file.mimeType === 'application/vnd.google-apps.folder'
          ? '–'
          : formatFileSize(file.size),
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
    }));
  }, []);

  const transformedFiles = useMemo(
    () => (files?.length ? transformFiles(files) : []),
    [files, transformFiles]
  );

  // File actions
  const handleMenuItemClick = (actionId: string, row: FileRow) => {
    if (actionId === 'download') {
      window.open(row.webContentLink, '_blank');
    } else if (actionId === 'view' && row.webViewLink) {
      window.open(row.webViewLink, '_blank');
    } else if (actionId === 'rename') {
      setItemToRename(row);
      setRenameModalOpen(true);
      resetRenameForm({ newName: row.name });
    } else if (actionId === 'share' && row.webViewLink) {
      window.open(`https://drive.google.com/file/d/${row.id}/share`, '_blank');
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
          createGoogleDriveFolder({ folder_name: folderName })
        ).unwrap();
        resetFolderForm();
        await dispatch(fetchGoogleDriveFiles({}));
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
        await dispatch(uploadGoogleDriveFiles(formData)).unwrap();
        await dispatch(fetchGoogleDriveFiles({}));
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

  // File rename functionality
  const [renameFile, renameFileLoading] = useAsyncOperation(
    async ({ fileId, newName }: { fileId: string; newName: string }) => {
      try {
        await dispatch(
          renameGoogleDriveFile({ file_id: fileId, name: newName })
        ).unwrap();
        await dispatch(fetchGoogleDriveFiles({}));
        notifications.show({
          message: 'File renamed successfully',
          color: 'green',
        });
        setRenameModalOpen(false);
      } catch (error) {
        notifications.show({
          message: 'Failed to rename file',
          color: 'red',
        });
      }
    }
  );

  const handleRenameConfirm = renameMethods.handleSubmit(data => {
    if (itemToRename?.id) {
      renameFile({ fileId: itemToRename.id, newName: data.newName });
    }
  });

  // File deletion functionality
  const [removeFile, removeFileLoading] = useAsyncOperation(
    async (fileId: string) => {
      try {
        await dispatch(removeGoogleDriveFiles({ field: fileId })).unwrap();
        await dispatch(fetchGoogleDriveFiles({}));
        notifications.show({
          message: 'File deleted successfully',
          color: 'green',
        });
        setDeleteModalOpen(false);
      } catch (error) {
        notifications.show({
          message: 'Failed to delete file',
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
            <Avatar src={row.owner.avatar} radius="xl" size="sm" color="blue">
              {row.owner.initials}
            </Avatar>
            <Text size="sm" truncate>
              {row.owner.name}
            </Text>
          </Group>
        ),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        width: '20%',
        render: (row: FileRow) => <Text size="sm">{row.lastModified}</Text>,
      },
      {
        key: 'size',
        label: 'Size',
        width: '15%',
        render: (row: FileRow) => <Text size="sm">{row.size}</Text>,
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
    connectWithGoogleDrive,
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
    pageToken,
    renameModalOpen,
    setRenameModalOpen,
    itemToRename,
    renameMethods,
    handleRenameConfirm,
    renameFileLoading,
  };
};

export default useGoogleDrive;
