import classes from './modal.module.css';
import {
  Modal as MantineModal,
  ScrollArea,
  Title,
  type ModalProps as MantineModalProps,
} from '@mantine/core';

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & MantineModalProps;

export const Modal = ({
  opened,
  onClose,
  title = '',
  children,
  size = 'lg',
  ...props
}: ModalProps) => {
  return (
    <MantineModal
      w="100%"
      {...{ opened, onClose, size }}
      title={
        title && (
          <Title component="span" order={4}>
            {title}
          </Title>
        )
      }
      zIndex={1000}
      scrollAreaComponent={ScrollArea.Autosize}
      closeButtonProps={{ bg: 'white', c: 'gray' }}
      styles={{
        header: {
          backgroundColor: 'var(--mantine-primary-color-6)',
          color: 'white',
          paddingLeft: 'var(--mantine-spacing-lg)',
          paddingRight: 'var(--mantine-spacing-sm)',
        },
        body: {
          paddingTop: 'var(--mantine-spacing-lg)',
          padding: 'var(--mantine-spacing-lg)',
          width: '100%',
        },
      }}
      classNames={{ content: classes.content }}
      {...props}
    >
      {children}
    </MantineModal>
  );
};
