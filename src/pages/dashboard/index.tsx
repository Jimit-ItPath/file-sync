import {
  Box,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import ActionButtons from './components/ActionButtons';
import FileTable from './components/FileTable';
// import RecentFiles from './RecentFiles';
import useDashboard from './use-dashboard';
import {
  Breadcrumbs,
  Button,
  Dropzone,
  Form,
  Modal,
  SelectionBar,
  Tooltip,
} from '../../components';
import { ICONS } from '../../assets/icons';
import FileGrid from './components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
import UploadProgress from './components/UploadProgress';
import { LoaderOverlay } from '../../components/loader';
import useSidebar from '../../layouts/dashboard-layout/navbar/use-sidebar';

const controlBoxStyles = {
  height: 40,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 6,
};

const Dashboard = () => {
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
    handleKeyDown,
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
    loading,
    closeModal,
    createFolderLoading,
    handleCreateFolder,
    handleFileUpload,
    handleSelectAll,
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
  } = useDashboard();
  const { connectedAccounts } = useSidebar();

  return (
    <Box bg="#fff" h="100vh">
      <LoaderOverlay visible={loading} opacity={1} />
      {/* <ScrollArea h="100vh"> */}
      <Box
        px={32}
        py={20}
        bg="#f8fafc"
        ref={dragRef}
        style={{
          position: 'relative',
          minHeight: 'calc(100vh - 120px)',
          transition: 'all 0.2s ease-in-out',
          ...(isDragging && {
            backgroundColor: 'rgba(37, 99, 235, 0.05)',
          }),
        }}
      >
        <DragDropOverlay
          isDragging={isDragging}
          message="Drop files here to upload"
          subMessage="Support for PDF, DOC, XLS, PPT, images and more"
        />
        {connectedAccounts?.length ? (
          <ActionButtons {...{ currentPath, navigateToFolderFn, openModal }} />
        ) : null}
        {/* <RecentFiles /> */}
        <Group mb={20} align="center" style={{ width: '100%' }}>
          {selectedIds.length > 0 ? (
            <Box style={{ ...controlBoxStyles, flex: 1, marginRight: 12 }}>
              <SelectionBar
                count={selectedIds.length}
                onCancel={handleUnselectAll}
                onDelete={handleDeleteSelected}
                onDownload={handleDownloadSelected}
                onShare={handleShareSelected}
              />
            </Box>
          ) : (
            <Box style={{ flex: 1, marginRight: 12 }} />
          )}
          <SegmentedControl
            value={layout}
            onChange={(value: string) => switchLayout(value as 'list' | 'grid')}
            p={7}
            color="#1c7ed6"
            data={[
              {
                value: 'list',
                label: (
                  <Tooltip label="List View" withArrow fz="xs">
                    <ICONS.IconList
                      // size={20}
                      color={layout === 'list' ? '#ffffff' : '#1c7ed6'}
                    />
                  </Tooltip>
                ),
              },
              {
                value: 'grid',
                label: (
                  <Tooltip label="Grid View" withArrow fz="xs">
                    <ICONS.IconGridDots
                      // size={20}
                      color={layout === 'grid' ? '#ffffff' : '#1c7ed6'}
                    />
                  </Tooltip>
                ),
              },
            ]}
            styles={() => ({
              root: {
                // backgroundColor: theme.colors.gray[2],
                backgroundColor: '#f3f4f6',
              },
            })}
          />
        </Group>
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
        />
        {layout === 'list' ? (
          <FileTable
            {...{
              files,
              handleSelect,
              handleKeyDown,
              onSelectAll,
              onSelectRow,
              selectedIds,
              currentPath,
              handleMenuItemClick,
              handleRowDoubleClick,
            }}
          />
        ) : (
          <FileGrid
            {...{
              files: regularFiles,
              handleSelect,
              selectedIds,
              folders,
              handleKeyDown,
              handleUnselectAll,
              getIndexById,
              setLastSelectedIndex,
              setSelectedIds,
              handleMenuItemClick,
              handleRowDoubleClick,
            }}
          />
        )}
      </Box>
      {/* </ScrollArea> */}
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
              maxSize={5 * 1024 ** 2}
              // multiple={false}
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
        title={`Delete ${selectedIds.length} items`}
      >
        <Text mb="md">
          Are you sure you want to delete "{selectedIds.length}" items?
          {selectedIds.length > 0 &&
            ' All contents will be deleted permanently.'}
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

export default Dashboard;
