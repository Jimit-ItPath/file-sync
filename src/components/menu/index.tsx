import Icon from '../../assets/icons/icon';
import {
  Menu as MantineMenu,
  type MenuProps as MantineMenuProps,
} from '@mantine/core';

type MenuProps = {
  opened?: boolean;
  setOpened?: (opened: boolean) => void;
  items: any[];
  onItemClick: (id: string) => void;
  shadow?: MantineMenuProps['shadow'];
  position?: MantineMenuProps['position'];
  children: React.ReactNode;
  [key: string]: any;
} & MantineMenuProps;

export const Menu = ({
  opened,
  setOpened,
  items = [],
  onItemClick,
  shadow = 'md',
  position = 'bottom',
  children,
  ...props
}: MenuProps) => {
  return (
    <MantineMenu
      {...{ opened, shadow, position }}
      onChange={setOpened}
      {...props}
    >
      <MantineMenu.Target>
        <div style={{ cursor: 'pointer' }}>{children}</div>
      </MantineMenu.Target>

      <MantineMenu.Dropdown>
        {items?.map(({ id, label, icon, color }) => {
          return (
            <MantineMenu.Item
              key={id}
              leftSection={<Icon component={icon} size={14} color={color} />}
              onClick={() => {
                onItemClick(id);
              }}
            >
              {label}
            </MantineMenu.Item>
          );
        })}
      </MantineMenu.Dropdown>
    </MantineMenu>
  );
};
