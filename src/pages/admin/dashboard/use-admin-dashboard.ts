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
      },
      {
        label: 'Active Google Drive Accounts',
        value: connectedAccountAnalyticsData.active_google_drive_accounts,
      },
      {
        label: 'Active Dropbox Accounts',
        value: connectedAccountAnalyticsData.active_dropbox_accounts,
      },
      {
        label: 'Active OneDrive Accounts',
        value: connectedAccountAnalyticsData.active_onedrive_accounts,
      },
      {
        label: 'Re-authentication Required',
        value: connectedAccountAnalyticsData.re_authentication_required,
      },
      {
        label: 'Inactive Accounts',
        value: connectedAccountAnalyticsData.inactive_accounts,
      },
    ];
  }, [allAnalyticsData]);

  const userAnalytics = useMemo(() => {
    if (!allAnalyticsData || !allAnalyticsData?.user_analytics) return [];
    const { user_analytics: userAnalyticsData } = allAnalyticsData;
    return [
      { label: 'Total Users', value: userAnalyticsData.total_users },
      { label: 'Active Users', value: userAnalyticsData.active_users },
      { label: 'Blocked Users', value: userAnalyticsData.blocked_users },
    ];
  }, [allAnalyticsData]);

  const contactUsAnalytics = useMemo(() => {
    if (!allAnalyticsData || !allAnalyticsData?.contact_us_analytics) return [];
    const { contact_us_analytics: contactUsAnalyticsData } = allAnalyticsData;
    return [
      {
        label: 'Total Submissions',
        value: contactUsAnalyticsData.total_submissions,
      },
      {
        label: 'New',
        value: contactUsAnalyticsData.new,
      },
      {
        label: 'In Progress',
        value: contactUsAnalyticsData.in_progress,
      },
      {
        label: 'Resolved',
        value: contactUsAnalyticsData.resolved,
      },
      {
        label: 'Rejected',
        value: contactUsAnalyticsData.rejected,
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
