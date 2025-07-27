import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ICONS } from '../../assets/icons';
import {
  formatDate,
  formatFileSize,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '../../utils/helper';
import { useMediaQuery } from '@mantine/hooks';
import useDragDrop from '../../components/inputs/dropzone/use-drag-drop';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createCloudStorageFolder,
  downloadFiles,
  initializeCloudStorageFromStorage,
  navigateToFolder,
  removeCloudStorageFiles,
  renameCloudStorageFile,
  resetCloudStorageFolder,
  setAccountType,
  setSearchTerm,
  uploadCloudStorageFiles,
  type AccountType,
} from '../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router';

export type FileType = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: (size: number) => React.ReactNode;
  owner: { name: string; avatar: string | null; initials: string };
  lastModified: string;
  size: string | null;
  preview?: string;
  mimeType?: string;
  fileExtension?: string | null;
  download_url: string | null;
};
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const getFileIcon = (item: {
  entry_type: string;
  mime_type?: string;
  file_extension?: string | null;
  name?: string;
}) => {
  const getIconComponent = (size: number) => {
    const iconSize = size || 20;

    // First handle folders
    if (
      item.entry_type === 'folder' ||
      item.mime_type === 'folder' ||
      item.mime_type === 'application/vnd.google-apps.folder'
    ) {
      return <ICONS.IconFolder size={iconSize} color="#38bdf8" />;
    }

    // Then handle by mime_type if available
    if (item.mime_type) {
      switch (true) {
        case item.mime_type.startsWith('image/'):
          return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
        case item.mime_type === 'application/pdf':
          return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
        case [
          'application/vnd.google-apps.document',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/rtf',
          'text/rtf',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
        case [
          'application/vnd.google-apps.spreadsheet',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
        case [
          'application/vnd.google-apps.presentation',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.oasis.opendocument.presentation',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
        case ['text/plain', 'text/markdown', 'text/x-markdown'].includes(
          item.mime_type
        ):
          return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
        case item.mime_type === 'text/csv':
          return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
        case [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/x-tar',
          'application/gzip',
        ].includes(item.mime_type):
          return <ICONS.IconFileTypeZip size={iconSize} color="#7c3aed" />;
        case item.mime_type.startsWith('audio/'):
          return <ICONS.IconDeviceAudioTape size={iconSize} color="#9333ea" />;
        case item.mime_type.startsWith('video/'):
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
        ].includes(item.mime_type):
          return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
        case [
          'application/x-sql',
          'application/sql',
          'application/x-sqlite3',
          'application/x-mdb',
        ].includes(item.mime_type):
          return <ICONS.IconDatabase size={iconSize} color="#10b981" />;
        case [
          'application/x-msdownload',
          'application/x-ms-dos-executable',
          'application/x-executable',
          'application/x-mach-binary',
        ].includes(item.mime_type):
          return <ICONS.IconBinary size={iconSize} color="#6b7280" />;
        case [
          'application/epub+zip',
          'application/x-mobipocket-ebook',
          'application/vnd.amazon.ebook',
        ].includes(item.mime_type):
          return <ICONS.IconBook size={iconSize} color="#14b8a6" />;
      }
    }

    // Fall back to file extension if mime_type is not provided or not matched
    const extension =
      item.file_extension || item.name?.split('.')?.pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <ICONS.IconFileTypePdf size={iconSize} color="#ef4444" />;
      case 'doc':
      case 'docx':
        return <ICONS.IconFileTypeDoc size={iconSize} color="#2563eb" />;
      case 'xls':
      case 'xlsx':
        return <ICONS.IconFileTypeXls size={iconSize} color="#16a34a" />;
      case 'ppt':
      case 'pptx':
        return <ICONS.IconFileTypePpt size={iconSize} color="#e11d48" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <ICONS.IconPhoto size={iconSize} color="#3b82f6" />;
      case 'txt':
      case 'md':
        return <ICONS.IconFileTypeTxt size={iconSize} color="#64748b" />;
      case 'csv':
        return <ICONS.IconFileTypeCsv size={iconSize} color="#16a34a" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <ICONS.IconFileTypeZip size={iconSize} color="#7c3aed" />;
      // Audio extensions
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
      case 'aac':
      case 'm4a':
        return <ICONS.IconDeviceAudioTape size={iconSize} color="#9333ea" />;
      // Video extensions
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'flv':
      case 'webm':
        return <ICONS.IconVideo size={iconSize} color="#dc2626" />;
      // Code extensions
      case 'html':
      case 'css':
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
      case 'xml':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'php':
      case 'rb':
      case 'sh':
        return <ICONS.IconCode size={iconSize} color="#f59e0b" />;
      // Database extensions
      case 'sql':
      case 'db':
      case 'sqlite':
      case 'mdb':
        return <ICONS.IconDatabase size={iconSize} color="#10b981" />;
      // Executable extensions
      case 'exe':
      case 'dmg':
      case 'app':
      case 'msi':
        return <ICONS.IconBinary size={iconSize} color="#6b7280" />;
      // Ebook extensions
      case 'epub':
      case 'mobi':
      case 'azw':
        return <ICONS.IconBook size={iconSize} color="#14b8a6" />;
      default:
        return <ICONS.IconFile size={iconSize} color="#64748b" />;
    }
  };

  return getIconComponent;
};

const folderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required'),
});

