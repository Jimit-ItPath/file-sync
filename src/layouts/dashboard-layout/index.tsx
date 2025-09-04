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
  Text,
  Image,
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
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProfile, resetUserProfile } from '../../store/slices/user.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import {
  fetchStorageDetails,
  getConnectedAccount,
  // fetchStorageDetails,
  // getConnectedAccount,
  resetUser,
  updateUser,
} from '../../store/slices/auth.slice';
import useResponsive from '../../hooks/use-responsive';
import { ROLES } from '../../utils/constants';
import {
  decodeToken,
  getLocalStorage,
  removeLocalStorage,
} from '../../utils/helper';
import GlobalSearchBar from './GlobalSearchBar';
import TawkToWidget from '../../widget/TawkToWidget';
import useDashboard from '../../pages/dashboard/use-dashboard';
import { Controller } from 'react-hook-form';
import {
  fetchCloudStorageFiles,
  resetCloudStorageFolder,
} from '../../store/slices/cloudStorage.slice';
import { notifications } from '@mantine/notifications';
import UploadProgressV2 from '../../pages/dashboard/file-upload-v2/UploadProgressV2';
import useFileDownloader from '../../pages/dashboard/components/use-file-downloader';
import GoogleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import AllCloudHubLogo from '../../assets/svgs/AllCloudHub-Logo.svg';

