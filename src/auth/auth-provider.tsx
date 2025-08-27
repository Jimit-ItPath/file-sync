import { createContext, useState, useEffect, type ReactNode } from 'react';
import { decodeToken } from '../utils/helper';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../routing/routes';
import { useTimeout } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { ROLES } from '../utils/constants';

const AuthContext = createContext<unknown>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  // const [token, setToken, removeToken] = useLocalStorage(LOCAL_STORAGE_KEY, '');
  // const [token, setToken, removeToken] = useLocalStorage('token', '');
  const [token, setToken] = useState(localStorage.getItem('token'));
  // const token = localStorage.getItem('token');

  const [user, setUser] = useState(() => {
    if (token) {
      const data: any = decodeToken(token);
      return data?.user || data;
    }
    return {};
  });

  const role = user?.role || '';

  const isAdmin = role === ROLES.ADMIN;

  // const redirectUrl = role ? REDIRECTION[role] : AUTH_ROUTES.LOGIN.url;
  const redirectUrl = Object.keys(user).length
    ? isAdmin
      ? // ? PRIVATE_ROUTES.ADMIN_DASHBOARD.url
        PRIVATE_ROUTES.ADMIN_DASHBOARD.url
      : PRIVATE_ROUTES.DASHBOARD.url
    : // : AUTH_ROUTES.LOGIN.url;
      AUTH_ROUTES.LANDING.url;

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const resetAllStores = () => {};

  const { start, clear } = useTimeout(() => resetAllStores(), 1000);

  const logout = () => {
    // removeToken();
    localStorage.removeItem('token');
    localStorage.clear();
    start();
    setToken(null);
    setUser({});
    notifications.show({
      message: 'Logged out successfully',
      color: 'green',
    });
  };

  useEffect(() => {
    if (token) {
      const data: any = decodeToken(token);
      setUser(data?.user || data);
    } else {
      setUser({});
    }
  }, [token]);

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        // role,
        user,
        redirectUrl,
        login,
        logout,
        // isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
