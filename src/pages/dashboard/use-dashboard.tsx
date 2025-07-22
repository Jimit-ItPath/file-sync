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
} from '../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router';
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
    accountId,
    searchTerm,
    navigateLoading,
  } = useAppSelector(state => state.cloudStorage);
  const { checkStorageDetails } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

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

  const handleAccountTypeChange = useCallback(
    (value: string | null) => {
      if (value) {
        dispatch(setAccountId(value));
      }
    },
    [dispatch]
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getCloudStorageFiles = useCallback(
    async (page?: number) => {
      await dispatch(
        initializeCloudStorageFromStorage({
          ...(folderId && { id: folderId }),
          limit: pagination?.page_limit || 20,
          page: typeof page === 'number' ? page : pagination?.page_no || 1,
          ...(accountId !== 'all' && {
            account_id: accountId,
          }),
          searchTerm: debouncedSearchTerm || '',
        })
      );
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
    if (accountId !== 'all') {
      getCloudStorageFiles(1);
    } else {
      getCloudStorageFiles();
    }
  }, [debouncedSearchTerm, accountId]);

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
          limit: pagination.page_limit || 20,
          ...(currentFolderId && { id: currentFolderId }),
          ...(accountId !== 'all' && {
            account_id: accountId,
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
      setSelectedIds([]);
      setLastSelectedIndex(null);
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
        const res = await dispatch(
          createCloudStorageFolder({
            name: folderName,
            ...(currentFolderId && {
              id: currentFolderId,
            }),
          })
        );
        if (res?.payload?.success) {
          resetFolderForm();
          await dispatch(
            initializeCloudStorageFromStorage({
              ...(folderId && { id: folderId }),
              limit: pagination?.page_limit || 20,
              page: pagination?.page_no || 1,
              ...(accountId !== 'all' && {
                account_id: accountId,
              }),
              searchTerm: debouncedSearchTerm || '',
            })
          );
          notifications.show({
            message: res?.payload?.message || 'Folder created successfully',
            color: 'green',
          });
          setModalOpen(false);
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

        closeModal();

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
            limit: pagination?.page_limit || 20,
            page: pagination?.page_no || 1,
            ...(accountId !== 'all' && {
              account_id: accountId,
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
            limit: pagination?.page_limit || 20,
            page: pagination?.page_no || 1,
            ...(accountId !== 'all' && {
              account_id: accountId,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
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
        await dispatch(removeCloudStorageFiles({ ids: [fileId] })).unwrap();
        await dispatch(
          initializeCloudStorageFromStorage({
            ...(folderId && { id: folderId }),
            limit: pagination?.page_limit || 20,
            page: pagination?.page_no || 1,
            ...(accountId !== 'all' && {
              account_id: accountId,
            }),
            searchTerm: debouncedSearchTerm || '',
          })
        );
        notifications.show({
          message: 'Item deleted successfully',
          color: 'green',
        });
        setDeleteModalOpen(false);
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
            limit: pagination?.page_limit || 20,
            page: pagination?.page_no || 1,
            ...(accountId !== 'all' && {
              account_id: accountId,
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
    accountId,
    searchTerm: localSearchTerm,
    handleAccountTypeChange,
    handleSearchChange,

    allIds,
    lastSelectedIndex,
    loadMoreFiles,
    pagination,
    accountOptions,
    navigateLoading,
  };
};

export default useDashboard;
