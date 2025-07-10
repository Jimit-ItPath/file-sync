import {
  Popover as MantinePopover,
  type PopoverProps as MantinePopoverProps,
} from '@mantine/core';

type PopoverProps = {
  opened: boolean;
  setOpened?: (opened: boolean) => void;
  shadow?: MantinePopoverProps['shadow'];
  position?: MantinePopoverProps['position'];
  dropdownContent: React.ReactNode;
  children: React.ReactNode;
  [key: string]: any;
} & MantinePopoverProps;

export const Popover = ({
  opened,
  setOpened,
  shadow = 'md',
  position = 'bottom',
  dropdownContent,
  children,
  ...props
}: PopoverProps) => {
  return (
    <MantinePopover
      {...{ opened, shadow, position }}
      onChange={setOpened}
      {...props}
    >
      <MantinePopover.Target>{children}</MantinePopover.Target>
      <MantinePopover.Dropdown>{dropdownContent}</MantinePopover.Dropdown>
    </MantinePopover>
  );
};
