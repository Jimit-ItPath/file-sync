import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  exportLogs,
  fetchActionTypes,
  fetchAuditLogs,
  fetchTypes,
  fetchUsers,
  resetAdminLogsState,
  setAuditLogSearchTerm,
  type AuditLogType,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import useDebounce from '../../../hooks/use-debounce';
import {
  downloadFiles,
  formatDate,
  formatDateAndTime,
} from '../../../utils/helper';
import { Group, Text, Tooltip } from '@mantine/core';
import type { SelectOption } from '../../../components/inputs/autocomplete';
import { notifications } from '@mantine/notifications';

const useAuditLogs = () => {
  const {
    auditLogsPagination,
    auditLogs,
    auditLogSearchTerm,
    actionTypes,
    types,
  } = useAppSelector(state => state.adminUser);
  const dispatch = useAppDispatch();

  const [localSearchTerm, setLocalSearchTerm] = useState(auditLogSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [initialUserList, setInitialUserList] = useState<SelectOption[]>([]);
  const [userSearchResults, setUserSearchResults] = useState<SelectOption[]>(
    []
  );
  const [limit, setLimit] = useState(auditLogsPagination?.page_limit || 10);
  const [selectedActionType, setSelectedActionType] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [successFilter, setSuccessFilter] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getAuditLogs = useCallback(
    async (pageNo?: number) => {
      await dispatch(
        fetchAuditLogs({
          limit,
          page: pageNo || selectedUser ? 1 : auditLogsPagination?.page_no || 1,
          searchTerm: debouncedSearchTerm || '',
          ...(selectedUser && {
            user_id: selectedUser,
          }),
          ...(selectedActionType && {
            action_types: selectedActionType,
          }),
          ...(selectedType && {
            types: selectedType,
          }),
          ...(successFilter && {
            success: successFilter === 'true',
          }),
        })
      );
    },
    [
      dispatch,
      limit,
      auditLogsPagination?.page_no,
      debouncedSearchTerm,
      selectedUser,
      selectedActionType,
      selectedType,
      successFilter,
    ]
  );
  const actionTypeOptions = useMemo(() => {
    if (actionTypes) {
      const options = Object.entries(actionTypes)?.map(([key, value]) => ({
        value,
        label: key,
      }));
      return options;
    }
    return [];
  }, [actionTypes]);

  const typeOptions = useMemo(() => {
    if (types) {
      const options = Object.entries(types)?.map(([key, value]) => ({
        value,
        label: key,
      }));
      return options;
    }
    return [];
  }, [types]);

  const successFilterOptions = useMemo(
    () => [
      {
        value: 'true',
        label: 'Success',
      },
      {
        value: 'false',
        label: 'Failure',
      },
    ],
    []
  );

  const handleSuccessFilterChange = (value: string | null) => {
    setSuccessFilter(value);
  };

  const handleClearSuccessFilter = () => {
    setSuccessFilter(null);
  };

  const fetchActionTypesData = useCallback(async () => {
    await dispatch(fetchActionTypes());
  }, [dispatch]);

  const [getActionTypes] = useAsyncOperation(fetchActionTypesData);

  const fetchTypesData = useCallback(async () => {
    await dispatch(fetchTypes());
  }, [dispatch]);

  const [getTypes] = useAsyncOperation(fetchTypesData);

  useEffect(() => {
    getActionTypes({});
    getTypes({});

    return () => {
      dispatch(resetAdminLogsState());
    };
  }, []);

  const handleActionTypeSelect = (actionType: string | string[] | null) => {
    setSelectedActionType(actionType as string | null);
  };

  const handleClearActionType = () => {
    setSelectedActionType(null);
  };

  const handleTypeSelect = (type: string | string[] | null) => {
    setSelectedType(type as string | null);
  };

  const handleClearType = () => {
    setSelectedType(null);
  };

  const handleReset = () => {
    setSelectedUser(null);
    setSelectedActionType(null);
    setSelectedType(null);
    setSuccessFilter(null);
    setLocalSearchTerm('');
  };

  const disableReset = useMemo(() => {
    return (
      !selectedUser &&
      !selectedActionType &&
      !selectedType &&
      !successFilter &&
      !localSearchTerm
    );
  }, [
    selectedUser,
    selectedActionType,
    selectedType,
    successFilter,
    localSearchTerm,
  ]);

  useEffect(() => {
    const fetchInitialUsers = async () => {
      try {
        const res = await dispatch(
          fetchUsers({
            limit: 10,
            page: 1,
          })
        );

        const users: SelectOption[] =
          res.payload?.data?.data?.map((user: any) => ({
            value: user.id,
            label: user?.email,
          })) || [];

        setUserSearchResults(users);
        setInitialUserList(users);
      } catch (err) {
        console.error('Initial user fetch failed:', err);
      }
    };

    fetchInitialUsers();
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      handleUserSearch();
    }
  }, [selectedUser]);

  useEffect(() => {
    dispatch(setAuditLogSearchTerm(debouncedSearchTerm));
    getAuditLogs(1);
  }, [
    debouncedSearchTerm,
    selectedUser,
    selectedActionType,
    selectedType,
    successFilter,
  ]);

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
          ...(selectedActionType && {
            action_types: selectedActionType,
          }),
          ...(selectedType && {
            types: selectedType,
          }),
          ...(successFilter && {
            success: successFilter === 'true',
          }),
        })
      );
    },
    [
      dispatch,
      debouncedSearchTerm,
      selectedUser,
      selectedActionType,
      selectedType,
      successFilter,
    ]
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
          ...(selectedActionType && {
            action_types: selectedActionType,
          }),
          ...(selectedType && {
            types: selectedType,
          }),
          ...(successFilter && {
            success: successFilter === 'true',
          }),
        })
      );
    },
    [
      dispatch,
      limit,
      debouncedSearchTerm,
      selectedUser,
      selectedActionType,
      selectedType,
      successFilter,
    ]
  );

  const handleUserSearch = useCallback(
    async (query?: string): Promise<SelectOption[]> => {
      try {
        const result = await dispatch(
          fetchUsers({
            limit,
            page: 1,
            searchTerm: query || '',
            ...(selectedActionType && { action_types: selectedActionType }),
            ...(selectedType && { types: selectedType }),
            ...(successFilter && { success: successFilter === 'true' }),
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
    [dispatch, limit, selectedActionType, selectedType, successFilter]
  );

  const handleUserSelect = (userId: string | string[] | null) => {
    setSelectedUser(userId as string | null);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setUserSearchResults(initialUserList);
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
        width: '400px',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Tooltip label={row.name} fz={'xs'}>
              <Text fz={'sm'} truncate style={{ maxWidth: '80%' }}>
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
          <>
            {row.updatedAt ? (
              <Tooltip label={formatDateAndTime(row.updatedAt)} fz={'xs'}>
                <Text size="sm">{formatDate(row.updatedAt)}</Text>
              </Tooltip>
            ) : (
              '-'
            )}
          </>
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
            style={{ maxWidth: '70%' }}
            // style={{ overflow: 'hidden' }}
          >
            <Tooltip label={row.error_message || '--'} fz={'xs'}>
              <Text fz={'sm'} truncate>
                {row.error_message || '--'}
              </Text>
            </Tooltip>
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
        ...(selectedActionType && {
          action_types: selectedActionType,
        }),
        ...(selectedType && {
          types: selectedType,
        }),
        ...(successFilter && {
          success: successFilter === 'true',
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
  }, [
    selectedUser,
    debouncedSearchTerm,
    selectedActionType,
    selectedType,
    successFilter,
  ]);

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
    actionTypeOptions,
    typeOptions,
    handleActionTypeSelect,
    handleTypeSelect,
    selectedActionType,
    selectedType,
    handleClearActionType,
    handleClearType,
    successFilterOptions,
    handleSuccessFilterChange,
    handleClearSuccessFilter,
    successFilter,
    handleReset,
    disableReset,
  };
};

export default useAuditLogs;
