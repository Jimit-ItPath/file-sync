// pages/auth/oauth-callback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '../../store';
import { updateUser } from '../../store/slices/auth.slice';
import { getCookie } from '../../utils/helper';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Increased delay to ensure cookies are set
    const checkAuthStatus = async () => {
      let retryCount = 0;
      const maxRetries = 5;

      const checkCookies = () => {
        const authStatus = getCookie('auth_status');
        const userRole = getCookie('user_role');

        if (authStatus === 'logged_in') {
          // Update Redux state
          dispatch(
            updateUser({
              isLoggedIn: true,
              user: {
                role: userRole || 'user',
              },
              activeUI: '',
            })
          );

          // Show success notification
          // notifications.show({
          //   message: 'Successfully logged in',
          //   color: 'green',
          // });

          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
          return true;
        }

        return false;
      };

      const attemptCheck = () => {
        if (checkCookies()) return;

        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptCheck, 500); // Retry every 500ms
        } else {
          // Fallback if cookies never appear
          // notifications.show({
          //   message: 'Login failed. Please try again.',
          //   color: 'red',
          // });
          navigate('/', { replace: true });
        }
      };

      attemptCheck();
    };

    checkAuthStatus();
  }, [navigate, dispatch]);

  return <div>Processing login...</div>;
}
