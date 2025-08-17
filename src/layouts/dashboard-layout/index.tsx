import { useDisclosure } from '@mantine/hooks';
import {
  ActionIcon,
  AppShell,
  Autocomplete,
  Avatar,
  Box,
  Burger,
  Container,
  Group,
  Stack,
  TextInput,
  Menu as MantineMenu,
} from '@mantine/core';
import { Outlet, useNavigate } from 'react-router';
import { usePageData } from '../../hooks/use-page-data';
import useAuth from '../../auth/use-auth';
import { ICONS } from '../../assets/icons';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../../routing/routes';
import NavBar from './navbar';
import { Button, Dropzone, Form, Menu, Modal } from '../../components';
import { ConfirmModal } from '../../components/confirm-modal';
import Icon from '../../assets/icons/icon';
import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProfile, resetUserProfile } from '../../store/slices/user.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import {
  // fetchStorageDetails,
  // getConnectedAccount,
  resetUser,
  updateUser,
} from '../../store/slices/auth.slice';
import useResponsive from '../../hooks/use-responsive';
import { ROLES } from '../../utils/constants';
import { decodeToken, removeLocalStorage } from '../../utils/helper';
import GlobalSearchBar from './GlobalSearchBar';
import TawkToWidget from '../../widget/TawkToWidget';
import useDashboard from '../../pages/dashboard/use-dashboard';
import { Controller } from 'react-hook-form';

