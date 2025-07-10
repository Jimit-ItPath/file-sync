import React from 'react';

type IconProps = {
  component: React.ElementType;
  size?: number;
  stroke?: number;
  [key: string]: any;
};

const Icon = ({
  component: Component,
  size = 16,
  stroke = 2,
  ...props
}: IconProps) => {
  return <Component {...{ size, stroke }} {...props} />;
};

export default Icon;
