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
  renameConnectedAccount,
  updateSequence,
  type ConnectedAccountType,
} from '../../../store/slices/auth.slice';
import {
  decodeToken,
  getLocalStorage,
  setLocalStorage,
} from '../../../utils/helper';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import { generatePath, useNavigate } from 'react-router';
import {
  // fetchRecentFiles,
  initializeCloudStorageFromStorage,
} from '../../../store/slices/cloudStorage.slice';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../../assets/svgs/OneDrive.svg';
import { Image } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { NAME_REGEX } from '../../../utils/constants';
import { encryptRouteParam } from '../../../utils/helper/encryption';

const connectAccountSchema = z.object({
  accountName: z.string().trim().min(1, 'Account name is required'),
  accountType: z.enum(['google_drive', 'dropbox', 'onedrive'], {
    errorMap: () => ({ message: 'Please select an account type' }),
  }),
});

const renameAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Account name is required')
    .max(50, 'Maximum 50 characters allowed')
    .regex(NAME_REGEX, "Letters only (spaces, - and ' allowed)"),
});

type RenameAccountFormData = z.infer<typeof renameAccountSchema>;

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
  const [renameAccountModalOpen, setRenameAccountModalOpen] = useState(false);
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
  const [menuOpened, setMenuOpened] = useState(false);

  // Add ref to track if drag operation is in progress
  const isDragInProgress = useRef(false);

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

  const renameAccountMethods = useForm<RenameAccountFormData>({
    resolver: zodResolver(renameAccountSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  });

  const { reset: resetRenameAccount } = renameAccountMethods;

  useEffect(() => {
    if (selectedAccountId && renameAccountModalOpen) {
      const account = connectedAccounts?.find(
        account => account.id === selectedAccountId
      );
      if (account) {
        renameAccountMethods.setValue('name', account.account_name);
      }
    }
  }, [selectedAccountId, connectedAccounts, renameAccountModalOpen]);

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
        const encryptedId = encryptRouteParam(account?.id?.toString());
        return {
          id: account.id,
          url: generatePath(config.url, { encryptedId }),
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
          const updatedAccounts = displayedAccounts
            .map(account => {
              const updatedAccount = data.find(item => item.id === account.id);
              return updatedAccount
                ? {
                    ...account,
                    sequence_number: updatedAccount.sequence_number,
                  }
                : account;
            })
            .sort((a, b) => a.sequence_number - b.sequence_number);

          setLocalSortedAccounts(updatedAccounts);
          // notifications.show({
          //   message: res?.message || 'Account order updated successfully',
          //   color: 'green',
          // });
          // Set a timeout before allowing account refresh to prevent UI glitch
          // setTimeout(() => {
          // isDragInProgress.current = false;
          // onInitialize({});
          // }, 500);
        } else {
          // Revert optimistic update on failure
          // isDragInProgress.current = false;
          setLocalSortedAccounts([...displayedAccounts]);
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
        // isDragInProgress.current = false;
        setLocalSortedAccounts([...displayedAccounts]);
        notifications.show({
          message: error || 'Failed to update account order',
          color: 'red',
        });
      } finally {
        isDragInProgress.current = false;
      }
    }
  );

  // Handle drag end event with improved state management
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      isDragInProgress.current = true;

      const oldIndex = displayedAccounts.findIndex(
        account => account.id === active.id
      );
      const newIndex = displayedAccounts.findIndex(
        account => account.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return;

      // const newOrder = arrayMove(sortedCloudAccounts, oldIndex, newIndex);
      const newOrder = arrayMove(displayedAccounts, oldIndex, newIndex);
      setLocalSortedAccounts(newOrder);

      const updateData = newOrder.map((account, index) => ({
        id: account.id,
        sequence_number: index + 1,
      }));

      await updateAccountSequence(updateData);
    },
    [displayedAccounts, updateAccountSequence]
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
          setLocalStorage('connectErrorFromBackend', true);
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

  const [handleReAuthenticate] = useAsyncOperation(
    async (account: ConnectedAccountType) => {
      try {
        const token = localStorage.getItem('token') || null;
        const decodedToken: any = decodeToken(token);
        const res = await dispatch(
          connectCloudAccount({
            id: Number(decodedToken?.user?.id),
            account_name: account.account_name,
            account_type: account.account_type,
            account_id: account.id,
          })
        ).unwrap();
        if (res?.success || res?.data?.redirect_url) {
          reset();
          setIsConnectModalOpen(false);
          setLocalStorage('connectErrorFromBackend', true);
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

  const openAccountModal = useCallback(() => {
    setIsConnectModalOpen(true);
  }, []);

  const closeAccountModal = useCallback(() => {
    setIsConnectModalOpen(false);
    reset();
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

  const openRenameAccountModal = useCallback((id: number) => {
    setHoveredAccountId(id);
    setSelectedAccountId(id);
    setRenameAccountModalOpen(true);
  }, []);

  const closeRenameAccountModal = useCallback(() => {
    setRenameAccountModalOpen(false);
    setSelectedAccountId(null);
    setHoveredAccountId(null);
    resetRenameAccount({ name: '' });
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

  // const getRecentFiles = useCallback(async () => {
  //   await dispatch(fetchRecentFiles({}));
  // }, [dispatch]);

  // const [onGetRecentFiles] = useAsyncOperation(getRecentFiles);

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
        // onGetRecentFiles({});
        if (location.pathname === PRIVATE_ROUTES.DASHBOARD.path) {
          getFiles({});
        }
        fetchStorageData({});
        navigate(PRIVATE_ROUTES.DASHBOARD.path, { replace: true });
        closeRemoveAccessModal();
      }
    } catch (error: any) {
      notifications.show({
        message: error || 'Error removing access',
        color: 'red',
      });
    }
  });

  const [renameAccount, renameAccountLoading] = useAsyncOperation(
    async ({ accountId, name }: { accountId: number; name: string }) => {
      try {
        const res = await dispatch(
          renameConnectedAccount({ id: accountId, name })
        ).unwrap();

        if (res?.success === 1) {
          notifications.show({
            message: res?.message || 'Item renamed successfully',
            color: 'green',
          });
          setRenameAccountModalOpen(false);
          onInitialize({});
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to rename item',
          color: 'red',
        });
      }
    }
  );

  const handleRenameConfirm = renameAccountMethods.handleSubmit(data => {
    if (selectedAccountId) {
      renameAccount({ accountId: selectedAccountId, name: data.name });
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

  const getSelectedAccount = useMemo(() => {
    return connectedAccounts.find(account => account.id === selectedAccountId);
  }, [connectedAccounts, selectedAccountId]);

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
    menuOpened,
    setMenuOpened,
    handleReAuthenticate,
    openRenameAccountModal,
    closeRenameAccountModal,
    renameAccountLoading,
    handleRenameConfirm,
    renameAccountModalOpen,
    renameAccountMethods,
    getSelectedAccount,
  };
};

export default useSidebar;
