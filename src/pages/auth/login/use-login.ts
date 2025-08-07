import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { api } from '../../../api';
import { decodeToken } from '../../../utils/helper';
import { PRIVATE_ROUTES } from '../../../routing/routes';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { updateUser } from '../../../store/slices/auth.slice';
import { notifications } from '@mantine/notifications';
import { useAppDispatch } from '../../../store';
import { ROLES } from '../../../utils/constants';

// Define Zod schema for form validation
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(value => value.trim() !== '', 'Email cannot be empty spaces'),
  password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    .refine(value => value.trim() !== '', 'Password cannot be empty spaces'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showLoginForm, setShowLoginForm] = useState(false);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const toggleLoginForm = useCallback(() => {
    setShowLoginForm(prev => !prev);
  }, []);

  const [onSubmit, loading] = useAsyncOperation(async (data: LoginFormData) => {
    const response = await api.auth.login({
      data: {
        email: data.email,
        password: data.password,
        role: ROLES.USER,
      },
    });
    if (response?.data?.success || response?.status === 200) {
      const decodeData: any = decodeToken(response?.data?.data?.access_token);
      if (decodeData?.user?.role === ROLES.ADMIN) {
        notifications.show({
          message: 'Invalid credentials',
          color: 'red',
        });
        return;
      } else {
        localStorage.setItem('token', response?.data?.data?.access_token);
        dispatch(
          updateUser({
            token: response?.data?.data?.access_token,
            activeUI: '',
            isTemporary: response?.data?.data?.isTemporary || false,
            user: { ...decodeData },
          })
        );
        notifications.show({
          message: response?.data?.message || 'Login Successful',
          color: 'green',
        });
        reset();
        navigate(PRIVATE_ROUTES.DASHBOARD.url);
      }
    }
  });

  const getLoginFormData = useCallback(
    () => [
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter email',
        type: 'email',
        label: 'Email address',
        isRequired: true,
        error: errors.email?.message,
      },
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter password',
        label: 'Password',
        type: 'password-input',
        showIcon: true,
        isRequired: true,
        error: errors.password?.message,
      },
    ],
    [errors]
  );

  return {
    loginFormData: getLoginFormData(),
    handleLoginSubmit: handleSubmit(onSubmit),
    isLoading: loading,
    methods,
    showLoginForm,
    toggleLoginForm,
    navigate,
  };
};

export default useLogin;
