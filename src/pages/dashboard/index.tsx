import { Box, Group, Select, Stack, Text, TextInput } from '@mantine/core';
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
} from '../../components';
import FileGrid from './components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
import UploadProgress from './components/UploadProgress';
import useSidebar from '../../layouts/dashboard-layout/navbar/use-sidebar';
import CustomToggle from './components/CustomToggle';
import { LoaderOverlay } from '../../components/loader';

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
    accountId,
    handleAccountTypeChange,
    handleSearchChange,
    searchTerm,
    allIds,
    lastSelectedIndex,
    loadMoreFiles,
    pagination,
    accountOptions,
    navigateLoading,
    handleSyncStorage,
    syncCloudStorageLoading,

    isMoveMode,
    handleMoveSelected,
    handlePasteFiles,
    filesToMove,
    moveFilesLoading,
    isPasteEnabled,
    cancelMoveMode,
  } = useDashboard();
  const { connectedAccounts } = useSidebar();

  // if (loading) return <LoaderOverlay visible={loading} opacity={1} />;

  return (
    <Box>
      <LoaderOverlay
        visible={navigateLoading || moveFilesLoading || syncCloudStorageLoading}
        opacity={1}
      />
      {/* <ScrollArea> */}
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
            {/* <SegmentedControl
              value={layout}
              onChange={(value: string) =>
                switchLayout(value as 'list' | 'grid')
              }
              p={4}
              color="#1c7ed6"
              data={[
                {
                  value: 'list',
                  label: (
                    <Tooltip label="List View" withArrow fz="xs">
                      <ICONS.IconList
                        size={18} // Adjusted size for compactness
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
                        size={18} // Adjusted size for compactness
                        color={layout === 'grid' ? '#ffffff' : '#1c7ed6'}
                      />
                    </Tooltip>
                  ),
                },
              ]}
              styles={() => ({
                root: {
                  backgroundColor: '#f3f4f6',
                  borderRadius: 8,
                  padding: '4px',
                  height: '40px', // Match the height of the SelectionBar
                  display: 'flex',
                  alignItems: 'center', // Ensure vertical centering
                },
                control: {
                  height: '32px', // Adjusted for compactness
                  width: '40px', // Make controls square for better alignment
                  display: 'flex',
                  alignItems: 'center', // Center icon vertically
                  justifyContent: 'center', // Center icon horizontally
                  borderRadius: 6,
                  transition: 'background-color 0.2s ease',
                },
                active: {
                  backgroundColor: '#1c7ed6', // Active background color
                  display: 'flex',
                  alignItems: 'center', // Ensure vertical centering in active state
                  justifyContent: 'center', // Ensure horizontal centering in active state
                },
                label: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              })}
            /> */}
          </Group>
          <Group align="center" w={'100%'} mt={16}>
            <Box style={{ flexGrow: 1 }}>
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
            </Box>
            <Select
              data={accountOptions}
              value={accountId}
              onChange={handleAccountTypeChange}
              placeholder="Select account type"
              style={{ width: '150px' }}
            />
            <TextInput
              placeholder="Search files..."
              value={searchTerm}
              onChange={event => handleSearchChange(event.currentTarget.value)}
              style={{ width: '200px' }}
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
              // maxSize={5 * 1024 ** 2}
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

export default Dashboard;
