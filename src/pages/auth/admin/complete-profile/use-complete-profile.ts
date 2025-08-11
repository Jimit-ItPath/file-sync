import { z } from 'zod';
import { passwordRequirements } from '../../../../utils/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import useAsyncOperation from '../../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import { api } from '../../../../api';
import { useCallback } from 'react';
import { PRIVATE_ROUTES } from '../../../../routing/routes';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ICONS } from '../../../../assets/icons';
import { decodeToken } from '../../../../utils/helper';
import { useAppDispatch } from '../../../../store';
import { updateUser } from '../../../../store/slices/auth.slice';

const completeProfileSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required'),
  last_name: z.string().trim().min(1, 'Last name is required'),
  // email: z
  //   .string()
  //   .trim()
  //   .min(1, 'Email is required')
  //   .email('Invalid email address'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine(val => passwordRequirements.every(req => req.re.test(val)), {
      message:
        'Password must include uppercase, lowercase, number, and special symbol',
    }),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

const features = [
  {
    icon: ICONS.IconShieldCheck,
    title: 'End-to-end secure access',
    description: 'Your files are protected with enterprise-grade encryption',
  },
  {
    icon: ICONS.IconRefresh,
    title: 'Fast file syncing across cloud drives',
    description: 'Real-time synchronization across all your platforms',
  },
  {
    icon: ICONS.IconCpu,
    title: 'Smart file distribution engine',
    description: 'AI-powered organization and intelligent file management',
  },
];

const useCompleteProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // const email = searchParams.get('email');
  const validation_code = searchParams.get('validation_code');
  const dispatch = useAppDispatch();

  const theme = useMantineTheme();
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const methods = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      // email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  // useEffect(() => {
  //   if (email) {
  //     setValue('email', email);
  //   }
  // }, []);

  const [onSubmit, loading] = useAsyncOperation(
    async (data: CompleteProfileFormData) => {
      if (!validation_code) {
        notifications.show({
          message: 'Validation code is required.',
          color: 'red',
        });
        return;
      }
      const res = await api.auth.completeProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        // email: data.email,
        validation_code,
        password: data.password,
      });

      if (res?.data?.success || res.status === 200) {
        const decodeData: any = decodeToken(res?.data?.data?.access_token);
        localStorage.setItem('token', res?.data?.data?.access_token);
        dispatch(
          updateUser({
            token: res?.data?.data?.access_token,
            activeUI: '',
            isTemporary: res?.data?.data?.isTemporary || false,
            user: { ...decodeData },
          })
        );
        notifications.show({
          message: res?.data?.message || 'Profile completed successfully',
          color: 'green',
        });
        navigate(PRIVATE_ROUTES.DASHBOARD.url);
        reset();
      }
    }
  );

  const getCompleteProfileFormData = useCallback(
    () => [
      {
        id: 'first_name',
        name: 'first_name',
        placeholder: 'Enter first name',
        type: 'text-input',
        label: 'First Name',
        isRequired: true,
        error: errors.first_name?.message,
      },
      {
        id: 'last_name',
        name: 'last_name',
        placeholder: 'Enter last name',
        type: 'text-input',
        label: 'Last Name',
        isRequired: true,
        error: errors.last_name?.message,
      },
      // {
      //   id: 'email',
      //   name: 'email',
      //   placeholder: 'Enter email',
      //   type: 'email-input',
      //   label: 'Email',
      //   isRequired: true,
      //   error: errors.email?.message,
      //   disabled: true,
      // },
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter password',
        label: 'Password',
        type: 'password-input',
        showIcon: true,
        isRequired: true,
        error: errors.password?.message,
        strengthMeter: true,
      },
    ],
    [errors]
  );

  return {
    completeProfileFormData: getCompleteProfileFormData(),
    handleCompleteProfileSubmit: handleSubmit(onSubmit),
    isLoading: loading,
    methods,
    isXs,
    isSm,
    isMd,
    features,
    navigate,
  };
};

export default useCompleteProfile;
