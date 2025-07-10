import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
} from '@mantine/core';
import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  [key: string]: any;
} & MantineButtonProps;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <MantineButton loaderProps={{ type: 'dots' }} {...props}>
      {children}
    </MantineButton>
  );
};
