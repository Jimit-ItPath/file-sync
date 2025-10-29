import { AUTH_ROUTES, PRIVATE_ROUTES } from '../routing/routes';
import { CACHED_URL_LOCAL_STORAGE_KEY, ROLES } from '../utils/constants';
import {
  getLocalStorage,
  setLocalStorage,
  getCookie,
  setCookie,
} from '../utils/helper';
import { store } from '../store';

export const REDIRECTION = {
  [ROLES.USER]: PRIVATE_ROUTES.DASHBOARD.url,
  [ROLES.ADMIN]: PRIVATE_ROUTES.ADMIN_DASHBOARD.url,
};

export interface GetAuthOptions {
  isCacheRedirection?: boolean;
  [key: string]: unknown;
}

export interface AuthResult {
  isAuthenticated: boolean;
  redirectUrl: string;
  role: string;
}

export const getAuth = (options: GetAuthOptions = {}): AuthResult => {
  const { isCacheRedirection } = options;
  const state = store.getState();
  const { isLoggedIn, user } = state.auth;

  // Don't redirect during OAuth callback
  if (window.location.pathname === '/oauth/callback') {
    setCookie('auth_status', 'logged_in', 7);
    setCookie('user_role', 'user', 7);
    return {
      isAuthenticated: true,
      redirectUrl: '/dashboard',
      role: 'user',
    };
  }

  const authStatus = getCookie('auth_status');
  const userRole = getCookie('user_role');

  // Check if user is authenticated via Redux
  // let isAuthenticated = (isLoggedIn && user) as boolean;
  let isAuthenticated = isLoggedIn || authStatus === 'logged_in';
  let role = user?.role || userRole || '';

  // Fallback: check auth_status cookie for page refresh scenarios
  if (!isAuthenticated) {
    const authStatus = getCookie('auth_status');
    if (authStatus === 'logged_in') {
      // User was logged in but Redux state is not hydrated yet
      // Return authenticated but let components handle loading state
      isAuthenticated = true;
      role = getCookie('user_role') || '';
    }
  }

  let redirectUrl = AUTH_ROUTES.LANDING.url;

  if (isAuthenticated) {
    const roleKey = `${CACHED_URL_LOCAL_STORAGE_KEY}-${role}`;
    const cachedRedirectUrl = getLocalStorage(roleKey);
    redirectUrl = role
      ? cachedRedirectUrl || REDIRECTION[role]
      : AUTH_ROUTES.LANDING.url;
  }

  if (isCacheRedirection && !isAuthenticated) {
    const { pathname, search } = window?.location || {};
    const cachedRedirectUrl = pathname + search;
    const roleKey = `${CACHED_URL_LOCAL_STORAGE_KEY}-${role || 'unknown'}`;
    setLocalStorage(roleKey, cachedRedirectUrl);
  }

  return {
    isAuthenticated,
    redirectUrl,
    role,
  };
};
