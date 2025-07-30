import { Box, Group, Stack, Text, TextInput } from '@mantine/core';
import ActionButtons from '../dashboard/components/ActionButtons';
import FileTable from '../dashboard/components/FileTable';
import {
  Breadcrumbs,
  Button,
  Dropzone,
  Form,
  Modal,
  SelectionBar,
} from '../../components';
import FileGrid from '../dashboard/components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
import UploadProgress from '../dashboard/components/UploadProgress';
import useSidebar from '../../layouts/dashboard-layout/navbar/use-sidebar';
import CustomToggle from '../dashboard/components/CustomToggle';
import useDropbox from './use-dropbox';
import { LoaderOverlay } from '../../components/loader';

const controlBoxStyles = {
  height: 40,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 6,
};

const Dropbox = () => {
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
    uploadProgress,
    handleCancelUpload,
    uploadingFiles,
    showUploadProgress,
    handleCloseUploadProgress,
    closeModal,
    createFolderLoading,
    handleCreateFolder,
    handleFileUpload,
    openModal,
    uploadFilesLoading,
    currentPath,
    navigateToFolderFn,
    modalOpen,
    modalType,
    folderMethods,
    setUploadedFiles,
    uploadedFiles,
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
    handleSearchChange,
    searchTerm,
    allIds,
    lastSelectedIndex,
    loadMoreFiles,
    pagination,
    navigateLoading,

    isMoveMode,
    handleMoveSelected,
    handlePasteFiles,
    filesToMove,
    moveFilesLoading,
    isPasteEnabled,
    cancelMoveMode,
    handleSyncStorage,
    syncDropboxLoading,
    parentId,
  } = useDropbox();
  const { connectedAccounts } = useSidebar();

  // if (loading) return <LoaderOverlay visible={loading} opacity={1} />;

  return (
    <Box>
      <LoaderOverlay
        visible={navigateLoading || moveFilesLoading || syncDropboxLoading}
        opacity={1}
      />
      <Box
        px={32}
        pb={20}
        bg="#f8fafc"
        // ref={dragRef}
        ref={el => {
          dragRef.current = el;
          scrollBoxRef.current = el;
        }}
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          // minHeight: 'calc(100vh - 120px)',
          transition: 'all 0.2s ease-in-out',
          ...(isDragging && {
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }),
        }}
        onScroll={handleScroll}
      >
        {/* Sticky Section */}
        <Box
          style={{
            position: 'sticky',
            top: 0,
            ...(files?.length || folders?.length ? { zIndex: 5 } : {}),
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid #e5e7eb',
          }}
          className="stickey-box"
        >
          <DragDropOverlay
            isDragging={isDragging}
            message="Drop files here to upload"
            subMessage="Support for PDF, DOC, XLS, PPT, images and more"
          />
          {connectedAccounts?.length ? (
            <ActionButtons
              {...{
                currentPath,
                navigateToFolderFn,
                openModal,
                handleSyncStorage,
              }}
            />
          ) : null}
          {/* <RecentFiles /> */}
          <Group mb={20} align="center" style={{ width: '100%' }}>
            {selectedIds.length > 0 ? (
              <Box style={{ ...controlBoxStyles, flex: 1, marginRight: 12 }}>
                <SelectionBar
                  count={selectedIds.length}
                  onCancel={() => {
                    handleUnselectAll();
                    cancelMoveMode();
                  }}
                  onDelete={handleDeleteSelected}
                  onDownload={handleDownloadSelected}
                  onShare={handleShareSelected}
                  onMove={handleMoveSelected}
                  onPaste={handlePasteFiles}
                  isMoveMode={isMoveMode}
                  isPasteEnabled={isPasteEnabled()}
                />
              </Box>
            ) : (
              <Box style={{ flex: 1, marginRight: 12 }} />
            )}
            <CustomToggle
              value={layout}
              onChange={(value: 'list' | 'grid') => switchLayout(value)}
            />
          </Group>
          <Group align="center" w={'100%'} mt={16}>
            <Box style={{ flexGrow: 1 }}>
              <Breadcrumbs
                items={currentPath}
                onNavigate={folder => {
                  if (!folder || folder.id === null) {
                    navigateToFolderFn(null);
                  } else {
                    navigateToFolderFn({ id: folder.id, name: folder.name });
                  }
                }}
              />
            </Box>
            <TextInput
              placeholder="Search files..."
              value={searchTerm}
              onChange={event => handleSearchChange(event.currentTarget.value)}
              maw={300}
              w={'100%'}
            />
          </Group>
        </Box>
        {layout === 'list' ? (
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
            }}
          />
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
              }}
            />
            {pagination && pagination.page_no < pagination.total_pages ? (
              <Button mt={20} onClick={loadMoreFiles}>
                Load More
              </Button>
            ) : null}
          </>
        )}
      </Box>
      {showUploadProgress ? (
        <UploadProgress
          uploadProgress={uploadProgress}
          uploadingFiles={uploadingFiles}
          onCancelUpload={handleCancelUpload}
          onClose={handleCloseUploadProgress}
        />
      ) : null}

      {/* Create folder / upload file modal */}
      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={modalType === 'folder' ? 'Create New Folder' : 'Upload Files'}
      >
        {modalType === 'folder' ? (
          <Form methods={folderMethods} onSubmit={handleCreateFolder}>
            <Stack gap="md">
              <TextInput
                placeholder="Folder name"
                label="Folder Name"
                {...folderMethods.register('folderName')}
                error={folderMethods.formState.errors.folderName?.message}
                withAsterisk
              />
              <Button
                type="submit"
                loading={createFolderLoading}
                disabled={
                  !folderMethods.formState.isValid || createFolderLoading
                }
                maw={150}
              >
                Create Folder
              </Button>
            </Stack>
          </Form>
        ) : (
          <>
            <Dropzone
              onFilesSelected={setUploadedFiles}
              // maxSize={5 * 1024 ** 2}
              // multiple={false}
              multiple={true}
              mb="md"
              getFileIcon={getFileIcon}
              files={uploadedFiles}
            />
            <Button
              onClick={handleFileUpload}
              loading={uploadFilesLoading}
              disabled={uploadedFiles.length === 0 || uploadFilesLoading}
            >
              Upload Files
            </Button>
          </>
        )}
      </Modal>

      {/* delete file/folder modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete ${itemToDelete?.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'File'}`}
      >
        <Text mb="md">
          Are you sure you want to delete "{itemToDelete?.name}"?
          {itemToDelete?.mimeType === 'application/vnd.google-apps.folder' &&
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
    </Box>
  );
};

export default Dropbox;
