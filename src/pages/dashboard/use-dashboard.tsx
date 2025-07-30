import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  formatDate,
  formatFileSize,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '../../utils/helper';
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
  setAccountId,
  setSearchTerm,
  uploadCloudStorageFiles,
  moveCloudStorageFiles,
  syncCloudStorage,
} from '../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useLocation, useNavigate, useParams } from 'react-router';
import useDebounce from '../../hooks/use-debounce';
import getFileIcon from '../../components/file-icon';

export type FileType = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: (size: number) => React.ReactNode;
  owner: { name: string; avatar: string | null; initials: string };
  lastModified: string;
  size: string | null;
  preview?: string | null;
  mimeType?: string;
  fileExtension?: string | null;
  download_url?: string | null;
  parent_id: string | null;
};

const folderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required'),
  accountId: z.string().min(1, 'Account selection is required').optional(),
});

const uploadSchema = z.object({
  accountId: z.string().min(1, 'Account selection is required').optional(),
  files: z.any().optional(),
});

const renameSchema = z.object({
  newName: z.string().min(1, 'New name is required'),
});

type FolderFormData = z.infer<typeof folderSchema>;
type UploadFormData = z.infer<typeof uploadSchema>;
type RenameFormData = z.infer<typeof renameSchema>;

const useDashboard = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const layoutKey = 'dashboardLayout';
  const folderIdKey = 'folderId';
  const pathKey = 'cloudStoragePath';

  const [layout, setLayout] = useState<'list' | 'grid'>(() => {
    const savedLayout = getLocalStorage(layoutKey);
    return savedLayout ? savedLayout : 'grid';
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

  const [isMoveMode, setIsMoveMode] = useState(false);
  const [filesToMove, setFilesToMove] = useState<string[]>([]);
  const [parentId, selectParentId] = useState<string | null>(null);
  const [sourceFolderId, setSourceFolderId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(null);

  const [dragDropModalOpen, setDragDropModalOpen] = useState(false);
  const [dragDropFiles, setDragDropFiles] = useState<File[]>([]);

  const {
    cloudStorage,
    loading,
    pagination,
    currentFolderId,
    currentPath,
    uploadLoading,
    accountId,
    searchTerm,
    navigateLoading,
    recentFiles,
  } = useAppSelector(state => state.cloudStorage);
  const { userProfile } = useAppSelector(state => state.user);
  const { checkStorageDetails } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const folderId = getLocalStorage(folderIdKey);

  const checkLocation = useMemo(
    () =>
      location.pathname.startsWith('/google-drive') ||
      location.pathname.startsWith('/dropbox') ||
      location.pathname.startsWith('/onedrive'),
    [location.pathname]
  );
  const currentAccountId = checkLocation ? params.id : accountId;

  const isSFDEnabled = useMemo(() => {
    return checkLocation
      ? true
      : !folderId
        ? (userProfile?.is_sfd_enabled ?? false)
        : true;
  }, [userProfile, folderId, checkLocation]);

  const folderMethods = useForm<FolderFormData>({
    resolver: zodResolver(
      isSFDEnabled ? folderSchema.omit({ accountId: true }) : folderSchema
    ),
    mode: 'onChange',
    defaultValues: {
      folderName: '',
      accountId: '',
    },
  });

  const uploadMethods = useForm<UploadFormData>({
    resolver: zodResolver(
      isSFDEnabled ? uploadSchema.omit({ accountId: true }) : uploadSchema
    ),
    mode: 'onChange',
    defaultValues: {
      files: [],
      accountId: '',
    },
  });

  const renameMethods = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    mode: 'onChange',
  });

  const { reset: resetFolderForm } = folderMethods;
  const { reset: resetRenameForm } = renameMethods;

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const accountOptions = useMemo(() => {
    if (checkStorageDetails && checkStorageDetails.result?.length) {
      const options = checkStorageDetails?.result?.map(account => ({
        value: account.id,
        label: account.account_name,
      }));
      return [{ value: 'all', label: 'All Accounts' }, ...options];
    }
    return [{ value: 'all', label: 'All Accounts' }];
  }, [checkStorageDetails]);

  const accountOptionsForSFD = useMemo(
    () => accountOptions?.filter(account => account.value !== 'all'),
    [accountOptions]
  );

  const handleAccountTypeChange = useCallback(
    (value: string | null) => {
      if (value && !checkLocation) {
        dispatch(setAccountId(value));
      }
    },
    [dispatch, checkLocation]
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getCloudStorageFiles = useCallback(
    async (page?: number) => {
      const requestParams: any = {
        ...(folderId && { id: folderId }),
        limit: pagination?.page_limit || 20,
        page: typeof page === 'number' ? page : pagination?.page_no || 1,
        searchTerm: debouncedSearchTerm || '',
      };

      if (checkLocation && currentAccountId) {
        requestParams.account_id = Number(currentAccountId);
      } else if (!checkLocation && accountId !== 'all') {
        requestParams.account_id = accountId;
      }

      await dispatch(initializeCloudStorageFromStorage(requestParams));
    },
    [
      dispatch,
      folderId,
      pagination?.page_limit,
      pagination?.page_no,
      accountId,
      debouncedSearchTerm,
    ]
  );

  const [onInitialize] = useAsyncOperation(getCloudStorageFiles);

  useEffect(() => {
    if (!initializedRef.current) {
      onInitialize({});
      initializedRef.current = true;
    }

    return () => {
      dispatch(resetCloudStorageFolder());
      removeLocalStorage(pathKey);
      removeLocalStorage(folderIdKey);
      removeLocalStorage(layoutKey);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedOnce.current && !checkLocation) {
      hasMountedOnce.current = true;
      return;
    }

    dispatch(setSearchTerm(debouncedSearchTerm));
    if (checkLocation || accountId !== 'all') {
      getCloudStorageFiles(1);
    } else {
      getCloudStorageFiles();
    }
  }, [debouncedSearchTerm, accountId, checkLocation]);

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
      setTimeout(() => {
        scrollBoxRef.current!.scrollTop = lastScrollTop.current;
      }, 0);
    }
  }, [cloudStorage.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoveMode) {
        setIsMoveMode(false);
        setFilesToMove([]);
        selectParentId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMoveMode]);

  const loadMoreFiles = useCallback(async () => {
    if (pagination && pagination.page_no < pagination.total_pages && !loading) {
      const requestParams: any = {
        page: pagination.page_no + 1,
        limit: pagination.page_limit || 20,
        ...(currentFolderId && { id: currentFolderId }),
        searchTerm: debouncedSearchTerm || '',
      };

      if (checkLocation && currentAccountId) {
        requestParams.account_id = Number(currentAccountId);
      } else if (!checkLocation && accountId !== 'all') {
        requestParams.account_id = accountId;
      }

      await dispatch(initializeCloudStorageFromStorage(requestParams));
    }
  }, [
    pagination,
    loading,
    dispatch,
    currentFolderId,
    accountId,
    currentAccountId,
    debouncedSearchTerm,
    checkLocation,
  ]);

  // Convert cloud storage data to FileType format
  const files = useMemo(() => {
    return cloudStorage.map(item => ({
      id: item.id,
      name: item.name,
      type:
        item.entry_type === 'folder' ? 'folder' : ('file' as 'file' | 'folder'),
      icon: getFileIcon({
        entry_type: item.entry_type,
        mime_type: item.mime_type,
        file_extension: item.file_extension,
        name: item.name,
      }),
      owner: { name: 'You', avatar: null, initials: 'JS' },
      lastModified: item.modified_at
        ? formatDate(item.modified_at)
        : formatDate(item.updatedAt),
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
    }));
  }, [cloudStorage]);

  const recentFilesData = useMemo(() => {
    return recentFiles.map(item => ({
      id: item.id,
      name: item.name,
      type:
        item.entry_type === 'folder' ? 'folder' : ('file' as 'file' | 'folder'),
      icon: getFileIcon({
        entry_type: 'file',
        mime_type: item.mime_type,
        file_extension: item.file_extension,
        name: item.name,
      }),
      owner: { name: 'You', avatar: null, initials: 'JS' },
      lastModified: item.modified_at
        ? formatDate(item.modified_at)
        : formatDate(item.updatedAt),
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
    }));
  }, [recentFiles]);

  const navigateToFolderFn = useCallback(
    (folder: { id?: string; name: string } | null) => {
      const requestParams: any = {};

      if (folder?.id) {
        setDestinationId(folder?.id);
        requestParams.id = String(folder?.id);
        requestParams.name = String(folder?.name);
      } else {
        setDestinationId(null);
        dispatch(resetCloudStorageFolder());
      }

      if (checkLocation && currentAccountId) {
        requestParams.account_id = Number(currentAccountId);
      }

      if (!isMoveMode) {
        setSelectedIds([]);
        setLastSelectedIndex(null);
      }

      dispatch(
        navigateToFolder(
          folder
            ? requestParams
            : checkLocation && currentAccountId
              ? { account_id: Number(currentAccountId) }
              : null
        )
      );
    },
    [dispatch, currentPath, isMoveMode, checkLocation, currentAccountId]
  );

  const handleRowDoubleClick = useCallback(
    (row: FileType, _?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (
        row.mimeType === 'application/vnd.google-apps.folder' ||
        row.type === 'folder'
      ) {
        // if (!isMoveMode) {
        //   setSelectedIds([]);
        //   setLastSelectedIndex(null);
        // }
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
    } else if (actionId === 'delete') {
      setItemToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  // Folder creation functionality
  const [createFolder, createFolderLoading] = useAsyncOperation(
    async (data: { folderName: string; accountId?: string | undefined }) => {
      try {
        const requestParams: any = {
          name: data.folderName,
          ...(currentFolderId && { id: currentFolderId }),
        };

        if (checkLocation && currentAccountId) {
          requestParams.account_id = Number(currentAccountId);
        } else if (!checkLocation && !isSFDEnabled && data.accountId) {
          requestParams.account_id = data.accountId;
        }

        const res = await dispatch(createCloudStorageFolder(requestParams));

        if (res?.payload?.success) {
          await getCloudStorageFiles(1);
          notifications.show({
            message: res?.payload?.message || 'Folder created successfully',
            color: 'green',
          });
          setModalOpen(false);
          resetFolderForm();
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to create folder',
          color: 'red',
        });
      }
    }
  );

  const handleCreateFolder = folderMethods.handleSubmit(data => {
    createFolder(data);
  });

  const [uploadFiles, uploadFilesLoading] = useAsyncOperation(
    async ({
      files,
      formData,
    }: {
      files: File[];
      formData: UploadFormData;
    }) => {
      try {
        setShowUploadProgress(true);
        const fileIds = files.map(() => uuidv4());

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

        const formDataToUpload = new FormData();
        files.forEach(file => formDataToUpload.append('file', file));
        if (currentFolderId) {
          formDataToUpload.append('id', currentFolderId);
        }

        if (checkLocation && currentAccountId) {
          formDataToUpload.append('account_id', String(currentAccountId));
        } else if (!checkLocation && !isSFDEnabled && formData.accountId) {
          formDataToUpload.append('account_id', formData.accountId);
        }

        // Call the API and track progress
        await dispatch(
          uploadCloudStorageFiles({
            data: formDataToUpload,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              files.forEach((_, index) => {
                const fileId = fileIds[index];
                setUploadProgress(prev => ({
                  ...prev,
                  [fileId]: percentCompleted,
                }));
              });
            },
          })
        ).unwrap();

        uploadMethods.reset();
        closeModal();

        // Wait for `uploadLoading` to become false and set progress to 100%
        const waitForUploadCompletion = () => {
          const interval = setInterval(() => {
            if (!uploadLoading) {
              files.forEach((_, index) => {
                const fileId = fileIds[index];
                setUploadProgress(prev => ({
                  ...prev,
                  [fileId]: 100,
                }));
              });
              clearInterval(interval);
            }
          }, 100);
        };

        waitForUploadCompletion();

        // Refresh the file list after upload
        await getCloudStorageFiles(1);
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
        await getCloudStorageFiles(1);
        notifications.show({
          message: 'Item renamed successfully',
          color: 'green',
        });
        setRenameModalOpen(false);
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to rename item',
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
        const res = await dispatch(removeCloudStorageFiles({ ids: [fileId] }));

        if (res?.payload?.status === 200 || res?.payload?.success !== false) {
          await getCloudStorageFiles(1);
          notifications.show({
            message: res?.payload?.message || 'Item deleted successfully',
            color: 'green',
          });
          if (selectedIds.includes(fileId)) {
            cancelMoveMode();
          }
          setDeleteModalOpen(false);
        } else {
          notifications.show({
            message: res?.payload?.message || 'Failed to delete item',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to delete item',
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

  const uploadFilesHandler = useCallback(
    async (files: File[], formData?: UploadFormData) => {
      if (files.length === 0) return;

      uploadsInProgressRef.current = true;
      setShowUploadProgress(true);

      setUploadProgress({});
      setUploadingFiles({});

      files.forEach(file => {
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
      });

      await uploadFiles({ files, formData: formData || { accountId: '' } });
    },
    [uploadFiles]
  );

  const handleFileUpload = uploadMethods.handleSubmit(async data => {
    const filesToUpload = uploadedFiles.length > 0 ? uploadedFiles : [];
    await uploadFilesHandler(filesToUpload, data);
  });

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
  };

  const handleCancelUpload = useCallback((fileId: string) => {
    cancelledUploadsRef.current.add(fileId);
    if (uploadControllers.current[fileId]) {
      uploadControllers.current[fileId].abort();
    }
    cleanupUpload(fileId);
  }, []);

  const handleCloseUploadProgress = useCallback(() => {
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

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      if (!isSFDEnabled) {
        setDragDropFiles(files);
        setDragDropModalOpen(true);
        uploadMethods.reset({ accountId: '', files: files });
      } else {
        await uploadFilesHandler(files);
      }
    },
    [uploadFilesHandler, isSFDEnabled, uploadMethods]
  );

  const handleDragDropUpload = uploadMethods.handleSubmit(async data => {
    await uploadFilesHandler(dragDropFiles, data);
    setDragDropModalOpen(false);
    setDragDropFiles([]);
  });

  const closeDragDropModal = useCallback(() => {
    setDragDropFiles([]);
    setDragDropModalOpen(false);
    uploadMethods.reset();
  }, [uploadMethods]);

  // Drag and drop functionality
  const { dragRef, isDragging } = useDragDrop({
    onFileDrop: handleFileDrop,
    acceptedFileTypes: ['*'],
  });

  useEffect(() => {
    setLocalStorage(layoutKey, layout);
  }, [layout, layoutKey]);

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

      const isCheckboxClick = (event.target as HTMLElement).closest(
        '[type="checkbox"]'
      );

      if (isMoveMode) {
        if (filesToMove.includes(id)) return;
        setSelectedIds([id]);
        setLastSelectedIndex(idx);
      } else if (isCheckboxClick) {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else if (event.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, idx);
        const end = Math.max(lastSelectedIndex, idx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])));
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else {
        setSelectedIds([id]);
        setLastSelectedIndex(idx);
      }
    },
    [allIds, lastSelectedIndex, getIndexById, isMoveMode, filesToMove]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(files.map(f => f.id));
  }, [files]);

  const handleUnselectAll = useCallback(() => {
    if (!isMoveMode) {
      setSelectedIds([]);
      setLastSelectedIndex(null);
    }
  }, [isMoveMode]);

  // Handle row selection
  const onSelectRow = useCallback(
    (id: string, checked: boolean) => {
      if (isMoveMode) {
        if (filesToMove.includes(id)) return;
        setSelectedIds([id]);
        setLastSelectedIndex(getIndexById(id));
      } else {
        setSelectedIds(prev =>
          checked ? [...prev, id] : prev.filter(i => i !== id)
        );
        setLastSelectedIndex(getIndexById(id));
      }
    },
    [getIndexById, isMoveMode, filesToMove]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (isMoveMode) return;
      if (checked) {
        handleSelectAll();
      } else {
        handleUnselectAll();
      }
    },
    [handleSelectAll, handleUnselectAll, isMoveMode]
  );

  // Actions for selected items
  const handleDeleteSelected = useCallback(() => {
    setRemoveFilesModalOpen(true);
  }, []);

  const closeRemoveFilesModal = useCallback(() => {
    setRemoveFilesModalOpen(false);
  }, []);

  const [handleRemoveFilesConfirm, removeFilesLoading] = useAsyncOperation(
    async () => {
      try {
        const res = await dispatch(
          removeCloudStorageFiles({ ids: selectedIds })
        );

        if (res?.payload?.status === 200 || res?.payload?.success) {
          await getCloudStorageFiles(1);
          notifications.show({
            message:
              res?.payload?.message ||
              `${selectedIds?.length > 1 ? 'Items' : 'Item'} deleted successfully`,
            color: 'green',
          });
          setSelectedIds([]);
          setLastSelectedIndex(null);
          closeRemoveFilesModal();
        } else {
          notifications.show({
            message:
              res?.payload?.message ||
              `Failed to delete ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
            color: 'red',
          });
        }
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

  const handleShareSelected = useCallback(() => {}, []);

  const openModal = useCallback((type: 'folder' | 'files') => {
    setModalType(type);
    setModalOpen(true);
    setUploadedFiles([]);
    if (type === 'files') uploadMethods.reset({ accountId: '' });
    resetFolderForm();
  }, []);

  const closeModal = useCallback(() => {
    setUploadedFiles([]);
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
      const contentDisposition = res.payload.headers?.['content-disposition'];
      const match = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `download-${Date.now()}.zip`;

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

  // Sync storage
  const [syncStorage, syncCloudStorageLoading] = useAsyncOperation(
    async (folderId: string | null) => {
      try {
        const requestParams: any = {};

        if (checkLocation && currentAccountId) {
          requestParams.account_id = currentAccountId;
        } else if (!checkLocation && accountId !== 'all') {
          requestParams.account_id = accountId;
        }

        if (folderId) {
          requestParams.directory_id = folderId;
        }

        const res = await dispatch(syncCloudStorage(requestParams)).unwrap();

        if (res?.status === 200) {
          await getCloudStorageFiles(1);
          notifications.show({
            message: res?.data?.message || 'Items synced successfully',
            color: 'green',
          });
        } else {
          notifications.show({
            message:
              res?.message || res?.data?.message || 'Failed to sync items',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to sync items',
          color: 'red',
        });
      }
    }
  );

  const handleSyncStorage = useCallback(() => {
    const folderId = getLocalStorage(folderIdKey);
    syncStorage(folderId);
  }, [syncStorage, folderIdKey]);

  // Moving files
  const [moveFiles, moveFilesLoading] = useAsyncOperation(
    async (destId: string | null) => {
      try {
        const res = await dispatch(
          moveCloudStorageFiles({
            ids: filesToMove,
            destination_id: destId,
          })
        ).unwrap();

        if (res?.status === 200) {
          notifications.show({
            message: 'Items moved successfully',
            color: 'green',
          });
          await getCloudStorageFiles(1);
        } else {
          notifications.show({
            message: res?.message || 'Failed to move items',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to move items',
          color: 'red',
        });
      } finally {
        setIsMoveMode(false);
        setFilesToMove([]);
        selectParentId(null);
        handleUnselectAll();
        setSelectedIds([]);
        setSourceFolderId(null);
      }
    }
  );

  const cancelMoveMode = useCallback(() => {
    setIsMoveMode(false);
    setFilesToMove([]);
    selectParentId(null);
    setSelectedIds([]);
    setLastSelectedIndex(null);
    setSourceFolderId(null);
  }, []);

  const handleMoveSelected = useCallback(() => {
    setIsMoveMode(true);
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    setFilesToMove([...selectedIds]);
    selectParentId(checkFiles?.parent_id ?? null);
    setSourceFolderId(currentFolderId ?? null);
  }, [selectedIds, currentFolderId]);

  const isPasteEnabled = useCallback(() => {
    if (!isMoveMode || filesToMove.length === 0) return false;

    // Disable paste if currentFolderId is same as sourceFolderId and selected folder is among filesToMove
    if (
      currentFolderId === sourceFolderId &&
      selectedIds.length === 1 &&
      filesToMove.includes(selectedIds[0])
    ) {
      return false;
    }

    return true;
  }, [isMoveMode, filesToMove, currentFolderId, sourceFolderId, selectedIds]);

  const handlePasteFiles = useCallback(() => {
    if (filesToMove.length === 0) return;

    // Get the destination folder ID (currentFolderId could be null for root)
    let destId: string | null = null;

    if (currentFolderId) {
      if (layout === 'list') {
        const checkId = files.find(item => selectedIds?.includes(item.id));
        destId = checkId ? checkId.id : destinationId;
      } else {
        destId = selectedIds.length > 0 ? selectedIds[0] : null;
      }
    } else {
      const checkId = files.find(item => selectedIds?.includes(item.id));
      destId = checkId ? checkId.id : destinationId;
    }

    // Check if any of the files being moved is the destination folder itself
    const isMovingFolderIntoItself = cloudStorage.some(
      file =>
        filesToMove.includes(file.id) &&
        file.entry_type === 'folder' &&
        file.id === destId
    );

    if (isMovingFolderIntoItself) {
      notifications.show({
        message: 'Cannot move a folder into itself',
        color: 'red',
      });
      return;
    }

    // Check if trying to move items into one of the selected folders
    const selectedFolders = cloudStorage.filter(
      file => filesToMove.includes(file.id) && file.entry_type === 'folder'
    );

    const isMovingIntoSelectedFolder = selectedFolders.some(
      folder => folder.id === destId
    );

    if (isMovingIntoSelectedFolder) {
      notifications.show({
        message: 'Cannot move items into one of the selected folders',
        color: 'red',
      });
      return;
    }

    moveFiles(destId);
  }, [
    filesToMove,
    currentFolderId,
    cloudStorage,
    moveFiles,
    layout,
    files,
    destinationId,
    selectedIds,
  ]);

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

    handleScroll,
    scrollBoxRef,
    navigate,
    accountId: checkLocation ? currentAccountId : accountId,
    searchTerm: localSearchTerm,
    handleAccountTypeChange,
    handleSearchChange,

    allIds,
    lastSelectedIndex,
    loadMoreFiles,
    pagination,
    accountOptions,
    navigateLoading,

    isMoveMode,
    filesToMove,
    handleMoveSelected,
    handlePasteFiles,
    moveFilesLoading,
    isPasteEnabled,
    cancelMoveMode,
    handleSyncStorage,
    syncCloudStorageLoading,
    uploadMethods,
    isSFDEnabled,
    accountOptionsForSFD,

    checkLocation,
    parentId,
    dragDropModalOpen,
    dragDropFiles,
    handleDragDropUpload,
    closeDragDropModal,
    recentFilesData,
    folderId,
  };
};

export default useDashboard;
