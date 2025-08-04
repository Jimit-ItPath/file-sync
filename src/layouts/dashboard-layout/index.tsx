import { useDisclosure } from '@mantine/hooks';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Container,
  Group,
  TextInput,
} from '@mantine/core';
import { Outlet, useNavigate } from 'react-router';
import { usePageData } from '../../hooks/use-page-data';
import useAuth from '../../auth/use-auth';
import { ICONS } from '../../assets/icons';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../../routing/routes';
import NavBar from './navbar';
import { Menu } from '../../components';
import { ConfirmModal } from '../../components/confirm-modal';
import Icon from '../../assets/icons/icon';
import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProfile, resetUserProfile } from '../../store/slices/user.slice';
import useAsyncOperation from '../../hooks/use-async-operation';
import { resetUser } from '../../store/slices/auth.slice';
import useResponsive from '../../hooks/use-responsive';
import { ROLES } from '../../utils/constants';

const DashboardLayout = () => {
  usePageData();
  const [mobileDrawerOpened, mobileDrawerHandler] = useDisclosure();
  const [logoutConfirmOpened, logoutConfirmHandler] = useDisclosure();
  const { isSm, isXs } = useResponsive();

  const { logout } = useAuth() as any;
  const dispatch = useAppDispatch();
  const { userProfile } = useAppSelector(state => state.user);
  const navigate = useNavigate();
  // const location = useLocation();
  // const hasRedirectedRef = useRef(false);

  const getUserProfile = useCallback(async () => {
    await dispatch(fetchProfile());
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
      navigate(AUTH_ROUTES.LOGIN.url);
    }
    dispatch(resetUser());
    dispatch(resetUserProfile());
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
            <Group h="100%" px="md" justify="space-between" w="100%">
              {/* Left: Burger + Logo + Search */}
              <Group
                gap={16}
                align="center"
                wrap="nowrap"
                // justify="space-between"
                // maw={600}
                // w="100%"
              >
                <Burger
                  opened={mobileDrawerOpened}
                  onClick={mobileDrawerHandler.toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                {isXs ? (
                  <ICONS.IconCloud size={32} color={'#0ea5e9'} />
                ) : (
                  <Box
                    fw={700}
                    fz={22}
                    c="blue.7"
                    style={{ letterSpacing: -0.5 }}
                  >
                    AllCloudHub
                  </Box>
                )}
                {!isSm ? (
                  <Group
                    align="center"
                    gap={0}
                    style={{ position: 'relative' }}
                  >
                    <TextInput
                      placeholder="Search files and folders..."
                      w={300}
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
                ) : null}
              </Group>

              <Group gap={16} align="center">
                <ICONS.IconBell size={isXs ? 20 : 24} />
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
        <AppShell.Navbar p="md">
          <NavBar />
        </AppShell.Navbar>
        <AppShell.Main>
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
    </>
  );
};

export default DashboardLayout;
