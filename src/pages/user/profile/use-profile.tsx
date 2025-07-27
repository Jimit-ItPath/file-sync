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
} from '../../../store/slices/user.slice';
import {
  getConnectedAccount,
  removeAccountAccess,
} from '../../../store/slices/auth.slice';
import { initializeCloudStorageFromStorage } from '../../../store/slices/cloudStorage.slice';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(20, 'First name must be less than 20 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(20, 'Last name must be less than 20 characters'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  avatar: z.union([z.string(), z.instanceof(File)]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UseProfile = () => {
  const { isLoading, userProfile } = useAppSelector(state => state.user);
  const { connectedAccounts, loading } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [preview, setPreview] = useState<string | null>(null);
  const [openRemoveProfileImageModal, setOpenRemoveProfileImageModal] =
    useState(false);
  const [removeAccessModalOpen, setRemoveAccessModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

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

  useEffect(() => {
    getProfile({});
    onInitialize({});
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
          title: 'Success',
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
        limit: 10,
        page: 1,
      })
    );
  }, [dispatch]);

  const [getFiles] = useAsyncOperation(getCloudStorageFiles);

  const [removeAccess, removeAccessLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(
        removeAccountAccess({ id: Number(selectedAccountId) })
      ).unwrap();
      if (res?.success) {
        notifications.show({
          title: 'Success',
          message: res?.message || 'Access removed successfully',
          color: 'green',
        });
        await onInitialize({});
        await getFiles({});
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

  const [removeProfilePic, removeProfileImageLoading] = useAsyncOperation(
    async () => {
      const res = await dispatch(removeProfileImage());
      if (res.payload?.success) {
        notifications.show({
          title: 'Success',
          message: res.payload?.message || 'Profile image removed successfully',
          color: 'green',
        });
        await getProfile({});
        closeRemoveProfilePicModal();
        setPreview(null);
      } else {
        notifications.show({
          title: 'Error',
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
        placeholder: 'Enter your first name',
        type: 'text',
        label: 'First name',
        isRequired: true,
        error: errors.firstName?.message,
      },
      {
        id: 'lastName',
        name: 'lastName',
        placeholder: 'Enter your last name',
        type: 'text',
        label: 'Last name',
        isRequired: true,
        error: errors.lastName?.message,
      },
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter your email',
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
  };
};

export default UseProfile;
