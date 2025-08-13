import {
  Avatar,
  Box,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import useUsers from './use-users';
import { Button, Card, Form, Modal, Tooltip } from '../../../components';
import { LoaderOverlay } from '../../../components/loader';
import { DataTable } from 'mantine-datatable';
import EmailMultiInput from './EmailMultiInput';
import { formatDate } from '../../../utils/helper';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../../assets/svgs/OneDrive.svg';

type AccountConfig = {
  icon: React.ReactNode;
  color: string;
  label: string;
  bg: string;
};

const accountConfigs: Record<string, AccountConfig> = {
  google_drive: {
    icon: <Image src={GoogleDriveIcon} alt="Google Drive" w={26} h={26} />,
    color: 'red',
    label: 'Google Drive',
    bg: 'rgba(234, 67, 53, 0.1)',
  },
  dropbox: {
    icon: <Image src={DropboxIcon} w={28} alt="Dropbox" />,
    color: 'blue',
    label: 'Dropbox',
    bg: 'rgba(0, 97, 255, 0.1)',
  },
  onedrive: {
    icon: <Image src={OneDriveIcon} alt="OneDrive" w={26} h={26} />,
    color: 'indigo',
    label: 'OneDrive',
    bg: 'rgba(0, 120, 215, 0.1)',
  },
};

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
                rowExpansion={{
                  allowMultiple: true,
                  content: ({ record }) => (
                    <Box p="md" bg="gray.0" style={{ borderRadius: 8 }}>
                      <Text size="sm" fw={600} mb="sm" c="gray.8">
                        Connected Accounts
                      </Text>

                      {record.UserConnectedAccounts?.length > 0 ? (
                        <SimpleGrid
                          cols={{ base: 1, sm: 2, md: 3 }}
                          spacing="md"
                          verticalSpacing="md"
                        >
                          {record.UserConnectedAccounts.map(account => {
                            const accountConfig =
                              accountConfigs[account.account_type];
                            return (
                              <Card
                                key={account.id}
                                p="md"
                                style={{ borderRadius: 8 }}
                              >
                                <Group justify="space-between" mb="xs">
                                  <Tooltip
                                    label={account.account_name}
                                    fz={'xs'}
                                  >
                                    <Text fw={500} maw={'70%'} truncate>
                                      {account.account_name}
                                    </Text>
                                  </Tooltip>
                                  <Avatar
                                    color={accountConfig.color}
                                    radius="sm"
                                    size="md"
                                  >
                                    {accountConfig.icon}
                                  </Avatar>
                                </Group>
                                <Text size="xs" c="dimmed">
                                  Created on: {formatDate(account.createdAt)}
                                </Text>
                              </Card>
                            );
                          })}
                        </SimpleGrid>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No connected accounts.
                        </Text>
                      )}
                    </Box>
                  ),
                }}
                styles={{
                  pagination: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                  },
                  table: {
                    cursor: 'pointer',
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
