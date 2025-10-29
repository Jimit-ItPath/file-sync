import { createBrowserRouter, redirect, useLoaderData } from 'react-router';
import { getAuth } from '../auth';
import { decryptRouteParam } from '../utils/helper/encryption';

// Routes
import { AUTH_ROUTES, PLAIN_ROUTES, PRIVATE_ROUTES } from './routes';

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
import Profile from '../pages/user/profile';
import AdminLogin from '../pages/auth/admin/AdminLogin';
import AdminDashboard from '../pages/admin/dashboard';
import AdminUsers from '../pages/admin/users';
import CompleteProfile from '../pages/auth/admin/complete-profile';
import { ROLES } from '../utils/constants';
import React from 'react';
import AdminAuditLogs from '../pages/admin/audit-logs';
import PrivacyPolicy from '../pages/auth/register/PrivacyPolicy';
import TermsAndConditions from '../pages/auth/register/TermsAndConditions';
import UnifidriveLanding from '../pages/landing';
import RecentFiles from '../pages/dashboard/components/RecentFiles';
import PricingPage from '../pages/landing/components/PricingPage';
import FaqPage from '../pages/landing/components/FaqPage';
import ContactForm from '../pages/landing/components/ContactForm';
import ContactUs from '../pages/admin/contact-us';
import { getCookie } from '../utils/helper';

const GoogleDriveDashboard = () => {
  const loaderData = useLoaderData() as { accountId: string };
  return React.createElement(Dashboard, {
    key: `google-drive-${loaderData?.accountId}`,
  });
};

const DropboxDashboard = () => {
  const loaderData = useLoaderData() as { accountId: string };
  return React.createElement(Dashboard, {
    key: `dropbox-${loaderData?.accountId}`,
  });
};

const OnedriveDashboard = () => {
  const loaderData = useLoaderData() as { accountId: string };
  return React.createElement(Dashboard, {
    key: `onedrive-${loaderData?.accountId}`,
  });
};

const authLayoutLoader = () => {
  const { isAuthenticated, redirectUrl } = getAuth({});
  if (isAuthenticated) {
    return redirect(redirectUrl);
  }
  return null;
};

const dashboardLayoutLoader = () => {
  // Don't check auth during OAuth callback
  if (window.location.pathname === PRIVATE_ROUTES.DASHBOARD.url) {
    return null;
  }

  const { isAuthenticated, redirectUrl } = getAuth({
    isCacheRedirection: true,
  });

  if (!isAuthenticated) {
    return redirect(redirectUrl);
  }
  return null;
};

