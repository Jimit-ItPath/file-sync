import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  downloadFilesEnhanced,
  formatFileSize,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '../../utils/helper';
import useDragDrop from '../../components/inputs/dropzone/use-drag-drop';
// import { v4 as uuidv4 } from 'uuid';
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
  // uploadCloudStorageFiles,
  moveCloudStorageFiles,
  syncCloudStorage,
  resetPagination,
  setMoveModalPath,
} from '../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { useLocation, useNavigate, useParams } from 'react-router';
import useDebounce from '../../hooks/use-debounce';
import getFileIcon from '../../components/file-icon';
// import { downloadFiles as downloadFilesHelper } from '../../utils/helper';
import { PRIVATE_ROUTES } from '../../routing/routes';
import {
  DOCUMENT_FILE_TYPES,
  IMAGE_FILE_TYPES,
  PREVIEW_FILE_TYPES,
  VIDEO_FILE_TYPES,
} from '../../utils/constants';
import dayjs from 'dayjs';
import useUploadManagerV2 from './file-upload-v2/use-upload-manager-v2';

type UseDashboardProps = {
  downloadFile?: (ids: string[]) => Promise<void>;
};

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
  fileExtension: string | null;
  download_url?: string | null;
  parent_id: string | null;
  web_view_url: string | null;
  external_parent_id?: null | string;
  UserConnectedAccount?: {
    id: string;
    account_name: string;
    account_type: string;
  } | null;
  account_type?: string | null;
};

const folderSchema = z.object({
  folderName: z.string().trim().min(1, 'Folder name is required'),
  accountId: z.string().min(1, 'Account selection is required').optional(),
});

const uploadSchema = z.object({
  accountId: z.string().min(1, 'Account selection is required').optional(),
  files: z.any().optional(),
});

const renameSchema = z.object({
  newName: z.string().trim().min(1, 'New name is required'),
});

type FolderFormData = z.infer<typeof folderSchema>;
type UploadFormData = z.infer<typeof uploadSchema>;
type RenameFormData = z.infer<typeof renameSchema>;

