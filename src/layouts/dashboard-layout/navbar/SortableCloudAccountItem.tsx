import { useSortable } from '@dnd-kit/sortable';
import { Box, Group, Progress, Stack, Text } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { NavLink as Link } from 'react-router';
import { formatBytes, removeLocalStorage } from '../../../utils/helper';
import { Tooltip } from '../../../components';
import { CSS } from '@dnd-kit/utilities';

const SortableCloudAccountItem = ({
  account,
  isActive,
  hoveredAccountId,
  setHoveredAccountId,
  openRemoveAccessModal,
  mobileDrawerHandler,
  sortedCloudAccounts = [],
}: {
  account: any;
  isActive: boolean;
  hoveredAccountId: number | null;
  setHoveredAccountId: (id: number | null) => void;
  openRemoveAccessModal: (id: number) => void;
  mobileDrawerHandler: any;
  sortedCloudAccounts: any[];
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // Remove transition during drag for smoother experience
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto', // Ensure dragged item is on top
  };

  const showDragHandle =
    sortedCloudAccounts?.length > 1 && hoveredAccountId === account.id;

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
          {showDragHandle && (
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
              marginLeft: showDragHandle ? '-20px' : '0px',
            }}
            onClick={() => {
              removeLocalStorage('folderId');
              removeLocalStorage('cloudStoragePath');
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
              <Text fz={'sm'} ml={10} c={'#000'} truncate maw={'50%'}>
                {account.title}
              </Text>
            </Tooltip>
          </Link>

          {/* Remove Access Button */}
          {hoveredAccountId === account.id && (
            <Tooltip label="Remove Access" position="right" withArrow>
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
      {account.storageInfo && account.storageInfo.total ? (
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
