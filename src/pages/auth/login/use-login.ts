import { useCallback } from 'react';
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

// Define Zod schema for form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  const [onSubmit, loading] = useAsyncOperation(async (data: LoginFormData) => {
    const response = await api.auth.login({
      data: {
        email: data.email,
        password: data.password,
      },
    });
    if (response?.data?.success || response?.status === 200) {
      const decodeData = decodeToken(response?.data?.data?.access_token);
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
  });

  const getLoginFormData = useCallback(
    () => [
      {
        id: 'email',
        name: 'email',
        placeholder: 'Enter your email',
        type: 'email',
        label: 'Email address',
        isRequired: true,
        error: errors.email?.message,
      },
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter Password',
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
  };
};

export default useLogin;