const useDashboard = ({ downloadFile }: UseDashboardProps) => {
  const {
    uploadingFiles: uploadingFilesV2,
    showUploadProgress: showUploadProgressV2,
    startUpload,
    cancelUpload: cancelUploadV2,
    removeUploadedFile,
    closeUploadProgress: closeUploadProgressV2,
    clearAllUploads,
  } = useUploadManagerV2();
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
  const hasCalledPostConnectAPIs = useRef(false);
  const prevConnectedAccountsLength = useRef(0);
  const hasCalledInitializeAPI = useRef(false);
  const hasCalledRecentFilesAPI = useRef(false);

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

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [itemsToMove, setItemsToMove] = useState<FileType[]>([]);

  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] =
    useState<FileType | null>(null);

  const [typeFilter, setTypeFilter] = useState<string[] | null>(null);
  const [modifiedFilter, setModifiedFilter] = useState<{
    after?: Date;
    before?: Date;
  } | null>(null);
  const [advancedFilterModalOpen, setAdvancedFilterModalOpen] = useState(false);

  // **NEW: Improved infinite scroll state management**
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const autoLoadInProgressRef = useRef(false);
  const autoLoadRequestIdRef = useRef<string>('');
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const isNavigatingRef = useRef(false);
  const isRouteSwitchingRef = useRef(false);

  const {
    cloudStorage,
    loading,
    pagination,
    currentFolderId,
    currentPath,
    // uploadLoading,
    accountId,
    searchTerm,
    navigateLoading,
    recentFiles,
    hasPaginationData,
  } = useAppSelector(state => state.cloudStorage);
  const { userProfile } = useAppSelector(state => state.user);
  const { checkStorageDetails, connectedAccounts } = useAppSelector(
    state => state.auth
  );
  const dispatch = useAppDispatch();

  const folderId = getLocalStorage(folderIdKey);
  const globalSearchState = getLocalStorage('globalSearchState');

  const lastScrollTop = useRef(0);

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

  const openAdvancedFilterModal = useCallback(() => {
    setAdvancedFilterModalOpen(true);
  }, []);

  const closeAdvancedFilterModal = useCallback(() => {
    setAdvancedFilterModalOpen(false);
  }, []);

  const getCloudStorageFiles = useCallback(
    async (
      page?: number,
      filters?: { type?: string; after?: string; before?: string }
    ) => {
      const requestParams: any = {
        ...(folderId && { id: folderId }),
        limit: pagination?.page_limit || 20,
        page: typeof page === 'number' ? page : 1,
        searchTerm: debouncedSearchTerm || '',
        ...(filters?.type && { type: filters.type }),
        ...(filters?.after && { start_date: filters.after }),
        ...(filters?.before && { end_date: filters.before }),
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
      accountId,
      debouncedSearchTerm,
      checkLocation,
      currentAccountId,
    ]
  );

  // **NEW: Improved auto-load logic with better state management**
  const checkAndAutoLoad = useCallback(async () => {
    if (
      !scrollBoxRef.current ||
      loading ||
      isAutoLoading ||
      autoLoadInProgressRef.current ||
      isNavigatingRef.current ||
      isRouteSwitchingRef.current ||
      !pagination ||
      pagination.page_no >= pagination.total_pages ||
      !connectedAccounts?.length
    ) {
      return;
    }

    const container = scrollBoxRef.current;
    const hasVerticalScrollbar =
      container.scrollHeight > container.clientHeight;

    if (!hasVerticalScrollbar) {
      // Generate unique request ID to prevent duplicate requests
      const requestId = `${Date.now()}-${Math.random()}`;
      autoLoadRequestIdRef.current = requestId;
      autoLoadInProgressRef.current = true;
      setIsAutoLoading(true);

      try {
        // Double-check conditions before making the request
        if (
          autoLoadRequestIdRef.current === requestId &&
          pagination &&
          pagination.page_no < pagination.total_pages &&
          !isNavigatingRef.current &&
          !isRouteSwitchingRef.current
        ) {
          const requestParams: any = {
            page: pagination.page_no + 1,
            limit: pagination.page_limit || 20,
            ...(currentFolderId && { id: currentFolderId }),
            searchTerm: debouncedSearchTerm || '',
            ...(typeFilter &&
              typeFilter.length && {
                type: typeFilter.join(','),
              }),
            ...(modifiedFilter?.after && {
              start_date: dayjs(modifiedFilter.after).format('MM/DD/YYYY'),
            }),
            ...(modifiedFilter?.before && {
              end_date: dayjs(modifiedFilter.before).format('MM/DD/YYYY'),
            }),
          };

          if (checkLocation && currentAccountId) {
            requestParams.account_id = Number(currentAccountId);
          } else if (!checkLocation && accountId !== 'all') {
            requestParams.account_id = accountId;
          }

          await dispatch(initializeCloudStorageFromStorage(requestParams));

          // Wait a bit for DOM to update, then check again
          setTimeout(() => {
            if (
              autoLoadRequestIdRef.current === requestId &&
              !isNavigatingRef.current &&
              !isRouteSwitchingRef.current
            ) {
              checkAndAutoLoad();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Auto-load failed:', error);
      } finally {
        if (autoLoadRequestIdRef.current === requestId) {
          autoLoadInProgressRef.current = false;
          setIsAutoLoading(false);
        }
      }
    }
  }, [
    loading,
    isAutoLoading,
    pagination,
    connectedAccounts,
    currentFolderId,
    debouncedSearchTerm,
    typeFilter,
    modifiedFilter,
    checkLocation,
    currentAccountId,
    accountId,
    dispatch,
  ]);

  useEffect(() => {
    isRouteSwitchingRef.current = true;
  }, [checkLocation, location.pathname]);

  // **NEW: Setup observers for better DOM change detection**
  useEffect(() => {
    if (!scrollBoxRef.current) return;

    const container = scrollBoxRef.current;

    // ResizeObserver to detect container size changes
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      if (
        !loading &&
        !isAutoLoading &&
        connectedAccounts?.length &&
        !isNavigatingRef.current &&
        !isRouteSwitchingRef.current
      ) {
        setTimeout(checkAndAutoLoad, 50);
      }
    });

    resizeObserverRef.current.observe(container);

    // MutationObserver to detect content changes
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }

    mutationObserverRef.current = new MutationObserver(() => {
      if (
        !loading &&
        !isAutoLoading &&
        connectedAccounts?.length &&
        !isNavigatingRef.current &&
        !isRouteSwitchingRef.current
      ) {
        setTimeout(checkAndAutoLoad, 50);
      }
    });

    mutationObserverRef.current.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [checkAndAutoLoad, loading, isAutoLoading, connectedAccounts]);

  useEffect(() => {
    if (!loading && cloudStorage?.length > 0 && pagination?.page_no === 1) {
      isRouteSwitchingRef.current = false;
    }
  }, [loading, cloudStorage.length, pagination?.page_no]);

  // **NEW: Trigger auto-load when data changes**
  useEffect(() => {
    if (
      !loading &&
      !isAutoLoading &&
      !isNavigatingRef.current &&
      !isRouteSwitchingRef.current &&
      cloudStorage.length > 0 &&
      connectedAccounts?.length
    ) {
      // Use RAF to ensure DOM has updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!isNavigatingRef.current && !isRouteSwitchingRef.current) {
            checkAndAutoLoad();
          }
        }, 100);
      });
    }
  }, [cloudStorage.length, loading, checkAndAutoLoad, connectedAccounts]);

  // **NEW: Reset auto-load state on context changes**
  const resetAutoLoadState = useCallback(() => {
    autoLoadInProgressRef.current = false;
    autoLoadRequestIdRef.current = '';
    isNavigatingRef.current = false;
    isRouteSwitchingRef.current = false;
    setIsAutoLoading(false);
  }, []);

  const handleAdvancedFilter = useCallback(
    async (filters: {
      types: string[] | null;
      modified: { after?: Date; before?: Date } | null;
    }) => {
      resetAutoLoadState();
      setTypeFilter(filters.types);
      setModifiedFilter(filters.modified);

      await getCloudStorageFiles(1, {
        type:
          filters.types && filters.types?.length
            ? filters.types?.join(',')
            : undefined,
        after: filters.modified?.after
          ? dayjs(filters.modified.after).format('MM/DD/YYYY')
          : undefined,
        before: filters.modified?.before
          ? dayjs(filters.modified.before).format('MM/DD/YYYY')
          : undefined,
      });
    },
    [resetAutoLoadState, getCloudStorageFiles]
  );

  const handleAdvancedFilterReset = useCallback(() => {
    // resetAutoLoadState();
    setTypeFilter(null);
    setModifiedFilter(null);
    // closeAdvancedFilterModal();
    // await getCloudStorageFiles(1);
  }, []);

  // Add filter handler functions:
  const handleTypeFilter = useCallback(
    async (types: string[] | null) => {
      resetAutoLoadState();
      setTypeFilter(types);
      await getCloudStorageFiles(1, {
        type: types && types?.length ? types?.join(',') : undefined,
        after: modifiedFilter?.after
          ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
          : undefined,
        before: modifiedFilter?.before
          ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
          : undefined,
      });
    },
    [modifiedFilter, resetAutoLoadState, getCloudStorageFiles]
  );

  const handleModifiedFilter = useCallback(
    async (dateRange: { after?: Date; before?: Date } | null) => {
      resetAutoLoadState();
      setModifiedFilter(dateRange);
      await getCloudStorageFiles(1, {
        type:
          typeFilter && typeFilter?.length ? typeFilter?.join(',') : undefined,
        after: dateRange?.after
          ? dayjs(dateRange.after).format('MM/DD/YYYY')
          : undefined,
        before: dateRange?.before
          ? dayjs(dateRange.before).format('MM/DD/YYYY')
          : undefined,
      });
    },
    [typeFilter, resetAutoLoadState, getCloudStorageFiles]
  );

  const handleClearFilters = useCallback(() => {
    setTypeFilter(null);
    setModifiedFilter(null);
  }, []);

  const [onInitialize] = useAsyncOperation(getCloudStorageFiles);

  const loadMoreFiles = useCallback(async () => {
    if (pagination && pagination.page_no < pagination.total_pages && !loading) {
      const requestParams: any = {
        page: pagination.page_no + 1,
        limit: pagination.page_limit || 20,
        ...(currentFolderId && { id: currentFolderId }),
        searchTerm: debouncedSearchTerm || '',
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
    typeFilter,
    modifiedFilter,
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
      lastModified: item.modified_at ? item.modified_at : item.updatedAt,
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
      web_view_url: item.web_view_url,
      external_parent_id: item.external_parent_id,
      UserConnectedAccount: item.UserConnectedAccount,
    }));
  }, [cloudStorage]);

  useEffect(() => {
    if (moveModalOpen) {
      dispatch(setMoveModalPath(currentPath));
    }
  }, [moveModalOpen, currentPath, dispatch]);

  useEffect(() => {
    if (checkLocation && !connectedAccounts?.length) {
      navigate(PRIVATE_ROUTES.DASHBOARD.url);
    }
  }, [checkLocation, navigate, connectedAccounts]);

  useEffect(() => {
    const currentLength = connectedAccounts?.length || 0;
    if (
      currentLength > 0 &&
      currentLength > prevConnectedAccountsLength.current &&
      !hasCalledPostConnectAPIs.current &&
      !hasCalledInitializeAPI.current
    ) {
      onInitialize({});
      hasCalledPostConnectAPIs.current = true;
      hasCalledInitializeAPI.current = true;
    }

    prevConnectedAccountsLength.current = currentLength;

    if (currentLength === 0) {
      hasCalledPostConnectAPIs.current = false;
      hasCalledInitializeAPI.current = false;
      hasCalledRecentFilesAPI.current = false;
      resetAutoLoadState();
    }
  }, [connectedAccounts?.length, onInitialize, resetAutoLoadState]);

  useEffect(() => {
    if (
      !initializedRef.current &&
      connectedAccounts?.length &&
      !hasCalledInitializeAPI.current
    ) {
      onInitialize({});
      initializedRef.current = true;
      hasCalledInitializeAPI.current = true;
    }

    return () => {
      dispatch(resetPagination());
      dispatch(resetCloudStorageFolder());
      if (!globalSearchState) {
        removeLocalStorage(pathKey);
        removeLocalStorage(folderIdKey);
      }
      removeLocalStorage(layoutKey);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedOnce.current || !connectedAccounts?.length) {
      hasMountedOnce.current = true;
      return;
    }

    resetAutoLoadState();
    getCloudStorageFiles(checkLocation || accountId !== 'all' ? 1 : undefined, {
      type:
        typeFilter && typeFilter?.length ? typeFilter?.join(',') : undefined,
      after: modifiedFilter?.after
        ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
        : undefined,
      before: modifiedFilter?.before
        ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
        : undefined,
    });
  }, [accountId, checkLocation]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    lastScrollTop.current = e.currentTarget.scrollTop;
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
      pagination &&
      pagination.page_no < pagination.total_pages &&
      !loading &&
      !isAutoLoading
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
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
      web_view_url: item.web_view_url,
      external_parent_id: item.external_parent_id,
      UserConnectedAccount: item.UserConnectedAccount,
    }));
  }, [recentFiles]);

  // **NEW: Reset auto-load state when context changes**
  useEffect(() => {
    resetAutoLoadState();
  }, [currentFolderId, accountId, resetAutoLoadState]);

  const navigateToFolderFn = useCallback(
    (folder: { id?: string; name: string } | null) => {
      resetAutoLoadState();
      isNavigatingRef.current = true;

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

      const navigationPromise = dispatch(
        navigateToFolder(
          folder
            ? requestParams
            : checkLocation && currentAccountId
              ? { account_id: Number(currentAccountId) }
              : null
        )
      );

      navigationPromise.finally(() => {
        isNavigatingRef.current = false;
      });
    },
    [dispatch, isMoveMode, checkLocation, currentAccountId, resetAutoLoadState]
  );

  const handleRowDoubleClick = useCallback(
    (row: FileType, _?: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      if (
        row.mimeType === 'application/vnd.google-apps.folder' ||
        row.type === 'folder'
      ) {
        navigateToFolderFn({ id: row.id, name: row.name });
      } else if (row.type === 'file') {
        handleMenuItemClick('preview', row);
      }
    },
    [navigateToFolderFn]
  );

  const handleMenuItemClick = async (actionId: string, row: FileType) => {
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
    } else if (actionId === 'move') {
      handleModalMoveSelected([row?.id]);
    } else if (actionId === 'details') {
      handleFilePreview(row, false);
      handleShowDetails(row);
    } else if (actionId === 'preview') {
      setPreviewModalOpen(true);
      handleFilePreview(row);
    }
  };

  const handleFilePreview = useCallback(
    async (row: FileType, isPreview = true) => {
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

        const ext = row.fileExtension
          ? `${row.fileExtension.toLowerCase()}`
          : '';
        const isSupported = isPreview
          ? PREVIEW_FILE_TYPES.includes(ext)
          : IMAGE_FILE_TYPES.includes(ext);

        if (!isSupported) {
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

        const res = await dispatch(downloadFiles({ ids: [row.id] }));
        if (res.payload?.status === 200 && res.payload?.data instanceof Blob) {
          const url = URL.createObjectURL(res.payload?.data);
          const isVideo = VIDEO_FILE_TYPES.includes(ext);
          const isDocument = DOCUMENT_FILE_TYPES.includes(ext);
          if (isPreview) {
            setPreviewFile({
              url,
              type: row.fileExtension || row.mimeType || '',
              name: row.name,
              size: row.size
                ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
                : undefined,
              isVideo,
              isDocument,
              share: row.web_view_url ?? null,
            });
          } else {
            setDetailsFile({
              url,
              type: row.fileExtension || row.mimeType || '',
              name: row.name,
              size: row.size
                ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
                : undefined,
              isVideo,
              isDocument,
              share: row.web_view_url ?? null,
            });
          }
        } else {
          notifications.show({
            message: res?.payload?.message || 'Failed to preview file',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to preview file',
          color: 'red',
        });
      } finally {
        if (isPreview) {
          setPreviewFileLoading(false);
        } else {
          setDetailsFileLoading(false);
        }
      }
    },
    [dispatch]
  );

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
          resetAutoLoadState();
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });
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

  const handleRemoveUploadedFile = useCallback(
    (idx: number) => {
      removeUploadedFile(idx?.toString());
      const updated = [...uploadedFiles];
      updated.splice(idx, 1);
      setUploadedFiles(updated);
      uploadMethods.setValue('files', updated);
    },
    [uploadedFiles, uploadMethods]
  );

  // const [uploadFiles, uploadFilesLoading] = useAsyncOperation(
  //   async ({
  //     files,
  //     formData,
  //   }: {
  //     files: File[];
  //     formData: UploadFormData;
  //   }) => {
  //     try {
  //       setShowUploadProgress(true);
  //       const fileIds = files.map(() => uuidv4());

  //       // Initialize progress and uploading files state
  //       files.forEach((file, index) => {
  //         const fileId = fileIds[index];
  //         setUploadingFiles(prev => ({
  //           ...prev,
  //           [fileId]: {
  //             name: file.name,
  //             size: formatFileSize(file.size.toString()),
  //           },
  //         }));
  //         setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
  //       });

  //       const formDataToUpload = new FormData();
  //       files.forEach(file => formDataToUpload.append('file', file));
  //       if (currentFolderId) {
  //         formDataToUpload.append('id', currentFolderId);
  //       }

  //       if (checkLocation && currentAccountId) {
  //         formDataToUpload.append('account_id', String(currentAccountId));
  //       } else if (!checkLocation && !isSFDEnabled && formData.accountId) {
  //         formDataToUpload.append('account_id', formData.accountId);
  //       }

  //       closeModal();
  //       closeDragDropModal();

  //       // Call the API and track progress
  //       await dispatch(
  //         uploadCloudStorageFiles({
  //           data: formDataToUpload,
  //           onUploadProgress: (progressEvent: ProgressEvent) => {
  //             const percentCompleted = Math.round(
  //               (progressEvent.loaded * 100) / progressEvent.total
  //             );
  //             files.forEach((_, index) => {
  //               const fileId = fileIds[index];
  //               setUploadProgress(prev => ({
  //                 ...prev,
  //                 [fileId]: percentCompleted,
  //               }));
  //             });
  //           },
  //         })
  //       ).unwrap();

  //       uploadMethods.reset();

  //       // Wait for `uploadLoading` to become false and set progress to 100%
  //       const waitForUploadCompletion = () => {
  //         const interval = setInterval(() => {
  //           if (!uploadLoading) {
  //             files.forEach((_, index) => {
  //               const fileId = fileIds[index];
  //               setUploadProgress(prev => ({
  //                 ...prev,
  //                 [fileId]: 100,
  //               }));
  //             });
  //             clearInterval(interval);
  //           }
  //         }, 100);
  //       };

  //       waitForUploadCompletion();

  //       // Refresh the file list after upload
  //       resetAutoLoadState();
  //       await getCloudStorageFiles(1, {
  //         type:
  //           typeFilter && typeFilter?.length
  //             ? typeFilter?.join(',')
  //             : undefined,
  //         after: modifiedFilter?.after
  //           ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
  //           : undefined,
  //         before: modifiedFilter?.before
  //           ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
  //           : undefined,
  //       });
  //     } catch (error: any) {
  //       notifications.show({
  //         message:
  //           typeof error === 'string'
  //             ? error
  //             : error?.message || 'Failed to upload files',
  //         color: 'red',
  //       });
  //     }
  //   }
  // );

  // File rename functionality
  const [renameFile, renameFileLoading] = useAsyncOperation(
    async ({ fileId, newName }: { fileId: string; newName: string }) => {
      try {
        await dispatch(
          renameCloudStorageFile({ id: fileId, name: newName })
        ).unwrap();

        resetAutoLoadState();
        await getCloudStorageFiles(1, {
          type:
            typeFilter && typeFilter?.length
              ? typeFilter?.join(',')
              : undefined,
          after: modifiedFilter?.after
            ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
            : undefined,
          before: modifiedFilter?.before
            ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
            : undefined,
        });
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
          resetAutoLoadState();
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });
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

  // const uploadFilesHandler = useCallback(
  //   async (files: File[], formData?: UploadFormData) => {
  //     if (files.length === 0) return;

  //     uploadsInProgressRef.current = true;
  //     setShowUploadProgress(true);

  //     setUploadProgress({});
  //     setUploadingFiles({});

  //     files.forEach(file => {
  //       const fileId = uuidv4();
  //       const controller = new AbortController();
  //       uploadControllers.current[fileId] = controller;

  //       setUploadingFiles(prev => ({
  //         ...prev,
  //         [fileId]: {
  //           name: file.name,
  //           size: formatFileSize(file.size.toString()),
  //           fileObject: file,
  //         },
  //       }));
  //     });

  //     await uploadFiles({ files, formData: formData || { accountId: '' } });
  //   },
  //   [uploadFiles]
  // );

  const handleFileUpload = uploadMethods.handleSubmit(async data => {
    const filesToUpload = uploadedFiles.length > 0 ? uploadedFiles : [];
    await uploadFilesHandlerV2(filesToUpload, data);
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

  // const handleFileDrop = useCallback(
  //   async (files: File[]) => {
  //     if (files.length > 5) {
  //       notifications.show({
  //         message: 'You can upload a maximum of 5 files at a time.',
  //         color: 'red',
  //       });
  //       files = files.slice(0, 5);
  //     }
  //     if (!isSFDEnabled) {
  //       setDragDropFiles(files);
  //       setDragDropModalOpen(true);
  //       uploadMethods.reset({ accountId: '', files: files });
  //     } else {
  //       await uploadFilesHandler(files);
  //     }
  //   },
  //   [uploadFilesHandler, isSFDEnabled, uploadMethods]
  // );

  const handleDragDropUpload = uploadMethods.handleSubmit(async data => {
    await uploadFilesHandlerV2(dragDropFiles, data);
    setDragDropModalOpen(false);
    setDragDropFiles([]);
  });

  const closeDragDropModal = useCallback(() => {
    setDragDropFiles([]);
    setDragDropModalOpen(false);
    uploadMethods.reset();
  }, [uploadMethods]);

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

  // Replace the handleFileUpload
  const handleFileUploadV2 = uploadMethods.handleSubmit(async data => {
    const filesToUpload = uploadedFiles.length > 0 ? uploadedFiles : [];
    await uploadFilesHandlerV2(filesToUpload, data);
  });

  const uploadFilesHandlerV2 = useCallback(
    async (files: File[], formData?: UploadFormData) => {
      if (files.length === 0) return;

      const uploadOptions: { id?: string; account_id?: string } = {};

      if (currentFolderId) {
        uploadOptions.id = currentFolderId;
      }

      if (checkLocation && currentAccountId) {
        uploadOptions.account_id = String(currentAccountId);
      } else if (!checkLocation && !isSFDEnabled && formData?.accountId) {
        uploadOptions.account_id = formData.accountId;
      }
      closeModal();
      closeDragDropModal();

      try {
        const res = await startUpload(files, uploadOptions);
        uploadMethods.reset();

        // Refresh the file list after upload starts
        // The actual refresh should happen when all uploads complete
        // For now, we'll do a delayed refresh

        if (res?.response?.success === 1) {
          setTimeout(async () => {
            await getCloudStorageFiles(1, {
              type:
                typeFilter && typeFilter?.length
                  ? typeFilter?.join(',')
                  : undefined,
              after: modifiedFilter?.after
                ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
                : undefined,
              before: modifiedFilter?.before
                ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
                : undefined,
            });
          }, 1000);
        }
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to start upload',
          color: 'red',
        });
      }
    },
    [
      currentFolderId,
      checkLocation,
      currentAccountId,
      isSFDEnabled,
      startUpload,
      closeModal,
      closeDragDropModal,
      uploadMethods,
      getCloudStorageFiles,
      typeFilter,
      modifiedFilter,
    ]
  );

  // Replace the handleFileDrop
  const handleFileDropV2 = useCallback(
    async (files: File[]) => {
      if (!isSFDEnabled) {
        setDragDropFiles(files);
        setDragDropModalOpen(true);
        uploadMethods.reset({ accountId: '', files: files });
      } else {
        await uploadFilesHandlerV2(files);
      }
    },
    [uploadFilesHandlerV2, isSFDEnabled, uploadMethods]
  );

  const handleDragDropUploadV2 = uploadMethods.handleSubmit(async data => {
    await uploadFilesHandlerV2(dragDropFiles, data);
    setDragDropModalOpen(false);
    setDragDropFiles([]);
  });

  // Drag and drop functionality
  const { dragRef, isDragging } = useDragDrop({
    // onFileDrop: handleFileDrop,
    onFileDrop: handleFileDropV2,
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
          resetAutoLoadState();
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });
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
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    if (checkFiles?.web_view_url) {
      window.open(checkFiles.web_view_url, '_blank');
    }
  }, [files, selectedIds]);

  const [downloadItems] = useAsyncOperation(async data => {
    try {
      const idsToDownload = Array.isArray(data) ? data : selectedIds;
      await downloadFilesEnhanced(idsToDownload, downloadFile!);
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
          resetAutoLoadState();
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });
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
          resetAutoLoadState();
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });
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

  const displayMoveIcon = useMemo(() => {
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    return checkFiles?.type === 'file' || checkLocation || folderId
      ? true
      : false;
  }, [selectedIds, files, checkLocation, folderId]);

  const displayDownloadIcon = useMemo(() => {
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    return checkFiles?.type === 'file' ? true : false;
  }, [selectedIds, files]);

  const displayShareIcon = useMemo(() => {
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    return checkFiles?.web_view_url ? true : false;
  }, [selectedIds, files]);

  const displayPreviewIcon = useMemo(() => {
    const checkFiles = files.find(file => selectedIds.includes(file.id));
    return checkFiles?.type === 'file' &&
      checkFiles.fileExtension &&
      PREVIEW_FILE_TYPES.includes(checkFiles?.fileExtension)
      ? true
      : false;
  }, [selectedIds, files]);

  const handleMoveSelected = useCallback(
    (ids?: string[]) => {
      setIsMoveMode(true);
      if (Array.isArray(ids) && ids?.length) {
        setSelectedIds(ids);
        const checkFiles = files.find(file => ids?.includes(file.id));
        setFilesToMove([...ids]);
        selectParentId(checkFiles?.parent_id ?? null);
        setSourceFolderId(currentFolderId ?? null);
      } else {
        const checkFiles = files.find(file => selectedIds.includes(file.id));
        setFilesToMove([...selectedIds]);
        selectParentId(checkFiles?.parent_id ?? null);
        setSourceFolderId(currentFolderId ?? null);
      }
    },
    [selectedIds, currentFolderId]
  );

  const isPasteEnabled = useCallback(() => {
    if (!isMoveMode || filesToMove.length === 0) return false;

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

  const openMoveModal = useCallback(
    (items?: FileType[]) => {
      const selectedFiles =
        items || files.filter(file => selectedIds.includes(file.id));
      setItemsToMove(selectedFiles);
      setMoveModalOpen(true);
    },
    [files, selectedIds]
  );

  const closeMoveModal = useCallback(() => {
    setMoveModalOpen(false);
    setItemsToMove([]);
  }, []);

  const handleMoveModalConfirm = useCallback(
    async (destinationId: string | null, destinationName: string) => {
      try {
        const itemIds = itemsToMove.map(item => item.id);

        const res = await dispatch(
          moveCloudStorageFiles({
            ids: itemIds,
            destination_id: destinationId,
          })
        ).unwrap();

        if (res?.status === 200) {
          notifications.show({
            message: `Items moved to ${destinationName} successfully`,
            color: 'green',
          });
          resetAutoLoadState();
          // if (!folderId || folderId === null) {
          //   onGetRecentFiles({});
          // }
          // await getCloudStorageFiles(1);
          await getCloudStorageFiles(1, {
            type:
              typeFilter && typeFilter?.length
                ? typeFilter?.join(',')
                : undefined,
            after: modifiedFilter?.after
              ? dayjs(modifiedFilter.after).format('MM/DD/YYYY')
              : undefined,
            before: modifiedFilter?.before
              ? dayjs(modifiedFilter.before).format('MM/DD/YYYY')
              : undefined,
          });

          // Clear selections
          setSelectedIds([]);
          setLastSelectedIndex(null);
          cancelMoveMode();
          closeMoveModal();
        } else {
          notifications.show({
            message: res?.message || 'Failed to move items',
            color: 'red',
          });
        }
        return res;
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to move items',
          color: 'red',
        });
      }
    },
    [
      itemsToMove,
      dispatch,
      folderId,
      // onGetRecentFiles,
      getCloudStorageFiles,
      cancelMoveMode,
      closeMoveModal,
    ]
  );

  const handleModalMoveSelected = useCallback(
    (ids?: string[]) => {
      if (Array.isArray(ids) && ids?.length) {
        const selectedFiles = files.filter(file => ids.includes(file.id));
        openMoveModal(selectedFiles);
      } else {
        openMoveModal();
      }
    },
    [files, openMoveModal]
  );

  const handleShowDetails = useCallback((item: FileType) => {
    setSelectedItemForDetails(item);
    setDetailsDrawerOpen(true);
  }, []);

  const closeDetailsDrawer = useCallback(() => {
    setDetailsDrawerOpen(false);
    setSelectedItemForDetails(null);
    setPreviewFile(null);
  }, []);

  const checkConnectedAccDetails = useMemo(() => {
    if (checkLocation) {
      return connectedAccounts.find(
        account => account.id?.toString() === currentAccountId
      );
    }
  }, [connectedAccounts, currentAccountId, checkLocation]);

  const hasFilters = useMemo(() => {
    return typeFilter?.length || modifiedFilter ? true : false;
  }, [typeFilter, modifiedFilter]);

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
    handleRemoveUploadedFile,

    // create file / folder
    createFolderLoading,
    handleCreateFolder,
    // uploadFilesLoading,
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
    displayMoveIcon,
    displayDownloadIcon,
    displayShareIcon,
    location,
    connectedAccounts,

    // preview
    previewModalOpen,
    setPreviewModalOpen,
    previewFile,
    setPreviewFile,
    previewFileLoading,
    displayPreviewIcon,
    downloadItems,

    // modal move
    moveModalOpen,
    closeMoveModal,
    itemsToMove,
    handleMoveModalConfirm,
    currentAccountId,
    handleModalMoveSelected,

    // details drawer
    closeDetailsDrawer,
    detailsDrawerOpen,
    selectedItemForDetails,
    detailsFile,
    detailsFileLoading,

    //filters
    handleClearFilters,
    handleModifiedFilter,
    handleTypeFilter,
    typeFilter,
    modifiedFilter,

    // file upload v2
    showUploadProgressV2,
    uploadingFilesV2,
    cancelUploadV2,
    closeUploadProgressV2,
    clearAllUploads,

    // Replace old upload handlers
    handleFileUploadV2,
    handleDragDropUploadV2,
    uploadFilesHandler: uploadFilesHandlerV2,
    isAutoLoading,
    checkConnectedAccDetails,
    hasPaginationData,

    // advance search filters
    advancedFilterModalOpen,
    openAdvancedFilterModal,
    closeAdvancedFilterModal,
    handleAdvancedFilter,
    handleAdvancedFilterReset,
    hasFilters,
  };
};

export default useDashboard;
