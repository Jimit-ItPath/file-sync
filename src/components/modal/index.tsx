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
      scrollAreaComponent={ScrollArea.Autosize}
      // closeButtonProps={{
      //   bg: '#000000',
      //   c: 'white',
      //   'aria-label': 'Close modal',
      // }}
      styles={{
        header: {
          backgroundColor: 'var(--mantine-primary-color-6)',
          color: 'white',
          paddingLeft: 'var(--mantine-spacing-lg)',
          paddingRight: 'var(--mantine-spacing-sm)',
          // borderRadius: 0,
        },
        body: {
          paddingTop: 'var(--mantine-spacing-lg)',
          padding: 'var(--mantine-spacing-lg)',
          width: '100%',
        },
      }}
      classNames={{ content: classes.content, close: 'modal-close-button' }}
      {...props}
    >
      {children}
      <style>
        {`
          .mantine-Modal-inner .m_1b7284a3 {
            --paper-radius: 0;
            border-radius: 10px;
            overflow: hidden;
            background: transparent;
          }
          .mantine-Modal-body,
          .mantine-Modal-footer {
            background: white;
          }
          .modal-close-button{
            background-color: #ffffff;
            color: gray;
            transition: transform 0.15s ease, opacity 0.15s ease;
          }
          .modal-close-button:hover {
            background-color: #e9e9e9;
            // color: #ffffff;
            // opacity: 0.9;
            transform: scale(1.02);
            // color: #1e293b;
          }
            /* Tooltip using ::after */
          .modal-close-button::after {
            content: 'Close';
            position: absolute;
            top: 50%;
            right: 110%;
            transform: translateY(-50%);
            background-color: var(--mantine-color-dark-9);
            color: var(--mantine-color-white);
            font-size: 12px;
            padding: 4px 8px;
            border-radius: var(--mantine-radius-sm);
            box-shadow: var(--mantine-shadow-sm);
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 150ms ease, transform 150ms ease;
          }
          .modal-close-button:hover::after {
            opacity: 1 !important;
            // transform: translateY(-50%) translateX(-4px);
          }
        `}
      </style>
    </MantineModal>
  );
};
