import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import {
  connectCloudAccount,
  getConnectedAccount,
  removeAccountAccess,
} from '../../../store/slices/auth.slice';
import { decodeToken } from '../../../utils/helper';

const connectAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['google_drive', 'dropbox', 'onedrive'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
});

type ConnectAccountFormData = z.infer<typeof connectAccountSchema>;

const useSidebar = () => {
  const dispatch = useAppDispatch();
  const { connectedAccounts, loading } = useAppSelector(state => state.auth);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [removeAccessModalOpen, setRemoveAccessModalOpen] = useState(false);
  const [hoveredAccountId, setHoveredAccountId] = useState<number | null>(null);

  const methods = useForm<ConnectAccountFormData>({
    resolver: zodResolver(connectAccountSchema),
    mode: 'onChange',
    defaultValues: {
      accountName: '',
      accountType: '' as 'google_drive' | 'dropbox' | 'onedrive',
    },
  });
  const {
    reset,
    formState: { errors },
  } = methods;

  const getAccounts = useCallback(async () => {
    await dispatch(getConnectedAccount());
  }, [dispatch]);

  const [onInitialize] = useAsyncOperation(getAccounts);

  useEffect(() => {
    onInitialize({});
  }, []);

  const [connectAccount, connectAccountLoading] = useAsyncOperation(
    async (data: ConnectAccountFormData) => {
      const token = localStorage.getItem('token') || null;
      const decodedToken: any = decodeToken(token);
      try {
        const res = await dispatch(
          connectCloudAccount({
            id: Number(decodedToken?.user?.id),
            account_name: data.accountName,
            account_type: data.accountType,
          })
        ).unwrap();
        if (res?.success || res?.data?.redirect_url) {
          reset();
          setIsConnectModalOpen(false);
          window.location.href = res?.data?.redirect_url;
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to connect account123',
          color: 'red',
        });
      }
    }
  );

  const handleConnectAccount = methods.handleSubmit(data => {
    connectAccount(data);
  });

  const openAccountModal = useCallback(() => {
    setIsConnectModalOpen(true);
    reset();
  }, []);

  const closeAccountModal = useCallback(() => {
    setIsConnectModalOpen(false);
  }, [reset]);

  const openRemoveAccessModal = useCallback((id: number) => {
    setHoveredAccountId(id);
    setRemoveAccessModalOpen(true);
    reset();
  }, []);

  const closeRemoveAccessModal = useCallback(() => {
    setRemoveAccessModalOpen(false);
    setHoveredAccountId(null);
  }, [reset]);

  const [removeAccess, removeAccessLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(
        removeAccountAccess({ id: Number(hoveredAccountId) })
      ).unwrap();
      if (res?.success) {
        notifications.show({
          title: 'Success',
          message: res?.message || 'Access removed successfully',
          color: 'green',
        });
        await onInitialize({});
        closeRemoveAccessModal();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error || 'Error removing access',
        color: 'red',
      });
    }
  });

  const getConnectAccountFormData = useCallback(
    () => [
      {
        id: 'accountName',
        name: 'accountName',
        placeholder: 'Enter account name',
        type: 'text',
        label: 'Account name',
        isRequired: true,
        error: errors.accountName?.message,
      },
    ],
    [errors]
  );

  return {
    methods,
    isConnectModalOpen,
    openAccountModal,
    closeAccountModal,
    handleConnectAccount,
    connectAccountFormData: getConnectAccountFormData(),
    connectAccountLoading,
    connectedAccounts,
    loading,
    openRemoveAccessModal,
    closeRemoveAccessModal,
    removeAccess,
    removeAccessLoading,
    removeAccessModalOpen,
    setHoveredAccountId,
    hoveredAccountId,
  };
};

export default useSidebar;
