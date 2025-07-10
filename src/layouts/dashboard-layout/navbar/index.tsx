import { NavLink as Link, useLocation } from 'react-router';
import { Box, NavLink, rem, Stack } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import Icon from '../../../assets/icons/icon';
import { useMemo } from 'react';

const DASHBOARD_NAV_ITEMS = [
  {
    id: 'files',
    label: 'Files',
    icon: ICONS.IconFolder,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: ICONS.IconStar,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  {
    id: 'recent',
    label: 'Recent',
    icon: ICONS.IconClock,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  {
    id: 'shared',
    label: 'Shared',
    icon: ICONS.IconUsersGroup,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  {
    id: 'file-requests',
    label: 'File requests',
    icon: ICONS.IconFile,
    url: PRIVATE_ROUTES.DASHBOARD.url,
    roles: PRIVATE_ROUTES.DASHBOARD.roles,
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: ICONS.IconTrash,
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

const cloudAccounts = [
  {
    id: 'google-drive',
    url: PRIVATE_ROUTES.GOOGLE_DRIVE.url,
    icon: (
      <ICONS.IconBrandGoogle
        size={18}
        color="#ef4444"
        stroke={1.25}
        fill="#ef4444"
      />
    ),
    title: 'Google Drive',
  },

  {
    id: 'dropbox',
    url: PRIVATE_ROUTES.DROPBOX.url,
    icon: (
      <ICONS.IconDroplets
        size={18}
        color="#007ee5"
        stroke={1.25}
        fill="#007ee5"
      />
    ),
    title: 'Dropbox',
  },
  {
    id: 'onedrive',
    url: PRIVATE_ROUTES.GOOGLE_DRIVE.url,
    icon: (
      <ICONS.IconBrandOnedrive
        size={18}
        color="#0078d4"
        stroke={1.25}
        fill="#0078d4"
      />
    ),
    title: 'OneDrive',
  },
];

const NavBar = ({ mobileDrawerHandler }: any) => {
  // const accessibleNavItems = DASHBOARD_NAV_ITEMS.filter(({ roles }) =>
  //   roles?.includes(role)
  // );
  const location = useLocation();

  const isActiveRoute = useMemo(
    () => (routeUrl: string) => location.pathname.startsWith(routeUrl),
    []
  );

  const accessibleNavItems = DASHBOARD_NAV_ITEMS;

  return (
    <>
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
              leftSection={<Icon component={icon} size={18} stroke={1.25} />}
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

      <Box>
        <Stack
          mt={20}
          style={{ flexDirection: 'row' }}
          justify="space-between"
          align="center"
        >
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            CLOUD ACCOUNTS
          </span>
          <ICONS.IconPlus size={18} />
        </Stack>

        {cloudAccounts.map(({ id, url, icon, title }) => {
          const isActive = isActiveRoute(url);

          return (
            <Link
              key={id}
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
              }}
              onClick={() => {
                mobileDrawerHandler?.close();
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'var(--mantine-color-gray-0)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                }
              }}
            >
              {icon}
              <span style={{ color: '#000', marginLeft: '6px' }}>{title}</span>
            </Link>
          );
        })}

        <Stack mt={20} style={{ flexDirection: 'row' }} align="center">
          <ICONS.IconPlus size={18} />
          <span style={{ fontSize: '14px', color: '##0284C7' }}>
            Connect Account
          </span>
        </Stack>
      </Box>

      <Box mt={20}>
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
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Documents
        </Stack>

        <Stack
          onClick={() => {
            mobileDrawerHandler?.close();
          }}
          mt={20}
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Images
        </Stack>

        <Stack
          onClick={() => {
            mobileDrawerHandler?.close();
          }}
          mt={20}
          style={{ flexDirection: 'row' }}
        >
          <ICONS.IconFolder size={18} stroke={1.25} /> Videos
        </Stack>
      </Box>
    </>
  );
};

export default NavBar;
