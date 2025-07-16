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
import { fetchProfile } from '../../store/slices/user.slice';
import useAsyncOperation from '../../hooks/use-async-operation';

const DashboardLayout = () => {
  usePageData();
  const [mobileDrawerOpened, mobileDrawerHandler] = useDisclosure();
  const [logoutConfirmOpened, logoutConfirmHandler] = useDisclosure();

  const { logout } = useAuth() as any;
  const dispatch = useAppDispatch();
  const { userProfile } = useAppSelector(state => state.user);

  const getUserProfile = useCallback(async () => {
    await dispatch(fetchProfile());
  }, [dispatch]);

  const [getProfile] = useAsyncOperation(getUserProfile);

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

  const navigate = useNavigate();

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
    navigate(AUTH_ROUTES.LOGIN.url);
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
                justify="space-between"
                maw={600}
                w="100%"
              >
                <Burger
                  opened={mobileDrawerOpened}
                  onClick={mobileDrawerHandler.toggle}
                  hiddenFrom="sm"
                  size="sm"
                />
                <Box
                  fw={700}
                  fz={22}
                  c="blue.7"
                  style={{ letterSpacing: -0.5 }}
                >
                  CloudSync
                </Box>
                <Group align="center" gap={0} style={{ position: 'relative' }}>
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
              </Group>

              <Group gap={16} align="center">
                <ICONS.IconBell />
                <ICONS.IconSettings />
                <Menu
                  width={140}
                  onItemClick={onItemClick}
                  position="bottom-end"
                  items={PROFILE_MENU_ITEMS}
                >
                  <ActionIcon
                    variant="filled"
                    size="lg"
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
                      <Box style={{ fontWeight: 600, fontSize: 14 }}>
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
