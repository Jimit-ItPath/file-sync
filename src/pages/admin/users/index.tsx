import { Box, Group, Stack, Text, TextInput } from '@mantine/core';
import useUsers from './use-users';
import { Button, Card, Form, Modal } from '../../../components';
import { LoaderOverlay } from '../../../components/loader';
import { DataTable } from 'mantine-datatable';
import EmailMultiInput from './EmailMultiInput';

const AdminUsers = () => {
  const {
    closeInviteUserModal,
    inviteUserMethods,
    handleSearchChange,
    loading,
    searchTerm,
    itemToBlock,
    openInviteUserModal,
    userBlockModalOpen,
    users,
    columns,
    handleInviteUser,
    inviteUserLoading,
    inviteUserModalOpen,
    closeUserBlockModal,
    blockUserLoading,
    handleBlockConfirm,
    currentPage,
    handlePageChange,
    handleLimitChange,
    totalRecords,
    limit,
  } = useUsers();

  return (
    <Box>
      <LoaderOverlay visible={loading} opacity={1} />
      <Box
        px={32}
        pb={20}
        bg="#f8fafc"
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <Group justify="flex-end" w={'100%'} mt={16}>
          <TextInput
            placeholder="Search users..."
            value={searchTerm}
            onChange={event => handleSearchChange(event.currentTarget.value)}
            maw={500}
            w={'100%'}
          />
          <Button
            onClick={openInviteUserModal}
            radius="md"
            size="sm"
            bd={'none'}
            style={{
              outline: 'none',
            }}
          >
            Invite User
          </Button>
        </Group>
        <Box mt={20}>
          <Card>
            {users.length > 0 ? (
              <DataTable
                withTableBorder
                borderRadius="md"
                records={users}
                columns={columns}
                totalRecords={totalRecords}
                recordsPerPage={limit}
                page={currentPage}
                onPageChange={handlePageChange}
                onRecordsPerPageChange={handleLimitChange}
                recordsPerPageOptions={[10, 20, 50, 100]}
                paginationWithEdges
                textSelectionDisabled
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
                paginationActiveBackgroundColor="blue"
                paginationActiveTextColor="white"
                noRecordsText=""
                className="mantine-user-data-table"
                styles={{
                  pagination: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                  },
                }}
              />
            ) : (
              <Text ta="center" py="xl" c="dimmed">
                No users available.
              </Text>
            )}
          </Card>
        </Box>
      </Box>

      {/* Invite User Modal */}
      <Modal
        opened={inviteUserModalOpen}
        onClose={closeInviteUserModal}
        title={'Invite User'}
      >
        <Form methods={inviteUserMethods} onSubmit={handleInviteUser}>
          <Stack gap="md">
            <EmailMultiInput
              inviteUserMethods={inviteUserMethods}
              inviteUserLoading={inviteUserLoading}
            />
            <Button
              type="submit"
              loading={inviteUserLoading}
              disabled={
                !inviteUserMethods.formState.isValid || inviteUserLoading
              }
              maw={150}
            >
              Invite User
            </Button>
          </Stack>
        </Form>
      </Modal>

      {/* Block / Unblock User Modal */}
      <Modal
        opened={userBlockModalOpen}
        onClose={closeUserBlockModal}
        title={`Block ${itemToBlock?.first_name + ' ' + itemToBlock?.last_name}`}
      >
        <Text mb="md">
          Are you sure you want to{' '}
          {itemToBlock?.is_blocked ? 'unblock' : 'block'} this user?
        </Text>
        <Group>
          <Button
            variant="outline"
            onClick={closeUserBlockModal}
            disabled={blockUserLoading}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleBlockConfirm}
            loading={blockUserLoading}
            disabled={blockUserLoading}
          >
            {itemToBlock?.is_blocked ? 'Unblock' : 'Block'}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default AdminUsers;