const dashboardPageLoader = (roles: string[]) => (args: any) => {
  if (window.location.pathname === PRIVATE_ROUTES.DASHBOARD.url) {
    return null;
  }
  const { role, isAuthenticated } = getAuth({});

  // Check auth_status cookie as fallback
  const authStatus = getCookie('auth_status');
  const userRole = getCookie('user_role');

  // Allow access if either Redux state or cookies indicate authentication
  if (!isAuthenticated && authStatus !== 'logged_in') {
    return redirect('/');
  }

  const effectiveRole = role || userRole;

  if (!roles?.includes(effectiveRole as string)) {
    return redirect('/');
  }

  // if (isAuthenticated && !roles.includes(role)) {
  //   return redirect('/404');
  // }

  // Handle both encrypted and non-encrypted routes
  if (args.params.encryptedId) {
    const decryptedId = decryptRouteParam(args.params.encryptedId);
    return { accountId: decryptedId };
  }

  return { accountId: args.params.id };
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
      const { isAuthenticated, role } = getAuth({});
      if (isAuthenticated) {
        return redirect(
          role === ROLES.ADMIN
            ? PRIVATE_ROUTES.ADMIN_DASHBOARD.url
            : PRIVATE_ROUTES.DASHBOARD.url
        );
      }
      return null;
      // return redirect(
      //   isAuthenticated
      //     ? role === ROLES.ADMIN
      //       ? PRIVATE_ROUTES.ADMIN_DASHBOARD.url
      //       : PRIVATE_ROUTES.DASHBOARD.url
      //     : // : AUTH_ROUTES.LOGIN.url
      //       AUTH_ROUTES.LANDING.url
      // );
    },
    Component: UnifidriveLanding,
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
          // return redirect(AUTH_ROUTES.LOGIN.url);
          return redirect(AUTH_ROUTES.LANDING.url);
        },
      },
      { ...AUTH_ROUTES.LOGIN, Component: Login },
      { ...AUTH_ROUTES.REGISTER, Component: Register },
      { ...AUTH_ROUTES.FORGOT_PASSWORD, Component: ForgotPassword },
      { ...AUTH_ROUTES.RESET_PASSWORD, Component: ResetPassword },
      { ...AUTH_ROUTES.VERIFY_USER, Component: VerifyUser },

      { ...AUTH_ROUTES.ADMIN_LOGIN, Component: AdminLogin },
      { ...AUTH_ROUTES.COMPLETE_PROFILE, Component: CompleteProfile },

      { ...AUTH_ROUTES.PRICING, Component: PricingPage },
      { ...AUTH_ROUTES.FAQ, Component: FaqPage },
      { ...AUTH_ROUTES.CONTACT, Component: ContactForm },
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
        ...PRIVATE_ROUTES.RECENT_FILES,
        Component: RecentFiles,
        loader: dashboardPageLoader(PRIVATE_ROUTES.RECENT_FILES.roles),
      },
      {
        ...PRIVATE_ROUTES.GOOGLE_DRIVE,
        // Component: GoogleDrive,
        Component: GoogleDriveDashboard,
        // element: React.createElement(Dashboard, { key: `google-drive` }),
        loader: dashboardPageLoader(PRIVATE_ROUTES.GOOGLE_DRIVE.roles),
      },
      {
        ...PRIVATE_ROUTES.DROPBOX,
        // Component: Dropbox,
        Component: DropboxDashboard,
        // element: React.createElement(Dashboard, { key: 'dropbox' }),
        loader: dashboardPageLoader(PRIVATE_ROUTES.DROPBOX.roles),
      },
      {
        ...PRIVATE_ROUTES.ONEDRIVE,
        // Component: OneDrive,
        Component: OnedriveDashboard,
        // element: React.createElement(Dashboard, { key: 'onedrive' }),
        loader: dashboardPageLoader(PRIVATE_ROUTES.ONEDRIVE.roles),
      },
      {
        ...PRIVATE_ROUTES.PROFILE,
        Component: Profile,
        loader: dashboardPageLoader(PRIVATE_ROUTES.PROFILE.roles),
      },
      {
        ...PRIVATE_ROUTES.ADMIN_DASHBOARD,
        Component: AdminDashboard,
        loader: dashboardPageLoader(PRIVATE_ROUTES.ADMIN_DASHBOARD.roles),
      },
      {
        ...PRIVATE_ROUTES.USERS,
        Component: AdminUsers,
        loader: dashboardPageLoader(PRIVATE_ROUTES.USERS.roles),
      },
      {
        ...PRIVATE_ROUTES.AUDIT_LOGS,
        Component: AdminAuditLogs,
        loader: dashboardPageLoader(PRIVATE_ROUTES.AUDIT_LOGS.roles),
      },
      {
        ...PRIVATE_ROUTES.CONTACT_US,
        Component: ContactUs,
        loader: dashboardPageLoader(PRIVATE_ROUTES.CONTACT_US.roles),
      },
    ],
  },
  {
    ...AUTH_ROUTES.OAUTH_CALLBACK,
    Component: OAuthCallback,
  },
  {
    path: PLAIN_ROUTES.PRIVACY_POLICY.path,
    Component: PrivacyPolicy,
  },
  {
    path: PLAIN_ROUTES.TERMS_OF_SERVICE.path,
    Component: TermsAndConditions,
  },
  { path: '*', Component: PageNotFound },
]);
