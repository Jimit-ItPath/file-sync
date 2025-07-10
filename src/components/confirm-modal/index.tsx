import { CloseButton, Group, Stack, Text, Title } from '@mantine/core';
import { Modal } from '../modal';
import Icon from '../../assets/icons/icon';
import { ICONS } from '../../assets/icons';
import { Button } from '../button';

type ConfirmButtonProps = {
  label: string;
  onClick: () => void;
  [key: string]: any;
};

type ConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  icon?: React.ElementType;
  title?: string;
  message?: string;
  content?: React.ReactNode;
  confirmButtonProps?: ConfirmButtonProps;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  [key: string]: any;
};

export const ConfirmModal = ({
  opened,
  onClose,
  icon = ICONS.IconAlertSquare,
  title = '',
  message,
  content,
  confirmButtonProps,
  size = 'md',
  ...props
}: ConfirmModalProps) => {
  const { label, onClick, ...buttonProps } =
    confirmButtonProps as ConfirmButtonProps;
  return (
    <Modal {...{ opened, onClose, size }} withCloseButton={false} {...props}>
      <Stack align="center" gap={16} px={8} py={8} style={{ zIndex: 1000 }}>
        <CloseButton pos="absolute" right={12} top={12} onClick={onClose} />
        <Icon
          component={icon}
          size={50}
          color="var(--mantine-primary-color-6)"
        />
        <Title order={3} ta="center">
          {title}
        </Title>
        {message ? <Text ta="center">{message}</Text> : content}

        <Group>
          <Button
            variant="outline"
            leftSection={<Icon component={ICONS.IconX} size={16} />}
            onClick={onClose}
          >
            Cancel
          </Button>{' '}
          <Button {...{ onClick }} {...buttonProps}>
            {label}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
