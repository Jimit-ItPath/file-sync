import { createContext, useEffect, type ReactNode } from 'react';
import { useTimeout } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAppSelector, useAppDispatch } from '../store';
import { resetUser } from '../store/slices/auth.slice';
import { getCookie, removeCookie } from '../utils/helper';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../routing/routes';
import { ROLES } from '../utils/constants';
import { api } from '../api';

const AuthContext = createContext<unknown>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const loggedInStatus = getCookie('auth_status');
  const userRole = getCookie('user_role');

  const resetAllStores = () => {};
  const { start, clear } = useTimeout(() => resetAllStores(), 1000);

  const logout = async () => {
    try {
      const res = await api.auth.logout();
      if (res.status === 200) {
        // Clear auth cookies
        removeCookie('auth_status');
        removeCookie('user_role');

        dispatch(resetUser());
        localStorage.clear();
        start();
        // notifications.show({
        //   message: 'Logged out successfully',
        //   color: 'green',
        // });
        return res;
      }
    } catch (error) {
      notifications.show({
        message: 'Error logging out',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  // const redirectUrl = Object.keys(user).length
  //   ? isAdmin
  //     ? // ? PRIVATE_ROUTES.ADMIN_DASHBOARD.url
  //       PRIVATE_ROUTES.ADMIN_DASHBOARD.url
  //     : PRIVATE_ROUTES.DASHBOARD.url
  //   : // : AUTH_ROUTES.LOGIN.url;
  //     AUTH_ROUTES.LANDING.url;

  let redirectUrl = AUTH_ROUTES.LANDING.url;
  if (loggedInStatus === 'true') {
    redirectUrl =
      userRole === ROLES.ADMIN
        ? PRIVATE_ROUTES.ADMIN_DASHBOARD.url
        : PRIVATE_ROUTES.DASHBOARD.url;
  } else if (userRole === ROLES.USER) {
    redirectUrl = PRIVATE_ROUTES.DASHBOARD.url;
  } else if (userRole === ROLES.ADMIN) {
    redirectUrl = PRIVATE_ROUTES.ADMIN_DASHBOARD.url;
  } else {
    redirectUrl = AUTH_ROUTES.LANDING.url;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        redirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