const DashboardLayout = () => {
  usePageData();
  const [mobileDrawerOpened, mobileDrawerHandler] = useDisclosure();
  const [logoutConfirmOpened, logoutConfirmHandler] = useDisclosure();
  const { isSm, isXs } = useResponsive();
  const {
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
  } = useDashboard({});

  const { logout } = useAuth() as any;
  const dispatch = useAppDispatch();
  const { userProfile } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  // const location = useLocation();
  // const hasRedirectedRef = useRef(false);

  // const getAccounts = useCallback(async () => {
  //   await dispatch(getConnectedAccount());
  // }, [dispatch]);

  // const [onInitialize] = useAsyncOperation(getAccounts);

  // const getStorageDetails = useCallback(async () => {
  //   await dispatch(fetchStorageDetails());
  // }, [dispatch]);

  // const [fetchStorageData] = useAsyncOperation(getStorageDetails);

  const getUserProfile = useCallback(async () => {
    const res = await dispatch(fetchProfile());
    if (res?.payload?.data?.role === ROLES.USER && token) {
      const decodeData: any = decodeToken(token);
      dispatch(
        updateUser({
          token,
          activeUI: '',
          user: { ...decodeData },
        })
      );
    }
  }, [dispatch]);

  const [getProfile] = useAsyncOperation(getUserProfile);

  // useEffect(() => {
  //   if (!hasRedirectedRef.current) {
  //     hasRedirectedRef.current = true;

  //     const role = user?.user?.role; // or get from auth state
  //     const currentPath = location.pathname;

  //     if (role === ROLES.ADMIN && !currentPath.startsWith('/admin')) {
  //       // navigate('/admin/dashboard', { replace: true });
  //       navigate(PRIVATE_ROUTES.USERS.url);
  //     }
  //     // else if (role === ROLES.USER && currentPath === '/dashboard') {
  //     //   navigate('/dashboard', { replace: true });
  //     // }
  //   }
  // }, [user, navigate, location]);

  useEffect(() => {
    getProfile({});
    // const handleBeforeUnload = () => {
    //   removeLocalStorage('googleDrivePath');
    // };

    // window.addEventListener('beforeunload', handleBeforeUnload);
    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, []);

  // useEffect(() => {
  //   if (userProfile?.role === ROLES.USER) {
  //     onInitialize({});
  //     fetchStorageData({});
  //   }
  // }, [userProfile]);

  const fullName = useMemo(
    () =>
      `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() ||
      '',
    [userProfile?.first_name, userProfile?.last_name]
  );

  const PROFILE_MENU_ITEMS = [
    { id: 'profile', label: 'Profile', icon: ICONS.IconUser },
    { id: 'logout', label: 'Logout', icon: ICONS.IconLogout },
  ];

  const onItemClick = (id: string) => {
    if (id === 'profile') {
      navigate(PRIVATE_ROUTES.PROFILE.url);
    }
    if (id === 'logout') {
      logoutConfirmHandler.open();
    }
  };

  const onLogoutConfirm = () => {
    logout();
    if (userProfile?.role === ROLES.ADMIN) {
      navigate(AUTH_ROUTES.ADMIN_LOGIN.url);
    } else {
      // navigate(AUTH_ROUTES.LOGIN.url);
      navigate(AUTH_ROUTES.LANDING.url);
    }
    setTimeout(() => {
      dispatch(resetUser());
      dispatch(resetUserProfile());
    }, 1000);
    logoutConfirmHandler.close();
  };

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 250,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileDrawerOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Container h="100%" size="var(--mantine-breakpoint-xxl)" px={0}>
            <Group h="100%" px="md" justify="space-between">
              {/* Left: Burger + Logo + Search */}
              <Group
                gap={16}
                align="center"
                wrap="nowrap"
                // justify="space-between"
                // maw={600}
                w={!isXs ? '90%' : 'max-content'}
              >
                <Burger
                  opened={mobileDrawerOpened}
                  onClick={mobileDrawerHandler.toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                {isXs ? (
                  <ICONS.IconCloud
                    size={32}
                    color={'#0ea5e9'}
                    onClick={() => {
                      removeLocalStorage('folderId');
                      removeLocalStorage('cloudStoragePath');
                      navigate(PRIVATE_ROUTES.DASHBOARD.url);
                    }}
                  />
                ) : (
                  <Box
                    fw={700}
                    fz={22}
                    c="blue.7"
                    style={{ letterSpacing: -0.5, cursor: 'pointer' }}
                    onClick={() => {
                      removeLocalStorage('folderId');
                      removeLocalStorage('cloudStoragePath');
                      navigate(PRIVATE_ROUTES.DASHBOARD.url);
                    }}
                  >
                    AllCloudHub
                  </Box>
                )}
                {/* {!isSm ? (
                  <Group
                    align="center"
                    gap={0}
                    style={{ position: 'relative' }}
                    ml={60}
                  >
                    <TextInput
                      placeholder="Search files and folders..."
                      w={600}
                      size="sm"
                      pl={36}
                      leftSection={
                        <Icon component={ICONS.IconSearch} size={16} />
                      }
                      styles={{
                        input: {
                          borderRadius: 8,
                          border: '1px solid #d1d5db',
                          background: '#fff',
                        },
                      }}
                      aria-label="Search files and folders"
                    />
                  </Group>
                ) : null} */}
                {!isXs ? (
                  <Group
                    align="center"
                    gap={0}
                    flex={1}
                    style={{ position: 'relative' }}
                    ml={isSm ? 0 : 60}
                    w={'100%'}
                  >
                    <GlobalSearchBar placeholder="Search files and folders..." />
                  </Group>
                ) : null}
              </Group>

              {isSm ? (
                <MantineMenu
                  position="top-end"
                  withArrow
                  width={200}
                  shadow="lg"
                  offset={8}
                >
                  <MantineMenu.Target>
                    <ActionIcon
                      radius="xl"
                      size={60}
                      variant="filled"
                      color="blue"
                      style={{
                        position: 'fixed',
                        bottom: 20,
                        left: 20,
                        zIndex: 2000,
                        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                      }}
                      aria-label="New"
                    >
                      <ICONS.IconPlus size={26} />
                    </ActionIcon>
                  </MantineMenu.Target>

                  <MantineMenu.Dropdown>
                    <MantineMenu.Item
                      leftSection={<ICONS.IconFolderPlus size={16} />}
                      onClick={() => {
                        openModal('folder');
                        mobileDrawerHandler?.close();
                      }}
                    >
                      Create folder
                    </MantineMenu.Item>
                    <MantineMenu.Item
                      leftSection={<ICONS.IconUpload size={16} />}
                      onClick={() => {
                        openModal('files');
                        mobileDrawerHandler?.close();
                      }}
                    >
                      Upload files
                    </MantineMenu.Item>
                  </MantineMenu.Dropdown>
                </MantineMenu>
              ) : null}

              <Group gap={16} align="center">
                {/* <ICONS.IconBell size={isXs ? 20 : 24} /> */}
                {/* <ICONS.IconSettings size={isXs ? 20 : 24} /> */}
                <Menu
                  width={140}
                  onItemClick={onItemClick}
                  position="bottom-end"
                  items={PROFILE_MENU_ITEMS}
                  zIndex={10}
                >
                  <ActionIcon
                    variant="filled"
                    size={isXs ? 'md' : 'lg'}
                    color="blue"
                    radius="xl"
                    aria-label="User"
                  >
                    {userProfile?.profile ? (
                      <Avatar
                        src={`${import.meta.env.VITE_REACT_APP_BASE_URL}/user-profile/${userProfile.profile}`}
                        alt={fullName}
                        radius="xl"
                        color="#fff"
                        size="md"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <Box
                        style={{ fontWeight: 600, fontSize: isXs ? 12 : 14 }}
                      >
                        {fullName
                          ? fullName
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : 'JS'}
                      </Box>
                    )}
                  </ActionIcon>
                </Menu>
              </Group>
            </Group>
          </Container>
        </AppShell.Header>
        <AppShell.Navbar p="md" styles={{ navbar: { zIndex: 20 } }}>
          <NavBar {...{ mobileDrawerHandler, isSm }} />
        </AppShell.Navbar>
        <AppShell.Main ml={-15} pe={0} pt={60}>
          <Container size="var(--mantine-breakpoint-xxl)" px={0}>
            <Outlet />
          </Container>
        </AppShell.Main>
      </AppShell>

      <ConfirmModal
        opened={logoutConfirmOpened}
        onClose={logoutConfirmHandler.close}
        icon={ICONS.IconLogout}
        title="Logout?"
        message="Are you sure you want to logout?"
        confirmButtonProps={{
          label: 'Logout',
          leftSection: <Icon component={ICONS.IconLogout} size={16} />,
          onClick: onLogoutConfirm,
        }}
      />

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
                type="submit"
                loading={uploadFilesLoading}
                disabled={uploadedFiles.length === 0 || uploadFilesLoading}
              >
                Upload Files
              </Button>
            </Stack>
          </Form>
        )}
      </Modal>

      <TawkToWidget />
    </>
  );
};

export default DashboardLayout;
