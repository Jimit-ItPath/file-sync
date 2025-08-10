import { Group, Box, Text, Stack, ActionIcon, TextInput } from '@mantine/core';
import { Button, Card, Form, Menu, Modal, Tooltip } from '../../../components';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import useRecentFiles from './use-recent-files';
import { LoaderOverlay } from '../../../components/loader';
import FilePreviewModal from './FilePreviewModal';
import DownloadProgress from './DownloadProgress';
import useFileDownloader from './use-file-downloader';

const FILE_CARD_HEIGHT = 220;
const MIN_CARD_WIDTH = 240;

const selectedCardStyle = {
  border: '2px solid #3b82f6',
  boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
};

const MENU_ITEMS: [
  { id: string; label: string; icon: React.FC; color?: string },
] = [{ id: 'rename', label: 'Rename', icon: ICONS.IconEdit }];

const RecentFiles = () => {
  const { isXs, isSm } = useResponsive();
  const { downloadProgress, cancelDownload, clearDownload, downloadFile } =
    useFileDownloader();
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
        !target.closest('.stickey-box')
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
    <Stack
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
      onClick={handleStackClick}
      ref={stackRef}
      mt={10}
    >
      <LoaderOverlay visible={loading} opacity={1} />
      <Box mt={10} mb={32}>
        <Group justify="space-between" mb={16}>
          <Text fw={700} fz="md" c="gray.9">
            Recent Files
          </Text>
          {/* <Button
        variant="subtle"
        color="blue"
        size="xs"
        style={{ fontWeight: 500 }}
      >
        View All
      </Button> */}
        </Group>
        <Card>
          {recentFiles.length > 0 ? (
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
                    // flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#f6faff',
                    border: '1px solid #e5e7eb',
                    height: FILE_CARD_HEIGHT,
                    ...(selectedIds.includes(file.id) ? selectedCardStyle : {}),
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
                    //   handleRowDoubleClick(file);
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
                      <Tooltip label={file.name} withArrow={false} fz={'xs'}>
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
                    {file.icon(isXs ? 50 : 60)}
                    {/* {file.preview ? (
                              <Image
                                src={file.preview}
                                alt={file.name}
                                radius="md"
                                fit="cover"
                                h={180}
                                w="100%"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Box
                                style={{
                                  width: '100%',
                                  height: 120,
                                  background: '#e5e7eb',
                                  borderRadius: 8,
                                }}
                              />
                            )} */}
                  </Box>
                  <Group justify="space-between" mt={8}>
                    <Text size="xs" c="gray.6">
                      {file.lastModified}
                    </Text>
                    <Text size="xs" c="gray.6">
                      {file.size}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Box>
          ) : (
            <Box style={{ minWidth: '100%', overflowX: 'auto' }}>
              <Text py="xl" c="dimmed" style={{ textAlign: 'center' }}>
                No files available.
              </Text>
            </Box>
          )}
        </Card>
      </Box>

      {/* delete file/folder modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.type === 'folder' ? 'Folder' : 'File'}`}
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
      <FilePreviewModal
        {...{
          previewFile,
          previewFileLoading,
          previewModalOpen,
          setPreviewFile,
          setPreviewModalOpen,
        }}
      />

      {downloadProgress && (
        <DownloadProgress
          downloadProgress={downloadProgress}
          onCancelDownload={cancelDownload}
          onClose={clearDownload}
        />
      )}
    </Stack>
  );
};

export default RecentFiles;
