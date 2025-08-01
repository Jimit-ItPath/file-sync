import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { api } from '../../../api';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

const useForgotPassword = () => {
  const navigate = useNavigate();
  const methods = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });
  const { reset } = methods;

  const [onSubmit, loading] = useAsyncOperation(
    async (data: ForgotFormData) => {
      const res = await api.auth.forgotPassword({
        data: { email: data.email },
      });
      if (res.status === 200 || res?.data?.success) {
        notifications.show({
          message:
            res?.data?.message || 'Password reset link sent to your email',
          color: 'green',
        });
        navigate(AUTH_ROUTES.LOGIN.url);
        reset();
      }
    }
  );

  return {
    methods,
    handleForgotSubmit: methods.handleSubmit(onSubmit),
    isLoading: loading,
  };
};

export default useForgotPassword;