const DashboardLayout = () => {
  usePageData();
  const [mobileDrawerOpened, mobileDrawerHandler] = useDisclosure();
  const [logoutConfirmOpened, logoutConfirmHandler] = useDisclosure();
  const { isSm, isXs } = useResponsive();
  const {
    downloadFile,
    cancelDownload,
    clearDownload,
    downloadProgress,
    pauseDownload,
    resumeDownload,
    fetchPreviewFileWithProgress,
  } = useFileDownloader();
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
    // uploadFilesLoading,
    showUploadProgress,
    uploadProgress,
    uploadingFiles,
    handleCancelUpload,
    handleCloseUploadProgress,
    handleRemoveUploadedFile,
    handleFileUploadV2,
    uploadingFilesV2,
    cancelUploadV2,
    closeUploadProgressV2,
    showUploadProgressV2,
  } = useDashboard({ fetchPreviewFileWithProgress });

  const { logout } = useAuth() as any;
  const dispatch = useAppDispatch();
  const { userProfile } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const hasCalledOnce = useRef(false);
  // const location = useLocation();
  // const hasRedirectedRef = useRef(false);

  const accountConfigs = useMemo(
    () => ({
      google_drive: {
        icon: <Image src={GoogleDriveIcon} w={14} h={14} />,
        color: 'red',
        label: 'Google Drive',
      },
      dropbox: {
        icon: <Image src={DropboxIcon} w={15} />,
        color: 'blue',
        label: 'Dropbox',
      },
      onedrive: {
        icon: <Image src={OneDriveIcon} w={14} h={14} />,
        color: 'indigo',
        label: 'OneDrive',
      },
    }),
    []
  );

  const getAccounts = useCallback(async () => {
    await dispatch(getConnectedAccount());
  }, [dispatch]);

  const [onInitialize] = useAsyncOperation(getAccounts);

  const getStorageDetails = useCallback(async () => {
    await dispatch(fetchStorageDetails());
  }, [dispatch]);

  const [fetchStorageData] = useAsyncOperation(getStorageDetails);

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
  //       navigate(PRIVATE_ROUTES.ADMIN_DASHBOARD.url);
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

  useEffect(() => {
    if (userProfile?.role === ROLES.USER && !hasCalledOnce.current) {
      hasCalledOnce.current = true;
      onInitialize({});
      fetchStorageData({});
    }
  }, [userProfile]);

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

  const redirectToDashboard = useCallback(() => {
    if (userProfile?.role === ROLES.ADMIN) {
      navigate(PRIVATE_ROUTES.ADMIN_DASHBOARD.url);
    } else {
      if (
        location.pathname === PRIVATE_ROUTES.DASHBOARD.url &&
        (!!getLocalStorage('folderId') || !!getLocalStorage('cloudStoragePath'))
      ) {
        dispatch(
          fetchCloudStorageFiles({
            limit: 20,
            page: 1,
          })
        );
        dispatch(resetCloudStorageFolder());
      }
      removeLocalStorage('folderId');
      removeLocalStorage('cloudStoragePath');
      navigate(PRIVATE_ROUTES.DASHBOARD.url);
    }
  }, [location, userProfile?.role]);

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
                {/* {isXs ? (
                  <ICONS.IconCloud
                    size={32}
                    color={'#0ea5e9'}
                    onClick={redirectToDashboard}
                  />
                ) : ( */}
                <Group
                  onClick={redirectToDashboard}
                  style={{ cursor: 'pointer' }}
                >
                  <Image src={AllCloudHubLogo} w={185} h="100%" fit="contain" />
                  {/* <ICONS.IconCloud size={32} color={'#1c7ed6'} />
                    <Box
                      fw={700}
                      fz={22}
                      c="blue.7"
                      style={{ letterSpacing: -0.5 }}
                    >
                      All Cloud Hub
                    </Box> */}
                </Group>
                {/* )} */}
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
                {!isXs && userProfile?.role === ROLES.USER ? (
                  <Group
                    align="center"
                    gap={0}
                    flex={1}
                    style={{ position: 'relative' }}
                    // ml={isSm ? 0 : 20}
                    w={'100%'}
                  >
                    <GlobalSearchBar
                      placeholder="Search files and folders..."
                      isSm={isSm}
                      downloadFile={downloadFile}
                      cancelDownload={cancelDownload}
                      clearDownload={clearDownload}
                      downloadProgress={downloadProgress}
                      pauseDownload={pauseDownload}
                      resumeDownload={resumeDownload}
                      fetchPreviewFileWithProgress={
                        fetchPreviewFileWithProgress
                      }
                    />
                  </Group>
                ) : null}
              </Group>

              {isSm && userProfile?.role === ROLES.USER ? (
                <MantineMenu
                  position="top-end"
                  withArrow
                  width={260}
                  shadow="xl"
                  offset={8}
                  transitionProps={{
                    transition: 'slide-up',
                    duration: 300,
                    timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  styles={{
                    dropdown: {
                      background: '#ffffff',
                      border: '1px solid rgba(0, 86, 179, 0.1)',
                      backdropFilter: 'blur(20px)',
                      boxShadow:
                        '0 20px 40px rgba(0, 86, 179, 0.15), 0 0 0 1px rgba(0, 86, 179, 0.05)',
                      padding: '8px',
                      marginLeft: '10px',
                      borderRadius: '12px',
                      transformOrigin: 'bottom center',
                    },
                    arrow: {
                      background: '#ffffff',
                      borderColor: 'rgba(0, 86, 179, 0.1)',
                    },
                  }}
                >
                  <MantineMenu.Target>
                    <Box
                      style={{
                        position: 'fixed',
                        bottom: 20,
                        left: 20,
                        zIndex: 2000,
                        display: mobileDrawerOpened ? 'none' : 'block',
                      }}
                    >
                      <ActionIcon
                        radius="xl"
                        size={60}
                        variant="filled"
                        style={{
                          background:
                            'linear-gradient(135deg, #1c7ed6 0%, #0070f3 100%)',
                          // boxShadow:
                          //   '0 8px 32px rgba(0, 86, 179, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.8)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '2px solid #ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          // e.currentTarget.style.boxShadow =
                          //   '0 12px 40px rgba(0, 86, 179, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.9)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          // e.currentTarget.style.boxShadow =
                          //   '0 8px 32px rgba(0, 86, 179, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.8)';
                        }}
                        aria-label="New"
                      >
                        {/* Pulsing Background */}
                        <Box
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                            animation: 'pulse 2s ease-in-out infinite',
                            pointerEvents: 'none',
                          }}
                        />

                        <ICONS.IconPlus
                          size={28}
                          color="#ffffff"
                          style={{
                            position: 'relative',
                            zIndex: 1,
                          }}
                        />

                        <style>{`
                          @keyframes pulse {
                            0%,
                            100% {
                              opacity: 0.8;
                              transform: scale(1);
                            }
                            50% {
                              opacity: 1;
                              transform: scale(1.1);
                            }
                          }
                        `}</style>
                      </ActionIcon>
                    </Box>
                  </MantineMenu.Target>

                  <MantineMenu.Dropdown>
                    <MantineMenu.Item
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
                            minWidth: '32px',
                            minHeight: '32px',
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
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(0, 86, 179, 0.02)',
                        color: '#1f2937',
                        border: '1px solid rgba(0, 86, 179, 0.08)',
                        minHeight: 'auto',
                        animation:
                          'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background =
                          'rgba(0, 86, 179, 0.08)';
                        e.currentTarget.style.transform =
                          'translateX(4px) scale(1.02)';
                        e.currentTarget.style.borderColor =
                          'rgba(0, 86, 179, 0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background =
                          'rgba(0, 86, 179, 0.02)';
                        e.currentTarget.style.transform =
                          'translateX(0px) scale(1)';
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
                    </MantineMenu.Item>

                    <MantineMenu.Item
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
                            minWidth: '32px',
                            minHeight: '32px',
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
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(0, 86, 179, 0.02)',
                        color: '#1f2937',
                        border: '1px solid rgba(0, 86, 179, 0.08)',
                        minHeight: 'auto',
                        animation:
                          'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background =
                          'rgba(0, 86, 179, 0.08)';
                        e.currentTarget.style.transform =
                          'translateX(4px) scale(1.02)';
                        e.currentTarget.style.borderColor =
                          'rgba(0, 86, 179, 0.2)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background =
                          'rgba(0, 86, 179, 0.02)';
                        e.currentTarget.style.transform =
                          'translateX(0px) scale(1)';
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
          <NavBar
            {...{
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
              // uploadFilesLoading,
              showUploadProgress,
              uploadProgress,
              uploadingFiles,
              handleCancelUpload,
              handleCloseUploadProgress,
              handleRemoveUploadedFile,
              handleFileUploadV2,
            }}
          />
        </AppShell.Navbar>
        <AppShell.Main ml={-15} pe={0} pt={60}>
          <Container size="var(--mantine-breakpoint-xxl)" px={0}>
            <Outlet />
          </Container>
        </AppShell.Main>
      </AppShell>

      {showUploadProgressV2 ? (
        <UploadProgressV2
          uploadingFiles={uploadingFilesV2}
          onCancelUpload={cancelUploadV2}
          onRemoveFile={handleRemoveUploadedFile as any}
          onClose={closeUploadProgressV2}
        />
      ) : null}

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
                        leftSection={
                          selectedOption && 'accountType' in selectedOption ? (
                            <Box
                              mt={
                                selectedOption?.accountType === 'dropbox'
                                  ? 0
                                  : -2
                              }
                            >
                              {
                                accountConfigs[
                                  selectedOption.accountType as keyof typeof accountConfigs
                                ]?.icon
                              }
                            </Box>
                          ) : null
                        }
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
                        renderOption={({ option }: any) => {
                          if ('accountType' in option) {
                            const config =
                              accountConfigs[
                                option.accountType as keyof typeof accountConfigs
                              ];
                            return (
                              <Group gap="sm">
                                <Box
                                  mt={
                                    option?.accountType === 'dropbox' ? 0 : -2
                                  }
                                >
                                  {config?.icon}
                                </Box>
                                <Text fz="sm">{option.label}</Text>
                              </Group>
                            );
                          }

                          return <Text fz="sm">{option.label}</Text>;
                        }}
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
                  if (files.length > 5) {
                    notifications.show({
                      message: 'You can upload a maximum of 5 files at a time.',
                      color: 'red',
                    });
                    // Only take the first 5 files
                    const limitedFiles = files.slice(0, 5);
                    setUploadedFiles(limitedFiles);
                    uploadMethods.setValue('files', limitedFiles);
                  } else {
                    setUploadedFiles(files);
                    uploadMethods.setValue('files', files);
                  }
                }}
                // maxSize={5 * 1024 ** 2}
                multiple={true}
                mb="md"
                getFileIcon={getFileIcon}
                files={uploadedFiles}
                handleRemoveUploadedFile={handleRemoveUploadedFile}
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
                        leftSection={
                          selectedOption && 'accountType' in selectedOption ? (
                            <Box
                              mt={
                                selectedOption?.accountType === 'dropbox'
                                  ? 0
                                  : -2
                              }
                            >
                              {
                                accountConfigs[
                                  selectedOption.accountType as keyof typeof accountConfigs
                                ]?.icon
                              }
                            </Box>
                          ) : null
                        }
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
                        renderOption={({ option }: any) => {
                          if ('accountType' in option) {
                            const config =
                              accountConfigs[
                                option.accountType as keyof typeof accountConfigs
                              ];
                            return (
                              <Group gap="sm" align="center">
                                <Box
                                  mt={
                                    option?.accountType === 'dropbox' ? 0 : -2
                                  }
                                >
                                  {config?.icon}
                                </Box>
                                <Text fz="sm">{option.label}</Text>
                              </Group>
                            );
                          }

                          return <Text fz="sm">{option.label}</Text>;
                        }}
                      />
                    );
                  }}
                />
              )}
              <Button
                type="submit"
                // loading={uploadFilesLoading}
                disabled={
                  uploadedFiles.length === 0
                  // || uploadFilesLoading
                }
              >
                Upload Files
              </Button>
            </Stack>
          </Form>
        )}
      </Modal>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>

      <TawkToWidget />
    </>
  );
};

export default DashboardLayout;
