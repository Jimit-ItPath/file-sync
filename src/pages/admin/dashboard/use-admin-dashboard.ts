import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchConnectedAccountAnalytics,
  fetchUserAnalytics,
} from '../../../store/slices/adminUser.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';

const useAdminDashboard = () => {
  const [animate, setAnimate] = useState(false);
  const {
    userAnalytics: { data: userAnalyticsData },
    connectedAccountAnalytics: { data: connectedAccountAnalyticsData },
  } = useAppSelector(state => state.adminUser);
  const dispatch = useAppDispatch();

  const getUserAnalytics = useCallback(async () => {
    await dispatch(fetchUserAnalytics());
  }, [dispatch]);

  const [userAnalyticsFn, userAnalyticsLoading] =
    useAsyncOperation(getUserAnalytics);

  const getConnectedAccountAnalytics = useCallback(async () => {
    await dispatch(fetchConnectedAccountAnalytics());
  }, [dispatch]);

  const [connectedAccountAnalyticsFn, connectedAccountAnalyticsLoading] =
    useAsyncOperation(getConnectedAccountAnalytics);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    userAnalyticsFn({});
    connectedAccountAnalyticsFn({});
  }, []);

  const connectedAccountAnalytics = useMemo(() => {
    if (!connectedAccountAnalyticsData) return [];
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
    ];
  }, [connectedAccountAnalyticsData]);

  const userAnalytics = useMemo(() => {
    if (!userAnalyticsData) return [];
    return [
      { label: 'Total Users', value: userAnalyticsData.total_users },
      { label: 'Active Users', value: userAnalyticsData.active_users },
      { label: 'Blocked Users', value: userAnalyticsData.blocked_users },
    ];
  }, [userAnalyticsData]);

  return {
    animate,
    userAnalytics,
    connectedAccountAnalytics,
    userAnalyticsLoading,
    connectedAccountAnalyticsLoading,
  };
};

export default useAdminDashboard;
