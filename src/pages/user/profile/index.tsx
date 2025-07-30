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
} from '@mantine/core';
import { Button, Form, Input, Modal, Tooltip } from '../../../components';
import useProfile from './use-profile';
import { ICONS } from '../../../assets/icons';
import { useState } from 'react';
import { LoaderOverlay } from '../../../components/loader';
import useSidebar from '../../../layouts/dashboard-layout/navbar/use-sidebar';
import AccountTypeSelector from '../../../layouts/dashboard-layout/navbar/AccountTypeSelector';
import { ROLES } from '../../../utils/constants';

const Profile = () => {
  const {
    methods,
    handleProfileSubmit,
    isLoading,
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
    loading,
    closeRemoveAccessModal,
    openRemoveAccessModal,
    removeAccessModalOpen,
    handleSFDToggle,
    userProfile,
    isXs,
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

  const {
    formState: { errors },
  } = methods;
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box py="xl" px={'xl'}>
      <LoaderOverlay
        visible={isLoading || removeAccessLoading || loading}
        opacity={1}
      />
      <Stack gap="xl">
        {/* Profile Card */}
        <Card radius="lg" p="xl" shadow="sm" withBorder>
          <Form methods={methods} onSubmit={handleProfileSubmit}>
            <Stack gap="xl">
              <Box>
                <Title order={2} mb={4} fw={600}>
                  Profile Settings
                </Title>
                <Text c="dimmed" size="md">
                  Manage your personal information
                </Text>
              </Box>

              <Group align="flex-start" gap="xl">
                <Box
                  pos="relative"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <Avatar
                    size={120}
                    radius={120}
                    src={
                      preview
                        ? preview?.includes('data:image/')
                          ? preview
                          : `${import.meta.env.VITE_REACT_APP_BASE_URL}/user-profile/${preview}`
                        : null
                    }
                    style={theme => ({
                      border: `2px solid ${theme.colors.blue[3]}`,
                      boxShadow: theme.shadows.sm,
                      transition: 'all 0.2s ease',
                    })}
                  >
                    <ICONS.IconUser size={60} />
                  </Avatar>
                  {preview && isHovering && (
                    <Tooltip
                      label="Remove avatar"
                      position="bottom"
                      withArrow
                      fz={'xs'}
                    >
                      <ActionIcon
                        variant="filled"
                        color="red"
                        size="lg"
                        radius="xl"
                        onClick={openRemoveProfilePicModal}
                        pos="absolute"
                        bottom={0}
                        right={0}
                        style={{
                          // transform: 'translate(50%, -50%)',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <ICONS.IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Box>

                <Stack gap="xs">
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
                          !preview ? <ICONS.IconUpload size={16} /> : null
                        }
                        size="md"
                        radius="md"
                        w={200}
                      >
                        Change Avatar
                      </Button>
                    )}
                  </FileButton>
                  <Text c="dimmed" size="sm">
                    JPG, PNG or WEBP (Max 5MB)
                  </Text>
                </Stack>
              </Group>

              <Grid gutter="xl">
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
                    <Grid.Col key={id} span={{ base: 12, sm: 6 }}>
                      <Input
                        name={name}
                        label={label}
                        placeholder={placeholder}
                        type={type}
                        error={
                          errors[name as keyof typeof errors]?.message || error
                        }
                        radius="md"
                        size="md"
                        withAsterisk={isRequired}
                        {...props}
                      />
                    </Grid.Col>
                  )
                )}
              </Grid>

              <Group mt="md">
                <Button
                  type="submit"
                  loading={submitLoading}
                  size="md"
                  radius="md"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Form>
        </Card>

        {/* Smart File Distribution Card */}
        {user?.user?.role === ROLES.USER ? (
          <Card radius="lg" p="xl" shadow="sm" withBorder>
            <Stack gap="md">
              <Box>
                <Title order={4} fw={600}>
                  File Organization Preference
                </Title>
                <Text size="sm" c="dimmed">
                  Enable Smart File Distribution to automatically organize your
                  files based on their types and content.
                </Text>
              </Box>

              <Group mt={20}>
                <MantineInput.Label
                  htmlFor="sfd-switch"
                  w="auto"
                  fz={isXs ? 'sm' : 'md'}
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
                  size="md"
                />
                <MantineInput.Label
                  htmlFor="sfd-switch"
                  w="auto"
                  fz={isXs ? 'sm' : 'md'}
                  style={{ cursor: 'pointer' }}
                >
                  Smart File Distribution
                </MantineInput.Label>
              </Group>
            </Stack>
          </Card>
        ) : null}

        {/* Cloud Storage Access Card */}
        {user?.user?.role === ROLES.USER ? (
          <Card radius="lg" p={'xl'} shadow="sm" withBorder>
            <Stack gap="sm">
              <Box>
                <Title order={4} fw={600}>
                  Connected Services
                </Title>
                <Text c="dimmed" size="sm">
                  Manage your cloud storage integrations
                </Text>
              </Box>

              {connectedAccounts.length === 0 ? (
                <Card withBorder radius="md" bg="gray.0">
                  <Group gap="sm">
                    <ICONS.IconCloudOff
                      size={24}
                      color="var(--mantine-color-gray-5)"
                    />
                    <Text size="sm" c="dimmed">
                      No cloud storage accounts connected yet
                    </Text>
                  </Group>
                  <Button
                    mt={20}
                    leftSection={<ICONS.IconPlus size={18} />}
                    maw={200}
                    onClick={openAccountModal}
                  >
                    <span style={{ fontSize: '14px', color: '##0284C7' }}>
                      Connect Account
                    </span>
                  </Button>
                </Card>
              ) : (
                <Grid gutter="md">
                  {connectedAccounts.map(account => {
                    type AccountConfig = {
                      icon: React.ReactNode;
                      color: string;
                      label: string;
                      bg: string;
                    };

                    const accountConfigs: Record<string, AccountConfig> = {
                      google_drive: {
                        icon: <ICONS.IconBrandGoogle size={24} />,
                        color: 'red',
                        label: 'Google Drive',
                        bg: 'rgba(234, 67, 53, 0.1)',
                      },
                      dropbox: {
                        icon: <ICONS.IconDroplets size={24} />,
                        color: 'blue',
                        label: 'Dropbox',
                        bg: 'rgba(0, 97, 255, 0.1)',
                      },
                      onedrive: {
                        icon: <ICONS.IconBrandOnedrive size={24} />,
                        color: 'indigo',
                        label: 'OneDrive',
                        bg: 'rgba(0, 120, 215, 0.1)',
                      },
                    };

                    const accountConfig = accountConfigs[account.account_type];

                    // Fallback for unknown account types
                    if (!accountConfig) {
                      return (
                        <Grid.Col
                          key={account.id}
                          span={{ base: 12, sm: 6, lg: 4 }}
                        >
                          <Card withBorder radius="md" p="lg" bg="gray.1">
                            <Text>
                              Unknown account type: {account.account_type}
                            </Text>
                          </Card>
                        </Grid.Col>
                      );
                    }

                    return (
                      <Grid.Col
                        key={account.id}
                        span={{ base: 12, sm: 6, lg: 4 }}
                      >
                        <Card
                          withBorder
                          radius="md"
                          p="lg"
                          // bg={accountConfig.bg}
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Box style={{ flex: 1 }}>
                            <Group justify="space-between" align="flex-start">
                              <Group gap="sm">
                                <Avatar
                                  color={accountConfig.color}
                                  radius="sm"
                                  size="lg"
                                >
                                  {accountConfig.icon}
                                </Avatar>
                                <Stack gap={2}>
                                  <Text fw={600}>{account.account_name}</Text>
                                  <Text size="sm" c="dimmed">
                                    {accountConfig.label}
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
                                label={`Disconnect ${accountConfig.label}`}
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

                            {/* {account.token_expires && (
                            <Box mt="sm">
                              <Group gap={4}>
                                <ICONS.IconClock size={14} />
                                <Text size="xs">
                                  Expires{' '}
                                  {new Date(
                                    parseInt(account.token_expires)
                                  ).toLocaleString()}
                                </Text>
                              </Group>
                            </Box>
                          )} */}
                          </Box>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              )}
            </Stack>
          </Card>
        ) : null}
      </Stack>

      {/* Remove Profile Pic Modal */}
      <Modal
        opened={openRemoveProfileImageModal}
        onClose={closeRemoveProfilePicModal}
        closeOnClickOutside={true}
        closeOnEscape={true}
        title="Remove Profile Picture"
        size="md"
      >
        <Text>Are you sure you want to remove your profile picture?</Text>
        <Group ta="right" mt={20}>
          <Button
            variant="outline"
            // color="red"
            onClick={closeRemoveProfilePicModal}
            radius="md"
            disabled={removeProfileImageLoading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            color="red"
            onClick={removeProfilePic}
            radius="md"
            disabled={removeProfileImageLoading}
            loading={removeProfileImageLoading}
          >
            Remove
          </Button>
        </Group>
      </Modal>

      {/* Remove Access Modal */}
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

      {/*Add Account Modal */}
      <Modal
        opened={isConnectModalOpen}
        onClose={closeAccountModal}
        title="Connect Cloud Account"
      >
        <Form onSubmit={handleConnectAccount} methods={connectAccountMethods}>
          <Stack>
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
                background: '#0284c7',
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
  );
};

export default Profile;
