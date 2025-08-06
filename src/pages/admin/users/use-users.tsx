import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  blockUser,
  fetchUsers,
  inviteUser,
  type UserType,
  setSearchTerm,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import useDebounce from '../../../hooks/use-debounce';
import { formatDate } from '../../../utils/helper';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

const inviteUserSchema = z.object({
  emails: z
    .array(
      z.string().min(1, 'Email is required').email('Invalid email address')
    )
    .min(1, 'At least one email is required'),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

const useUsers = () => {
  const [inviteUserModalOpen, setInviteUserModalOpen] = useState(false);
  const [userBlockModalOpen, setUserBlockModalOpen] = useState(false);
  const [itemToBlock, setItemToBlock] = useState<UserType | null>(null);
  const initializedRef = useRef(false);
  const hasMountedOnce = useRef(false);

  const { loading, pagination, users, searchTerm } = useAppSelector(
    state => state.adminUser
  );
  const [limit, setLimit] = useState(pagination?.page_limit || 10);
  const dispatch = useAppDispatch();

  const inviteUserMethods = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    mode: 'onChange',
    defaultValues: {
      emails: [],
    },
  });

  const { reset } = inviteUserMethods;

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getUsers = useCallback(
    async (pageNo?: number) => {
      await dispatch(
        fetchUsers({
          limit,
          page: pageNo ? pageNo : pagination?.page_no || 1,
          searchTerm: debouncedSearchTerm || '',
        })
      );
    },
    [dispatch, limit, pagination?.page_no, debouncedSearchTerm]
  );

  const [onInitialize] = useAsyncOperation(getUsers);

  useEffect(() => {
    if (!initializedRef.current) {
      onInitialize({});
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasMountedOnce.current) {
      hasMountedOnce.current = true;
      return;
    }

    dispatch(setSearchTerm(debouncedSearchTerm));
    getUsers(1);
  }, [debouncedSearchTerm]);

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      dispatch(
        fetchUsers({
          limit: newLimit,
          page: 1,
          searchTerm: debouncedSearchTerm || '',
        })
      );
    },
    [dispatch, debouncedSearchTerm]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        fetchUsers({
          limit,
          page,
          searchTerm: debouncedSearchTerm || '',
        })
      );
    },
    [dispatch, limit, debouncedSearchTerm]
  );

  // Invite User
  const [inviteUserFn, inviteUserLoading] = useAsyncOperation(
    async (emails: string[]) => {
      try {
        const res = await dispatch(
          inviteUser({
            emails,
          })
        );
        if (res?.payload?.success) {
          reset();
          await dispatch(
            fetchUsers({
              limit,
              page: pagination?.page_no || 1,
              searchTerm: debouncedSearchTerm || '',
            })
          );
          notifications.show({
            message: res?.payload?.message || 'User invited successfully',
            color: 'green',
          });
          setInviteUserModalOpen(false);
        } else {
          notifications.show({
            message: res?.payload?.message || 'Failed to invite user',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to invite user',
          color: 'red',
        });
      }
    }
  );

  const handleInviteUser = inviteUserMethods.handleSubmit(data => {
    inviteUserFn(data.emails);
  });

  // User Block / Unblock
  const [blockUserFn, blockUserLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(
        blockUser({
          id: Number(itemToBlock?.id),
          is_blocked: !itemToBlock?.is_blocked,
        })
      );
      if (res.payload?.success) {
        await dispatch(
          fetchUsers({
            limit,
            page: pagination?.page_no || 1,
            searchTerm: debouncedSearchTerm || '',
          })
        );
        notifications.show({
          message: 'User block status updated successfully',
          color: 'green',
        });
        setUserBlockModalOpen(false);
      } else {
        notifications.show({
          message: res.payload?.message || 'Failed to update user block status',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        message: error || 'Failed to update user block status',
        color: 'red',
      });
    }
  });

  const handleBlockConfirm = useCallback(() => {
    if (itemToBlock?.id) {
      blockUserFn({});
    }
  }, [itemToBlock, blockUserFn]);

  const openInviteUserModal = useCallback(() => {
    setInviteUserModalOpen(true);
    reset();
  }, []);

  const closeInviteUserModal = useCallback(() => {
    setInviteUserModalOpen(false);
  }, []);

  const openUserBlockModal = useCallback((row: UserType) => {
    setItemToBlock(row);
    setUserBlockModalOpen(true);
  }, []);

  const closeUserBlockModal = useCallback(() => {
    setUserBlockModalOpen(false);
    setItemToBlock(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        // width: '20%',
        render: (row: UserType) => (
          <Group
            gap={8}
            wrap="nowrap"
            // maw={'100%'}
            // style={{ overflow: 'hidden' }}
          >
            {row?.first_name && row?.last_name ? (
              <Tooltip label={row.first_name + ' ' + row.last_name} fz={'xs'}>
                <Text
                  fw={600}
                  fz={'sm'}
                  truncate
                  // style={{ maxWidth: 'calc(60%)' }}
                >
                  {row.first_name + ' ' + row.last_name}
                </Text>
              </Tooltip>
            ) : (
              '-'
            )}
          </Group>
        ),
      },
      {
        accessor: 'email',
        title: 'Email',
        // width: '20%',
        render: (row: UserType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Tooltip label={row.email} fz={'xs'}>
              <Text size="sm" truncate style={{ maxWidth: 'calc(80%)' }}>
                {row.email}
              </Text>
            </Tooltip>
          </Group>
        ),
      },
      {
        accessor: 'lastModified',
        title: 'Last Modified',
        // width: '20%',
        render: (row: UserType) => (
          <Text size="sm">
            {row.updatedAt ? formatDate(row.updatedAt) : '-'}
          </Text>
        ),
      },
      {
        accessor: 'lastLogin',
        title: 'Last Login',
        render: (row: UserType) => (
          <Text size="sm">
            {row.last_login ? formatDate(row.last_login) : '-'}
          </Text>
        ),
      },
      {
        accessor: 'verified',
        title: 'Verified',
        render: (row: UserType) => (
          // <Text size="sm">{row.verified ? 'Yes' : 'No'}</Text>
          <Text size="sm">
            {row.verified ? (
              <Tooltip label="Verified" fz={'xs'}>
                <ICONS.IconUserCheck color="green" />
              </Tooltip>
            ) : (
              <Tooltip label="Not Verified" fz={'xs'}>
                <ICONS.IconUserCancel color="red" />
              </Tooltip>
            )}
          </Text>
        ),
      },
      {
        accessor: 'actions',
        title: 'Block / Unblock',
        // width: '10%',
        render: (row: UserType) => (
          <>
            <Tooltip label={row.is_blocked ? 'Unblock' : 'Block'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={e => {
                  e.stopPropagation();
                  openUserBlockModal(row);
                }}
              >
                {row.is_blocked ? (
                  <ICONS.IconLockCheck size={20} color={'green'} />
                ) : (
                  <ICONS.IconForbid2 size={20} color={'red'} />
                )}
              </ActionIcon>
            </Tooltip>
          </>
        ),
      },
    ],
    []
  );

  return {
    users,
    loading,
    openInviteUserModal,
    closeInviteUserModal,
    inviteUserModalOpen,
    inviteUserMethods,
    userBlockModalOpen,
    itemToBlock,
    searchTerm: localSearchTerm,
    handleSearchChange,
    columns,
    handleInviteUser,
    inviteUserLoading,
    closeUserBlockModal,
    handleBlockConfirm,
    blockUserLoading,
    handlePageChange,
    currentPage: pagination?.page_no || 1,
    totalRecords: pagination?.total || 0,
    limit,
    handleLimitChange,
  };
};

export default useUsers;
