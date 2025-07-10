import { Stack } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Button } from '../../../components';

export const LoginSocialButtons = () => (
  <Stack gap={12} mb={6}>
    <Button
      variant="default"
      leftSection={<ICONS.IconBrandGoogle size={18} color="#ef4444" />}
      fullWidth
      size="md"
      radius="md"
      style={{ fontWeight: 500 }}
    >
      Continue with Google
    </Button>
    <Button
      variant="default"
      leftSection={<ICONS.IconBrandFacebook size={18} color="#1877f3" />}
      fullWidth
      size="md"
      radius="md"
      style={{ fontWeight: 500 }}
    >
      Continue with Facebook
    </Button>
  </Stack>
);
