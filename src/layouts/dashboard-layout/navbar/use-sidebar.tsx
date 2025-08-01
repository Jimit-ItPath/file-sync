import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import {
  connectCloudAccount,
  fetchStorageDetails,
  getConnectedAccount,
  removeAccountAccess,
} from '../../../store/slices/auth.slice';
import { decodeToken } from '../../../utils/helper';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import { generatePath, useNavigate } from 'react-router';
import {
  fetchRecentFiles,
  initializeCloudStorageFromStorage,
} from '../../../store/slices/cloudStorage.slice';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../../assets/svgs/OneDrive.svg';
import { Image } from '@mantine/core';
import { ROLES } from '../../../utils/constants';

const connectAccountSchema = z.object({
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['google_drive', 'dropbox', 'onedrive'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
});

type ConnectAccountFormData = z.infer<typeof connectAccountSchema>;

const accountTypeConfig = {
  google_drive: {
    url: PRIVATE_ROUTES.GOOGLE_DRIVE.url,
    // icon: (
    //   <ICONS.IconBrandGoogle
    //     size={18}
    //     color="#ef4444"
    //     stroke={1.25}
    //     fill="#ef4444"
    //   />
    // ),
    icon: <Image src={GoogleDriveIcon} alt="Google Drive" w={16} h={16} />,
    title: 'Google Drive',
  },
  dropbox: {
    url: PRIVATE_ROUTES.DROPBOX.url,
    // icon: (
    //   <ICONS.IconDroplets
    //     size={18}
    //     color="#007ee5"
    //     stroke={1.25}
    //     fill="#007ee5"
    //   />
    // ),
    icon: <Image src={DropboxIcon} alt="Dropbox" w={16} h={16} />,
    title: 'Dropbox',
  },
  onedrive: {
    url: PRIVATE_ROUTES.ONEDRIVE.url,
    // icon: (
    //   <ICONS.IconBrandOnedrive
    //     size={18}
    //     color="#0078d4"
    //     stroke={1.25}
    //     fill="#0078d4"
    //   />
    // ),
    icon: <Image src={OneDriveIcon} alt="OneDrive" w={16} h={16} />,
    title: 'OneDrive',
  },
};

const useSidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { connectedAccounts, loading, checkStorageDetails, user } =
    useAppSelector(state => state.auth);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [removeAccessModalOpen, setRemoveAccessModalOpen] = useState(false);
  const [hoveredAccountId, setHoveredAccountId] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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

  const getStorageDetails = useCallback(async () => {
    await dispatch(fetchStorageDetails());
  }, [dispatch]);

  const [fetchStorageData] = useAsyncOperation(getStorageDetails);

  useEffect(() => {
    if (user?.user?.role === ROLES.USER) {
      onInitialize({});
      fetchStorageData({});
    }
  }, [user]);

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
    setSelectedAccountId(id);
    setRemoveAccessModalOpen(true);
  }, []);

  const closeRemoveAccessModal = useCallback(() => {
    setRemoveAccessModalOpen(false);
    setSelectedAccountId(null);
    setHoveredAccountId(null);
  }, []);

  const getCloudStorageFiles = useCallback(async () => {
    await dispatch(
      initializeCloudStorageFromStorage({
        limit: 20,
        page: 1,
      })
    );
  }, [dispatch]);

  const [getFiles] = useAsyncOperation(getCloudStorageFiles);

  const getRecentFiles = useCallback(async () => {
    await dispatch(fetchRecentFiles({}));
  }, [dispatch]);

  const [onGetRecentFiles] = useAsyncOperation(getRecentFiles);

  const [removeAccess, removeAccessLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(
        removeAccountAccess({ id: Number(selectedAccountId) })
      ).unwrap();
      if (res?.success) {
        notifications.show({
          message: res?.message || 'Access removed successfully',
          color: 'green',
        });
        onInitialize({});
        onGetRecentFiles({});
        getFiles({});
        fetchStorageData({});
        navigate(PRIVATE_ROUTES.DASHBOARD.path);
        closeRemoveAccessModal();
      }
    } catch (error: any) {
      notifications.show({
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
        label: 'Account name (Alias)',
        isRequired: true,
        error: errors.accountName?.message,
      },
    ],
    [errors]
  );

  const cloudAccountsWithStorage = connectedAccounts?.map(account => {
    const storageInfo = checkStorageDetails?.result?.find(
      detail => detail.id === account.id.toString()
    );
    const config = accountTypeConfig[account.account_type];
    return {
      id: account.id,
      url: generatePath(config.url, { id: account.id }),
      icon: config.icon,
      title: account.account_name || config.title,
      storageInfo: storageInfo?.storage_details,
    };
  });

  const openNewModal = () => setIsNewModalOpen(true);
  const closeNewModal = () => setIsNewModalOpen(false);

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
    cloudAccountsWithStorage,
    checkStorageDetails,
    user,
    isNewModalOpen,
    openNewModal,
    closeNewModal,
  };
};

export default useSidebar;
