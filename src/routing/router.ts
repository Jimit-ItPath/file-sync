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

const dashboardPageLoader = (roles: string[]) => () => {
  const { role } = getAuth({});

  if (!roles?.includes(role)) {
    return redirect('/');
  }

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
      const { isAuthenticated, role } = getAuth({});
      if (isAuthenticated) {
        return redirect(
          role === ROLES.ADMIN
            ? PRIVATE_ROUTES.USERS.url
            : PRIVATE_ROUTES.DASHBOARD.url
        );
      }
      return null;
      // return redirect(
      //   isAuthenticated
      //     ? role === ROLES.ADMIN
      //       ? PRIVATE_ROUTES.USERS.url
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
      { ...AUTH_ROUTES.OAUTH_CALLBACK, Component: OAuthCallback },
      { ...AUTH_ROUTES.ADMIN_LOGIN, Component: AdminLogin },
      { ...AUTH_ROUTES.COMPLETE_PROFILE, Component: CompleteProfile },
      { ...AUTH_ROUTES.PRIVACY_POLICY, Component: PrivacyPolicy },
      { ...AUTH_ROUTES.TERMS_OF_SERVICE, Component: TermsAndConditions },
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
        // Component: Dashboard,
        element: React.createElement(Dashboard, { key: 'google-drive' }),
        loader: dashboardPageLoader(PRIVATE_ROUTES.GOOGLE_DRIVE.roles),
      },
      {
        ...PRIVATE_ROUTES.DROPBOX,
        // Component: Dropbox,
        // Component: Dashboard,
        element: React.createElement(Dashboard, { key: 'dropbox' }),
        loader: dashboardPageLoader(PRIVATE_ROUTES.DROPBOX.roles),
      },
      {
        ...PRIVATE_ROUTES.ONEDRIVE,
        // Component: OneDrive,
        // Component: Dashboard,
        element: React.createElement(Dashboard, { key: 'onedrive' }),
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
  { path: '*', Component: PageNotFound },
]);
