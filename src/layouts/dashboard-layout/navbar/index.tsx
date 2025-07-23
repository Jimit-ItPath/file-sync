import { NavLink as Link, useLocation } from 'react-router';
import { Box, Group, NavLink, Progress, rem, Stack, Text } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import Icon from '../../../assets/icons/icon';
import { useMemo } from 'react';
import useSidebar from './use-sidebar';
import { Button, Form, Input, Modal, Tooltip } from '../../../components';
import AccountTypeSelector from './AccountTypeSelector';
import { LoaderOverlay } from '../../../components/loader';
import { formatBytes } from '../../../utils/helper';
import { ROLES } from '../../../utils/constants';

const DASHBOARD_NAV_ITEMS = [
  {
    id: 'files',
    label: 'Files',
    icon: ICONS.IconFolder,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  // {
  //   id: 'favorites',
  //   label: 'Favorites',
  //   icon: ICONS.IconStar,
  //   url: PRIVATE_ROUTES.DASHBOARD.url,
  //   roles: PRIVATE_ROUTES.DASHBOARD.roles,
  // },
  // {
  //   id: 'recent',
  //   label: 'Recent',
  //   icon: ICONS.IconClock,
  //   url: PRIVATE_ROUTES.DASHBOARD.url,
  //   roles: PRIVATE_ROUTES.DASHBOARD.roles,
  // },
  // {
  //   id: 'shared',
  //   label: 'Shared',
  //   icon: ICONS.IconUsersGroup,
  //   url: PRIVATE_ROUTES.DASHBOARD.url,
  //   roles: PRIVATE_ROUTES.DASHBOARD.roles,
  // },
  // {
  //   id: 'file-requests',
  //   label: 'File requests',
  //   icon: ICONS.IconFile,
  //   url: PRIVATE_ROUTES.DASHBOARD.url,
  //   roles: PRIVATE_ROUTES.DASHBOARD.roles,
  // },
  // {
  //   id: 'trash',
  //   label: 'Trash',
  //   icon: ICONS.IconTrash,
  //   url: PRIVATE_ROUTES.DASHBOARD.url,
  //   roles: PRIVATE_ROUTES.DASHBOARD.roles,
  // },
] as const;

type NavItem = (typeof DASHBOARD_NAV_ITEMS)[number];

type AccessibleNavItemProps = NavItem & {
  children?: any[];
  roles?: string[];
  id: string | number;
  label: string;
  icon: React.ElementType;
  url: string;
};

const NavBar = ({ mobileDrawerHandler }: any) => {
  const location = useLocation();
  const {
    handleConnectAccount,
    isConnectModalOpen,
    methods,
    openAccountModal,
    closeAccountModal,
    connectAccountFormData,
    connectAccountLoading,
    loading,
    closeRemoveAccessModal,
    openRemoveAccessModal,
    removeAccess,
    removeAccessLoading,
    removeAccessModalOpen,
    hoveredAccountId,
    setHoveredAccountId,
    cloudAccountsWithStorage,
    checkStorageDetails,
    user,
  } = useSidebar();

  const isActiveRoute = useMemo(
    () => (routeUrl: string) => location.pathname.startsWith(routeUrl),
    [location.pathname]
  );

  const accessibleNavItems = DASHBOARD_NAV_ITEMS;

  return (
    <Box display={'flex'} h={'100%'} style={{ flexDirection: 'column' }}>
      <LoaderOverlay visible={loading} opacity={1} />
      {user?.user?.role !== ROLES.ADMIN ? (
        <>
          <Box style={{ flexGrow: 1 }}>
            {accessibleNavItems.map(
              ({ id, label, icon, url, children }: AccessibleNavItemProps) => {
                const isNested = Boolean(children?.length);

                const isActive = isNested
                  ? children?.map(({ url }) => url).includes(location?.pathname)
                  : location?.pathname === url;

                return (
                  <NavLink
                    component={Link}
                    key={id}
                    {...{ label }}
                    leftSection={
                      <Icon component={icon} size={18} stroke={1.25} />
                    }
                    active={isActive}
                    to={url}
                    style={{
                      borderRadius: 'var(--mantine-radius-default)',
                      ...(isActive && {
                        // border: '1px solid var(--mantine-primary-color-1)',
                        fontWeight: 400,
                      }),
                    }}
                    onClick={() => {
                      mobileDrawerHandler?.close();
                    }}
                    w={{ base: '100%', sm: 'auto' }}
                    px={{ sm: 8 }}
                    py={{ sm: 6 }}
                    styles={{
                      section: {
                        marginInlineEnd: 'var(--mantine-spacing-xs)',
                        marginBottom: rem(-1),
                      },
                    }}
                  />
                );
              }
            )}
            <Stack
              mt={20}
              style={{ flexDirection: 'row' }}
              justify="space-between"
              align="center"
            >
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                CLOUD ACCOUNTS
              </span>
              <ICONS.IconPlus
                size={18}
                onClick={openAccountModal}
                style={{ cursor: 'pointer' }}
              />
            </Stack>
            {cloudAccountsWithStorage?.length
              ? cloudAccountsWithStorage?.map(({ id, url, icon, title }) => {
                  const isActive = isActiveRoute(url);

                  return (
                    <Group
                      key={id}
                      style={{
                        position: 'relative',
                        width: '100%',
                      }}
                      onMouseEnter={() => setHoveredAccountId(id)}
                      onMouseLeave={() => setHoveredAccountId(null)}
                    >
                      <Stack style={{ flexDirection: 'row' }} w={'100%'}>
                        <Link
                          to={url}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            borderRadius: 'var(--mantine-radius-default)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'background-color 0.2s',
                            backgroundColor: isActive
                              ? 'var(--mantine-color-gray-0)'
                              : undefined,
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '100%',
                          }}
                          onClick={() => {
                            mobileDrawerHandler?.close();
                          }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor =
                                'var(--mantine-color-gray-0)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = '';
                            }
                          }}
                        >
                          {icon}
                          <span style={{ color: '#000', marginLeft: '10px' }}>
                            {title}
                          </span>
                        </Link>
                        {hoveredAccountId === id && (
                          <Tooltip
                            label="Remove Access"
                            position="right"
                            withArrow
                          >
                            <Box
                              style={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                              }}
                              onClick={e => {
                                e.stopPropagation();
                                openRemoveAccessModal(id);
                              }}
                            >
                              <ICONS.IconTrash size={16} color="red" />
                            </Box>
                          </Tooltip>
                        )}
                      </Stack>
                    </Group>
                  );
                })
              : null}

            <Stack
              mt={20}
              style={{ flexDirection: 'row', cursor: 'pointer' }}
              align="center"
              onClick={openAccountModal}
            >
              <ICONS.IconPlus size={18} />
              <span style={{ fontSize: '14px', color: '##0284C7' }}>
                Connect Account
              </span>
            </Stack>
          </Box>

          {checkStorageDetails?.storage_details && (
            <Box mt="auto" style={{ width: '100%', padding: '16px 0' }}>
              <Text size="sm" fw={500} mb={8}>
                Storage Usage
              </Text>
              <Progress
                value={
                  (Number(checkStorageDetails?.storage_details?.used) /
                    Number(checkStorageDetails?.storage_details?.total)) *
                  100
                }
                size="xl"
                radius="xl"
                styles={theme => ({
                  root: {
                    backgroundColor: theme.colors.gray[2],
                  },
                  bar: {
                    backgroundColor: theme.colors.blue[6],
                  },
                })}
              />
              <Text size="xs" mt={8} color="dimmed">
                {formatBytes(
                  Number(checkStorageDetails?.storage_details?.used)
                )}{' '}
                of{' '}
                {formatBytes(
                  Number(checkStorageDetails?.storage_details?.total)
                )}{' '}
                used
              </Text>
            </Box>
          )}
        </>
      ) : (
        <>
          {(() => {
            const url = PRIVATE_ROUTES.USERS.url;
            const isActive = location?.pathname === url;

            return (
              <NavLink
                component={Link}
                label="Users"
                leftSection={
                  <Icon component={ICONS.IconUser} size={18} stroke={1.25} />
                }
                active={isActive}
                to={url}
                style={{
                  borderRadius: 'var(--mantine-radius-default)',
                  ...(isActive && {
                    fontWeight: 400,
                  }),
                }}
                onClick={() => {
                  mobileDrawerHandler?.close();
                }}
                w={{ base: '100%', sm: 'auto' }}
                px={{ sm: 8 }}
                py={{ sm: 6 }}
                styles={{
                  section: {
                    marginInlineEnd: 'var(--mantine-spacing-xs)',
                    marginBottom: rem(-1),
                  },
                }}
              />
            );
          })()}
        </>
      )}

      {/* <Box mt={20}>
        <Stack
          mt={20}
          style={{ flexDirection: 'row' }}
          justify="space-between"
          align="center"
        >
          <span style={{ fontSize: '14px', color: '#6b7280' }}>FOLDERS</span>
          <ICONS.IconFolder size={18} />
        </Stack>

        <Stack
          onClick={() => {
            mobileDrawerHandler?.close();
          }}
          mt={20}
          fz={14}
          align='center'
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Documents
        </Stack>

        <Stack
          onClick={() => {
            mobileDrawerHandler?.close();
          }}
          mt={20}
          fz={14}
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Images
        </Stack>

        <Stack
          onClick={() => {
            mobileDrawerHandler?.close();
          }}
          mt={20}
          fz={14}
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Videos
        </Stack>
      </Box> */}

      <Modal
        opened={isConnectModalOpen}
        onClose={closeAccountModal}
        title="Connect Cloud Account"
      >
        <Form onSubmit={handleConnectAccount} methods={methods}>
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
              value={methods.watch('accountType')}
              onChange={val =>
                methods.setValue(
                  'accountType',
                  val as 'google_drive' | 'dropbox' | 'onedrive'
                )
              }
              error={methods.formState.errors.accountType?.message}
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

      {/* Remove access modal */}
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
    </Box>
  );
};

export default NavBar;
