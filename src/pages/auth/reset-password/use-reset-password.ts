import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { api } from '../../../api';
import { AUTH_ROUTES } from '../../../routing/routes';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { notifications } from '@mantine/notifications';
import { passwordRequirements } from '../../../utils/constants';

interface ResetPasswordProps {
  email: string | null;
  validation_code: string | null;
}

// Define Zod schema for form validation
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(val => passwordRequirements.every(req => req.re.test(val)), {
        message:
          'Password must include uppercase, lowercase, number, and special symbol',
      }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

const useResetPassword = ({ email, validation_code }: ResetPasswordProps) => {
  const navigate = useNavigate();

  const methods = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const [onSubmit, loading] = useAsyncOperation(async (data: ResetFormData) => {
    if (!email || !validation_code) {
      notifications.show({
        message: 'Email and validation code are required.',
        color: 'red',
      });
      return;
    }
    const res = await api.auth.restPassword({
      data: {
        email,
        validation_code,
        password: data.password,
      },
    });

    if (res?.data?.success || res.status === 200) {
      notifications.show({
        message: res?.data?.message || 'Password reset link sent to your email',
        color: 'green',
      });
      navigate(AUTH_ROUTES.LOGIN.url);
      reset();
    }
  });

  const getResetPasswordFormData = useCallback(
    () => [
      {
        id: 'password',
        name: 'password',
        placeholder: 'Enter Password',
        type: 'password-input',
        label: 'Password',
        isRequired: true,
        error: errors.password?.message,
      },
      {
        id: 'confirmPassword',
        name: 'confirmPassword',
        placeholder: 'ReEnter Password',
        type: 'password-input',
        label: 'Password',
        isRequired: true,
        error: errors.confirmPassword?.message,
      },
    ],
    [errors]
  );

  return {
    resetPasswordFormData: getResetPasswordFormData(),
    handleResetPasswordSubmit: handleSubmit(onSubmit),
    isLoading: loading,
    methods,
  };
};

export default useResetPassword;