const renameSchema = z.object({
  newName: z.string().min(1, 'New name is required'),
});

type FolderFormData = z.infer<typeof folderSchema>;

type RenameFormData = z.infer<typeof renameSchema>;

const useDashboard = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const savedLayout = getLocalStorage('dashboardLayout');
    return savedLayout ? savedLayout : 'list';
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: { name: string; size: string };
  }>({});
  const uploadControllers = useRef<{ [key: string]: AbortController }>({});
  const cancelledUploadsRef = useRef<Set<string>>(new Set());
  const uploadsInProgressRef = useRef(false);
  const initializedRef = useRef(false);
  const hasMountedOnce = useRef(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'files'>('folder');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileType | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileType | null>(null);
  const [removeFilesModalOpen, setRemoveFilesModalOpen] = useState(false);

  const {
    cloudStorage,
    loading,
    pagination,
    currentFolderId,
    currentPath,
    uploadLoading,
    accountType,
    searchTerm,
  } = useAppSelector(state => state.cloudStorage);
  const dispatch = useAppDispatch();

  const isXs = useMediaQuery('(max-width: 575px)');
  const isSm = useMediaQuery('(min-width: 576px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 991px)');

  const gridColumns = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4;

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

  const folderIdPath = params['*']
    ? params['*'].split('/').filter(Boolean)
    : [];
  // const folderId = getLocalStorage('folderId');
  // console.log("folder id path-", folderIdPath)
  const folderId = folderIdPath?.length
    ? folderIdPath[folderIdPath.length - 1]
    : '';

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const handleAccountTypeChange = (value: AccountType | 'all') => {
    dispatch(setAccountType(value));
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getCloudStorageFiles = useCallback(async () => {
    await dispatch(
      initializeCloudStorageFromStorage({
        ...(folderId && { id: folderId }),
        limit: pagination?.page_limit || 10,
        page: pagination?.page_no || 1,
        ...(accountType !== 'all' && {
          account_type: accountType,
        }),
        searchTerm: debouncedSearchTerm || '',
      })
    );
  }, [
    dispatch,
    folderId,
    pagination?.page_limit,
    pagination?.page_no,
    accountType,
    debouncedSearchTerm,
  ]);

  const [onInitialize] = useAsyncOperation(getCloudStorageFiles);

  useEffect(() => {
    if (!initializedRef.current) {
      onInitialize({});
      initializedRef.current = true;
    }

    return () => {
      dispatch(resetCloudStorageFolder());
      removeLocalStorage('cloudStoragePath');
      removeLocalStorage('folderId');
    };
  }, []);

  useEffect(() => {
    if (!hasMountedOnce.current) {
      hasMountedOnce.current = true;
      return;
    }

    dispatch(setSearchTerm(debouncedSearchTerm));
    getCloudStorageFiles();
  }, [debouncedSearchTerm, accountType]);

  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const lastScrollTop = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    lastScrollTop.current = e.currentTarget.scrollTop;
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
      pagination &&
      pagination.page_no < pagination.total_pages &&
      !loading
    ) {
      loadMoreFiles();
    }
  };

  useEffect(() => {
    if (scrollBoxRef.current && lastScrollTop.current > 0) {
      // Use setTimeout to ensure DOM is updated before restoring scroll
      setTimeout(() => {
        scrollBoxRef.current!.scrollTop = lastScrollTop.current;
      }, 0);
    }
  }, [cloudStorage.length]);

  const loadMoreFiles = useCallback(async () => {
    if (pagination && pagination.page_no < pagination.total_pages && !loading) {
      await dispatch(
        initializeCloudStorageFromStorage({
          page: pagination.page_no + 1,
          limit: pagination.page_limit,
          ...(currentFolderId && { id: currentFolderId }),
          ...(accountType !== 'all' && {
            account_type: accountType,
          }),
          searchTerm: debouncedSearchTerm || '',
        })
      );
    }
  }, [pagination, loading, dispatch, currentFolderId]);

  // Convert cloud storage data to FileType format
  const files = useMemo(() => {
    return cloudStorage.map(item => ({
      id: item.id,
      name: item.name,
      type: item.entry_type === 'folder' ? 'folder' : 'file',
      // icon: getFileIcon(item.name, item.mime_type),
      icon: getFileIcon({
        entry_type: item.entry_type,
        mime_type: item.mime_type,
        file_extension: item.file_extension,
        name: item.name,
      }),
      owner: { name: 'You', avatar: null, initials: 'JS' },
      lastModified: formatDate(item.modified_at),
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
    }));
  }, [cloudStorage]);

  const navigateToFolderFn = useCallback(
    (folder: { id?: string; name: string } | null) => {
      if (folder?.id) {
        const idx = currentPath.findIndex(f => f.id === folder.id);
        const path = currentPath
          .slice(0, idx + 1)
          .map(f => f.id)
          .join('/');
        navigate(`/dashboard/${path}`);
        dispatch(
          navigateToFolder({
            id: String(folder?.id),
            name: String(folder?.name),
          })
        );
      } else {
        dispatch(navigateToFolder(null));
        navigate('/dashboard');
      }
    },
    [dispatch, currentPath]
  );

  const handleRowDoubleClick = useCallback(
    (row: FileType, _?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (
        row.mimeType === 'application/vnd.google-apps.folder' ||
        row.type === 'folder'
      ) {
        setSelectedIds([]);
        setLastSelectedIndex(null);
        navigateToFolderFn({ id: row.id, name: row.name });
      }
    },
    [navigateToFolderFn]
  );

  const handleMenuItemClick = (actionId: string, row: FileType) => {
    if (
      actionId === 'download' &&
      (row.type !== 'folder' ||
        row.mimeType !== 'application/vnd.google-apps.folder') &&
      row.download_url
    ) {
      window.open(row.download_url, '_blank');
    }
    // else if (actionId === 'view') {
    //   if (row.mimeType === 'application/vnd.google-apps.folder') {
    //     navigateToFolderFn({ id: row.id, name: row.name });
    //   } else if (row.webViewLink) {
    //     window.open(row.webViewLink, '_blank');
    //   }
    // }
    else if (actionId === 'rename') {
      setItemToRename(row);
      setRenameModalOpen(true);
      resetRenameForm({ newName: row.name });
    }
    // else if (actionId === 'share' && row.webViewLink) {
    //   window.open(`https://drive.google.com/file/d/${row.id}/share`, '_blank');
    // }
    else if (actionId === 'delete') {
      setItemToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  // Folder creation functionality
  const [createFolder, createFolderLoading] = useAsyncOperation(
    async (folderName: string) => {
      try {
        await dispatch(
          createCloudStorageFolder({
            name: folderName,
            ...(currentFolderId && {
              id: currentFolderId,
            }),
          })
        ).unwrap();
        resetFolderForm();
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 10,
            page: pagination?.page_no || 1,
            ...(accountType !== 'all' && {
              account_type: accountType,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
        setModalOpen(false);
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to create folder',
          color: 'red',
        });
      }
    }
  );

  const handleCreateFolder = folderMethods.handleSubmit(data => {
    createFolder(data.folderName);
  });

  // const [uploadFiles, uploadFilesLoading] = useAsyncOperation(
  //   async (files: File[]) => {
  //     try {
  //       const formData = new FormData();
  //       files.forEach(file => formData.append('file', file));
  //       if (currentFolderId) {
  //         formData.append('id', currentFolderId);
  //       }
  //       await dispatch(uploadCloudStorageFiles(formData)).unwrap();
  //       await dispatch(
  //         initializeCloudStorageFromStorage({
  //           ...(folderId && {
  //             id: folderId,
  //           }),
  //           limit: pagination?.page_limit || 10,
  //           page: pagination?.page_no || 1,
  //         })
  //       );
  //       setUploadedFiles([]);
  //       setModalOpen(false);
  //     } catch (error: any) {
  //       notifications.show({
  //         message: error || 'Failed to upload files',
  //         color: 'red',
  //       });
  //     }
  //   }
  // );

  const [uploadFiles, uploadFilesLoading] = useAsyncOperation(
    async (files: File[]) => {
      try {
        setShowUploadProgress(true); // Show the progress UI
        const fileIds = files.map(() => uuidv4()); // Generate unique IDs for each file

        // Initialize progress and uploading files state
        files.forEach((file, index) => {
          const fileId = fileIds[index];
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              name: file.name,
              size: formatFileSize(file.size.toString()),
            },
          }));
          setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        });

        const formData = new FormData();
        files.forEach(file => formData.append('file', file));
        if (currentFolderId) {
          formData.append('id', currentFolderId);
        }

        // Simulate progress manually up to 95%
        const simulateProgress = (fileId: string) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5; // Increment progress by 5%
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: Math.min(progress, 95), // Cap progress at 95%
            }));
            if (progress >= 95 || !uploadLoading) {
              clearInterval(interval); // Stop simulation when progress reaches 95% or upload completes
            }
          }, 300); // Update progress every 300ms
        };

        // Start simulating progress for each file
        files.forEach((_, index) => {
          const fileId = fileIds[index];
          simulateProgress(fileId);
        });

        // Call the API and track progress
        await dispatch(
          uploadCloudStorageFiles({
            data: formData,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              files.forEach((_, index) => {
                const fileId = fileIds[index];
                setUploadProgress(prev => ({
                  ...prev,
                  [fileId]: Math.min(percentCompleted, 95), // Cap progress at 95%
                }));
              });
            },
          })
        ).unwrap();

        // Wait for `uploadLoading` to become false and set progress to 100%
        const waitForUploadCompletion = () => {
          const interval = setInterval(() => {
            if (!uploadLoading) {
              files.forEach((_, index) => {
                const fileId = fileIds[index];
                setUploadProgress(prev => ({
                  ...prev,
                  [fileId]: 100, // Set progress to 100% when upload completes
                }));
              });
              clearInterval(interval); // Clear interval once upload is complete
            }
          }, 100); // Check every 100ms
        };

        waitForUploadCompletion();

        // Refresh the file list after upload
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 10,
            page: pagination?.page_no || 1,
            ...(accountType !== 'all' && {
              account_type: accountType,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );

        // Do not reset states here to keep the progress bar visible
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to upload files',
          color: 'red',
        });
      }
    }
  );

  // File rename functionality
  const [renameFile, renameFileLoading] = useAsyncOperation(
    async ({ fileId, newName }: { fileId: string; newName: string }) => {
      try {
        await dispatch(
          renameCloudStorageFile({ id: fileId, name: newName })
        ).unwrap();
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 10,
            page: pagination?.page_no || 1,
            ...(accountType !== 'all' && {
              account_type: accountType,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
        notifications.show({
          message: 'File renamed successfully',
          color: 'green',
        });
        setRenameModalOpen(false);
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to rename file',
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
        await dispatch(removeCloudStorageFiles({ ids: [fileId] })).unwrap();
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 10,
            page: pagination?.page_no || 1,
            ...(accountType !== 'all' && {
              account_type: accountType,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
        notifications.show({
          message: 'File deleted successfully',
          color: 'green',
        });
        setDeleteModalOpen(false);
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to delete file',
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

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const filesToUpload = files?.length ? files : uploadedFiles;
      if (filesToUpload.length === 0) return;

      uploadsInProgressRef.current = true;
      setShowUploadProgress(true);

      // Reset states for new uploads
      setUploadProgress({});
      setUploadingFiles({});

      filesToUpload.forEach(file => {
        const fileId = uuidv4();
        const controller = new AbortController();
        uploadControllers.current[fileId] = controller;

        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            name: file.name,
            size: formatFileSize(file.size.toString()),
            fileObject: file,
          },
        }));

        // setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      });
      uploadFiles(filesToUpload);
    },
    [uploadFiles, uploadedFiles]
  );

  const cleanupUpload = (fileId: string) => {
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
    setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
    delete uploadControllers.current[fileId];
    cancelledUploadsRef.current.delete(fileId);
    // checkUploadsComplete();
  };

  // const checkUploadsComplete = () => {
  //   if (
  //     Object.keys(uploadProgress).length === 0 &&
  //     Object.keys(uploadingFiles).length === 0
  //   ) {
  //     uploadsInProgressRef.current = false;
  //   }
  // };

  const handleCancelUpload = useCallback((fileId: string) => {
    cancelledUploadsRef.current.add(fileId);
    if (uploadControllers.current[fileId]) {
      uploadControllers.current[fileId].abort();
    }
    cleanupUpload(fileId);
  }, []);

  const handleCloseUploadProgress = useCallback(() => {
    // Cancel all ongoing uploads when closing the progress panel
    Object.keys(uploadControllers.current).forEach(fileId => {
      uploadControllers.current[fileId].abort();
    });
    setShowUploadProgress(false);
    setUploadProgress({});
    setUploadingFiles({});
    uploadsInProgressRef.current = false;
    cancelledUploadsRef.current.clear();
    uploadControllers.current = {};
  }, []);

  useEffect(() => {
    return () => {
      uploadsInProgressRef.current = false;
    };
  }, []);

  // Drag and drop functionality
  const { dragRef, isDragging } = useDragDrop({
    onFileDrop: handleFileUpload,
    acceptedFileTypes: ['*'],
    // maxFileSize: 100 * 1024 * 1024,
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
    setRemoveFilesModalOpen(true);
  }, [selectedIds]);

  const closeRemoveFilesModal = useCallback(() => {
    setRemoveFilesModalOpen(false);
  }, [setRemoveFilesModalOpen]);

  const [handleRemoveFilesConfirm, removeFilesLoading] = useAsyncOperation(
    async () => {
      try {
        await dispatch(removeCloudStorageFiles({ ids: selectedIds }));
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 10,
            page: pagination?.page_no || 1,
            ...(accountType !== 'all' && {
              account_type: accountType,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
        notifications.show({
          message: `${selectedIds?.length > 1 ? 'Items' : 'Item'} deleted successfully`,
          color: 'green',
        });
        setSelectedIds([]);
        setLastSelectedIndex(null);
        closeRemoveFilesModal();
      } catch (error: any) {
        notifications.show({
          message:
            error ||
            `Failed to delete ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
          color: 'red',
        });
      }
    }
  );

  const handleShareSelected = useCallback(() => {}, [selectedIds]);

  const openModal = useCallback((type: 'folder' | 'files') => {
    setModalType(type);
    setModalOpen(true);
    setUploadedFiles([]);
    resetFolderForm();
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const [downloadItems] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(downloadFiles({ ids: selectedIds }));
      if (res?.payload?.status !== 200) {
        notifications.show({
          message:
            res?.payload?.message ||
            `Failed to download ${selectedIds.length > 1 ? 'items' : 'item'}`,
          color: 'red',
        });
        return;
      }

      const blob = new Blob([res.payload.data]);

      // ✅ Extract filename from Content-Disposition header
      const contentDisposition = res.payload.headers?.['content-disposition'];
      const match = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `download-${Date.now()}.zip`;

      // ✅ Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      notifications.show({
        message:
          error ||
          `Failed to download ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
        color: 'red',
      });
    }
  });

  const handleDownloadSelected = useCallback(() => {
    downloadItems({});
  }, [selectedIds]);

  return {
    layout,
    switchLayout,
    files,
    loading,
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
    handleCancelUpload,
    handleCloseUploadProgress,
    showUploadProgress,

    // create file / folder
    createFolderLoading,
    handleCreateFolder,
    uploadFilesLoading,
    openModal,
    closeModal,
    currentPath,
    navigateToFolderFn,
    modalOpen,
    modalType,
    folderMethods,
    setUploadedFiles,
    uploadedFiles,
    getFileIcon,

    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    removeFileLoading,
    handleDeleteConfirm,
    removeFilesModalOpen,
    removeFilesLoading,

    renameModalOpen,
    setRenameModalOpen,
    itemToRename,
    renameMethods,
    handleRenameConfirm,
    renameFileLoading,
    handleRemoveFilesConfirm,
    closeRemoveFilesModal,

    handleMenuItemClick,
    handleRowDoubleClick,

    loadMoreFiles,
    pagination,
    handleScroll,
    scrollBoxRef,
    navigate,
    accountType,
    searchTerm: localSearchTerm,
    handleAccountTypeChange,
    handleSearchChange,
  };
};

export default useDashboard;
