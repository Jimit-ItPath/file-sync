import { Flex } from '@mantine/core';

const Svg = ({ svgData = '', ...props }) => {
  return (
    <Flex dangerouslySetInnerHTML={{ __html: svgData || '' }} {...props} />
  );
};

export default Svg;
