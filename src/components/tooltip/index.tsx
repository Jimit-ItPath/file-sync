import {
  Tooltip as MantineTooltip,
  type TooltipProps as MantineTooltipProps,
} from '@mantine/core';

type TooltipProps = {
  children: React.ReactNode;
  label: string | MantineTooltipProps['label'];
  [key: string]: any;
} & MantineTooltipProps;

export const Tooltip = ({
  label,
  withArrow = true,
  children,
  ...props
}: TooltipProps) => {
  return (
    <MantineTooltip {...{ label, withArrow }} {...props}>
      {children}
    </MantineTooltip>
  );
};
