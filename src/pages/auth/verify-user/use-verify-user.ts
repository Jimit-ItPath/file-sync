import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { api } from '../../../api';
import { notifications } from '@mantine/notifications';
import { AUTH_ROUTES } from '../../../routing/routes';

type Status = 'idle' | 'success' | 'error' | 'loading';

const useVerifyUser = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your account...');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const validation_code = searchParams.get('validation_code');
  const navigate = useNavigate();

  const [verifyUser, loading] = useAsyncOperation(
    async (data: { email: string | null; validation_code: string | null }) => {
      const res = await api.auth.verifyUser({ data });
      return res;
    }
  );

  useEffect(() => {
    const verify = async () => {
      setStatus('loading');
      if (!email) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }
      const res = await verifyUser({ email, validation_code });
      if (res?.data?.success) {
        setStatus('success');
        setMessage(
          res?.data?.message || 'Your account has been successfully verified!'
        );
        notifications.show({
          message: res?.data?.message || 'Your account has been verified!',
          color: 'green',
        });
        navigate(AUTH_ROUTES.LOGIN.url);
      } else {
        setStatus('error');
        setMessage(res?.data?.message || 'Invalid email or validation code');
      }
    };

    verify();
  }, [email]);

  return { status, message, loading };
};

export default useVerifyUser;
