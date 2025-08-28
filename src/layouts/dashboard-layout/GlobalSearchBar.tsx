import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Box,
  Paper,
  Group,
  Text,
  UnstyledButton,
  Loader,
  Badge,
  Stack,
} from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { ICONS } from '../../assets/icons';
import Icon from '../../assets/icons/icon';
import { useAppDispatch, useAppSelector } from '../../store';
import { api } from '../../api';
import {
  navigateToFolder,
  // downloadFiles,
} from '../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import useDebounce from '../../hooks/use-debounce';
import getFileIcon from '../../components/file-icon';
import {
  downloadFilesEnhanced,
  formatDate,
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '../../utils/helper';
import {
  DOCUMENT_FILE_TYPES,
  PREVIEW_FILE_TYPES,
  VIDEO_FILE_TYPES,
} from '../../utils/constants';
import type { FileType } from '../../pages/dashboard/use-dashboard';
import { useNavigate, useParams } from 'react-router';
import FullScreenPreview from '../../pages/dashboard/components/FullScreenPreview';
import DownloadProgress from '../../pages/dashboard/components/DownloadProgress';
import TextInput from '../../components/inputs/text-input';
import { PRIVATE_ROUTES } from '../../routing/routes';

interface DownloadProgress {
  isDownloading: boolean;
  fileName?: string;
  totalSize: number;
  downloadedSize: number;
  percentage: number;
  status: 'downloading' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startTime: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  fileCount: number;
}

interface SearchBarProps {
  placeholder?: string;
  isSm?: boolean;
  downloadFile: (selectedIds: string[]) => Promise<void>;
  cancelDownload: () => void;
  clearDownload: () => void;
  downloadProgress: DownloadProgress | null;
  pauseDownload: () => void;
  resumeDownload: () => void;
  fetchPreviewFileWithProgress: (
    url: string,
    signal: AbortSignal,
    selectedIds: string[],
    onProgress?: ((percent: number) => void) | undefined
  ) => Promise<Blob>;
}

interface SearchResult {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: ((size: number) => React.ReactNode) | React.ReactNode;
  lastModified: string;
  parent_path?: string;
  mimeType?: string;
  fileExtension?: string | null;
  web_view_url?: string | null;
  entry_type?: string;
  modified_at?: string;
  updatedAt?: string;
  mime_type?: string;
  file_extension?: string | null;
  UserConnectedAccount?: {
    id: string;
    account_name: string;
    account_type: string;
  } | null;
}

const GlobalSearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search files and folders...',
  isSm = false,
  downloadFile,
  cancelDownload,
  clearDownload,
  downloadProgress,
  pauseDownload,
  resumeDownload,
  fetchPreviewFileWithProgress,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const folderId = getLocalStorage('folderId');
  const params = useParams();

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { accountId } = useAppSelector(state => state.cloudStorage);

  const [previewFileLoading, setPreviewFileLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    id?: string;
    url: string;
    type: string;
    name: string;
    size?: number;
    isVideo?: boolean;
    isDocument?: boolean;
    share?: string | null;
  } | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  const checkLocation = useMemo(
    () =>
      location.pathname.startsWith('/google-drive') ||
      location.pathname.startsWith('/dropbox') ||
      location.pathname.startsWith('/onedrive'),
    [location.pathname]
  );
  const currentAccountId = checkLocation ? params.id : accountId;

  useClickOutside(() => setIsOpen(false), null, [
    searchRef.current,
    dropdownRef.current,
  ]);

  const debouncedSearchValue = useDebounce(searchValue.trim(), 300);

  // Separate search function that doesn't modify main cloudStorage state
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      try {
        setSearchError(null);
        const requestParams: any = {
          limit: 20,
          page: 1,
          searchTerm: searchTerm,
          ...(folderId && { id: folderId }),
          // global_search: true,
        };

        if (checkLocation && currentAccountId) {
          requestParams.account_id = Number(currentAccountId);
        } else if (!checkLocation && accountId !== 'all') {
          requestParams.account_id = accountId;
        }

        // Direct API call to avoid modifying main cloudStorage state
        const response = await api.cloudStorage.getFiles(requestParams);

        if (response.data?.data?.data?.length) {
          const results = response.data.data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type:
              item.entry_type === 'folder'
                ? 'folder'
                : ('file' as 'folder' | 'file'),
            icon: getFileIcon({
              entry_type: item.entry_type,
              mime_type: item.mime_type,
              file_extension: item.file_extension,
              name: item.name,
            }),
            lastModified: item.modified_at
              ? formatDate(item.modified_at)
              : formatDate(item.updatedAt),
            parent_path: item.parent_path || '',
            mimeType: item.mime_type,
            fileExtension: item.file_extension,
            web_view_url: item.web_view_url,
            entry_type: item.entry_type,
            modified_at: item.modified_at,
            updatedAt: item.updatedAt,
            mime_type: item.mime_type,
            file_extension: item.file_extension,
            UserConnectedAccount: item.UserConnectedAccount,
          }));
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error: any) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
      }
    },
    [accountId, checkLocation, currentAccountId]
  );

  const [searchFiles, searchLoading] = useAsyncOperation(performSearch);

  useEffect(() => {
    if (debouncedSearchValue) {
      searchFiles(debouncedSearchValue);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setSearchError(null);
      setIsOpen(false);
    }
  }, [debouncedSearchValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (!value.trim()) {
      setIsOpen(false);
      setSearchResults([]);
      setSearchError(null);
      setSelectedIndex(-1);
    }
  };

  const handleInputFocus = () => {
    if (searchValue.trim() && (searchResults.length > 0 || searchError)) {
      setIsOpen(true);
    }
  };

  // const getCloudProviderIcon = (result: SearchResult) => {
  //   const accountType = result.UserConnectedAccount?.account_type;
  //   switch (accountType) {
  //     case 'google_drive':
  //       return <ICONS.IconBrandGoogle size={12} color="#4285f4" />;
  //     case 'dropbox':
  //       return <ICONS.IconDroplets size={12} color="#0061ff" />;
  //     case 'onedrive':
  //       return <ICONS.IconBrandOnedrive size={12} color="#0078d4" />;
  //     default:
  //       return null;
  //   }
  // };

  const handleFolderNavigation = useCallback(
    (result: SearchResult) => {
      // Follow the same navigation pattern as use-dashboard
      const requestParams = {
        id: result.id,
        name: result.name,
        account_id: result?.UserConnectedAccount?.id!,
        is_breadcrumb: true,
      };

      // Store folder info in localStorage and navigate
      setLocalStorage('folderId', result.id);
      setLocalStorage('cloudStoragePath', [
        ...(getLocalStorage('cloudStoragePath') || []),
        {
          id: result.id,
          name: result.name,
          account_id: requestParams.account_id,
        },
      ]);
      dispatch(navigateToFolder(requestParams));
      if (location.pathname === PRIVATE_ROUTES.RECENT_FILES.url) {
        navigate(PRIVATE_ROUTES.DASHBOARD.url);
      }
      if (
        (currentAccountId !== requestParams.account_id ||
          (accountId !== 'all' && accountId !== requestParams.account_id)) &&
        checkLocation
      ) {
        setLocalStorage('globalSearchState', true);
        if (result?.UserConnectedAccount?.account_type === 'dropbox') {
          navigate(`/dropbox/${requestParams.account_id}`);
        } else if (
          result?.UserConnectedAccount?.account_type === 'google_drive'
        ) {
          navigate(`/google-drive/${requestParams.account_id}`);
        } else if (result?.UserConnectedAccount?.account_type === 'onedrive') {
          navigate(`/onedrive/${requestParams.account_id}`);
        }
      } else {
        removeLocalStorage('globalSearchState');
      }
    },
    [dispatch, accountId, checkLocation, currentAccountId]
  );

  const [downloadItems] = useAsyncOperation(async data => {
    try {
      const idsToDownload = Array.isArray(data) ? data : [];

      // Use the enhanced download system
      await downloadFilesEnhanced(idsToDownload, downloadFile);
    } catch (error: any) {
      notifications.show({
        message: error || 'Failed to download Item',
        color: 'red',
      });
    }
  });

  // const handleFilePreview = useCallback(
  //   async (row: FileType) => {
  //     try {
  //       setPreviewFileLoading(true);
  //       setPreviewModalOpen(true);
  //       setPreviewFile({
  //         name: row.name,
  //       } as any);

  //       const ext = row.fileExtension
  //         ? `${row.fileExtension.toLowerCase()}`
  //         : '';
  //       const isSupported = PREVIEW_FILE_TYPES.includes(ext);

  //       if (!isSupported) {
  //         setPreviewFile({
  //           id: row.id,
  //           url: '',
  //           type: ext || row.mimeType || '',
  //           name: row.name,
  //           size: row.size
  //             ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //             : undefined,
  //           share: row.web_view_url ?? null,
  //         });
  //         setPreviewFileLoading(false);
  //         return;
  //       }

  //       const res = await dispatch(downloadFiles({ ids: [row.id] }));
  //       if (res.payload?.status === 200 && res.payload?.data instanceof Blob) {
  //         const url = URL.createObjectURL(res.payload?.data);
  //         const isVideo = VIDEO_FILE_TYPES.includes(ext);
  //         const isDocument = DOCUMENT_FILE_TYPES.includes(ext);
  //         setPreviewFile({
  //           id: row.id,
  //           url,
  //           type: row.fileExtension || row.mimeType || '',
  //           name: row.name,
  //           size: row.size
  //             ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
  //             : undefined,
  //           isVideo,
  //           isDocument,
  //           share: row.web_view_url ?? null,
  //         });
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
  //       setPreviewFileLoading(false);
  //     }
  //   },
  //   [dispatch]
  // );

  const handleFilePreview = useCallback(async (row: FileType) => {
    try {
      setPreviewFileLoading(true);
      setPreviewModalOpen(true);
      setPreviewFile({
        name: row.name,
      } as any);

      const ext = row.fileExtension ? `${row.fileExtension.toLowerCase()}` : '';
      const isSupported = PREVIEW_FILE_TYPES.includes(ext);

      if (!isSupported) {
        setPreviewFile({
          id: row.id,
          url: '',
          type: ext || row.mimeType || '',
          name: row.name,
          size: row.size
            ? parseInt(row.size.replace(/[^0-9]/g, '')) * 1024
            : undefined,
          share: row.web_view_url ?? null,
        });
        setPreviewFileLoading(false);
        return;
      }

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
        id: row.id,
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
    }
  }, []);

  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'folder') {
        // Navigate to folder using the same pattern as dashboard
        handleFolderNavigation(result);
      } else {
        const fileData: FileType = {
          id: result.id,
          name: result.name,
          type: result.type,
          icon: result.icon as (size: number) => React.ReactNode,
          owner: { name: 'You', avatar: null, initials: 'JS' },
          lastModified: result.lastModified,
          size: null,
          mimeType: result.mimeType,
          fileExtension: result.fileExtension!,
          preview: null,
          parent_id: null,
          web_view_url: result.web_view_url!,
          UserConnectedAccount: result.UserConnectedAccount,
        };
        handleFilePreview(fileData);
      }

      // Close search dropdown
      setIsOpen(false);
      setSearchValue('');
      setSelectedIndex(-1);
      searchRef.current?.blur();
    },
    [handleFolderNavigation, handleFilePreview]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    // Handle no results or error state
    if (searchResults.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultSelect(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          // If no item is selected, select the first one
          handleResultSelect(searchResults[0]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: '#fff3cd', padding: 0 }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getResultSubtext = (result: SearchResult) => {
    const parts = [];
    if (result.parent_path) {
      parts.push(`In: ${result.parent_path}`);
    }
    if (result.UserConnectedAccount?.account_name) {
      parts.push(result.UserConnectedAccount.account_name);
    }
    parts.push(result.lastModified);
    return parts.join(' • ');
  };

  const renderSearchResults = () => {
    if (searchError) {
      return (
        <Box p="md" ta="center">
          <Stack gap="xs" align="center">
            <Icon component={ICONS.IconAlertCircle} size={24} color="red" />
            <Text size="sm" c="red">
              {searchError}
            </Text>
          </Stack>
        </Box>
      );
    }

    if (searchResults.length === 0 && !searchLoading && debouncedSearchValue) {
      return (
        <Box p="md" ta="center">
          <Stack gap="xs" align="center">
            <Icon component={ICONS.IconSearchOff} size={24} color="gray" />
            <Text size="sm" c="dimmed">
              No results found for "{debouncedSearchValue}"
            </Text>
          </Stack>
        </Box>
      );
    }

    return searchResults.map((result, index) => (
      <UnstyledButton
        key={result.id}
        onClick={() => handleResultSelect(result)}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 16px',
          backgroundColor: selectedIndex === index ? '#f8f9fa' : 'transparent',
          borderBottom:
            index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setSelectedIndex(index)}
        data-hover="true"
      >
        <Group gap={12} align="flex-start" wrap="nowrap">
          <Box style={{ marginTop: 2, flexShrink: 0, position: 'relative' }}>
            {typeof result.icon === 'function' ? result.icon(24) : result.icon}
            {/* Cloud provider badge */}
            {/* {getCloudProviderIcon(result) && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {getCloudProviderIcon(result)}
              </Box>
            )} */}
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" align="center" wrap="nowrap">
              <Text
                size="sm"
                fw={500}
                style={{
                  color: '#3c4043',
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  flex: 1,
                }}
              >
                {highlightText(result.name, debouncedSearchValue)}
              </Text>
              {result.type === 'folder' && (
                <Badge size="xs" variant="light" color="blue">
                  Folder
                </Badge>
              )}
            </Group>
            {getResultSubtext(result) && (
              <Text
                size="xs"
                c="dimmed"
                style={{
                  lineHeight: 1.2,
                  marginTop: 4,
                  wordBreak: 'break-word',
                }}
              >
                {getResultSubtext(result)}
              </Text>
            )}
          </Box>
        </Group>
      </UnstyledButton>
    ));
  };

  return (
    <Box style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
      <TextInput
        ref={searchRef}
        value={searchValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        field={{
          value: searchValue,
          onChange: handleInputChange,
          ref: searchRef,
        }}
        size="sm"
        w="100%"
        pl={36}
        leftSection={
          searchLoading ? (
            <Loader size={16} />
          ) : (
            <Icon component={ICONS.IconSearch} size={16} />
          )
        }
        rightSection={
          searchValue ? (
            <UnstyledButton
              onClick={() => {
                setSearchValue('');
                setIsOpen(false);
                setSearchResults([]);
                setSearchError(null);
                setSelectedIndex(-1);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: 10,
              }}
            >
              <Icon component={ICONS.IconX} size={14} />
            </UnstyledButton>
          ) : null
        }
        styles={{
          input: {
            // borderRadius: 24,
            border: '1px solid #dadce0',
            backgroundColor: '#fff',
            fontSize: 14,
            '&:focus': {
              borderColor: '#1a73e8',
              boxShadow: '0 2px 8px rgba(26, 115, 232, 0.2)',
            },
            '&:hover': {
              borderColor: '#dadce0',
              boxShadow: '0 1px 6px rgba(32, 33, 36, 0.15)',
            },
          },
        }}
      />

      {isOpen && (debouncedSearchValue || searchError) && (
        <Paper
          ref={dropdownRef}
          shadow="lg"
          style={{
            position: 'absolute',
            top: '100%',
            // left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            maxHeight: 480,
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            width: isSm ? '90%' : '94%',
          }}
        >
          {searchLoading && (
            <Box p="md" ta="center">
              <Group justify="center" gap="sm">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Searching...
                </Text>
              </Group>
            </Box>
          )}

          {!searchLoading && renderSearchResults()}
        </Paper>
      )}

      <FullScreenPreview
        previewFile={previewFile}
        previewFileLoading={previewFileLoading}
        previewModalOpen={previewModalOpen}
        setPreviewModalOpen={setPreviewModalOpen}
        setPreviewFile={setPreviewFile}
        previewAbortRef={previewAbortRef}
        previewProgress={previewProgress}
        onDownload={() => {
          if (previewFile && previewFile.id) {
            downloadItems([previewFile.id]);
          }
        }}
        onShare={() => {
          if (previewFile && previewFile.share) {
            window.open(previewFile.share, '_blank');
          }
        }}
      />

      {downloadProgress && (
        <DownloadProgress
          downloadProgress={downloadProgress}
          onCancelDownload={cancelDownload}
          onClose={clearDownload}
          onPause={pauseDownload}
          onResume={resumeDownload}
        />
      )}
    </Box>
  );
};

export default GlobalSearchBar;
