import {
  Notification as MantineNotification,
  type NotificationProps as MantineNotificationProps,
} from '@mantine/core';

type NotificationProps = {
  message: string | React.ReactNode;
  onClose?: () => void;
  [key: string]: any;
} & MantineNotificationProps;

export const Notification = ({
  message,
  onClose,
  ...props
}: NotificationProps) => {
  return (
    <MantineNotification {...{ onClose }} {...props}>
      {message}
    </MantineNotification>
  );
};
