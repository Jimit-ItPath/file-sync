import { useSortable } from '@dnd-kit/sortable';
import { Box, Group, Progress, Stack, Text } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { NavLink as Link } from 'react-router';
import {
  formatBytes,
  getLocalStorage,
  removeLocalStorage,
} from '../../../utils/helper';
import { Tooltip } from '../../../components';
import { CSS } from '@dnd-kit/utilities';
import useResponsive from '../../../hooks/use-responsive';
import type { ConnectedAccountType } from '../../../store/slices/auth.slice';
import { useMemo } from 'react';

const SortableCloudAccountItem = ({
  account,
  isActive,
  hoveredAccountId,
  setHoveredAccountId,
  openRemoveAccessModal,
  mobileDrawerHandler,
  sortedCloudAccounts = [],
  connectedAccounts = [],
  handleReAuthenticate = () => {},
  openRenameAccountModal,
}: {
  account: any;
  isActive: boolean;
  hoveredAccountId: number | null;
  setHoveredAccountId: (id: number | null) => void;
  openRemoveAccessModal: (id: number) => void;
  mobileDrawerHandler: any;
  sortedCloudAccounts: any[];
  connectedAccounts: ConnectedAccountType[];
  handleReAuthenticate: (account: ConnectedAccountType) => void;
  openRenameAccountModal: (id: number) => void;
}) => {
  const { isXs } = useResponsive();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });
  const globalSearchState = getLocalStorage('globalSearchState');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Remove transition during drag for smoother experience
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto', // Ensure dragged item is on top
  };

  const showDragHandle =
    sortedCloudAccounts?.length > 1 && hoveredAccountId === account.id;

  const getConnectedAccount = useMemo(() => {
    const connectedAccount = connectedAccounts?.find(
      acc => acc.id === account.id
    );
    return connectedAccount;
  }, [connectedAccounts, account.id]);

  return (
    <Box key={account.id} mb={'xs'} ref={setNodeRef} style={style}>
      <Group
        style={{
          position: 'relative',
          width: '100%',
        }}
        onMouseEnter={() => setHoveredAccountId(account.id)}
        onMouseLeave={() => setHoveredAccountId(null)}
      >
        <Stack style={{ flexDirection: 'row' }} w={'100%'} align="center">
          {/* Drag Handle - Only show when hovering and multiple accounts exist */}
          {(showDragHandle || isXs) && (
            <Box
              {...attributes}
              {...listeners}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.6,
                flexShrink: 0, // Prevent shrinking
              }}
            >
              <ICONS.IconGripVertical size={14} color="#6b7280" />
            </Box>
          )}

          <Link
            to={account.url}
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
              marginLeft: showDragHandle || isXs ? '-20px' : '0px',
            }}
            onClick={() => {
              if (!globalSearchState) {
                removeLocalStorage('folderId');
                removeLocalStorage('cloudStoragePath');
              }
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
            {account.icon}
            <Tooltip label={account.title} fz={'xs'}>
              <Text
                fz={'sm'}
                ml={10}
                c={'#000'}
                truncate
                maw={isXs ? '70%' : '62%'}
              >
                {account.title}
              </Text>
            </Tooltip>
          </Link>

          {/* Rename Account Button */}
          {(hoveredAccountId === account.id || isXs) && (
            <Tooltip
              label="Rename Account"
              position="right"
              withArrow
              fz={'xs'}
            >
              <Box
                style={{
                  position: 'absolute',
                  right: isXs ? 40 : 28,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 10,
                  flexShrink: 0,
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  openRenameAccountModal(account.id);
                }}
              >
                <ICONS.IconEdit size={16} color="#1c7ed6" />
              </Box>
            </Tooltip>
          )}

          {/* Remove Access Button */}
          {(hoveredAccountId === account.id || isXs) && (
            <Tooltip label="Remove Access" position="right" withArrow fz={'xs'}>
              <Box
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 10, // Ensure it's above other elements
                  flexShrink: 0, // Prevent shrinking
                }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault(); // Prevent any navigation
                  openRemoveAccessModal(account.id);
                }}
              >
                <ICONS.IconTrash size={16} color="red" />
              </Box>
            </Tooltip>
          )}
        </Stack>
      </Group>

      {/* Storage Progress Bar */}
      {getConnectedAccount?.re_authentication_required ? (
        <Text
          fz="xs"
          fw={500}
          ml={-1}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            color: '#2563eb', // blue-600
            transition: 'all 0.2s ease',
          }}
          onClick={() => handleReAuthenticate(getConnectedAccount)}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#eff6ff';
            e.currentTarget.style.color = '#1d4ed8';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#2563eb';
          }}
        >
          <ICONS.IconRefresh size={16} stroke={2} />
          Re-authenticate Account
        </Text>
      ) : account.storageInfo && account.storageInfo.total ? (
        <Box
          px={8}
          mt={4}
          style={{
            transition: 'margin-left 0.2s ease', // Smooth transition for margin changes
          }}
        >
          <Progress
            value={
              (Number(account.storageInfo.used) /
                Number(account.storageInfo.total)) *
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
            {formatBytes(Number(account.storageInfo.used))} of{' '}
            {formatBytes(Number(account.storageInfo.total))} used
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export default SortableCloudAccountItem;
