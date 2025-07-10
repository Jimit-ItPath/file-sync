import {
  Alert as MantineAlert,
  rem,
  type AlertProps as MantineAlertProps,
  type AlertFactory,
} from '@mantine/core';
import Icon from '../../assets/icons/icon';

type AlertProps = {
  message: React.ReactNode;
  variant?: AlertFactory['variant'];
  onClose?: () => void;
  icon?: React.ElementType;
  withCloseButton?: boolean;
} & Omit<
  MantineAlertProps,
  'variant' | 'onClose' | 'icon' | 'withCloseButton' | 'children'
>;

export const Alert = ({
  message,
  variant,
  onClose,
  icon: IconComponent,
  withCloseButton = true,
  ...props
}: AlertProps) => {
  return (
    <MantineAlert
      {...{ variant, onClose, withCloseButton }}
      icon={
        IconComponent ? <Icon component={IconComponent} size={24} /> : undefined
      }
      styles={{
        closeButton: { paddingTop: rem(3) },
      }}
      {...props}
    >
      {message}
    </MantineAlert>
  );
};
