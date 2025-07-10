import { useEffect, useState } from 'react';
import { ERROR_MESSAGES } from '../utils/constants';
import { notifications } from '@mantine/notifications';
import { apiAsyncHandler } from '../utils/helper';
import { useTimeout } from '@mantine/hooks';
import { ICONS } from '../assets/icons';
import { Alert } from '../components';

interface NotificationOptions {
  title: string;
  message: string;
}

type NotificationType = 'toast' | 'default';

interface UseAsyncOperationOptions {
  notification?: NotificationOptions;
  notificationType?: NotificationType;
  autoHide?: boolean;
}

type OperationFunction<T = any> = (params: any) => Promise<T>;
type HandleErrorFunction = (error: unknown) => boolean;
type ExecuteOperation = <T>(params: T) => Promise<any>;

const defaultOptions: UseAsyncOperationOptions = {
  notification: { title: '', message: '' },
  notificationType: 'toast',
  autoHide: false,
};

const useAsyncOperation = (
  operation: OperationFunction,
  handleError?: HandleErrorFunction,
  options?: UseAsyncOperationOptions
): [ExecuteOperation, boolean, React.ReactNode] => {
  const [loading, setLoading] = useState(false);
  const [notificationUi, setNotificationUi] = useState<React.ReactNode>(null);
  const mergedOptions = { ...defaultOptions, ...options };

  const { start, clear } = useTimeout(() => setNotificationUi(null), 4000);

  const executeOperation = async (params: any) => {
    setLoading(true);
    return await apiAsyncHandler(
      async () => {
        const result = await operation(params);
        return result;
      },
      error => {
        const {
          notificationType = 'toast',
          notification,
          autoHide,
        } = mergedOptions || {};

        let isHandled = false;
        const message =
          (typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message?: string }).message
            : undefined) || ERROR_MESSAGES.common;

        if (handleError && typeof handleError === 'function') {
          isHandled = handleError(error);
        }

        if (!isHandled) {
          if (notificationType === 'toast') {
            notifications.show({
              title: notification?.title,
              message,
              color: 'red',
            });
          } else {
            if (autoHide) {
              clear();
              start();
            }
            setNotificationUi(
              <Alert
                {...{ message }}
                color="red"
                icon={ICONS.IconAlertSquare}
                onClose={() => {
                  setNotificationUi(null);
                  if (autoHide) {
                    clear();
                  }
                }}
              />
            );
          }
        }

        return null;
      },
      () => {
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return [executeOperation, loading, notificationUi];
};

export default useAsyncOperation;
