import {
  Grid,
  Stack,
  Title,
  Text,
  Box,
  Avatar,
  Group,
  FileButton,
  Card,
  ActionIcon,
  Switch,
  Input as MantineInput,
  Image,
} from '@mantine/core';
import { Button, Form, Input, Modal, Tooltip } from '../../../components';
import useProfile from './use-profile';
import { ICONS } from '../../../assets/icons';
import { useState } from 'react';
import { LoaderOverlay } from '../../../components/loader';
import useSidebar from '../../../layouts/dashboard-layout/navbar/use-sidebar';
import AccountTypeSelector from '../../../layouts/dashboard-layout/navbar/AccountTypeSelector';
import { ROLES } from '../../../utils/constants';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../../assets/svgs/OneDrive.svg';
import ConnectAccountDescription from '../../dashboard/ConnectAccountDescription';
import useResponsive from '../../../hooks/use-responsive';

const Profile = () => {
  const {
    methods,
    handleProfileSubmit,
    profileFormData,
    submitLoading,
    handleAvatarChange,
    preview,
    removeAccess,
    removeAccessLoading,
    removeProfilePic,
    removeProfileImageLoading,
    closeRemoveProfilePicModal,
    openRemoveProfilePicModal,
    openRemoveProfileImageModal,
    connectedAccounts,
    closeRemoveAccessModal,
    openRemoveAccessModal,
    removeAccessModalOpen,
    handleSFDToggle,
    userProfile,
  } = useProfile();

  const {
    openAccountModal,
    isConnectModalOpen,
    closeAccountModal,
    handleConnectAccount,
    connectAccountFormData,
    methods: connectAccountMethods,
    connectAccountLoading,
    user,
  } = useSidebar();

  const { isMd, isXs } = useResponsive();

  const {
    formState: { errors },
  } = methods;
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      <Box py="xl" px="xl">
        <LoaderOverlay visible={removeAccessLoading} opacity={1} />

        <Grid gutter="xl">
          {/* ===== PROFILE SECTION ===== */}
          <Grid.Col span={{ base: 12 }}>
            <Stack gap="lg">
              <Box>
                <Title order={isXs ? 3 : 2} fw={600} mb={4}>
                  Profile
                </Title>
                <Text size="sm" c="dimmed">
                  Update your personal details and profile picture
                </Text>
              </Box>

              <Card radius="md" p="lg" shadow="xs" withBorder>
                <Form methods={methods} onSubmit={handleProfileSubmit}>
                  <Stack gap="xl">
                    <Group align="flex-start" gap="lg">
                      <Box
                        pos="relative"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                      >
                        <Avatar
                          size={110}
                          radius={120}
                          src={
                            preview
                              ? preview?.includes('data:image/')
                                ? preview
                                : `${import.meta.env.VITE_REACT_APP_BASE_URL}/user-profile/${preview}`
                              : null
                          }
                          style={theme => ({
                            border: `2px solid ${theme.colors.blue[4]}`,
                            boxShadow: theme.shadows.sm,
                            transition: 'all 0.2s ease',
                          })}
                        >
                          <ICONS.IconUser size={56} />
                        </Avatar>
                        {userProfile?.profile && preview && isHovering && (
                          <Tooltip
                            label="Remove avatar"
                            position="bottom"
                            withArrow
                            fz="xs"
                          >
                            <ActionIcon
                              variant="filled"
                              color="red"
                              size="md"
                              radius="xl"
                              onClick={openRemoveProfilePicModal}
                              pos="absolute"
                              bottom={0}
                              right={0}
                              style={{
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              <ICONS.IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Box>

                      <Stack gap={4}>
                        <FileButton
                          onChange={handleAvatarChange}
                          accept="image/png,image/jpeg,image/webp"
                          multiple={false}
                        >
                          {props => (
                            <Button
                              {...props}
                              variant="light"
                              color="blue"
                              leftSection={
                                !preview ? <ICONS.IconUpload size={14} /> : null
                              }
                              size="sm"
                              radius="md"
                              fw={500}
                            >
                              Change Avatar
                            </Button>
                          )}
                        </FileButton>
                        <Text size="xs" c="dimmed">
                          JPG, PNG or WEBP (Max 5MB)
                        </Text>
                      </Stack>
                    </Group>

                    <Grid gutter="md">
                      {profileFormData.map(
                        ({
                          id,
                          label,
                          placeholder,
                          type,
                          error,
                          name,
                          isRequired,
                          ...props
                        }) => (
                          <Grid.Col key={id} span={{ base: 12, sm: 6, md: 4 }}>
                            <Input
                              name={name}
                              label={label}
                              placeholder={placeholder}
                              type={type}
                              error={
                                errors[name as keyof typeof errors]?.message ||
                                error
                              }
                              radius="md"
                              size="sm"
                              withAsterisk={isRequired}
                              {...props}
                            />
                          </Grid.Col>
                        )
                      )}
                    </Grid>

                    <Group>
                      <Button
                        type="submit"
                        loading={submitLoading}
                        size="sm"
                        radius="md"
                        fw={500}
                      >
                        Save Changes
                      </Button>
                    </Group>
                  </Stack>
                </Form>
              </Card>
            </Stack>
          </Grid.Col>

          {/* ===== SETTINGS SECTION ===== */}
          {userProfile?.role === ROLES.USER ? (
            <Grid.Col span={{ base: 12 }}>
              <Stack gap="lg">
                <Box>
                  <Title order={isXs ? 3 : 2} fw={600} mb={4}>
                    Settings
                  </Title>
                  <Text size="sm" c="dimmed">
                    Manage your smart file distribution and connected services
                  </Text>
                </Box>

                {/* Smart File Distribution */}
                {user?.user?.role === ROLES.USER && (
                  <Card radius="md" p="lg" shadow="xs" withBorder>
                    <Stack gap="md">
                      <Title order={4} fw={600} fz={isXs ? 'md' : 'lg'}>
                        Smart File Distribution
                      </Title>
                      <Text size="sm" c="dimmed" lh={1.5}>
                        {/* Automatically route uploaded files to your preferred cloud
                      storage based on type or rules. */}
                        Smart File Distribution helps you automatically route
                        uploaded files or folders to your preferred cloud
                        storage platforms (Google Drive, Dropbox, or OneDrive)
                        based on file types, content, or your selected
                        preferences.
                      </Text>

                      <Text fz={13} c="gray" mt={8}>
                        You can turn this off or choose to be asked each time
                        during file upload.
                      </Text>

                      <Group wrap="wrap" align="center" gap="xs">
                        <MantineInput.Label
                          htmlFor="sfd-switch"
                          w="auto"
                          fz="sm"
                          style={{ cursor: 'pointer' }}
                        >
                          Ask Every Time
                        </MantineInput.Label>
                        <Switch
                          id="sfd-switch"
                          checked={userProfile?.is_sfd_enabled}
                          onChange={event =>
                            handleSFDToggle(event.currentTarget.checked)
                          }
                          size="sm"
                          color="cyan"
                        />
                        <MantineInput.Label
                          htmlFor="sfd-switch"
                          w="auto"
                          fz="sm"
                          style={{ cursor: 'pointer' }}
                        >
                          Smart File Distribution
                        </MantineInput.Label>
                      </Group>
                    </Stack>
                  </Card>
                )}

                {/* Connected Services */}
                {user?.user?.role === ROLES.USER && (
                  <Card radius="md" p="lg" shadow="xs" withBorder>
                    <Stack gap="sm">
                      <Title order={4} fw={600} fz={isXs ? 'md' : 'lg'}>
                        Connected Services
                      </Title>
                      <Text size="xs" c="dimmed">
                        Manage your cloud storage integrations
                      </Text>

                      {connectedAccounts.length === 0 ? (
                        <Card withBorder radius="md" bg="gray.0">
                          <Group gap="sm">
                            <ICONS.IconCloudOff
                              size={20}
                              color="var(--mantine-color-gray-5)"
                            />
                            <Text size="sm" c="dimmed">
                              No accounts connected
                            </Text>
                          </Group>
                          <Button
                            mt="sm"
                            size="xs"
                            leftSection={<ICONS.IconPlus size={14} />}
                            onClick={openAccountModal}
                          >
                            Connect Account
                          </Button>
                        </Card>
                      ) : (
                        <Grid gutter="sm">
                          {connectedAccounts.map(account => {
                            const accountConfigs = {
                              google_drive: {
                                icon: (
                                  <Image
                                    src={GoogleDriveIcon}
                                    w={isXs ? 16 : 20}
                                    h={isXs ? 16 : 20}
                                  />
                                ),
                                color: 'red',
                                label: 'Google Drive',
                              },
                              dropbox: {
                                icon: (
                                  <Image src={DropboxIcon} w={isXs ? 20 : 24} />
                                ),
                                color: 'blue',
                                label: 'Dropbox',
                              },
                              onedrive: {
                                icon: (
                                  <Image
                                    src={OneDriveIcon}
                                    w={isXs ? 20 : 24}
                                    h={isXs ? 20 : 24}
                                  />
                                ),
                                color: 'indigo',
                                label: 'OneDrive',
                              },
                            };
                            const cfg = accountConfigs[account.account_type];
                            if (!cfg) return null;

                            return (
                              <Grid.Col
                                key={account.id}
                                span={{ base: 12, sm: 6, lg: 4 }}
                              >
                                <Card
                                  withBorder
                                  radius="md"
                                  p={isMd ? 'sm' : 'lg'}
                                  // bg={cfg.bg}
                                  style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}
                                >
                                  <Box style={{ flex: 1 }}>
                                    <Group
                                      justify="space-between"
                                      align="flex-start"
                                      wrap="nowrap"
                                    >
                                      <Group gap="sm">
                                        <Avatar
                                          color={cfg.color}
                                          radius="sm"
                                          size={isXs ? 'md' : 'lg'}
                                        >
                                          {cfg.icon}
                                        </Avatar>
                                        <Stack gap={2}>
                                          <Tooltip
                                            label={account.account_name}
                                            fz={'xs'}
                                          >
                                            <Text
                                              fw={600}
                                              truncate
                                              maw={!isMd ? 300 : 150}
                                              fz={isXs ? 'sm' : 'md'}
                                            >
                                              {account.account_name}
                                            </Text>
                                          </Tooltip>
                                          <Text
                                            size="sm"
                                            c="dimmed"
                                            fz={isXs ? 'xs' : 'sm'}
                                          >
                                            {cfg.label}
                                          </Text>
                                          <Text size="xs" c="dimmed">
                                            Connected on{' '}
                                            {new Date(
                                              account.createdAt
                                            ).toLocaleDateString()}
                                          </Text>
                                        </Stack>
                                      </Group>
                                      <Tooltip
                                        label={`Disconnect ${cfg.label}`}
                                        fz={'xs'}
                                      >
                                        <ActionIcon
                                          variant="subtle"
                                          color="red"
                                          onClick={() =>
                                            openRemoveAccessModal(account.id)
                                          }
                                          loading={removeAccessLoading}
                                        >
                                          <ICONS.IconTrash size={18} />
                                        </ActionIcon>
                                      </Tooltip>
                                    </Group>
                                  </Box>
                                </Card>
                              </Grid.Col>
                            );
                          })}
                        </Grid>
                      )}
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid.Col>
          ) : null}
        </Grid>

        {/** Remove Profile Pic Modal */}
        <Modal
          opened={openRemoveProfileImageModal}
          onClose={closeRemoveProfilePicModal}
          title="Remove Profile Picture"
          size="md"
        >
          <Text>Are you sure you want to remove your profile picture?</Text>
          <Group ta="right" mt={20}>
            <Button
              variant="outline"
              onClick={closeRemoveProfilePicModal}
              disabled={removeProfileImageLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={removeProfilePic}
              disabled={removeProfileImageLoading}
              loading={removeProfileImageLoading}
            >
              Remove
            </Button>
          </Group>
        </Modal>

        {/** Remove Access Modal */}
        <Modal
          opened={removeAccessModalOpen}
          onClose={closeRemoveAccessModal}
          title="Remove Access"
        >
          <Text mb="md">Are you sure you want to remove account access?</Text>
          <Group>
            <Button
              variant="outline"
              onClick={closeRemoveAccessModal}
              disabled={removeAccessLoading}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={removeAccess}
              loading={removeAccessLoading}
              disabled={removeAccessLoading}
            >
              Remove
            </Button>
          </Group>
        </Modal>

        {/** Add Account Modal */}
        <Modal
          opened={isConnectModalOpen}
          onClose={closeAccountModal}
          title="Connect Cloud Account"
        >
          <Form onSubmit={handleConnectAccount} methods={connectAccountMethods}>
            <Stack>
              <ConnectAccountDescription />
              {connectAccountFormData?.map(
                ({ id, name, placeholder, type, label, error, isRequired }) => (
                  <Input
                    key={id}
                    name={name}
                    label={label}
                    placeholder={placeholder}
                    type={type}
                    error={error}
                    radius="md"
                    withAsterisk={isRequired}
                  />
                )
              )}

              <AccountTypeSelector
                value={connectAccountMethods.watch('accountType')}
                onChange={val =>
                  connectAccountMethods.setValue(
                    'accountType',
                    val as 'google_drive' | 'dropbox' | 'onedrive'
                  )
                }
                error={
                  connectAccountMethods.formState.errors.accountType?.message
                }
              />

              <Button
                type="submit"
                maw="fit-content"
                loading={Boolean(connectAccountLoading)}
                disabled={Boolean(connectAccountLoading)}
                radius="md"
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  // background: '#0284c7',
                  background: 'var(--mantine-primary-color-6)',
                  color: '#fff',
                  marginTop: 8,
                }}
              >
                Connect Account
              </Button>
            </Stack>
          </Form>
        </Modal>
      </Box>
    </>
  );
};

export default Profile;
