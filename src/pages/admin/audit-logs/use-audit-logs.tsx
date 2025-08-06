import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  exportLogs,
  fetchAuditLogs,
  fetchUsers,
  setAuditLogSearchTerm,
  type AuditLogType,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import useDebounce from '../../../hooks/use-debounce';
import { downloadFiles, formatDate } from '../../../utils/helper';
import { Group, Text, Tooltip } from '@mantine/core';
import type { SelectOption } from '../../../components/inputs/autocomplete';
import { notifications } from '@mantine/notifications';

const useAuditLogs = () => {
  const { auditLogsPagination, auditLogs, auditLogSearchTerm } = useAppSelector(
    state => state.adminUser
  );
  const dispatch = useAppDispatch();

  const [localSearchTerm, setLocalSearchTerm] = useState(auditLogSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userSearchResults, setUserSearchResults] = useState<SelectOption[]>(
    []
  );
  const [limit, setLimit] = useState(auditLogsPagination?.page_limit || 10);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getAuditLogs = useCallback(async () => {
    await dispatch(
      fetchAuditLogs({
        limit,
        page: selectedUser ? 1 : auditLogsPagination?.page_no || 1,
        searchTerm: debouncedSearchTerm || '',
        ...(selectedUser && {
          user_id: selectedUser,
        }),
      })
    );
  }, [
    dispatch,
    limit,
    auditLogsPagination?.page_no,
    debouncedSearchTerm,
    selectedUser,
  ]);

  const [onInitialize] = useAsyncOperation(getAuditLogs);

  useEffect(() => {
    handleUserSearch();
  }, [selectedUser]);

  useEffect(() => {
    dispatch(setAuditLogSearchTerm(debouncedSearchTerm));
    onInitialize({});
  }, [debouncedSearchTerm, selectedUser]);

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      dispatch(
        fetchAuditLogs({
          limit: newLimit,
          page: selectedUser ? 1 : auditLogsPagination?.page_no || 1,
          searchTerm: debouncedSearchTerm || '',
          ...(selectedUser && {
            user_id: selectedUser,
          }),
        })
      );
    },
    [dispatch, debouncedSearchTerm]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        fetchAuditLogs({
          limit,
          page,
          searchTerm: debouncedSearchTerm || '',
          ...(selectedUser && {
            user_id: selectedUser,
          }),
        })
      );
    },
    [dispatch, limit, debouncedSearchTerm]
  );

  const handleUserSearch = useCallback(
    async (query?: string): Promise<SelectOption[]> => {
      try {
        const result = await dispatch(
          fetchUsers({
            limit,
            page: 1,
            searchTerm: query || '',
          })
        );

        const users: SelectOption[] =
          result.payload?.data?.data?.map((user: any) => ({
            value: user.id,
            label: user?.email,
          })) || [];

        setUserSearchResults(users);
        return users;
      } catch (error) {
        console.error('User search failed:', error);
        setUserSearchResults([]);
        return [];
      }
    },
    [dispatch]
  );

  const handleUserSelect = (userId: string | string[] | null) => {
    setSelectedUser(userId as string | null);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
  };

  const filteredOptions = useMemo(() => {
    if (selectedUser) {
      return userSearchResults.filter(option => option.value === selectedUser);
    }
    return userSearchResults;
  }, [selectedUser, userSearchResults]);

  const columns = useMemo(
    () => [
      {
        accessor: 'action_type',
        title: 'Action Type',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Text fz={'sm'} truncate>
              {row.action_type}
            </Text>
          </Group>
        ),
      },
      {
        accessor: 'type',
        title: 'Type',
        render: (row: AuditLogType) => (
          <Group gap={8} wrap="nowrap">
            <Text size="sm" truncate>
              {row.type}
            </Text>
          </Group>
        ),
      },
      {
        accessor: 'name',
        title: 'Name',
        // width: '30%',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Tooltip label={row.name} fz={'xs'}>
              <Text
                fz={'sm'}
                truncate
                style={{ maxWidth: 'calc(100% - 100px)' }}
              >
                {row.name}
              </Text>
            </Tooltip>
          </Group>
        ),
      },
      {
        accessor: 'status',
        title: 'Status',
        // width: '15%',
        render: (row: AuditLogType) => (
          <Group gap={8} wrap="nowrap">
            <Text fz={'sm'} truncate c={row.success ? 'green.8' : 'red'}>
              {row.success ? 'Success' : 'Failed'}
            </Text>
          </Group>
        ),
      },
      {
        accessor: 'lastModified',
        title: 'Last Modified',
        // width: '20%',
        render: (row: AuditLogType) => (
          <Text size="sm">
            {row.updatedAt ? formatDate(row.updatedAt) : '-'}
          </Text>
        ),
      },
      {
        accessor: 'error_message',
        title: 'Error Message',
        // width: '30%',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ maxWidth: 'calc(100% - 100px)' }}
            // style={{ overflow: 'hidden' }}
          >
            <Text fz={'sm'} truncate>
              {row.error_message || '--'}
            </Text>
          </Group>
        ),
      },
      // {
      //   accessor: 'actions',
      //   title: 'Actions',
      //   render: (row: AuditLogType) => (
      //     <>
      //       <Tooltip label={'View Details'} fz={'xs'}>
      //         <ActionIcon
      //           variant="subtle"
      //           color="gray"
      //           // onClick={() => openUserBlockModal(row)}
      //         >
      //           <ICONS.IconEye size={20} color={'gray'} />
      //         </ActionIcon>
      //       </Tooltip>
      //     </>
      //   ),
      // },
    ],
    []
  );

  const [downloadLogs, downloadLogsLoading] = useAsyncOperation(async () => {
    try {
      const payload = {
        ...(selectedUser && {
          user_id: selectedUser,
        }),
        ...(debouncedSearchTerm && {
          searchTerm: debouncedSearchTerm,
        }),
      };
      const res = await dispatch(exportLogs(payload));
      if (res?.payload?.status !== 200) {
        notifications.show({
          message: res?.payload?.message || `Failed to export logs`,
          color: 'red',
        });
        return;
      }
      downloadFiles(res.payload.data, res);
    } catch (error: any) {
      notifications.show({
        message: error || `Failed to export logs`,
        color: 'red',
      });
    }
  });

  const handleExportLogs = useCallback(() => {
    downloadLogs({});
  }, [selectedUser, debouncedSearchTerm]);

  return {
    auditLogs,
    searchTerm: localSearchTerm,
    handleSearchChange,
    columns,
    handleUserSearch,
    userSearchResults: filteredOptions,
    selectedUser,
    handleUserSelect,
    handleClearSelection,
    handleExportLogs,
    downloadLogsLoading,
    handlePageChange,
    currentPage: auditLogsPagination?.page_no || 1,
    totalRecords: auditLogsPagination?.total || 0,
    limit,
    handleLimitChange,
  };
};

export default useAuditLogs;
