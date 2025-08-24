import { Group, Box, Text, Stack, ActionIcon, TextInput } from '@mantine/core';
import {
  Button,
  Card,
  Form,
  Menu,
  Modal,
  SelectionBar,
  Tooltip,
} from '../../../components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import useRecentFiles from './use-recent-files';
import DownloadProgress from './DownloadProgress';
import useFileDownloader from './use-file-downloader';
import FileDetailsDrawer from './FileDetailsDrawer';
import FullScreenPreview from './FullScreenPreview';
import { formatDate, formatDateAndTime } from '../../../utils/helper';
import FileGridSkeleton from '../../../components/skeleton/FileGridSkeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import AdvancedFiltersModal from './AdvancedFiltersModal';

const FILE_CARD_HEIGHT = 200;
const MIN_CARD_WIDTH = 220;

const selectedCardStyle = {
  border: '2px solid #3b82f6',
  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
};

const MENU_ITEMS: {
  id: string;
  label: string;
  icon: React.FC;
  color?: string;
}[] = [
  { id: 'rename', label: 'Rename', icon: ICONS.IconEdit },
  { id: 'details', label: 'Details', icon: ICONS.IconInfoSquareRounded },
];

const RecentFiles = () => {
  const { isXs, isSm } = useResponsive();
  const {
    downloadProgress,
    cancelDownload,
    clearDownload,
    downloadFile,
    pauseDownload,
    resumeDownload,
  } = useFileDownloader();
  const {
    loading,
    selectedIds,
    setSelectedIds,
    setLastSelectedIndex,
    handleSelect,
    handleUnselectAll,
    getIndexById,

    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    removeFileLoading,
    handleDeleteConfirm,
    removeFilesModalOpen,
    removeFilesLoading,
    handleDeleteSelected,
    handleDownloadSelected,
    handleShareSelected,

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
    recentFiles,
    displayDownloadIcon,
    displayShareIcon,

    // preview
    previewModalOpen,
    setPreviewModalOpen,
    previewFile,
    setPreviewFile,
    previewFileLoading,
    displayPreviewIcon,

    closeDetailsDrawer,
    detailsDrawerOpen,
    selectedItemForDetails,
    detailsFile,
    detailsFileLoading,
    downloadItems,
    scrollBoxRef,
    // infinite scroll
    loadMoreFiles,
    hasMore,
    openAdvancedFilterModal,
    closeAdvancedFilterModal,
    typeFilter,
    modifiedFilter,
    advancedFilterModalOpen,
    hasFilters,
    handleAdvancedFilter,
    handleAdvancedFilterReset,
  } = useRecentFiles({ downloadFile });
  const responsiveIconSize = isXs ? 16 : isSm ? 20 : 24;
  const responsiveFontSize = isXs ? 'xs' : 'sm';
  const [columnsCount, setColumnsCount] = useState(2);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumnsCount = () => {
      if (stackRef.current) {
        const containerWidth = stackRef.current.offsetWidth;
        const newColumnsCount = Math.max(
          2,
          Math.floor(containerWidth / MIN_CARD_WIDTH)
        );
        setColumnsCount(newColumnsCount);
      }
    };

    updateColumnsCount();
    window.addEventListener('resize', updateColumnsCount);
    return () => window.removeEventListener('resize', updateColumnsCount);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        stackRef.current &&
        !stackRef.current.contains(target) &&
        !target.closest('.stickey-box') &&
        !target.closest('.delete-file-folder-modal')
      ) {
        handleUnselectAll();
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleUnselectAll]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!selectedIds.length) return;

      const currentIdx =
        lastSelectedIndex ?? getIndexById(selectedIds[selectedIds.length - 1]);
      let nextIdx = currentIdx;

      if (event.shiftKey) {
        if (event.key === 'ArrowDown') {
          nextIdx = Math.min(
            Number(currentIdx) + columnsCount,
            allIds.length - 1
          );
        } else if (event.key === 'ArrowUp') {
          nextIdx = Math.max(Number(currentIdx) - columnsCount, 0);
        } else if (event.key === 'ArrowRight') {
          nextIdx = Math.min(Number(currentIdx) + 1, allIds.length - 1);
        } else if (event.key === 'ArrowLeft') {
          nextIdx = Math.max(Number(currentIdx) - 1, 0);
        }
        if (nextIdx !== currentIdx) {
          const rangeStart =
            selectedIds.length === 1
              ? currentIdx
              : getIndexById(selectedIds[0]);
          const start = Math.min(Number(rangeStart), Number(nextIdx));
          const end = Math.max(Number(rangeStart), Number(nextIdx));
          const rangeIds = allIds.slice(start, end + 1);
          setSelectedIds(rangeIds);
          setLastSelectedIndex(Number(nextIdx));
        }
      }
    },
    [selectedIds, lastSelectedIndex, allIds, getIndexById, columnsCount]
  );

  const handleStackClick = (_: React.MouseEvent<HTMLDivElement>) => {
    handleUnselectAll();
  };

  const filteredMenuItems = useMemo(() => {
    const menuItems = [...MENU_ITEMS];
    if (displayDownloadIcon) {
      menuItems.push({
        id: 'download',
        label: 'Download',
        icon: ICONS.IconDownload,
      });
    }
    if (displayPreviewIcon) {
      menuItems.push({
        id: 'preview',
        label: 'Preview',
        icon: ICONS.IconLiveView,
      });
    }
    if (displayShareIcon) {
      menuItems.push({
        id: 'share',
        label: 'Share',
        icon: ICONS.IconShare,
      });
    }
    menuItems.push({
      id: 'delete',
      label: 'Delete',
      icon: ICONS.IconTrash,
      color: 'red',
    });
    return menuItems;
  }, [displayDownloadIcon, displayShareIcon, displayPreviewIcon]);

  return (
    <Box>
      <Box
        pb={20}
        bg="#f8fafc"
        ref={scrollBoxRef}
        style={{
          position: 'relative',
          height: 'calc(100vh - 100px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 'calc(100vh - 120px)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Sticky Section */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            ...(recentFiles?.length ? { zIndex: 10 } : {}),
            backgroundColor: '#f6faff',
            border: '1px solid #e5e7eb',
            borderRadius: 'var(--mantine-radius-default)',
            padding: '8px 24px',
            zIndex: 10,
          }}
          // mt={16}
          className="stickey-box"
        >
          <Group
            align={isXs ? 'start' : 'center'}
            w={'100%'}
            h={isXs ? 'auto' : 48}
            gap={16}
            style={{ flexDirection: isXs ? 'column' : 'row' }}
          >
            <Text fw={700} fz="md" c="gray.9">
              Recent Files
            </Text>
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
            <Box flex={isXs ? 1 : 2} w={isXs ? '100%' : 'max-content'}>
              {selectedIds.length > 0 ? (
                <SelectionBar
                  count={selectedIds.length}
                  onCancel={() => {
                    handleUnselectAll();
                  }}
                  onDelete={handleDeleteSelected}
                  onDownload={handleDownloadSelected}
                  onShare={handleShareSelected}
                  onMove={() => {}}
                  onPaste={() => {}}
                  isMoveMode={false}
                  isPasteEnabled={false}
                  displayMoveIcon={false}
                  displayDownloadIcon={displayDownloadIcon}
                  displayShareIcon={
                    selectedIds?.length === 1 && displayShareIcon
                  }
                />
              ) : null}
            </Box>
          </Group>
        </Box>
        <Stack
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{ outline: 'none' }}
          onClick={handleStackClick}
          ref={stackRef}
        >
          <Card>
            {loading && !recentFiles?.length ? (
              <FileGridSkeleton includeFolders={false} />
            ) : recentFiles.length > 0 ? (
              <InfiniteScroll
                dataLength={recentFiles.length}
                next={loadMoreFiles}
                hasMore={hasMore}
                loader={null}
                // loader={
                //   <FileGridSkeleton includeFolders={false} />
                //   // <Box style={{ textAlign: 'center', padding: '20px' }}>
                //   //   <Text size="sm" c="dimmed">
                //   //     Loading more files...
                //   //   </Text>
                //   // </Box>
                // }
                scrollableTarget={scrollBoxRef.current as any}
                scrollThreshold={0.8}
                style={{ overflow: 'hidden' }}
              >
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
                    gap: '20px',
                  }}
                  mt={20}
                >
                  {recentFiles.map(file => (
                    <Card
                      key={file.id}
                      radius="md"
                      shadow="sm"
                      p="md"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        background: '#f6faff',
                        border: '1px solid #e5e7eb',
                        height: FILE_CARD_HEIGHT,
                        ...(selectedIds.includes(file.id)
                          ? selectedCardStyle
                          : {}),
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s ease',
                        userSelect: 'none',
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleSelect(file.id, e);
                      }}
                      onDoubleClick={(e: any) => {
                        e.stopPropagation();
                        handleMenuItemClick('preview', file);
                      }}
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        mb={8}
                        style={{ flexWrap: 'nowrap' }}
                      >
                        <Group gap={8} flex={1} miw={0} align="center">
                          {file.icon(responsiveIconSize)}
                          <Tooltip
                            label={file.name}
                            withArrow={false}
                            fz={'xs'}
                          >
                            <Text
                              fw={600}
                              fz={responsiveFontSize}
                              flex={1}
                              truncate
                              miw={0}
                            >
                              {file.name}
                            </Text>
                          </Tooltip>
                        </Group>
                        <Menu
                          items={filteredMenuItems}
                          onItemClick={actionId =>
                            handleMenuItemClick(actionId, file)
                          }
                        >
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            style={{ flexShrink: 0 }}
                          >
                            <ICONS.IconDotsVertical size={18} />
                          </ActionIcon>
                        </Menu>
                      </Group>
                      <Box
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 8,
                          marginTop: 8,
                        }}
                      >
                        {file.icon(50)}
                      </Box>
                      <Group justify="space-between" mt={8}>
                        <Text size="xs" c="gray.6">
                          {file.lastModified ? (
                            <Tooltip
                              label={formatDateAndTime(file.lastModified)}
                              fz={'xs'}
                            >
                              <Text size="xs">
                                {formatDate(file.lastModified)}
                              </Text>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </Text>
                        <Text size="xs" c="gray.6">
                          {file.size}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </Box>
              </InfiniteScroll>
            ) : (
              <Box style={{ minWidth: '100%', overflowX: 'auto' }}>
                <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
                  No files available.
                </Text>
              </Box>
            )}
          </Card>
        </Stack>
      </Box>

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
          {itemToDelete?.name}"{' '}
          {itemToDelete?.UserConnectedAccount?.account_name
            ? `from "${itemToDelete?.UserConnectedAccount?.account_name}"`
            : ''}
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

      {/* Preview Modal */}
      <FullScreenPreview
        previewFile={previewFile}
        previewFileLoading={previewFileLoading}
        previewModalOpen={previewModalOpen}
        setPreviewModalOpen={setPreviewModalOpen}
        setPreviewFile={setPreviewFile}
        onDownload={() => {
          if (
            previewFile &&
            recentFiles.find(f => f.name === previewFile.name)
          ) {
            const fileToDownload = recentFiles.find(
              f => f.name === previewFile.name
            );
            if (fileToDownload) {
              downloadItems([fileToDownload.id]);
            }
          }
        }}
        onShare={() => {
          if (
            previewFile &&
            recentFiles.find(f => f.name === previewFile.name)
          ) {
            const fileToShare = recentFiles.find(
              f => f.name === previewFile.name
            );
            if (fileToShare?.web_view_url) {
              window.open(fileToShare.web_view_url, '_blank');
            }
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

      {/* File Details Drawer */}
      <FileDetailsDrawer
        opened={detailsDrawerOpen}
        onClose={closeDetailsDrawer}
        item={selectedItemForDetails}
        onPreview={item => {
          handleMenuItemClick('preview', item);
        }}
        detailsFile={detailsFile}
        detailsFileLoading={detailsFileLoading}
      />

      <AdvancedFiltersModal
        opened={advancedFilterModalOpen}
        onClose={closeAdvancedFilterModal}
        onFilter={handleAdvancedFilter}
        onReset={handleAdvancedFilterReset}
        activeTypeFilter={typeFilter}
        activeModifiedFilter={modifiedFilter}
      />
    </Box>
  );
};

export default RecentFiles;
