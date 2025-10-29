import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { api } from '../../../api';
import { notifications } from '@mantine/notifications';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../../../routing/routes';
import { useAppDispatch, useAppSelector } from '../../../store';
import { updateUser } from '../../../store/slices/auth.slice';
import { setCookie } from '../../../utils/helper';

type Status = 'idle' | 'success' | 'error' | 'loading';

const useVerifyUser = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your account...');
  const [searchParams] = useSearchParams();
  const validation_code = searchParams.get('validation_code');
  const { isLoggedIn } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [verifyUser, loading] = useAsyncOperation(
    async (data: { validation_code: string | null }) => {
      const res = await api.auth.verifyUser({ data });
      return res;
    }
  );

  useEffect(() => {
    if (isLoggedIn) {
      navigate(PRIVATE_ROUTES.DASHBOARD.url, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const verify = async () => {
      if (!validation_code) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const res = await verifyUser({ validation_code });

        if (res?.data?.success || res?.status === 200) {
          // const decodeData: any = decodeToken(res?.data?.data?.access_token);
          // localStorage.setItem('token', res?.data?.data?.access_token);
          // setCookie('access_token', res?.data?.data?.access_token);
          // Update Redux user state
          dispatch(
            updateUser({
              // token: res?.data?.data?.access_token,
              activeUI: '',
              isTemporary: res?.data?.data?.isTemporary || false,
              user: res?.data?.data,
              isLoggedIn: true,
            })
          );
          setCookie('auth_status', 'logged_in', 7);
          setCookie('user_role', res?.data?.data?.role || 'user', 7);

          setStatus('success');
          setMessage(
            res?.data?.message || 'Your account has been successfully verified!'
          );

          // Show a notification
          notifications.show({
            message: res?.data?.message || 'Your account has been verified!',
            color: 'green',
          });
        } else {
          setStatus('error');
          setMessage(res?.data?.message || 'Invalid validation code');
          setTimeout(() => {
            navigate(AUTH_ROUTES.LOGIN.url);
          }, 3000);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verify();
  }, [validation_code]);

  return { status, message, loading };
};

export default useVerifyUser;
