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
  Dropzone,
  Form,
  Image,
  Modal,
  SelectionBar,
  Tooltip,
} from '../../components';
import FileGrid from './components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
import UploadProgress from './components/UploadProgress';
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
import DashboardFilters from './components/DashboardFilters';

const iconStyle = {
  borderRadius: 999,
  transition: 'background 0.2s',
  padding: 4,
  '&:hover': {
    background: '#e0e7ff',
  },
};

const Dashboard = () => {
  const { downloadProgress, cancelDownload, clearDownload, downloadFile } =
    useFileDownloader();
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
    // openModal,
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
    isSFDEnabled,
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
    location,
    displayShareIcon,
    connectedAccounts,
    previewFile,
    previewModalOpen,
    setPreviewFile,
    setPreviewModalOpen,
    previewFileLoading,
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
    handleClearFilters,
    handleModifiedFilter,
    handleTypeFilter,
    typeFilter,
    modifiedFilter,
    // isAutoLoading,
  } = useDashboard({ downloadFile });

  const {
    openAccountModal,
    isConnectModalOpen,
    closeAccountModal,
    handleConnectAccount,
    methods,
    connectAccountFormData,
    connectAccountLoading,
  } = useSidebar();
  const { isSm, theme } = useResponsive();

  // if (loading) return <LoaderOverlay visible={loading} opacity={1} />;

  if (!connectedAccounts?.length) {
    return (
      <>
        <LoaderOverlay visible={loading} opacity={1} />
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

  return (
    <Box>
      <LoaderOverlay
        visible={navigateLoading || moveFilesLoading || syncCloudStorageLoading}
        opacity={1}
      />
      {/* <ScrollArea> */}
      {location.pathname?.startsWith('/dropbox') ? (
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
      ) : null}
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
          <Group align="center" w={'100%'} 
          // h={48}
          h={isSm ? 48 : 'auto'} 
          gap={16}>
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
                <DashboardFilters
                  onTypeFilter={handleTypeFilter}
                  onModifiedFilter={handleModifiedFilter}
                  onClearFilters={handleClearFilters}
                  activeTypeFilter={typeFilter}
                  activeModifiedFilter={modifiedFilter}
                  isMobile={isSm}
                />
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
                      }}
                      onClick={handleSyncStorage}
                    >
                      <ICONS.IconRefresh size={16} />
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
              <DashboardFilters
                onTypeFilter={handleTypeFilter}
                onModifiedFilter={handleModifiedFilter}
                onClearFilters={handleClearFilters}
                activeTypeFilter={typeFilter}
                activeModifiedFilter={modifiedFilter}
                isMobile={isSm}
              />
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
                    }}
                    onClick={handleSyncStorage}
                  >
                    <ICONS.IconRefresh size={16} />
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
            subMessage="Support for PDF, DOC, XLS, PPT, images and more"
          />
        </Box>
        {layout === 'list' ? (
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
              {!isSFDEnabled && (
                <Controller
                  control={folderMethods.control}
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
                        onChange={value => {
                          const matchedOption = accountOptionsForSFD.find(
                            option =>
                              option.label === value || option.value === value
                          );
                          field.onChange(
                            matchedOption ? matchedOption.value : ''
                          );
                        }}
                        error={
                          folderMethods.formState.errors.accountId?.message
                        }
                        required
                      />
                    );
                  }}
                />
              )}
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
          <Form onSubmit={handleFileUpload} methods={uploadMethods}>
            <Stack gap={'md'}>
              <Dropzone
                // onFilesSelected={setUploadedFiles}
                onFilesSelected={files => {
                  setUploadedFiles(files);
                  uploadMethods.setValue('files', files);
                }}
                // maxSize={5 * 1024 ** 2}
                multiple={true}
                mb="md"
                getFileIcon={getFileIcon}
                files={uploadedFiles}
              />
              {!isSFDEnabled && (
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
                        onChange={value => {
                          const matchedOption = accountOptionsForSFD.find(
                            option =>
                              option.label === value || option.value === value
                          );
                          field.onChange(
                            matchedOption ? matchedOption.value : ''
                          );
                        }}
                        error={
                          uploadMethods.formState.errors.accountId?.message
                        }
                        required
                      />
                    );
                  }}
                />
              )}
              <Button
                // onClick={handleFileUpload}
                type="submit"
                loading={uploadFilesLoading}
                disabled={
                  uploadedFiles.length === 0 || uploadFilesLoading
                  // ||
                  // (!isSFDEnabled && !uploadMethods.formState.isValid)
                }
              >
                Upload Files
              </Button>
            </Stack>
          </Form>
        )}
      </Modal>

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
              selected for upload:
            </Text>
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
              {dragDropFiles.map((file, index) => {
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
            </Box>

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
                    onChange={value => {
                      const matchedOption = accountOptionsForSFD.find(
                        option =>
                          option.label === value || option.value === value
                      );
                      field.onChange(matchedOption ? matchedOption.value : '');
                    }}
                    error={uploadMethods.formState.errors.accountId?.message}
                    required
                  />
                );
              }}
            />

            <Button
              type="submit"
              loading={uploadFilesLoading}
              disabled={
                dragDropFiles.length === 0 ||
                uploadFilesLoading ||
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
        accountId={accountId}
        currentAccountId={currentAccountId}
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
        />
      )}
    </Box>
  );
};

export default Dashboard;
