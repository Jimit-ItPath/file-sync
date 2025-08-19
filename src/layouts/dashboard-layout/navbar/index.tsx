import { NavLink as Link, useLocation } from 'react-router';
import {
  Autocomplete,
  Box,
  Group,
  Menu,
  NavLink,
  Progress,
  rem,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import Icon from '../../../assets/icons/icon';
import { useMemo } from 'react';
import useSidebar from './use-sidebar';
import { Button, Dropzone, Form, Input, Modal } from '../../../components';
import AccountTypeSelector from './AccountTypeSelector';
import { formatBytes, removeLocalStorage } from '../../../utils/helper';
import { ROLES } from '../../../utils/constants';
import ConnectAccountDescription from '../../../pages/dashboard/ConnectAccountDescription';
import ShowConfetti from '../../../components/confetti';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableCloudAccountItem from './SortableCloudAccountItem';
import { Controller } from 'react-hook-form';
import UploadProgress from '../../../pages/dashboard/components/UploadProgress';

const DASHBOARD_NAV_ITEMS = [
  {
    id: 'files',
    label: 'Files',
    icon: ICONS.IconFolder,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
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

const NavBar = ({
  mobileDrawerHandler,
  isSm,
  openModal,
  modalOpen,
  closeModal,
  modalType,
  folderMethods,
  handleCreateFolder,
  isSFDEnabled,
  accountOptionsForSFD,
  createFolderLoading,
  handleFileUpload,
  uploadMethods,
  setUploadedFiles,
  getFileIcon,
  uploadedFiles,
  uploadFilesLoading,
  showUploadProgress,
  uploadProgress,
  uploadingFiles,
  handleCancelUpload,
  handleCloseUploadProgress,
}: any) => {
  const location = useLocation();
  const {
    handleConnectAccount,
    isConnectModalOpen,
    methods,
    openAccountModal,
    closeAccountModal,
    connectAccountFormData,
    connectAccountLoading,
    // loading,
    closeRemoveAccessModal,
    openRemoveAccessModal,
    removeAccess,
    removeAccessLoading,
    removeAccessModalOpen,
    hoveredAccountId,
    setHoveredAccountId,
    checkStorageDetails,
    user,
    height,
    width,
    showConfetti,
    setShowConfetti,
    sortedCloudAccounts,
    handleDragEnd,
    // updateSequenceLoading,
    // closeNewModal,
    // isNewModalOpen,
    // openNewModal,
    menuOpened,
    setMenuOpened,
  } = useSidebar();

  const isActiveRoute = useMemo(
    () => (routeUrl: string) => location.pathname.startsWith(routeUrl),
    [location.pathname]
  );

  const accessibleNavItems = DASHBOARD_NAV_ITEMS;

  // Configure sensors with more restrictive activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Box display={'flex'} h={'100%'} style={{ flexDirection: 'column' }}>
      {/* <LoaderOverlay visible={loading} opacity={1} /> */}
      {user?.user?.role !== ROLES.ADMIN ? (
        <>
          {sortedCloudAccounts?.length && !isSm ? (
            <Menu
              position="bottom-start"
              opened={menuOpened}
              onClose={() => setMenuOpened(false)}
              width={260}
              shadow="xl"
              radius="lg"
              offset={8}
              styles={{
                dropdown: {
                  background: '#ffffff',
                  border: '1px solid rgba(0, 86, 179, 0.1)',
                  backdropFilter: 'blur(20px)',
                  boxShadow:
                    '0 20px 40px rgba(0, 86, 179, 0.15), 0 0 0 1px rgba(0, 86, 179, 0.05)',
                  padding: '8px',
                },
              }}
            >
              <Menu.Target>
                <Box
                  onClick={() => setMenuOpened(true)}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    marginRight: '1rem',
                    width: 'fit-content',
                  }}
                >
                  {/* Main Button */}
                  <Box
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: menuOpened ? 'scale(0.95)' : 'scale(1)',
                      // border: '2px solid #0056b3',
                      border: '2px solid #1c7ed6',
                      // boxShadow: menuOpened
                      //   ? '0 8px 32px rgba(0, 86, 179, 0.25)'
                      //   : '0 4px 20px rgba(0, 86, 179, 0.15)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform =
                        'scale(1.02) translateY(-1px)';
                      // e.currentTarget.style.boxShadow =
                      //   '0 12px 40px rgba(0, 86, 179, 0.3)';
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={e => {
                      if (!menuOpened) {
                        e.currentTarget.style.transform = 'scale(1)';
                        // e.currentTarget.style.boxShadow =
                        //   '0 4px 20px rgba(0, 86, 179, 0.15)';
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
                  >
                    {/* Animated Background Pattern */}
                    <Box
                      style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background:
                          'conic-gradient(from 0deg, transparent, rgba(0, 86, 179, 0.03), transparent)',
                        animation: 'rotate 10s linear infinite',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Button Content */}
                    <Group gap={8} style={{ position: 'relative', zIndex: 1 }}>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '8px',
                          // background: '#0056b3',
                          background: '#1c7ed6',
                          transition: 'all 0.3s ease',
                          // boxShadow: '0 2px 8px rgba(0, 86, 179, 0.3)',
                          // boxShadow: '0 2px 8px #1c7ed6',
                        }}
                      >
                        <ICONS.IconPlus
                          size={14}
                          color="#ffffff"
                          style={{
                            transition: 'transform 0.3s ease',
                            transform: menuOpened
                              ? 'rotate(45deg)'
                              : 'rotate(0deg)',
                          }}
                        />
                      </Box>
                      <Text
                        style={{
                          // color: '#0056b3',
                          color: '#1c7ed6',
                          fontWeight: 600,
                          fontSize: '14px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        New
                      </Text>
                    </Group>

                    {/* Subtle Shimmer Effect */}
                    <Box
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(0, 86, 179, 0.1), transparent)',
                        animation: 'shimmer 4s ease-in-out infinite',
                        pointerEvents: 'none',
                      }}
                    />
                  </Box>

                  <style>{`
                    @keyframes rotate {
                      from {
                        transform: rotate(0deg);
                      }
                      to {
                        transform: rotate(360deg);
                      }
                    }

                    @keyframes shimmer {
                      0%,
                      100% {
                        left: -100%;
                      }
                      50% {
                        left: 100%;
                      }
                    }
                  `}</style>
                </Box>
              </Menu.Target>

              <Menu.Dropdown>
                {/* Enhanced Menu Items */}
                <Menu.Item
                  leftSection={
                    <Box
                      style={{
                        background:
                          'linear-gradient(135deg, #0056b3 0%, #0070f3 100%)',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ICONS.IconFolderPlus size={16} color="#ffffff" />
                    </Box>
                  }
                  onClick={() => {
                    openModal('folder');
                    mobileDrawerHandler?.close();
                  }}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    // margin: '4px',
                    transition: 'all 0.2s ease',
                    background: 'rgba(0, 86, 179, 0.02)',
                    color: '#1f2937',
                    border: '1px solid rgba(0, 86, 179, 0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 86, 179, 0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.borderColor = 'rgba(0, 86, 179, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 86, 179, 0.02)';
                    e.currentTarget.style.transform = 'translateX(0px)';
                    e.currentTarget.style.borderColor =
                      'rgba(0, 86, 179, 0.08)';
                  }}
                >
                  <Box>
                    <Text fw={500} size="sm" c="#1f2937">
                      Create folder
                    </Text>
                    <Text size="xs" c="#6b7280" mt={2}>
                      Organize your files
                    </Text>
                  </Box>
                </Menu.Item>

                <Menu.Item
                  leftSection={
                    <Box
                      style={{
                        background:
                          'linear-gradient(135deg, #0056b3 0%, #0070f3 100%)',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ICONS.IconUpload size={16} color="#ffffff" />
                    </Box>
                  }
                  onClick={() => {
                    openModal('files');
                    mobileDrawerHandler?.close();
                  }}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    marginTop: '4px',
                    transition: 'all 0.2s ease',
                    background: 'rgba(0, 86, 179, 0.02)',
                    color: '#1f2937',
                    border: '1px solid rgba(0, 86, 179, 0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 86, 179, 0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.borderColor = 'rgba(0, 86, 179, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 86, 179, 0.02)';
                    e.currentTarget.style.transform = 'translateX(0px)';
                    e.currentTarget.style.borderColor =
                      'rgba(0, 86, 179, 0.08)';
                  }}
                >
                  <Box>
                    <Text fw={500} size="sm" c="#1f2937">
                      Upload files
                    </Text>
                    <Text size="xs" c="#6b7280" mt={2}>
                      Add documents, images & more
                    </Text>
                  </Box>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : null}
          <Box
            style={{ flexGrow: 1 }}
            mt={sortedCloudAccounts?.length ? 10 : 0}
          >
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
                      removeLocalStorage('folderId');
                      removeLocalStorage('cloudStoragePath');
                      removeLocalStorage('globalSearchState');
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
            {(() => {
              const url = PRIVATE_ROUTES.RECENT_FILES.url;
              const isActive = location?.pathname === url;

              if (!sortedCloudAccounts?.length) return null;

              return (
                <NavLink
                  component={Link}
                  label="Recent Files"
                  leftSection={
                    <Icon component={ICONS.IconClock} size={18} stroke={1.25} />
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
            <Stack
              mt={20}
              style={{ flexDirection: 'row' }}
              justify="space-between"
              align="center"
            >
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                CLOUD ACCOUNTS
              </span>
              {/* <ICONS.IconPlus
                size={18}
                onClick={() => {
                  openAccountModal();
                  mobileDrawerHandler?.close();
                }}
                style={{ cursor: 'pointer' }}
              /> */}
            </Stack>

            {/* Drag and Drop Context for Cloud Accounts - Constrained to this container */}
            {sortedCloudAccounts?.length ? (
              <Box
                style={{
                  position: 'relative',
                  // Add container styles to limit drag area
                  // overflow: 'hidden',
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  // Add modifiers to constrain dragging
                  modifiers={[
                    // Custom modifier to restrict drag area
                    ({ transform, containerNodeRect, draggingNodeRect }) => {
                      if (!containerNodeRect || !draggingNodeRect)
                        return transform;

                      // Constrain horizontal movement
                      const constrainedX = Math.max(
                        containerNodeRect.left - draggingNodeRect.left,
                        Math.min(
                          containerNodeRect.right - draggingNodeRect.right,
                          transform.x
                        )
                      );

                      return {
                        ...transform,
                        x: constrainedX,
                      };
                    },
                  ]}
                >
                  <SortableContext
                    items={sortedCloudAccounts.map(account => account.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {/* {updateSequenceLoading ? (
                      <Group align="center" justify="center" mt={10} mr={10}>
                        <Loader />
                      </Group>
                    ) : ( */}
                    {sortedCloudAccounts?.map(account => {
                      const isActive = isActiveRoute(account.url);

                      return (
                        <SortableCloudAccountItem
                          key={account.id}
                          account={account}
                          isActive={isActive}
                          hoveredAccountId={hoveredAccountId}
                          setHoveredAccountId={setHoveredAccountId}
                          openRemoveAccessModal={openRemoveAccessModal}
                          mobileDrawerHandler={mobileDrawerHandler}
                          sortedCloudAccounts={sortedCloudAccounts}
                        />
                      );
                    })}
                    {/* )} */}
                  </SortableContext>
                </DndContext>
              </Box>
            ) : null}
            {/* {cloudAccountsWithStorage?.length
              ? cloudAccountsWithStorage?.map(
                  ({ id, url, icon, title, storageInfo }) => {
                    const isActive = isActiveRoute(url);

                    return (
                      <Box key={id} mb={'xs'}>
                        <Group
                          // key={id}
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
                                removeLocalStorage('folderId');
                                removeLocalStorage('cloudStoragePath');
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
                              <span
                                style={{ color: '#000', marginLeft: '10px' }}
                              >
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
                        {storageInfo && storageInfo.total ? (
                          // && storageInfo.used
                          <Box px={8} mt={4}>
                            <Progress
                              value={
                                (Number(storageInfo.used) /
                                  Number(storageInfo.total)) *
                                100
                              }
                              size="sm"
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
                            <Text size="xs" mt={4} c="dimmed">
                              {formatBytes(Number(storageInfo.used))} of{' '}
                              {formatBytes(Number(storageInfo.total))} used
                            </Text>
                          </Box>
                        ) : null}
                      </Box>
                    );
                  }
                )
              : null} */}

            <Stack
              mt={20}
              style={{ flexDirection: 'row', cursor: 'pointer' }}
              align="center"
              onClick={() => {
                openAccountModal();
                mobileDrawerHandler?.close();
              }}
            >
              <ICONS.IconPlus size={18} color="#0284C7" />
              <span
                style={{ fontSize: '14px', color: '#0284C7', fontWeight: 400 }}
              >
                Connect Account
              </span>
            </Stack>
          </Box>

          {checkStorageDetails?.storage_details &&
          checkStorageDetails?.storage_details?.total ? (
            // && checkStorageDetails?.storage_details?.used
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
              <Text size="xs" mt={8} c="dimmed">
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
          ) : null}

          {showConfetti && (
            <ShowConfetti
              {...{ height, setShowConfetti, showConfetti, width }}
            />
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

          {(() => {
            const url = PRIVATE_ROUTES.AUDIT_LOGS.url;
            const isActive = location?.pathname === url;

            return (
              <NavLink
                component={Link}
                label="Audit Logs"
                leftSection={
                  <Icon component={ICONS.IconLogs} size={18} stroke={1.25} />
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

      {/* File / Folder Action Modal */}
      {/* <Modal opened={isNewModalOpen} onClose={closeNewModal} title="Create New">
        <ActionButtons
          openModal={openModal}
          handleSyncStorage={handleSyncStorage}
          onActionComplete={closeNewModal}
        />
      </Modal> */}

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
                      (option: any) => option.value === field.value
                    );

                    return (
                      <Autocomplete
                        label="Select Account"
                        placeholder="Choose an account"
                        data={accountOptionsForSFD}
                        value={selectedOption ? selectedOption.label : ''}
                        onChange={value => {
                          const matchedOption = accountOptionsForSFD.find(
                            (option: any) =>
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
                      (option: any) => option.value === field.value
                    );

                    return (
                      <Autocomplete
                        label="Select Account"
                        placeholder="Choose an account"
                        data={accountOptionsForSFD}
                        value={selectedOption ? selectedOption.label : ''}
                        onChange={value => {
                          const matchedOption = accountOptionsForSFD.find(
                            (option: any) =>
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

      {showUploadProgress ? (
        <UploadProgress
          uploadProgress={uploadProgress}
          uploadingFiles={uploadingFiles}
          onCancelUpload={handleCancelUpload}
          onClose={handleCloseUploadProgress}
        />
      ) : null}
    </Box>
  );
};

export default NavBar;
