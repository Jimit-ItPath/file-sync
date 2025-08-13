import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import useAsyncOperation from '../../../hooks/use-async-operation';
import { api } from '../../../api';
import { notifications } from '@mantine/notifications';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../../../routing/routes';
import { decodeToken } from '../../../utils/helper';
import { useAppDispatch } from '../../../store';
import { updateUser } from '../../../store/slices/auth.slice';
import { ROLES } from '../../../utils/constants';

type Status = 'idle' | 'success' | 'error' | 'loading';

const useVerifyUser = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your account...');
  const [searchParams] = useSearchParams();
  // const email = searchParams.get('email');
  const validation_code = searchParams.get('validation_code');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [verifyUser, loading] = useAsyncOperation(
    async (data: { validation_code: string | null }) => {
      const res = await api.auth.verifyUser({ data });
      return res;
    }
  );

  useEffect(() => {
    const verify = async () => {
      setStatus('loading');
      if (!validation_code) {
        setStatus('error');
        setMessage('Invalid verification link.');
        return;
      }
      const res = await verifyUser({
        // email,
        validation_code,
      });
      if (res?.data?.success || res?.status === 200) {
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
        setStatus('success');
        setMessage(
          res?.data?.message || 'Your account has been successfully verified!'
        );
        notifications.show({
          message: res?.data?.message || 'Your account has been verified!',
          color: 'green',
        });
        if (decodeData?.user?.role === ROLES.USER) {
          navigate(PRIVATE_ROUTES.DASHBOARD.url);
        } else {
          navigate(AUTH_ROUTES.LOGIN.url);
        }
      } else {
        setStatus('error');
        setMessage(res?.data?.message || 'Invalid validation code');
      }
    };

    verify();
  }, [validation_code]);

  return { status, message, loading };
};

export default useVerifyUser;
