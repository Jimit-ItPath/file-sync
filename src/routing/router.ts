import { createBrowserRouter, redirect } from 'react-router';
import { getAuth } from '../auth';

// Routes
import { AUTH_ROUTES, PRIVATE_ROUTES } from './routes';

// Pages
import { PageNotFound } from '../components';

// Layouts
import AuthLayout from '../layouts/auth-layout';
// import PlainLayout from '../layouts/plain-layout';
import DashboardLayout from '../layouts/dashboard-layout';

// Plain pages
// import Home from '../pages/home';

// Auth pages
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';

// Dashboard pages
import Dashboard from '../pages/dashboard';
import ForgotPassword from '../pages/auth/forgot-password';
import ResetPassword from '../pages/auth/reset-password';
import VerifyUser from '../pages/auth/verify-user';
import OAuthCallback from '../pages/auth/OAuthCallback';
import GoogleDrive from '../pages/google-drive';
import Dropbox from '../pages/dropbox';
import OneDrive from '../pages/onedrive';
import Profile from '../pages/user/profile';

const authLayoutLoader = () => {
  const { isAuthenticated, redirectUrl } = getAuth({});
  if (isAuthenticated) {
    return redirect(redirectUrl);
  }
  return null;
};

const dashboardLayoutLoader = () => {
  const { isAuthenticated, redirectUrl } = getAuth({
    isCacheRedirection: true,
  });

  if (!isAuthenticated) {
    return redirect(redirectUrl);
  }
  return null;
};

const dashboardPageLoader = (_: string[]) => () => {
  // const { isAuthenticated, role } = getAuth({});

  // if (isAuthenticated && !roles.includes(role)) {
  //   return redirect('/404');
  // }

  return null;
};

export const router = createBrowserRouter([
  // {
  //   ...PLAIN_ROUTES.layout,
  //   Component: PlainLayout,
  //   children: [{ ...PLAIN_ROUTES.HOME, Component: Home }],
  // },
  {
    path: '/',
    loader: () => {
      const { isAuthenticated } = getAuth({});
      return redirect(
        isAuthenticated ? PRIVATE_ROUTES.DASHBOARD.url : AUTH_ROUTES.LOGIN.url
      );
    },
  },
  {
    ...AUTH_ROUTES.layout,
    Component: AuthLayout,
    // Component: DashboardLayout,
    loader: authLayoutLoader,
    children: [
      {
        // ...PLAIN_ROUTES.root,
        loader: () => {
          return redirect(AUTH_ROUTES.LOGIN.url);
        },
      },
      { ...AUTH_ROUTES.LOGIN, Component: Login },
      { ...AUTH_ROUTES.REGISTER, Component: Register },
      { ...AUTH_ROUTES.FORGOT_PASSWORD, Component: ForgotPassword },
      { ...AUTH_ROUTES.RESET_PASSWORD, Component: ResetPassword },
      { ...AUTH_ROUTES.VERIFY_USER, Component: VerifyUser },
      { ...AUTH_ROUTES.OAUTH_CALLBACK, Component: OAuthCallback },
      // { ...PRIVATE_ROUTES.DASHBOARD, Component: Dashboard },
    ],
  },
  {
    ...PRIVATE_ROUTES.layout,
    Component: DashboardLayout,
    loader: dashboardLayoutLoader,
    children: [
      {
        ...PRIVATE_ROUTES.DASHBOARD,
        Component: Dashboard,
        loader: dashboardPageLoader(PRIVATE_ROUTES.DASHBOARD.roles),
      },
      {
        ...PRIVATE_ROUTES.GOOGLE_DRIVE,
        Component: GoogleDrive,
        loader: dashboardPageLoader(PRIVATE_ROUTES.GOOGLE_DRIVE.roles),
      },
      {
        ...PRIVATE_ROUTES.DROPBOX,
        Component: Dropbox,
        loader: dashboardPageLoader(PRIVATE_ROUTES.DROPBOX.roles),
      },
      {
        ...PRIVATE_ROUTES.ONEDRIVE,
        Component: OneDrive,
        loader: dashboardPageLoader(PRIVATE_ROUTES.ONEDRIVE.roles),
      },
      {
        ...PRIVATE_ROUTES.PROFILE,
        Component: Profile,
        loader: dashboardPageLoader(PRIVATE_ROUTES.PROFILE.roles),
      },
    ],
  },
  { path: '*', Component: PageNotFound },
]);
