import { Box, Group, Stack, Text, TextInput } from '@mantine/core';
import useUsers from './use-users';
import { Button, Form, Modal, Table } from '../../../components';
import { LoaderOverlay } from '../../../components/loader';

const AdminUsers = () => {
  const {
    closeInviteUserModal,
    inviteUserMethods,
    handleScroll,
    handleSearchChange,
    loading,
    scrollBoxRef,
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
  } = useUsers();

  return (
    <Box>
      <LoaderOverlay visible={loading} opacity={1} />
      <Box
        px={32}
        pb={20}
        bg="#f8fafc"
        ref={scrollBoxRef}
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.2s ease-in-out',
        }}
        onScroll={handleScroll}
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
          <Table
            data={users}
            columns={columns}
            idKey="id"
            emptyMessage="No users available."
          />
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
            <TextInput
              placeholder="User email"
              label="User Email"
              {...inviteUserMethods.register('email')}
              error={inviteUserMethods.formState.errors.email?.message}
              withAsterisk
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
