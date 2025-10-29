import { useEffect, useMemo, useRef, useState } from 'react';
import { decryptRouteParam } from '../../utils/helper/encryption';
import {
  ActionIcon,
  Autocomplete,
  Box,
  Group,
  rem,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import FileTable from './components/FileTable';
import useDashboard from './use-dashboard';
import {
  Breadcrumbs,
  Button,
  Card,
  Form,
  Image,
  Modal,
  SelectionBar,
  Tooltip,
} from '../../components';
import FileGrid from './components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
// import UploadProgress from './components/UploadProgress';
import CustomToggle from './components/CustomToggle';
import { LoaderOverlay } from '../../components/loader';
import { Controller } from 'react-hook-form';
import { formatFileSize } from '../../utils/helper';
// import RecentFiles from './components/RecentFilesOld';
import useResponsive from '../../hooks/use-responsive';
import useSidebar from '../../layouts/dashboard-layout/navbar/use-sidebar';
import NoConnectedAccount from './NoConnectedAccount';
import MoveModal from './components/MoveModal';
import { ICONS } from '../../assets/icons';
import FullScreenPreview from './components/FullScreenPreview';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import FileDetailsDrawer from './components/FileDetailsDrawer';
import useFileDownloader from './components/use-file-downloader';
import DownloadProgress from './components/DownloadProgress';
// import DashboardFilters from './components/DashboardFilters';
import UploadProgressV2 from './file-upload-v2/UploadProgressV2';
import FileTableSkeleton from '../../components/skeleton/FileTableSkeleton';
import FileGridSkeleton from '../../components/skeleton/FileGridSkeleton';
import AdvancedFiltersModal from './components/AdvancedFiltersModal';
import { useAppSelector } from '../../store';
import ReAuthenticateAccount from './ReAuthenticateAccount';
import GoogleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import dayjs from 'dayjs';
import {
  connectSocket,
  getSocket,
  initSocket,
  subscribeToEvent,
  unsubscribeFromEvent,
} from '../../utils/socket';
import { initializeCloudStorageFromStorage } from '../../store/slices/cloudStorage.slice';

const iconStyle = {
  borderRadius: 999,
  transition: 'background 0.2s',
  padding: 4,
  '&:hover': {
    background: '#e0e7ff',
  },
};

const Dashboard = () => {
  const {
    downloadProgress,
    cancelDownload,
    clearDownload,
    downloadFile,
    pauseDownload,
    resumeDownload,
    fetchPreviewFileWithProgress,
  } = useFileDownloader();
  const {
    layout,
    switchLayout,
    files,
    folders,
    regularFiles,
    handleDeleteSelected,
    handleDownloadSelected,
    handleSelect,
    handleShareSelected,
    handleUnselectAll,
    selectedIds,
    setSelectedIds,
    setLastSelectedIndex,
    getIndexById,
    onSelectAll,
    onSelectRow,
    dragRef,
    isDragging,
    // uploadProgress,
    // handleCancelUpload,
    // uploadingFiles,
    // showUploadProgress,
    // handleCloseUploadProgress,
    // handleFileUpload,
    // openModal,
    // uploadFilesLoading,
    currentPath,
    navigateToFolderFn,
    getFileIcon,
    deleteModalOpen,
    handleDeleteConfirm,
    itemToDelete,
    removeFileLoading,
    setDeleteModalOpen,
    handleRenameConfirm,
    itemToRename,
    renameFileLoading,
    renameMethods,
    renameModalOpen,
    setRenameModalOpen,
    handleMenuItemClick,
    handleRowDoubleClick,
    closeRemoveFilesModal,
    handleRemoveFilesConfirm,
    removeFilesModalOpen,
    removeFilesLoading,
    handleScroll,
    scrollBoxRef,
    accountId,
    handleAccountTypeChange,
    allIds,
    lastSelectedIndex,
    // loadMoreFiles,
    // pagination,
    accountOptions,
    navigateLoading,
    handleSyncStorage,
    syncCloudStorageLoading,

    isMoveMode,
    // handleMoveSelected,
    handlePasteFiles,
    filesToMove,
    moveFilesLoading,
    isPasteEnabled,
    cancelMoveMode,
    uploadMethods,
    accountOptionsForSFD,
    checkLocation,
    parentId,
    dragDropModalOpen,
    dragDropFiles,
    handleDragDropUpload,
    closeDragDropModal,
    // recentFilesData,
    folderId,
    displayMoveIcon,
    displayDownloadIcon,
    displayShareIcon,
    previewFile,
    previewModalOpen,
    setPreviewFile,
    setPreviewModalOpen,
    previewFileLoading,
    previewProgress,
    previewAbortRef,
    displayPreviewIcon,
    closeMoveModal,
    handleMoveModalConfirm,
    itemsToMove,
    moveModalOpen,
    currentAccountId,
    handleModalMoveSelected,
    loading,
    downloadItems,
    closeDetailsDrawer,
    detailsDrawerOpen,
    selectedItemForDetails,
    detailsFile,
    detailsFileLoading,
    // handleClearFilters,
    // handleModifiedFilter,
    // handleTypeFilter,
    typeFilter,
    modifiedFilter,
    // file upload v2
    showUploadProgressV2,
    uploadingFilesV2,
    cancelUploadV2,
    closeUploadProgressV2,
    handleRemoveUploadedFile,
    // clearAllUploads,

    // Replace old upload handlers
    // handleDragDropUploadV2,
    // uploadFilesHandler,
    connectedAccounts,
    checkConnectedAccDetails,
    // isAutoLoading,
    hasPaginationData,
    // handleRemoveUploadedFile,

    // advance filter
    advancedFilterModalOpen,
    openAdvancedFilterModal,
    closeAdvancedFilterModal,
    handleAdvancedFilter,
    handleAdvancedFilterReset,
    hasFilters,
    // connect error
    connectErrorModalOpen,
    connectErrorMessage,
    closeConnectErrorModal,
    dispatch,
    params,
  } = useDashboard({ downloadFile, fetchPreviewFileWithProgress });

  const {
    openAccountModal,
    isConnectModalOpen,
    closeAccountModal,
    handleConnectAccount,
    methods,
    connectAccountFormData,
    connectAccountLoading,
    loading: connectedAccountLoading,
    handleReAuthenticate,
  } = useSidebar();

  const [socketDataLoading, setSocketDataLoading] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const webhookTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handlerRef = useRef<((data: any) => void) | null>(null);

  // Socket setup with global state management
  useEffect(() => {
    if (!connectedAccounts?.length) return;

    let socket = getSocket();

    if (!socket) {
      socket = initSocket(
        import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3051'
      );
    }

    // Connect if not connected
    if (!socket.connected) {
      connectSocket();
    }

    // Set up connection listener
    const handleConnect = () => {
      // console.log('✅ Socket connected, ready for subscriptions');
      setSocketReady(true);
    };

    const handleDisconnect = () => {
      // console.log('🔴 Socket disconnected');
      setSocketReady(false);
    };

    // Add listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Check if already connected
    if (socket.connected) {
      setSocketReady(true);
    }

    // Cleanup
    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
    };
  }, [connectedAccounts?.length]);

  // Update webhook handler when values change
  useEffect(() => {
    if (!socketReady || !connectedAccounts?.length) {
      return;
    }

    // Create webhook handler with current values
    const webhookHandler = (data: any) => {
      // Clear existing timeout
      if (webhookTimeoutRef.current) {
        clearTimeout(webhookTimeoutRef.current);
      }

      webhookTimeoutRef.current = setTimeout(async () => {
        if (!data?.accountId) {
          return;
        }

        const isSpecificRoute =
          location.pathname.startsWith('/google-drive') ||
          location.pathname.startsWith('/dropbox') ||
          location.pathname.startsWith('/onedrive');

        if (isSpecificRoute) {
          const decryptedParamId = params?.encryptedId
            ? decryptRouteParam(params.encryptedId)
            : null;
          if (String(data.accountId) !== String(decryptedParamId)) {
            return;
          }
        }

        const requestParams: any = {
          ...(folderId && data?.parent_id === folderId && { id: folderId }),
          limit: 20,
          page: 1,
          ...(typeFilter &&
            typeFilter.length && { type: typeFilter.join(',') }),
          ...(modifiedFilter?.after && {
            start_date: dayjs(modifiedFilter.after).format('MM/DD/YYYY'),
          }),
          ...(modifiedFilter?.before && {
            end_date: dayjs(modifiedFilter.before).format('MM/DD/YYYY'),
          }),
        };

        if (isSpecificRoute) {
          requestParams.account_id = data.accountId;
        }

        setSocketDataLoading(true);
        try {
          const result: any = await dispatch(
            initializeCloudStorageFromStorage(requestParams)
          );

          // Trigger auto-load after webhook API response
          if (result?.payload?.payload?.data?.paging) {
            setTimeout(() => {
              checkAutoLoadAfterWebhook(
                result?.payload?.payload?.data?.paging,
                requestParams
              );
            }, 100);
          }
        } catch (error) {
          console.error('❌ Error fetching webhook data:', error);
        } finally {
          setSocketDataLoading(false);
        }
      }, 150);
    };

    // Store handler reference for cleanup
    handlerRef.current = webhookHandler;

    // Subscribe to the event
    subscribeToEvent('webhook_processed', webhookHandler);

    // Cleanup function
    return () => {
      if (webhookTimeoutRef.current) {
        clearTimeout(webhookTimeoutRef.current);
      }
      if (handlerRef.current) {
        unsubscribeFromEvent('webhook_processed', handlerRef.current);
        handlerRef.current = null;
      }
    };
  }, [
    socketReady, // Add this dependency
    connectedAccounts?.length,
    params?.encryptedId,
    currentAccountId,
    location.pathname,
    folderId,
    typeFilter,
    modifiedFilter,
    dispatch,
  ]);

  // Auto-load function using fresh pagination data from API response
  const checkAutoLoadAfterWebhook = async (
    paginationData: any,
    baseParams: any
  ) => {
    if (!scrollBoxRef.current || !paginationData) return;

    const container = scrollBoxRef.current;
    const hasVerticalScrollbar =
      container.scrollHeight > container.clientHeight;

    if (
      !hasVerticalScrollbar &&
      paginationData?.page_no < paginationData?.total_pages
    ) {
      const nextPage = paginationData.page_no + 1;
      const nextParams = { ...baseParams, page: nextPage };

      try {
        const nextResult: any = await dispatch(
          initializeCloudStorageFromStorage(nextParams)
        );

        // Continue auto-loading if still no scrollbar and more pages available
        if (
          nextResult?.payload?.payload?.data?.paging &&
          nextPage < paginationData?.total_pages
        ) {
          setTimeout(() => {
            checkAutoLoadAfterWebhook(
              nextResult?.payload?.payload?.data?.paging,
              baseParams
            );
          }, 100);
        }
      } catch (error) {
        console.error('Auto-load after webhook failed:', error);
      }
    }
  };

  const accountConfigs = useMemo(
    () => ({
      google_drive: {
        icon: <Image src={GoogleDriveIcon} w={14} h={14} />,
        color: 'red',
        label: 'Google Drive',
      },
      dropbox: {
        icon: <Image src={DropboxIcon} w={15} />,
        color: 'blue',
        label: 'Dropbox',
      },
      onedrive: {
        icon: <Image src={OneDriveIcon} w={14} h={14} />,
        color: 'indigo',
        label: 'OneDrive',
      },
    }),
    []
  );

  const { isSm, theme } = useResponsive();
  const { loading: authLoading, hasInitializedAccounts } = useAppSelector(
    state => state.auth
  );

  const isInitialLoading =
    loading ||
    connectedAccountLoading ||
    navigateLoading ||
    syncCloudStorageLoading;

  if (authLoading || !hasInitializedAccounts) {
    return null;
  }

  if (
    !authLoading &&
    hasInitializedAccounts &&
    // !connectedAccountLoading &&
    connectedAccounts?.length === 0
    // &&
    // files?.length === 0 &&
    // !loading
  ) {
    return (
      <>
        <NoConnectedAccount
          {...{
            closeAccountModal,
            connectAccountFormData,
            connectAccountLoading,
            handleConnectAccount,
            isConnectModalOpen,
            methods,
            openAccountModal,
            isSm,
          }}
        />
      </>
    );
  }

  if (checkLocation && checkConnectedAccDetails?.re_authentication_required) {
    return (
      <ReAuthenticateAccount
        account={checkConnectedAccDetails}
        handleReAuthenticate={handleReAuthenticate}
      />
    );
  }

  return (
    <Box>
      <LoaderOverlay
        // visible={navigateLoading || moveFilesLoading || syncCloudStorageLoading}
        visible={moveFilesLoading}
        opacity={1}
      />
      {/* <ScrollArea> */}
      {/* {location.pathname?.startsWith('/dropbox') ? (
        <Text fz={'sm'} fw={500}>
          You are in dropbox account
        </Text>
      ) : location.pathname?.startsWith('/google-drive') ? (
        <Text fz={'sm'} fw={500}>
          You are in google drive account
        </Text>
      ) : location.pathname?.startsWith('/onedrive') ? (
        <Text fz={'sm'} fw={500}>
          You are in onedrive account
        </Text>
      ) : null} */}
      <Box
        // px={32}
        pb={20}
        bg="#f8fafc"
        // ref={dragRef}
        ref={el => {
          dragRef.current = el;
          scrollBoxRef.current = el;
        }}
        style={{
          position: 'relative',
          height: 'calc(100vh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 'calc(100vh - 120px)',
          transition: 'all 0.2s ease-in-out',
          ...(isDragging && {
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }),
        }}
        onScroll={handleScroll}
      >
        {/* Top Row - Toggle and Action Buttons */}
        {/* <Box mt={10}>
          <Group justify="space-between" align="center" gap={20}>
            {connectedAccounts?.length ? (
              <ActionButtons
                {...{
                  openModal,
                  handleSyncStorage,
                }}
              />
            ) : null}
            <Tooltip label="Sync" fz={'xs'}>
                <ActionIcon
                  h={40}
                  w={40}
                  variant="outline"
                  onClick={handleSyncStorage}
                >
                  <ICONS.IconRefresh />
                </ActionIcon>
              </Tooltip>
          </Group>
        </Box> */}

        {/* {recentFilesData?.length && !folderId ? (
          <RecentFiles
            {...{
              recentFiles: recentFilesData,
              isSm,
              isXs,
              allIds,
              getIndexById,
              handleSelect,
              handleUnselectAll,
              isMoveMode,
              lastSelectedIndex,
              selectedIds,
              setLastSelectedIndex,
              setSelectedIds,
              displayDownloadIcon,
              handleMenuItemClick,
              displayShareIcon,
              displayPreviewIcon,
            }}
          />
        ) : null} */}

        {/* Sticky Section */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            ...(files?.length || folders?.length ? { zIndex: 10 } : {}),
            // backgroundColor: '#E5E7EB',
            backgroundColor: '#f6faff',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--mantine-radius-default)',
            padding: '8px 24px',
            zIndex: 10,
            // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            // borderBottom: '1px solid #e5e7eb',
          }}
          // mt={16}
          className="stickey-box"
        >
          {/* <Box> */}
          <Group
            align="center"
            w={'100%'}
            // h={48}
            // h={isSm ? 48 : 'auto'}
            gap={16}
          >
            {/* Left Section - Breadcrumbs */}
            <Box style={{ flexGrow: 1, minWidth: 0 }}>
              <Breadcrumbs
                items={currentPath}
                onNavigate={folderId => {
                  if (!folderId || folderId === null) {
                    navigateToFolderFn(null);
                  } else {
                    const folder = currentPath.find(f => f.id === folderId);
                    if (folder) {
                      navigateToFolderFn(folder);
                    }
                  }
                }}
                checkConnectedAccDetails={checkConnectedAccDetails}
              />
            </Box>

            {/* Center/Right Section - Selection Bar or Controls */}
            {selectedIds?.length > 0 ? (
              <Box style={{ flexShrink: 0 }}>
                <SelectionBar
                  count={selectedIds.length}
                  onCancel={() => {
                    handleUnselectAll();
                    cancelMoveMode();
                  }}
                  onDelete={handleDeleteSelected}
                  onDownload={handleDownloadSelected}
                  onShare={handleShareSelected}
                  onMove={handleModalMoveSelected}
                  onPaste={handlePasteFiles}
                  isMoveMode={isMoveMode}
                  isPasteEnabled={isPasteEnabled()}
                  displayMoveIcon={displayMoveIcon}
                  displayDownloadIcon={displayDownloadIcon}
                  displayShareIcon={
                    selectedIds?.length === 1 && displayShareIcon
                  }
                />
              </Box>
            ) : null}
            {/* ( */}
            {!isSm ? (
              <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
                {/* Filters - Compact Version */}
                {/* {!isXs && ( */}
                {/* <DashboardFilters
                  onTypeFilter={handleTypeFilter}
                  onModifiedFilter={handleModifiedFilter}
                  onClearFilters={handleClearFilters}
                  activeTypeFilter={typeFilter}
                  activeModifiedFilter={modifiedFilter}
                  isMobile={isSm}
                /> */}
                <Tooltip
                  fz={'xs'}
                  label={hasFilters ? 'Filters are active' : 'Open filters'}
                >
                  <ActionIcon
                    size={36}
                    variant={hasFilters ? 'filled' : 'outline'}
                    onClick={openAdvancedFilterModal}
                    style={{
                      borderRadius: '8px',
                      border: hasFilters ? 'none' : '1.5px solid #dadce0',
                      backgroundColor: hasFilters ? '#1c7ed6' : '#ffffff',
                      color: hasFilters ? '#ffffff' : '#5f6368',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: hasFilters
                          ? '0 4px 12px rgba(30, 122, 232, 0.4)'
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <ICONS.IconFilter size={16} />
                  </ActionIcon>
                </Tooltip>
                {/* )} */}

                {/* Account Select - Compact */}
                {!checkLocation && (
                  <Select
                    data={accountOptions}
                    value={accountId}
                    onChange={handleAccountTypeChange}
                    placeholder="Account"
                    w={140}
                    size="sm"
                    styles={{
                      input: {
                        height: '36px',
                        borderRadius: '8px',
                        border: '1.5px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#374151',
                        transition: 'all 0.2s ease',
                        '&:focus': {
                          borderColor: '#1e7ae8',
                          boxShadow: '0 0 0 2px rgba(30, 122, 232, 0.1)',
                        },
                        '&:hover': {
                          borderColor: '#d1d5db',
                        },
                      },
                      dropdown: {
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  />
                )}

                {/* Toggle and Sync */}
                <Group gap={6} wrap="nowrap">
                  <Tooltip label="Sync" fz={'xs'}>
                    <ActionIcon
                      style={{
                        ...iconStyle,
                        width: 36,
                        height: 36,
                        transition: 'transform 0.5s ease',
                        animation: syncCloudStorageLoading
                          ? 'spin 1s linear infinite'
                          : 'none',
                      }}
                      onClick={handleSyncStorage}
                    >
                      <ICONS.IconRefresh size={16} />
                      <style>
                        {`
                        @keyframes spin {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(180deg); }
                        }
                      `}
                      </style>
                    </ActionIcon>
                  </Tooltip>

                  <CustomToggle
                    value={layout}
                    onChange={(value: 'list' | 'grid') => switchLayout(value)}
                  />
                </Group>
              </Group>
            ) : null}
            {/* )} */}
          </Group>

          {isSm ? (
            <Group gap={8} wrap="nowrap" mt={10} style={{ flexShrink: 0 }}>
              {/* Filters - Compact Version */}
              {/* {!isXs && ( */}
              {/* <DashboardFilters
                onTypeFilter={handleTypeFilter}
                onModifiedFilter={handleModifiedFilter}
                onClearFilters={handleClearFilters}
                activeTypeFilter={typeFilter}
                activeModifiedFilter={modifiedFilter}
                isMobile={isSm}
              /> */}
              <Tooltip
                fz={'xs'}
                label={hasFilters ? 'Filters are active' : 'Open filters'}
              >
                <ActionIcon
                  size={36}
                  variant={hasFilters ? 'filled' : 'outline'}
                  onClick={openAdvancedFilterModal}
                  style={{
                    borderRadius: '8px',
                    border: hasFilters ? 'none' : '1.5px solid #dadce0',
                    backgroundColor: hasFilters ? '#1c7ed6' : '#ffffff',
                    color: hasFilters ? '#ffffff' : '#5f6368',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: hasFilters
                        ? '0 4px 12px rgba(30, 122, 232, 0.4)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <ICONS.IconFilter size={16} />
                </ActionIcon>
              </Tooltip>
              {/* )} */}

              {/* Account Select - Compact */}
              {!checkLocation && (
                <Select
                  data={accountOptions}
                  value={accountId}
                  onChange={handleAccountTypeChange}
                  placeholder="Account"
                  w={140}
                  size="sm"
                  styles={{
                    input: {
                      height: '36px',
                      borderRadius: '8px',
                      border: '1.5px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#374151',
                      transition: 'all 0.2s ease',
                      '&:focus': {
                        borderColor: '#1e7ae8',
                        boxShadow: '0 0 0 2px rgba(30, 122, 232, 0.1)',
                      },
                      '&:hover': {
                        borderColor: '#d1d5db',
                      },
                    },
                    dropdown: {
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                />
              )}

              {/* Toggle and Sync */}
              <Group gap={6} wrap="nowrap">
                <Tooltip label="Sync" fz={'xs'}>
                  <ActionIcon
                    style={{
                      ...iconStyle,
                      width: 36,
                      height: 36,
                      transition: 'transform 0.5s ease',
                      animation: syncCloudStorageLoading
                        ? 'spin 1s linear infinite'
                        : 'none',
                    }}
                    onClick={handleSyncStorage}
                  >
                    <ICONS.IconRefresh size={16} />
                    <style>
                      {`
                        @keyframes spin {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(180deg); }
                        }
                      `}
                    </style>
                  </ActionIcon>
                </Tooltip>

                <CustomToggle
                  value={layout}
                  onChange={(value: 'list' | 'grid') => switchLayout(value)}
                />
              </Group>
            </Group>
          ) : null}
          {/* <Box mt={10}>
            {selectedIds?.length > 0 ? (
              <Box style={{ flexGrow: 1 }}>
                <SelectionBar
                  count={selectedIds.length}
                  onCancel={() => {
                    handleUnselectAll();
                    cancelMoveMode();
                  }}
                  onDelete={handleDeleteSelected}
                  onDownload={handleDownloadSelected}
                  onShare={handleShareSelected}
                  // onMove={handleMoveSelected}
                  onMove={handleModalMoveSelected}
                  onPaste={handlePasteFiles}
                  isMoveMode={isMoveMode}
                  isPasteEnabled={isPasteEnabled()}
                  displayMoveIcon={displayMoveIcon}
                  displayDownloadIcon={displayDownloadIcon}
                  displayShareIcon={
                    selectedIds?.length === 1 && displayShareIcon
                  }
                />
              </Box>
            ) : !isXs ? (
              <Box
                style={{
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  // background: 'rgba(255, 255, 255, 0.75)',
                  // backdropFilter: 'blur(8px)',
                  borderRadius: 9999,
                  margin: 'auto',
                  // boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  // border: '1px solid rgba(200, 200, 200, 0.4)',
                  transition: 'opacity 0.25s ease, transform 0.25s ease',
                }}
                h={40}
              >
                <DashboardFilters
                  onTypeFilter={handleTypeFilter}
                  onModifiedFilter={handleModifiedFilter}
                  onClearFilters={handleClearFilters}
                  activeTypeFilter={typeFilter}
                  activeModifiedFilter={modifiedFilter}
                  isMobile={isSm}
                />
              </Box>
            ) : null}
          </Box> */}
          {/* </Box> */}

          <DragDropOverlay
            isDragging={isDragging}
            message="Drop files here to upload"
            subMessage="Upload up to 5 files"
          />
        </Box>
        {isInitialLoading && hasPaginationData && !socketDataLoading ? (
          layout === 'list' ? (
            <FileTableSkeleton />
          ) : (
            <Card>
              <FileGridSkeleton />
            </Card>
          )
        ) : layout === 'list' ? (
          <>
            <FileTable
              {...{
                files,
                handleSelect,
                onSelectAll,
                onSelectRow,
                selectedIds,
                currentPath,
                handleMenuItemClick,
                handleRowDoubleClick,
                handleUnselectAll,
                filesToMove,
                isMoveMode,
                parentId,
                checkLocation,
                folderId,
              }}
            />
            {/* {pagination && pagination.page_no < pagination.total_pages ? (
              <Button
                mt={20}
                onClick={loadMoreFiles}
                loading={isAutoLoading}
                disabled={isAutoLoading}
              >
                {isAutoLoading ? 'Auto Loading...' : 'Load More'}
              </Button>
            ) : null} */}
          </>
        ) : (
          <>
            <FileGrid
              {...{
                files: regularFiles,
                handleSelect,
                selectedIds,
                folders,
                handleUnselectAll,
                getIndexById,
                setLastSelectedIndex,
                setSelectedIds,
                handleMenuItemClick,
                handleRowDoubleClick,
                allIds,
                lastSelectedIndex,
                filesToMove,
                isMoveMode,
                parentId,
                displayDownloadIcon,
                displayShareIcon,
                displayMoveIcon,
                displayPreviewIcon,
              }}
            />
            {/* {pagination && pagination.page_no < pagination.total_pages ? (
              <Button
                mt={20}
                onClick={loadMoreFiles}
                loading={isAutoLoading}
                disabled={isAutoLoading}
              >
                {isAutoLoading ? 'Auto Loading...' : 'Load More'}
              </Button>
            ) : null} */}
          </>
        )}
      </Box>
      {/* </ScrollArea> */}
      {/* {showUploadProgress ? (
        <UploadProgress
          uploadProgress={uploadProgress}
          uploadingFiles={uploadingFiles}
          onCancelUpload={handleCancelUpload}
          onClose={handleCloseUploadProgress}
        />
      ) : null} */}

      {/* delete file/folder modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.type === 'folder' ? 'Folder' : 'File'}`}
        className="delete-file-folder-modal"
      >
        <Text mb="md">
          Are you sure you want to delete this{' '}
          {itemToDelete?.type === 'folder' ? 'folder' : 'file'} "
          <span style={{ fontWeight: 600 }}>{itemToDelete?.name}"</span>{' '}
          {itemToDelete?.UserConnectedAccount?.account_name && (
            <>
              from "
              <span style={{ fontWeight: 600 }}>
                {itemToDelete?.UserConnectedAccount?.account_name}
              </span>
              "
            </>
          )}
          ?
          {itemToDelete?.type === 'folder' &&
            ' All contents will be deleted permanently.'}
        </Text>
        <Group>
          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(false)}
            disabled={removeFileLoading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteConfirm}
            loading={removeFileLoading}
            disabled={removeFileLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Remove multiple files modal*/}
      <Modal
        opened={removeFilesModalOpen}
        onClose={closeRemoveFilesModal}
        title={`Remove items`}
        className="delete-file-folder-modal"
      >
        <Text mb="md">
          Are you sure you want to remove items? All contents will be deleted
          permanently.
        </Text>
        <Group>
          <Button
            variant="outline"
            onClick={() => closeRemoveFilesModal()}
            disabled={removeFileLoading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleRemoveFilesConfirm}
            loading={removeFilesLoading}
            disabled={removeFilesLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      {/* rename file/folder modal */}
      <Modal
        opened={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={`Rename ${itemToRename?.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'File'}`}
      >
        <Form methods={renameMethods} onSubmit={handleRenameConfirm}>
          <Stack gap="md">
            <TextInput
              placeholder={`${itemToRename?.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'File'} name`}
              label={`${itemToRename?.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'File'} Name`}
              {...renameMethods.register('newName')}
              error={renameMethods.formState.errors.newName?.message}
              withAsterisk
            />
            <Button
              type="submit"
              loading={renameFileLoading}
              maw={150}
              disabled={!renameMethods.formState.isValid || renameFileLoading}
            >
              Rename
            </Button>
          </Stack>
        </Form>
      </Modal>

      {/* Drag & Drop Upload Modal - shown when files are dragged without SFD enabled */}
      <Modal
        opened={dragDropModalOpen}
        onClose={closeDragDropModal}
        title="Upload Dragged Files"
      >
        <Form onSubmit={handleDragDropUpload} methods={uploadMethods}>
          <Stack gap={'md'}>
            <Text size="sm" c="dimmed" mb="xs">
              {dragDropFiles.length} file{dragDropFiles.length > 1 ? 's' : ''}{' '}
              selected for upload (max 5 files) :
            </Text>
            <Controller
              control={uploadMethods.control}
              name="accountId"
              render={({ field }) => {
                const selectedOption = accountOptionsForSFD.find(
                  option => option.value === field.value
                );

                return (
                  <Autocomplete
                    label="Select Account"
                    placeholder="Choose an account"
                    data={accountOptionsForSFD}
                    value={selectedOption ? selectedOption.label : ''}
                    leftSection={
                      selectedOption && 'accountType' in selectedOption ? (
                        <Box
                          mt={
                            selectedOption?.accountType === 'dropbox' ? 0 : -2
                          }
                        >
                          {
                            accountConfigs[
                              selectedOption.accountType as keyof typeof accountConfigs
                            ]?.icon
                          }
                        </Box>
                      ) : null
                    }
                    onChange={value => {
                      const matchedOption = accountOptionsForSFD.find(
                        option =>
                          option.label === value || option.value === value
                      );
                      field.onChange(matchedOption ? matchedOption.value : '');
                    }}
                    error={uploadMethods.formState.errors.accountId?.message}
                    required
                    renderOption={({ option }: any) => {
                      if ('accountType' in option) {
                        const config =
                          accountConfigs[
                            option.accountType as keyof typeof accountConfigs
                          ];
                        return (
                          <Group gap="sm">
                            <Box
                              mt={option?.accountType === 'dropbox' ? 0 : -2}
                            >
                              {config?.icon}
                            </Box>
                            <Text fz="sm">{option.label}</Text>
                          </Group>
                        );
                      }

                      return <Text fz="sm">{option.label}</Text>;
                    }}
                  />
                );
              }}
            />
            <Box
              style={{
                maxHeight: '250px',
                overflowY: 'auto',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
              }}
            >
              {dragDropFiles?.slice(0, 5).map((file, index) => {
                const isImage = file.type.startsWith('image/');
                return (
                  <Group key={index} gap={'md'} mt={index > 0 ? 15 : 0}>
                    <Box
                      style={{
                        width: rem(60),
                        height: rem(60),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: rem(4),
                        backgroundColor: theme.colors.gray[0],
                        flexShrink: 0,
                        marginRight: rem(12),
                      }}
                    >
                      {isImage ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover',
                          }}
                          alt={file.name}
                        />
                      ) : (
                        getFileIcon({
                          entry_type: file.type,
                          mime_type: file.type,
                          file_extension: file.type,
                          name: file.name,
                        })(40)
                      )}
                    </Box>
                    <Text size="sm" style={{ marginBottom: '4px' }}>
                      📄 {file.name} ({formatFileSize(file.size.toString())})
                    </Text>
                  </Group>
                );
              })}
              {dragDropFiles.length > 5 ? (
                <Text size="sm" c="red" mt="md">
                  Only the first 5 files will be uploaded.
                </Text>
              ) : null}
            </Box>

            <Button
              type="submit"
              // loading={uploadFilesLoading}
              disabled={
                dragDropFiles.length === 0 ||
                // uploadFilesLoading ||
                !uploadMethods.formState.isValid
              }
            >
              Upload Files
            </Button>
          </Stack>
        </Form>
      </Modal>

      {/* Preview Modal */}
      {/* <FilePreviewModal
        {...{
          previewFile,
          previewFileLoading,
          previewModalOpen,
          setPreviewFile,
          setPreviewModalOpen,
        }}
      /> */}

      <FullScreenPreview
        previewFile={previewFile}
        previewFileLoading={previewFileLoading}
        previewModalOpen={previewModalOpen}
        setPreviewModalOpen={setPreviewModalOpen}
        setPreviewFile={setPreviewFile}
        previewProgress={previewProgress}
        previewAbortRef={previewAbortRef}
        onDownload={() => {
          if (previewFile && files.find(f => f.name === previewFile.name)) {
            const fileToDownload = files.find(f => f.name === previewFile.name);
            if (fileToDownload) {
              downloadItems([fileToDownload.id]);
            }
          }
        }}
        onShare={() => {
          if (previewFile && files.find(f => f.name === previewFile.name)) {
            const fileToShare = files.find(f => f.name === previewFile.name);
            if (fileToShare?.web_view_url) {
              window.open(fileToShare.web_view_url, '_blank');
            }
          }
        }}
      />

      {/* Move Modal */}
      <MoveModal
        opened={moveModalOpen}
        onClose={closeMoveModal}
        selectedItems={itemsToMove}
        onMoveConfirm={handleMoveModalConfirm}
        currentFolderId={folderId}
        checkLocation={checkLocation}
        accountId={accountId!}
        currentAccountId={currentAccountId!}
      />

      {/* File Details Drawer */}
      <FileDetailsDrawer
        opened={detailsDrawerOpen}
        onClose={closeDetailsDrawer}
        item={selectedItemForDetails}
        onNavigateToFolder={navigateToFolderFn}
        detailsFile={detailsFile}
        detailsFileLoading={detailsFileLoading}
        onPreview={item => {
          handleMenuItemClick('preview', item);
          // closeDetailsDrawer();
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

      {showUploadProgressV2 ? (
        <UploadProgressV2
          uploadingFiles={uploadingFilesV2}
          onCancelUpload={cancelUploadV2}
          onRemoveFile={handleRemoveUploadedFile as any}
          onClose={closeUploadProgressV2}
        />
      ) : null}
      <AdvancedFiltersModal
        opened={advancedFilterModalOpen}
        onClose={closeAdvancedFilterModal}
        onFilter={handleAdvancedFilter}
        onReset={handleAdvancedFilterReset}
        activeTypeFilter={typeFilter}
        activeModifiedFilter={modifiedFilter}
      />

      {/* Connect Error Modal */}
      <Modal
        opened={connectErrorModalOpen}
        onClose={closeConnectErrorModal}
        centered
        radius="lg"
        transitionProps={{ transition: 'fade', duration: 300 }}
        // overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        title="Connect Account Error"
      >
        <Text size="sm" mb="md" c="red" fw={500}>
          {connectErrorMessage}
        </Text>
        <Group justify="flex-end">
          <Button onClick={closeConnectErrorModal} color="red" radius="md">
            Close
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default Dashboard;
