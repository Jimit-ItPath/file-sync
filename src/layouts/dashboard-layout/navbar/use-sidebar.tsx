import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import {
  connectCloudAccount,
  fetchStorageDetails,
  getConnectedAccount,
  removeAccountAccess,
  updateSequence,
} from '../../../store/slices/auth.slice';
import {
  decodeToken,
  getLocalStorage,
  setLocalStorage,
} from '../../../utils/helper';
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
import { useViewportSize } from '@mantine/hooks';
import { type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const connectAccountSchema = z.object({
  accountName: z.string().trim().min(1, 'Account name is required'),
  accountType: z.enum(['google_drive', 'dropbox', 'onedrive'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
});

type ConnectAccountFormData = z.infer<typeof connectAccountSchema>;

const accountTypeConfig = {
  google_drive: {
    url: PRIVATE_ROUTES.GOOGLE_DRIVE.url,
    icon: <Image src={GoogleDriveIcon} alt="Google Drive" w={16} h={16} />,
    title: 'Google Drive',
  },
  dropbox: {
    url: PRIVATE_ROUTES.DROPBOX.url,
    icon: <Image src={DropboxIcon} alt="Dropbox" w={18} />,
    title: 'Dropbox',
  },
  onedrive: {
    url: PRIVATE_ROUTES.ONEDRIVE.url,
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
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useViewportSize();
  const [localSortedAccounts, setLocalSortedAccounts] = useState<any[] | null>(
    null
  );
  // const hasMountedOnce = useRef(false);

  // Add ref to track if drag operation is in progress
  const isDragInProgress = useRef(false);
  const pendingSequenceUpdate = useRef<any[]>([]);

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
    // Don't fetch accounts if drag is in progress
    // if (isDragInProgress.current) {
    //   return;
    // }
    await dispatch(getConnectedAccount());
  }, [dispatch]);

  const [onInitialize] = useAsyncOperation(getAccounts);

  const getStorageDetails = useCallback(async () => {
    await dispatch(fetchStorageDetails());
  }, [dispatch]);

  const [fetchStorageData] = useAsyncOperation(getStorageDetails);

  // useEffect(() => {
  //   if (user?.user?.role === ROLES.USER && !hasMountedOnce.current) {
  //     onInitialize({});
  //     fetchStorageData({});
  //     hasMountedOnce.current = true;
  //   }
  // }, [user]);

  useEffect(() => {
    const isPostConnect = getLocalStorage('post_connect_redirect') === true;

    if (isPostConnect && connectedAccounts?.length === 1) {
      setShowConfetti(true);
      localStorage.removeItem('post_connect_redirect');
    }
  }, [connectedAccounts]);

  const cloudAccountsWithStorage = useMemo(() => {
    return (
      connectedAccounts?.map(account => {
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
          sequence_number: account.sequence_number || 0,
        };
      }) || []
    );
  }, [connectedAccounts, checkStorageDetails?.result]);

  const sortedCloudAccounts = useMemo(() => {
    return [...cloudAccountsWithStorage].sort((a, b) => {
      if (a.sequence_number !== b.sequence_number) {
        return a.sequence_number - b.sequence_number;
      }
      return a.id - b.id;
    });
  }, [cloudAccountsWithStorage]);

  const displayedAccounts = localSortedAccounts || sortedCloudAccounts;

  const [updateAccountSequence, updateSequenceLoading] = useAsyncOperation(
    async (data: { id: number; sequence_number: number }[]) => {
      try {
        const res = await dispatch(updateSequence(data)).unwrap();
        if (res?.success) {
          notifications.show({
            message: res?.message || 'Account order updated successfully',
            color: 'green',
          });

          // Set a timeout before allowing account refresh to prevent UI glitch
          // setTimeout(() => {
          // isDragInProgress.current = false;
          onInitialize({});
          // }, 500);
        } else {
          // Revert optimistic update on failure
          isDragInProgress.current = false;
          setLocalSortedAccounts(pendingSequenceUpdate.current);
          notifications.show({
            message:
              res?.message ||
              res?.data?.message ||
              'Failed to update account order',
            color: 'red',
          });
        }
      } catch (error: any) {
        // Revert optimistic update on error
        isDragInProgress.current = false;
        setLocalSortedAccounts(pendingSequenceUpdate.current);
        notifications.show({
          message: error || 'Failed to update account order',
          color: 'red',
        });
      }
    }
  );

  // Handle drag end event with improved state management
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const oldIndex = sortedCloudAccounts.findIndex(
        account => account.id === active.id
      );
      const newIndex = sortedCloudAccounts.findIndex(
        account => account.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(sortedCloudAccounts, oldIndex, newIndex);
      setLocalSortedAccounts(newOrder);

      const updateData = newOrder.map((account, index) => ({
        id: account.id,
        sequence_number: index + 1,
      }));

      try {
        await updateAccountSequence(updateData);
        setLocalSortedAccounts(null);
      } catch {
        setLocalSortedAccounts(null);
      }
    },
    [sortedCloudAccounts, updateAccountSequence]
  );

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
          if (!connectedAccounts?.length) {
            setLocalStorage('post_connect_redirect', true);
          }
          reset();
          setIsConnectModalOpen(false);
          window.location.href = res?.data?.redirect_url;
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to connect account',
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
    sortedCloudAccounts: displayedAccounts,
    handleDragEnd,
    updateSequenceLoading,
    checkStorageDetails,
    user,
    isNewModalOpen,
    openNewModal,
    closeNewModal,
    showConfetti,
    width,
    height,
    setShowConfetti,
  };
};

export default useSidebar;
