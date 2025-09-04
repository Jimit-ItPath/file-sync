import {
  downloadFilesEnhanced,
  formatBytes,
} from './../../../utils/helper/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  // downloadFiles,
  fetchRecentFiles,
  removeCloudStorageFiles,
  renameCloudStorageFile,
  resetRecentFiles,
  syncCloudStorage,
} from '../../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import getFileIcon from '../../../components/file-icon';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import type { FileType } from '../use-dashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DOCUMENT_FILE_TYPES,
  IMAGE_FILE_TYPES,
  PREVIEW_FILE_TYPES,
  VIDEO_FILE_TYPES,
} from '../../../utils/constants';
import dayjs from 'dayjs';

const renameSchema = z.object({
  newName: z.string().trim().min(1, 'New name is required'),
});

type RenameFormData = z.infer<typeof renameSchema>;

type UseRecentFilesProps = {
  downloadFile: (ids: string[]) => Promise<void>;
  fetchPreviewFileWithProgress: (
    url: string,
    signal: AbortSignal,
    selectedIds: string[],
    onProgress?: (percent: number) => void
  ) => Promise<Blob>;
};

const useRecentFiles = ({
  downloadFile,
  fetchPreviewFileWithProgress,
}: UseRecentFilesProps) => {
  const {
    loading,
    recentFiles,
    recentFilesPagination: pagination,
  } = useAppSelector(state => state.cloudStorage);
  const dispatch = useAppDispatch();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileType | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileType | null>(null);
  const [removeFilesModalOpen, setRemoveFilesModalOpen] = useState(false);
  const [previewFileLoading, setPreviewFileLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: string;
    name: string;
    size?: number;
    isVideo?: boolean;
    isDocument?: boolean;
    share?: string | null;
  } | null>(null);
  const [detailsFileLoading, setDetailsFileLoading] = useState(false);
  const [detailsFile, setDetailsFile] = useState<{
    url: string;
    type: string;
    name: string;
    size?: number;
    isVideo?: boolean;
    isDocument?: boolean;
    share?: string | null;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] =
    useState<FileType | null>(null);
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const hasTriggeredAutoLoad = useRef(false);
  const isInitialLoadComplete = useRef(false);
  const lastAutoLoadCheck = useRef<string>('');
  const autoLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  const [typeFilter, setTypeFilter] = useState<string[] | null>(null);
  const [modifiedFilter, setModifiedFilter] = useState<{
    after?: Date;
    before?: Date;
  } | null>(null);
  const [advancedFilterModalOpen, setAdvancedFilterModalOpen] = useState(false);

  const renameMethods = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    mode: 'onChange',
  });

  const { reset: resetRenameForm } = renameMethods;

  const getRecentFiles = useCallback(
    async (page: number = 1, _: boolean = false) => {
      const result = await dispatch(
        fetchRecentFiles({
          page: typeof page === 'number' ? page : 1,
          limit: pagination?.page_limit || 20,
          ...(typeFilter && {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
          }),
          ...(modifiedFilter?.after && {
            start_date: dayjs(modifiedFilter.after).format('MM/DD/YYYY'),
          }),
          ...(modifiedFilter?.before && {
            end_date: dayjs(modifiedFilter.before).format('MM/DD/YYYY'),
          }),
        })
      );

      if (result.payload?.data && result.payload?.data?.paging) {
        const { page_no, total_pages } = result.payload?.data?.paging;
        setHasMore(page_no < total_pages);
      }

      // return result;
    },
    [dispatch, pagination?.page_limit, typeFilter, modifiedFilter]
  );

  const [onGetRecentFiles] = useAsyncOperation(getRecentFiles);

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
      lastModified: item.modified_at ? item.modified_at : item.updatedAt,
      // size: item.size ? formatFileSize(item.size.toString()) : null,
      size: item.size ? formatBytes(Number(item.size)) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
      web_view_url: item.web_view_url,
      external_parent_id: item.external_parent_id,
      UserConnectedAccount: item.UserConnectedAccount,
      account_type: item?.account_type,
    }));
  }, [recentFiles]);

  useEffect(() => {
    onGetRecentFiles({});
    setHasMore(true);

    return () => {
      dispatch(resetRecentFiles());
    };
  }, []);

  const loadMoreFiles = useCallback(async () => {
    if (
      pagination &&
      pagination.page_no < pagination.total_pages &&
      !loading &&
      !isAutoLoading
    ) {
      setIsAutoLoading(true);
      try {
        await getRecentFiles(pagination.page_no + 1, true);
      } finally {
        setIsAutoLoading(false);
      }
    }
  }, [pagination, loading, isAutoLoading, getRecentFiles]);

  const checkScrollbarAndAutoLoad = useCallback(async () => {
    if (
      !scrollBoxRef.current ||
      loading ||
      isAutoLoading ||
      hasTriggeredAutoLoad.current
    ) {
      return;
    }

    // Create a unique identifier for this check to prevent duplicates
    const checkId = `${recentFiles.length}-${pagination?.page_no}-${pagination?.total_pages}`;
    if (lastAutoLoadCheck.current === checkId) {
      return;
    }
    lastAutoLoadCheck.current = checkId;

    const container = scrollBoxRef.current;
    const hasVerticalScrollbar =
      container.scrollHeight > container.clientHeight;

    // Only auto-load if no scrollbar, more pages available, and initial load is complete
    if (
      !hasVerticalScrollbar &&
      pagination &&
      pagination.page_no < pagination.total_pages &&
      isInitialLoadComplete.current
    ) {
      setIsAutoLoading(true);
      hasTriggeredAutoLoad.current = true;

      try {
        await loadMoreFiles();
      } catch (error) {
        console.error('Auto-load failed:', error);
      } finally {
        // Reset flags after a delay to allow DOM to update
        setTimeout(() => {
          hasTriggeredAutoLoad.current = false;
          setIsAutoLoading(false);
          // Schedule next check
          setTimeout(() => {
            checkScrollbarAndAutoLoad();
          }, 100);
        }, 200);
      }
    }
  }, [loading, isAutoLoading, pagination, loadMoreFiles, recentFiles.length]);

  useEffect(() => {
    // Clear any existing timeout
    if (autoLoadTimeoutRef.current) {
      clearTimeout(autoLoadTimeoutRef.current);
    }

    if (!isInitialLoadComplete.current && recentFiles.length > 0) {
      isInitialLoadComplete.current = true;
    }

    // Check for scrollbar after DOM updates
    if (isInitialLoadComplete.current && recentFiles.length > 0) {
      autoLoadTimeoutRef.current = setTimeout(() => {
        checkScrollbarAndAutoLoad();
      }, 300); // Increased delay to prevent rapid calls
    }

    return () => {
      if (autoLoadTimeoutRef.current) {
        clearTimeout(autoLoadTimeoutRef.current);
      }
    };
  }, [recentFiles.length, isInitialLoadComplete.current]);

  useEffect(() => {
    hasTriggeredAutoLoad.current = false;
    lastAutoLoadCheck.current = '';
    isInitialLoadComplete.current = false;
  }, []);

  // Reset auto-load flag when filters change or navigation occurs
  useEffect(() => {
    return () => {
      if (autoLoadTimeoutRef.current) {
        clearTimeout(autoLoadTimeoutRef.current);
      }
    };
  }, []);

  const handleMenuItemClick = (actionId: string, row: FileType) => {
    if (
      actionId === 'download' &&
      (row.type !== 'folder' ||
        row.mimeType !== 'application/vnd.google-apps.folder')
    ) {
      downloadItems([row.id]);
    } else if (actionId === 'rename') {
      setItemToRename(row);
      setRenameModalOpen(true);
      resetRenameForm({ newName: row.name });
    } else if (actionId === 'delete') {
      setItemToDelete(row);
      setDeleteModalOpen(true);
    } else if (actionId === 'share' && row.web_view_url) {
      window.open(row.web_view_url, '_blank');
    } else if (actionId === 'details') {
      previewItems(row, false);
      handleShowDetails(row);
    } else if (actionId === 'preview') {
      // preview code
      setPreviewModalOpen(true);
      previewItems(row);
    }
  };

  const [renameFile, renameFileLoading] = useAsyncOperation(
    async ({ fileId, newName }: { fileId: string; newName: string }) => {
      try {
        await dispatch(
          renameCloudStorageFile({ id: fileId, name: newName })
        ).unwrap();
        getRecentFiles(1);
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
          getRecentFiles(1);
          notifications.show({
            message: res?.payload?.message || 'Item deleted successfully',
            color: 'green',
          });
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

  const allIds = useMemo(
    () => recentFilesData.map(f => f.id),
    [recentFilesData]
  );

  const getIndexById = useCallback(
    (id: string) => allIds.findIndex(i => i === id),
    [allIds]
  );

  const handleSelect = useCallback(
    (id: string, event: React.MouseEvent) => {
      const idx = getIndexById(id);

      const isCheckboxClick = (event.target as HTMLElement).closest(
        '[type="checkbox"]'
      );

      if (isCheckboxClick) {
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
    [allIds, lastSelectedIndex, getIndexById]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(recentFilesData.map(f => f.id));
  }, [recentFilesData]);

  const handleUnselectAll = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }, []);

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
          getRecentFiles(1);
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

  const handleShareSelected = useCallback(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    if (checkFiles?.web_view_url) {
      window.open(checkFiles.web_view_url, '_blank');
    }
  }, [recentFilesData, selectedIds]);

  // const previewItems = useCallback(
  //   async (row: FileType, isPreview = true) => {
  //     try {
  //       if (isPreview) {
  //         setPreviewFileLoading(true);
  //         setPreviewFile({
  //           name: row.name,
  //         } as any);
  //       } else {
  //         setDetailsFileLoading(true);
  //         setDetailsFile({
  //           name: row.name,
  //         } as any);
  //       }

  //       const ext = row.fileExtension
  //         ? `${row.fileExtension.toLowerCase()}`
  //         : '';
  //       const isSupported = isPreview
  //         ? PREVIEW_FILE_TYPES.includes(ext)
  //         : IMAGE_FILE_TYPES.includes(ext);

  //       if (!isSupported) {
  //         if (isPreview) {
  //           setPreviewFile({
  //             url: '',
  //             type: ext || row.mimeType || '',
  //             name: row.name,
  //             size: row.size
  //               ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //               : undefined,
  //             share: row.web_view_url ?? null,
  //           });
  //           setPreviewFileLoading(false);
  //         } else {
  //           setDetailsFile({
  //             url: '',
  //             type: ext || row.mimeType || '',
  //             name: row.name,
  //             size: row.size
  //               ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //               : undefined,
  //             share: row.web_view_url ?? null,
  //           });
  //           setDetailsFileLoading(false);
  //         }
  //         return;
  //       }

  //       const res = await dispatch(downloadFiles({ ids: [row.id] }));
  //       if (res.payload?.status === 200 && res.payload?.data instanceof Blob) {
  //         const url = URL.createObjectURL(res.payload?.data);
  //         const isVideo = VIDEO_FILE_TYPES.includes(ext);
  //         const isDocument = DOCUMENT_FILE_TYPES.includes(ext);
  //         if (isPreview) {
  //           setPreviewFile({
  //             url,
  //             type: row.fileExtension || row.mimeType || '',
  //             name: row.name,
  //             size: row.size
  //               ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //               : undefined,
  //             isVideo,
  //             isDocument,
  //             share: row.web_view_url ?? null,
  //           });
  //         } else {
  //           setDetailsFile({
  //             url,
  //             type: row.fileExtension || row.mimeType || '',
  //             name: row.name,
  //             size: row.size
  //               ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //               : undefined,
  //             isVideo,
  //             isDocument,
  //             share: row.web_view_url ?? null,
  //           });
  //         }
  //       } else {
  //         notifications.show({
  //           message: res?.payload?.message || 'Failed to preview file',
  //           color: 'red',
  //         });
  //       }
  //     } catch (error: any) {
  //       notifications.show({
  //         message: error || 'Failed to preview file',
  //         color: 'red',
  //       });
  //     } finally {
  //       if (isPreview) {
  //         setPreviewFileLoading(false);
  //       } else {
  //         setDetailsFileLoading(false);
  //       }
  //     }
  //   },
  //   [dispatch]
  // );

  const previewItems = useCallback(async (row: FileType, isPreview = true) => {
    try {
      if (isPreview) {
        setPreviewFileLoading(true);
        setPreviewFile({
          name: row.name,
        } as any);
      } else {
        setDetailsFileLoading(true);
        setDetailsFile({
          name: row.name,
        } as any);
      }
      const ext = row.fileExtension ? `${row.fileExtension.toLowerCase()}` : '';
      const isSupported = isPreview
        ? PREVIEW_FILE_TYPES.includes(ext)
        : IMAGE_FILE_TYPES.includes(ext);

      if (!isSupported || !isPreview) {
        if (isPreview) {
          setPreviewFile({
            url: '',
            type: ext || row.mimeType || '',
            name: row.name,
            size: row.size
              ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
              : undefined,
            share: row.web_view_url ?? null,
          });
          setPreviewFileLoading(false);
        } else {
          setDetailsFile({
            url: '',
            type: ext || row.mimeType || '',
            name: row.name,
            size: row.size
              ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
              : undefined,
            share: row.web_view_url ?? null,
          });
          setDetailsFileLoading(false);
        }
        return;
      }

      // setPreviewFileLoading(true);
      setPreviewProgress(0);
      previewAbortRef.current = new AbortController();

      const fileUrl = `${import.meta.env.VITE_REACT_APP_BASE_URL}/cloud-storage/download`; // replace with your actual API endpoint
      const blob = await fetchPreviewFileWithProgress(
        fileUrl,
        previewAbortRef.current!.signal,
        [row.id],
        percent => setPreviewProgress(percent)
      );

      const url = URL.createObjectURL(blob);
      setPreviewFile({
        url,
        type: row.fileExtension || row.mimeType || '',
        name: row.name,
        size: row.size
          ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
          : undefined,
        isVideo: VIDEO_FILE_TYPES.includes(
          row.fileExtension?.toLowerCase() || ''
        ),
        isDocument: DOCUMENT_FILE_TYPES.includes(
          row.fileExtension?.toLowerCase() || ''
        ),
        share: row.web_view_url ?? null,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        notifications.show({
          message: 'Failed to preview file',
          color: 'red',
        });
      }
    } finally {
      setPreviewFileLoading(false);
      setPreviewProgress(null);
      setDetailsFileLoading(false);
    }
  }, []);

  const [downloadItems] = useAsyncOperation(async data => {
    try {
      const idsToDownload = Array.isArray(data) ? data : selectedIds;

      // Use the enhanced download system
      await downloadFilesEnhanced(idsToDownload, downloadFile);
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
  }, [downloadItems]);

  const [syncStorage, syncCloudStorageLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(syncCloudStorage({})).unwrap();

      if (res?.status === 200) {
        getRecentFiles(1);
        notifications.show({
          message: res?.data?.message || 'Items synced successfully',
          color: 'green',
        });
      } else {
        notifications.show({
          message: res?.message || res?.data?.message || 'Failed to sync items',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        message: error?.message || 'Failed to sync items',
        color: 'red',
      });
    }
  });

  const handleSyncStorage = useCallback(() => {
    syncStorage({});
  }, [syncStorage]);

  const displayDownloadIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.type === 'file' ? true : false;
  }, [selectedIds, recentFilesData]);

  const displayShareIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.web_view_url ? true : false;
  }, [selectedIds, recentFilesData]);

  const displayPreviewIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.type === 'file' &&
      checkFiles.fileExtension &&
      PREVIEW_FILE_TYPES.includes(checkFiles?.fileExtension)
      ? true
      : false;
  }, [selectedIds, recentFilesData]);

  const handleShowDetails = useCallback((item: FileType) => {
    setSelectedItemForDetails(item);
    setDetailsDrawerOpen(true);
  }, []);

  const closeDetailsDrawer = useCallback(() => {
    setDetailsDrawerOpen(false);
    setSelectedItemForDetails(null);
  }, []);

  const openAdvancedFilterModal = useCallback(() => {
    setAdvancedFilterModalOpen(true);
  }, []);

  const closeAdvancedFilterModal = useCallback(() => {
    setAdvancedFilterModalOpen(false);
  }, []);

  const hasFilters = useMemo(() => {
    return typeFilter?.length || modifiedFilter ? true : false;
  }, [typeFilter, modifiedFilter]);

  const handleAdvancedFilter = useCallback(
    async (filters: {
      types: string[] | null;
      modified: { after?: Date; before?: Date } | null;
    }) => {
      setTypeFilter(filters.types);
      setModifiedFilter(filters.modified);

      await dispatch(
        fetchRecentFiles({
          page: pagination?.page_no || 1,
          limit: pagination?.page_limit || 20,
          type:
            filters.types && filters.types?.length
              ? filters.types?.join(',')
              : undefined,
          start_date: filters.modified?.after
            ? dayjs(filters.modified.after).format('MM/DD/YYYY')
            : undefined,
          end_date: filters.modified?.before
            ? dayjs(filters.modified.before).format('MM/DD/YYYY')
            : undefined,
        })
      );
    },
    []
  );

  const handleAdvancedFilterReset = useCallback(() => {
    setTypeFilter(null);
    setModifiedFilter(null);
  }, []);

  return {
    loading,
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
    allIds,
    lastSelectedIndex,
    handleSyncStorage,
    syncCloudStorageLoading,
    recentFiles: recentFilesData,
    displayDownloadIcon,
    displayShareIcon,
    location,

    // preview
    previewModalOpen,
    setPreviewModalOpen,
    previewFile,
    setPreviewFile,
    previewFileLoading,
    displayPreviewIcon,
    previewProgress,
    previewAbortRef,

    // details drawer
    closeDetailsDrawer,
    detailsDrawerOpen,
    selectedItemForDetails,
    detailsFile,
    detailsFileLoading,
    downloadItems,

    loadMoreFiles,
    hasMore,
    scrollBoxRef,
    pagination,

    //filter
    openAdvancedFilterModal,
    closeAdvancedFilterModal,
    typeFilter,
    modifiedFilter,
    advancedFilterModalOpen,
    hasFilters,
    handleAdvancedFilter,
    handleAdvancedFilterReset,
  };
};

export default useRecentFiles;
