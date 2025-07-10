import {
  Card as MantineCard,
  type CardProps as MantineCardProps,
} from '@mantine/core';
import type { ReactNode } from 'react';

type CardProps = {
  shadow?: MantineCardProps['shadow'];
  children: ReactNode;
  [key: string]: any;
} & MantineCardProps;

export const Card = ({ shadow = 'sm', children, ...props }: CardProps) => {
  return (
    <MantineCard {...{ shadow }} withBorder {...props}>
      {children}
    </MantineCard>
  );
};
