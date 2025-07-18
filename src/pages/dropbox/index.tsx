import React from 'react';
import { Dropzone, Table } from '../../components';
import { Button, Form, Modal } from '../../components';
import { LoaderOverlay } from '../../components/loader';
import { Box, Group, Stack, Text, TextInput } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import useDropbox from './use-dropbox';

const Dropbox: React.FC = () => {
  const {
    isLoading,
    files,
    hasAccess,
    connectWithDropbox,
    columns,
    onSelectAll,
    // onSelectRow,
    selectedRows,
    folderMethods,
    modalType,
    setUploadedFiles,
    uploadedFiles,
    createFolderLoading,
    uploadFilesLoading,
    handleCreateFolder,
    handleFileUpload,
    closeModal,
    modalOpen,
    openModal,
    getFileIcon,
    deleteModalOpen,
    handleDeleteConfirm,
    itemToDelete,
    removeFileLoading,
    setDeleteModalOpen,
    hasMore,
    loadMoreFiles,
    handleRenameConfirm,
    itemToRename,
    renameFileLoading,
    renameMethods,
    renameModalOpen,
    setRenameModalOpen,
  } = useDropbox();

  return (
    <>
      <LoaderOverlay visible={isLoading} opacity={1} />
      {hasAccess ? (
        <>
          <Group gap={12} mb={32} wrap="wrap">
            <Button
              leftSection={<ICONS.IconUpload size={20} color="#2563eb" />}
              onClick={() => openModal('files')}
              radius="md"
              size="md"
              px={20}
              style={{
                minWidth: 130,
                height: 48,
                fontWeight: 500,
                fontSize: 14,
                backgroundColor: '#fff',
                color: '#1e293b',
                border: '1px solid #e5e7eb',
              }}
            >
              Upload Files
            </Button>
            {/* <Card pb={0} w={128}>
              <Stack
                gap={1}
                justify="center"
                align="center"
                bdrs={12}
                onClick={() => openModal('files')}
              >
                <ICONS.IconUpload size={30} color="#2563eb" />
                <Button
                  // leftSection={<ICONS.IconUpload size={20} color="#2563eb" />}
                  // onClick={() => openModal('files')}
                  radius="md"
                  size="md"
                  px={20}
                  style={{
                    minWidth: 130,
                    height: 48,
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: '#fff',
                    color: '#1e293b',
                    // border: '1px solid #e5e7eb',
                  }}
                >
                  Upload Files
                </Button>
              </Stack>
            </Card> */}
            <Button
              leftSection={<ICONS.IconFolderPlus size={20} color="#2563eb" />}
              onClick={() => openModal('folder')}
              radius="md"
              size="md"
              px={20}
              style={{
                minWidth: 130,
                height: 48,
                fontWeight: 500,
                fontSize: 14,
                backgroundColor: '#fff',
                color: '#1e293b',
                border: '1px solid #e5e7eb',
              }}
            >
              New Folder
            </Button>
            <Button
              leftSection={<ICONS.IconDownload size={20} color="#2563eb" />}
              radius="md"
              size="md"
              px={20}
              style={{
                minWidth: 130,
                height: 48,
                fontWeight: 500,
                fontSize: 14,
                backgroundColor: '#fff',
                color: '#1e293b',
                border: '1px solid #e5e7eb',
              }}
            >
              Download
            </Button>
          </Group>
          <Table
            title="All Files"
            data={files}
            columns={columns}
            selectedRows={selectedRows}
            // onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
            idKey="id"
            emptyMessage="No files available in Dropbox. Please upload files to see them here."
          />
          {hasMore && !isLoading && (
            <Button
              onClick={loadMoreFiles}
              loading={isLoading}
              disabled={isLoading}
              variant="outline"
              mt={10}
            >
              Load More
            </Button>
          )}

          {/* Create folder / upload file modal */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title={
              modalType === 'folder' ? 'Create New Folder' : 'Upload Files'
            }
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
                  multiple={false}
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

          {/* Delete file modal */}
          <Modal
            opened={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title={`Delete ${itemToDelete?.['.tag'] === 'folder' ? 'Folder' : 'File'}`}
          >
            <Text mb="md">
              Are you sure you want to delete "{itemToDelete?.name}"?
              {itemToDelete?.['.tag'] === 'folder' &&
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

          {/* rename file/folder modal */}
          <Modal
            opened={renameModalOpen}
            onClose={() => setRenameModalOpen(false)}
            title={`Rename ${itemToRename?.['.tag'] === 'folder' ? 'Folder' : 'File'}`}
          >
            <Form methods={renameMethods} onSubmit={handleRenameConfirm}>
              <Stack gap="md">
                <TextInput
                  placeholder={`${itemToRename?.['.tag'] === 'folder' ? 'Folder' : 'File'} name`}
                  label={`${itemToRename?.['.tag'] === 'folder' ? 'Folder' : 'File'} Name`}
                  {...renameMethods.register('newName')}
                  error={renameMethods.formState.errors.newName?.message}
                  withAsterisk
                />
                <Button
                  type="submit"
                  loading={renameFileLoading}
                  maw={150}
                  disabled={
                    !renameMethods.formState.isValid || renameFileLoading
                  }
                >
                  Rename
                </Button>
              </Stack>
            </Form>
          </Modal>
        </>
      ) : (
        <Box ta={'center'}>
          <Button onClick={connectWithDropbox} ta={'center'}>
            Connect Dropbox
          </Button>
        </Box>
      )}
    </>
  );
};

export default Dropbox;
