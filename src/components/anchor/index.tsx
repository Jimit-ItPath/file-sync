import {
  Anchor as MantineAnchor,
  type AnchorProps as MantineAnchorProps,
} from '@mantine/core';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

type AnchorProps = {
  children: ReactNode;
  [key: string]: any;
} & MantineAnchorProps;

export const Anchor = ({ to, children, ...props }: AnchorProps) => {
  return (
    <MantineAnchor component={Link} {...{ to }} {...props}>
      {children}
    </MantineAnchor>
  );
};
