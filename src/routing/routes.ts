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
  ADMIN_LOGIN: {
    title: 'Admin Login',
    path: '/admin',
    url: '/admin',
  },
  COMPLETE_PROFILE: {
    title: 'Complete Profile',
    path: '/complete-profile',
    url: '/complete-profile',
  },
  PRIVACY_POLICY: {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    url: '/privacy-policy',
  },
  TERMS_OF_SERVICE: {
    title: 'Terms of Service',
    path: '/terms-of-service',
    url: '/terms-of-service',
  },
  LANDING: {
    title: 'Landing',
    path: '/',
    url: '/',
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
  RECENT_FILES: {
    path: '/recent-files',
    roles: Object.values(ROLES),
    title: 'Recent Files',
    url: '/recent-files',
  },
  GOOGLE_DRIVE: {
    path: '/google-drive/:id',
    roles: Object.values(ROLES),
    title: 'Google Drive',
    url: '/google-drive/:id',
  },
  DROPBOX: {
    path: '/dropbox/:id',
    roles: Object.values(ROLES),
    title: 'Dropbox',
    url: '/dropbox/:id',
  },
  ONEDRIVE: {
    path: '/onedrive/:id',
    roles: Object.values(ROLES),
    title: 'OneDrive',
    url: '/onedrive/:id',
  },
  PROFILE: {
    path: '/profile',
    roles: Object.values(ROLES),
    title: 'Profile',
    url: '/profile',
  },
  ADMIN_DASHBOARD: {
    path: '/admin/dashboard',
    roles: Object.values(ROLES),
    title: 'Admin Dashboard',
    url: '/admin/dashboard',
  },
  USERS: {
    path: '/users',
    roles: Object.values(ROLES),
    title: 'Users',
    url: '/users',
  },
  AUDIT_LOGS: {
    path: '/logs',
    roles: Object.values(ROLES),
    title: 'Audit Logs',
    url: '/logs',
  },
};
