import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchAuditLogs,
  setAuditLogSearchTerm,
  type AuditLogType,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import useDebounce from '../../../hooks/use-debounce';
import { formatDate } from '../../../utils/helper';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

const useAuditLogs = () => {
  const initializedRef = useRef(false);
  const hasMountedOnce = useRef(false);

  const {
    auditLogsPagination,
    auditLogs,
    auditLogSearchTerm,
    auditLogLoading,
  } = useAppSelector(state => state.adminUser);
  const dispatch = useAppDispatch();

  const [localSearchTerm, setLocalSearchTerm] = useState(auditLogSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const getAuditLogs = useCallback(async () => {
    await dispatch(
      fetchAuditLogs({
        limit: auditLogsPagination?.page_limit || 20,
        page: auditLogsPagination?.page_no || 1,
        searchTerm: debouncedSearchTerm || '',
      })
    );
  }, [
    dispatch,
    auditLogsPagination?.page_limit,
    auditLogsPagination?.page_no,
    debouncedSearchTerm,
  ]);

  const [onInitialize] = useAsyncOperation(getAuditLogs);

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

    dispatch(setAuditLogSearchTerm(debouncedSearchTerm));
    getAuditLogs();
  }, [debouncedSearchTerm]);

  const scrollBoxRef = useRef<HTMLDivElement>(null);

  const lastScrollTop = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    lastScrollTop.current = e.currentTarget.scrollTop;
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 100 &&
      auditLogsPagination &&
      auditLogsPagination.page_no < auditLogsPagination.total_pages &&
      !auditLogLoading
    ) {
      loadMoreAuditLogs();
    }
  };

  useEffect(() => {
    if (scrollBoxRef.current && lastScrollTop.current > 0) {
      setTimeout(() => {
        scrollBoxRef.current!.scrollTop = lastScrollTop.current;
      }, 0);
    }
  }, [auditLogs.length]);

  const loadMoreAuditLogs = useCallback(async () => {
    if (
      auditLogsPagination &&
      auditLogsPagination.page_no < auditLogsPagination.total_pages &&
      !auditLogLoading
    ) {
      await dispatch(
        fetchAuditLogs({
          page: auditLogsPagination.page_no + 1,
          limit: auditLogsPagination.page_limit || 20,
          searchTerm: debouncedSearchTerm || '',
        })
      );
    }
  }, [auditLogsPagination, auditLogLoading, dispatch]);

  const columns = useMemo(
    () => [
      {
        key: 'action_type',
        label: 'Action Type',
        // width: '15%',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Text
              fz={'sm'}
              truncate
              //   style={{ maxWidth: 'calc(100% - 40px)' }}
            >
              {row.action_type}
            </Text>
          </Group>
        ),
      },
      {
        key: 'object_type',
        label: 'Object Type',
        // width: '10%',
        render: (row: AuditLogType) => (
          <Group gap={8} wrap="nowrap">
            <Text size="sm" truncate>
              {row.object_type}
            </Text>
          </Group>
        ),
      },
      {
        key: 'object_name',
        label: 'Object Name',
        width: '30%',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Tooltip label={row.object_name} fz={'xs'}>
              <Text
                fz={'sm'}
                truncate
                style={{ maxWidth: 'calc(100% - 40px)' }}
              >
                {row.object_name}
              </Text>
            </Tooltip>
          </Group>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '15%',
        render: (row: AuditLogType) => (
          <Group gap={8} wrap="nowrap">
            <Text fz={'sm'} truncate c={row.success ? 'green.8' : 'red'}>
              {row.success ? 'Success' : 'Failed'}
            </Text>
          </Group>
        ),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        width: '20%',
        render: (row: AuditLogType) => (
          <Text size="sm">
            {row.updatedAt ? formatDate(row.updatedAt) : '-'}
          </Text>
        ),
      },
      {
        key: 'error_message',
        label: 'Error Message',
        width: '30%',
        render: (row: AuditLogType) => (
          <Group
            gap={8}
            wrap="nowrap"
            maw={'100%'}
            style={{ overflow: 'hidden' }}
          >
            <Text fz={'sm'} truncate>
              {row.error_message || '--'}
            </Text>
          </Group>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row: AuditLogType) => (
          <>
            <Tooltip label={'View Details'} fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                // onClick={() => openUserBlockModal(row)}
              >
                <ICONS.IconEye size={20} color={'gray'} />
              </ActionIcon>
            </Tooltip>
          </>
        ),
      },
    ],
    []
  );

  return {
    auditLogs,
    handleScroll,
    scrollBoxRef,
    searchTerm: localSearchTerm,
    handleSearchChange,
    columns,
  };
};

export default useAuditLogs;
