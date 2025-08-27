import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchContactUs,
  resetContactUsState,
  setContactUsSearchTerm,
  updateContactUs,
  type ContactUsType,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import useDebounce from '../../../hooks/use-debounce';
import { formatDate, formatDateAndTime } from '../../../utils/helper';
import { ActionIcon, Text, Tooltip } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { CONTACT_US_STATUS } from '../../../utils/constants';

const updateConactUsSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved']),
  notes: z.string().optional(),
});

type UpdateContactUsFormData = z.infer<typeof updateConactUsSchema>;

const useContactUs = () => {
  const [contactUsModalOpen, setContactUsModalOpen] = useState(false);
  const [contactUsItem, setContactUsItem] = useState<ContactUsType | null>(
    null
  );
  const initializedRef = useRef(false);
  const hasMountedOnce = useRef(false);

  const {
    contactUs: { data, loading, pagination, searchTerm },
  } = useAppSelector(state => state.adminUser);
  const [limit, setLimit] = useState(pagination?.page_limit || 10);
  const [status, setStatus] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const updateContactUsMethods = useForm<UpdateContactUsFormData>({
    resolver: zodResolver(updateConactUsSchema),
    mode: 'onChange',
    defaultValues: {
      notes: '',
      status: 'new',
    },
  });

  const {
    reset,
    formState: { errors },
  } = updateContactUsMethods;

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
  };

  const statusOptions = useMemo(() => {
    const options = Object.entries(CONTACT_US_STATUS).map(([key, value]) => ({
      value,
      label: key,
    }));
    return options;
  }, []);

  const getContactUs = useCallback(
    async (pageNo?: number) => {
      await dispatch(
        fetchContactUs({
          limit,
          page: typeof pageNo === 'number' ? pageNo : pagination?.page_no || 1,
          searchTerm: debouncedSearchTerm || '',
          ...(status && {
            status,
          }),
        })
      );
    },
    [dispatch, limit, pagination?.page_no, debouncedSearchTerm, status]
  );

  const [onInitialize] = useAsyncOperation(getContactUs);

  useEffect(() => {
    if (!initializedRef.current) {
      onInitialize({});
      initializedRef.current = true;
    }
    return () => {
      dispatch(resetContactUsState());
    };
  }, []);

  useEffect(() => {
    if (!hasMountedOnce.current) {
      hasMountedOnce.current = true;
      return;
    }

    dispatch(setContactUsSearchTerm(debouncedSearchTerm));
    getContactUs(1);
  }, [debouncedSearchTerm, status]);

  useEffect(() => {
    if (contactUsModalOpen) {
      updateContactUsMethods.setValue(
        'status',
        (contactUsItem?.status as 'new' | 'in_progress' | 'resolved') || 'new'
      );
      updateContactUsMethods.setValue('notes', contactUsItem?.notes || '');
    }
  }, [contactUsModalOpen]);

  const handleStatusChange = (value: string | null) => {
    setStatus(value);
  };

  const handleClearStatus = () => {
    setStatus(null);
  };

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      dispatch(
        fetchContactUs({
          limit: newLimit,
          page: 1,
          searchTerm: debouncedSearchTerm || '',
          ...(status && {
            status,
          }),
        })
      );
    },
    [dispatch, debouncedSearchTerm, status]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(
        fetchContactUs({
          limit,
          page,
          searchTerm: debouncedSearchTerm || '',
          ...(status && {
            status,
          }),
        })
      );
    },
    [dispatch, limit, debouncedSearchTerm, status]
  );

  // Update Contact Us
  const [updateContactUsFn, updateContactUsLoading] = useAsyncOperation(
    async (data: { status: string; notes?: string }) => {
      try {
        const res = await dispatch(
          updateContactUs({
            id: contactUsItem?.id!,
            status: data.status,
            notes: data.notes,
          })
        );
        if (res?.payload?.success) {
          notifications.show({
            message: res?.payload?.message || 'Contact us updated successfully',
            color: 'green',
          });
          await dispatch(
            fetchContactUs({
              limit,
              page: pagination?.page_no || 1,
              searchTerm: debouncedSearchTerm || '',
              ...(status && {
                status,
              }),
            })
          );
          setContactUsModalOpen(false);
          reset();
        } else {
          notifications.show({
            message: res?.payload?.message || 'Failed to update contact us',
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

  const handleUpdateContactUs = updateContactUsMethods.handleSubmit(data => {
    updateContactUsFn(data);
  });

  const openContactUsModal = useCallback((row: ContactUsType) => {
    setContactUsItem(row);
    setContactUsModalOpen(true);
    reset();
  }, []);

  const closeContactUsModal = useCallback(() => {
    setContactUsModalOpen(false);
    setContactUsItem(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        accessor: 'name',
        title: 'Name',
        minWidth: 150,
        maxWidth: 200,
        render: (row: ContactUsType) => (
          <Tooltip label={row.name} fz="xs">
            <Text fw={600} fz="sm" truncate>
              {row.name}
            </Text>
          </Tooltip>
        ),
      },
      {
        accessor: 'email',
        title: 'Email',
        minWidth: 200,
        maxWidth: 250,
        render: (row: ContactUsType) => (
          <Tooltip label={row.email} fz="xs">
            <Text fz="sm" truncate>
              {row.email}
            </Text>
          </Tooltip>
        ),
      },
      {
        accessor: 'contact_number',
        title: 'Contact Number',
        minWidth: 150,
        maxWidth: 200,
        render: (row: ContactUsType) => (
          <Text fz="sm">{row.contact_number || '--'}</Text>
        ),
      },
      {
        accessor: 'subject',
        title: 'Subject',
        minWidth: 180,
        maxWidth: 220,
        render: (row: ContactUsType) => (
          <Tooltip label={row.subject} fz="xs">
            <Text fz="sm" truncate>
              {row.subject}
            </Text>
          </Tooltip>
        ),
      },
      {
        accessor: 'message',
        title: 'Message',
        minWidth: 250,
        maxWidth: 300,
        render: (row: ContactUsType) => (
          <Tooltip label={row.message} fz="xs">
            <Text fz="sm" truncate>
              {row.message}
            </Text>
          </Tooltip>
        ),
      },
      {
        accessor: 'status',
        title: 'Status',
        width: 120,
        render: (row: ContactUsType) => <Text fz="sm">{row.status}</Text>,
      },
      {
        accessor: 'lastModified',
        title: 'Last Modified',
        width: 150,
        render: (row: ContactUsType) =>
          row.updatedAt ? (
            <Tooltip label={formatDateAndTime(row.updatedAt)} fz="xs">
              <Text fz="sm">{formatDate(row.updatedAt)}</Text>
            </Tooltip>
          ) : (
            '-'
          ),
      },
      {
        accessor: 'actions',
        title: 'Actions',
        width: 80,
        render: (row: ContactUsType) => (
          <Tooltip label="Change Status" fz="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={e => {
                e.stopPropagation();
                openContactUsModal(row);
              }}
            >
              <ICONS.IconStatusChange size={20} color="#0056b3" />
            </ActionIcon>
          </Tooltip>
        ),
      },
    ],
    []
  );

  const getUpdateContactUsFormData = useCallback(
    () => [
      {
        id: 'status',
        name: 'status',
        placeholder: 'Select status',
        type: 'select',
        label: 'Status',
        isRequired: true,
        data: statusOptions,
        error: errors.status?.message,
      },
      {
        id: 'notes',
        name: 'notes',
        placeholder: 'Enter notes',
        type: 'textarea',
        label: 'Notes',
        isRequired: false,
        error: errors.notes?.message,
      },
    ],
    []
  );

  return {
    data,
    loading,
    closeContactUsModal,
    contactUsModalOpen,
    updateContactUsMethods,
    searchTerm: localSearchTerm,
    handleSearchChange,
    columns,
    handleUpdateContactUs,
    updateContactUsLoading,
    handlePageChange,
    currentPage: pagination?.page_no || 1,
    totalRecords: pagination?.total || 0,
    limit,
    handleLimitChange,
    handleStatusChange,
    updateContactUsFormData: getUpdateContactUsFormData(),
    statusOptions,
    status,
    handleClearStatus,
  };
};

export default useContactUs;
