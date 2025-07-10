import { Center, Title } from '@mantine/core';
import { DASHBOARD_LAYOUT_CALC } from '../../utils/constants';

export const PagePlaceholder = ({ title = '', dashboardLayout = false }) => {
  return (
    <Center
      h="100%"
      w="100%"
      ta="center"
      mih={dashboardLayout ? DASHBOARD_LAYOUT_CALC : '100dvh'}
    >
      <Title order={3} c="gray.5">
        {title} coming soon...
      </Title>
    </Center>
  );
};
export default PagePlaceholder;
