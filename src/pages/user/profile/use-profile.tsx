import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../../api';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchProfile,
  removeProfileImage,
  updateSFDPreference,
} from '../../../store/slices/user.slice';
import {
  fetchStorageDetails,
  getConnectedAccount,
  removeAccountAccess,
} from '../../../store/slices/auth.slice';
import {
  fetchRecentFiles,
  initializeCloudStorageFromStorage,
} from '../../../store/slices/cloudStorage.slice';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { NAME_REGEX, ROLES } from '../../../utils/constants';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be less than 20 characters')
    .regex(
      NAME_REGEX,
      'First name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be less than 20 characters')
    .regex(
      NAME_REGEX,
      'Last name must contain only letters, spaces, hyphens, and apostrophes'
    ),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  avatar: z.union([z.string(), z.instanceof(File)]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UseProfile = () => {
  const { isLoading, userProfile } = useAppSelector(state => state.user);
  const { connectedAccounts, loading, user } = useAppSelector(
    state => state.auth
  );
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [openRemoveProfileImageModal, setOpenRemoveProfileImageModal] =
    useState(false);
  const [removeAccessModalOpen, setRemoveAccessModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  const theme = useMantineTheme();
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;
  const { setValue } = methods;

  const getUserProfile = useCallback(async () => {
    await dispatch(fetchProfile());
  }, [dispatch]);

  const [getProfile] = useAsyncOperation(getUserProfile);

  const getAccounts = useCallback(async () => {
    await dispatch(getConnectedAccount());
  }, [dispatch]);

  const [onInitialize] = useAsyncOperation(getAccounts);

  const getStorageDetails = useCallback(async () => {
    await dispatch(fetchStorageDetails());
  }, [dispatch]);

  const [fetchStorageData] = useAsyncOperation(getStorageDetails);

  useEffect(() => {
    getProfile({});
    if (user?.user?.role === ROLES.USER) {
      onInitialize({});
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      reset({
        firstName: userProfile?.first_name || '',
        lastName: userProfile?.last_name || '',
        email: userProfile?.email || '',
        avatar: userProfile?.profile || undefined,
      });
      if (userProfile?.profile) {
        setPreview(String(userProfile.profile));
      }
    }
  }, [userProfile, reset]);

  const [sfdPreference] = useAsyncOperation(async (checked: boolean) => {
    const res: any = await dispatch(
      updateSFDPreference({ is_sfd_enabled: checked })
    );
    if (res.payload?.status === 200) {
      await getProfile({});
      notifications.show({
        message:
          res?.payload?.data?.message || 'SFD preference updated successfully!',
        color: 'green',
      });
    } else {
      notifications.show({
        message: res?.payload?.message || 'Failed to update SFD preference!',
        color: 'red',
      });
    }
  });

  const handleSFDToggle = useCallback(async (checked: boolean) => {
    sfdPreference(checked);
  }, []);

  const [onSubmit, submitLoading] = useAsyncOperation(
    async (data: ProfileFormData) => {
      const formData = new FormData();
      formData.append('first_name', data.firstName);
      formData.append('last_name', data.lastName);
      if (data.avatar instanceof File) {
        formData.append('profile', data.avatar);
      }

      const response = await api.user.updateProfile({
        data: formData,
      });

      if (response?.data?.success || response?.status === 200) {
        notifications.show({
          message: 'Profile updated successfully!',
          color: 'green',
        });
        await getProfile({});
      }
    }
  );

  const handleAvatarChange = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setValue('avatar', undefined);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      notifications.show({
        message: 'Only JPG, PNG, or WEBP files are allowed',
        color: 'red',
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      notifications.show({
        message: 'File size must be less than 5MB',
        color: 'red',
      });
      return;
    }

    setValue('avatar', file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openRemoveProfilePicModal = useCallback(() => {
    setOpenRemoveProfileImageModal(true);
  }, []);

  const closeRemoveProfilePicModal = useCallback(() => {
    setOpenRemoveProfileImageModal(false);
  }, []);

  const openRemoveAccessModal = useCallback((id: number) => {
    setSelectedAccountId(id);
    setRemoveAccessModalOpen(true);
  }, []);

  const closeRemoveAccessModal = useCallback(() => {
    setSelectedAccountId(null);
    setRemoveAccessModalOpen(false);
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
        await onInitialize({});
        await onGetRecentFiles({});
        await getFiles({});
        closeRemoveAccessModal();
        await fetchStorageData({});
      }
    } catch (error: any) {
      notifications.show({
        message: error || 'Error removing access',
        color: 'red',
      });
    }
  });

  const [removeProfilePic, removeProfileImageLoading] = useAsyncOperation(
    async () => {
      const res = await dispatch(removeProfileImage());
      if (res.payload?.success) {
        notifications.show({
          message: res.payload?.message || 'Profile image removed successfully',
          color: 'green',
        });
        await getProfile({});
        closeRemoveProfilePicModal();
        setPreview(null);
      } else {
        notifications.show({
          message: res.payload?.message || 'Error removing profile image',
          color: 'red',
        });
      }
    }
  );

  const getProfileFormData = useCallback(
    () => [
      {
        id: 'firstName',
        name: 'firstName',
        placeholder: 'Enter first name',
        type: 'text',
        label: 'First name',
        isRequired: true,
        error: errors.firstName?.message,
      },
      {
        id: 'lastName',
        name: 'lastName',
        placeholder: 'Enter last name',
        type: 'text',
        label: 'Last name',
        isRequired: true,
        error: errors.lastName?.message,
      },
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter email',
        type: 'email',
        label: 'Email address',
        isRequired: true,
        disabled: true,
        error: errors.email?.message,
      },
    ],
    [errors]
  );

  return {
    profileFormData: getProfileFormData(),
    handleProfileSubmit: handleSubmit(onSubmit),
    isLoading,
    submitLoading,
    methods,
    preview,
    handleAvatarChange,
    removeAccess,
    removeAccessLoading,
    openRemoveAccessModal,
    closeRemoveAccessModal,
    removeAccessModalOpen,
    removeProfilePic,
    removeProfileImageLoading,
    openRemoveProfileImageModal,
    openRemoveProfilePicModal,
    closeRemoveProfilePicModal,
    connectedAccounts,
    loading,
    handleSFDToggle,
    userProfile,
    isXs,
    isSm,
    isMd,
  };
};

export default UseProfile;
