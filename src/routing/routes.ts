import { ROLES } from '../utils/constants';

// export const PLAIN_ROUTES = {
//   root: { path: '/', url: '/', title: APP_TITLE },
//   layout: {
//     path: '/',
//   },
//   HOME: {
//     index: true,
//     title: 'Home',
//     url: '/',
//   }
// };

export const AUTH_ROUTES = {
  layout: {},
  LOGIN: {
    title: 'Login',
    path: '/login',
    url: '/login',
  },
  REGISTER: {
    title: 'Register',
    path: '/register',
    url: '/register',
  },
  FORGOT_PASSWORD: {
    title: 'Forgot Password',
    path: '/forgot-password',
    url: '/forgot-password',
  },
  RESET_PASSWORD: {
    title: 'Reset Password',
    path: '/reset-password',
    url: '/reset-password',
  },
  VERIFY_USER: {
    title: 'Verify User',
    path: '/verify-email',
    url: '/verify-email',
  },
  OAUTH_CALLBACK: {
    title: 'OAuth Callback',
    path: '/oauth-callback',
    url: '/oauth-callback',
  },
};

const DASHBOARD_PATH = '/dashboard';

export const PRIVATE_ROUTES = {
  layout: {
    path: '/',
  },
  DASHBOARD: {
    path: DASHBOARD_PATH,
    roles: Object.values(ROLES),
    title: 'Dashboard',
    url: DASHBOARD_PATH,
  },
  GOOGLE_DRIVE: {
    path: '/google-drive',
    roles: Object.values(ROLES),
    title: 'Google Drive',
    url: '/google-drive',
  },
  DROPBOX: {
    path: '/dropbox',
    roles: Object.values(ROLES),
    title: 'Dropbox',
    url: '/dropbox',
  },
};
