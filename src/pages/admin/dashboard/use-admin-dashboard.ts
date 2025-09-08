import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchAllAnalytics,
  // fetchConnectedAccountAnalytics,
  // fetchUserAnalytics,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';

const useAdminDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const {
    // userAnalytics: { data: userAnalyticsData },
    // connectedAccountAnalytics: { data: connectedAccountAnalyticsData },
    allAnalytics: { data: allAnalyticsData },
  } = useAppSelector(state => state.adminUser);
  const dispatch = useAppDispatch();

  // const getUserAnalytics = useCallback(async () => {
  //   await dispatch(fetchUserAnalytics());
  // }, [dispatch]);

  // const [userAnalyticsFn, userAnalyticsLoading] =
  //   useAsyncOperation(getUserAnalytics);

  // const getConnectedAccountAnalytics = useCallback(async () => {
  //   await dispatch(fetchConnectedAccountAnalytics());
  // }, [dispatch]);

  // const [connectedAccountAnalyticsFn, connectedAccountAnalyticsLoading] =
  //   useAsyncOperation(getConnectedAccountAnalytics);

  const getAllAnalytics = useCallback(async () => {
    await dispatch(fetchAllAnalytics());
  }, [dispatch]);

  const [allAnalyticsFn, allAnalyticsLoading] =
    useAsyncOperation(getAllAnalytics);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    allAnalyticsFn({});
  }, []);

  const connectedAccountAnalytics = useMemo(() => {
    if (!allAnalyticsData || !allAnalyticsData?.account_analytics) return [];
    const { account_analytics: connectedAccountAnalyticsData } =
      allAnalyticsData;
    return [
      {
        label: 'Total Accounts',
        value: connectedAccountAnalyticsData.total_accounts,
        description:
          'The total number of connected cloud storage accounts across all users',
      },
      {
        label: 'Active Google Drive Accounts',
        value: connectedAccountAnalyticsData.active_google_drive_accounts,
        description:
          'The number of Google Drive accounts currently connected and active',
      },
      {
        label: 'Active Dropbox Accounts',
        value: connectedAccountAnalyticsData.active_dropbox_accounts,
        description:
          'The number of Dropbox accounts currently connected and active',
      },
      {
        label: 'Active OneDrive Accounts',
        value: connectedAccountAnalyticsData.active_onedrive_accounts,
        description:
          'The number of OneDrive accounts currently connected and active',
      },
      {
        label: 'Re-authentication Required',
        value: connectedAccountAnalyticsData.re_authentication_required,
        description:
          'Accounts that need the user to re-authorize access (e.g., expired tokens or revoked permissions)',
      },
      {
        label: 'Inactive Accounts',
        value: connectedAccountAnalyticsData.inactive_accounts,
        description:
          'Accounts that were once connected but are no longer in use (disconnected or inactive)',
      },
    ];
  }, [allAnalyticsData]);

  const userAnalytics = useMemo(() => {
    if (!allAnalyticsData || !allAnalyticsData?.user_analytics) return [];
    const { user_analytics: userAnalyticsData } = allAnalyticsData;
    return [
      {
        label: 'Total Users',
        value: userAnalyticsData.total_users,
        description: 'The total number of registered users on the platform',
      },
      {
        label: 'Active Users',
        value: userAnalyticsData.active_users,
        description:
          'Users who have logged in or interacted with the platform recently',
      },
      {
        label: 'Blocked Users',
        value: userAnalyticsData.blocked_users,
        description:
          'Users whose accounts have been disabled or restricted due to violations, security, or admin action',
      },
    ];
  }, [allAnalyticsData]);

  const contactUsAnalytics = useMemo(() => {
    if (!allAnalyticsData || !allAnalyticsData?.contact_us_analytics) return [];
    const { contact_us_analytics: contactUsAnalyticsData } = allAnalyticsData;
    return [
      {
        label: 'Total Submissions',
        value: contactUsAnalyticsData.total_submissions,
        description:
          'The total number of contact/support requests submitted by users',
      },
      {
        label: 'New',
        value: contactUsAnalyticsData.new,
        description:
          'Requests that have been submitted but not yet reviewed or assigned',
      },
      {
        label: 'In Progress',
        value: contactUsAnalyticsData.in_progress,
        description: 'Requests currently being worked on by the support team',
      },
      {
        label: 'Resolved',
        value: contactUsAnalyticsData.resolved,
        description:
          'Requests that have been successfully addressed and closed',
      },
      {
        label: 'Rejected',
        value: contactUsAnalyticsData.rejected,
        description:
          'Requests that were not valid, out of scope, or declined for other reasons',
      },
    ];
  }, [allAnalyticsData]);

  return {
    animate,
    userAnalytics,
    connectedAccountAnalytics,
    // userAnalyticsLoading,
    // connectedAccountAnalyticsLoading,
    allAnalyticsLoading,
    contactUsAnalytics,
  };
};

export default useAdminDashboard;
