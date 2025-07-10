import { Stack } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { Button } from '../../../components';
import useSocialLogin from '../useSocialLogin';

export const SocialLoginButtons: React.FC = () => {
  const { handleFacebookResponse, handleGoogleLogin } = useSocialLogin();

  return (
    <Stack gap={12} mb={6}>
      <Button
        onClick={handleGoogleLogin}
        variant="default"
        leftSection={<ICONS.IconBrandGoogle size={18} color="#ef4444" />}
        fullWidth
        size="md"
        radius="md"
        style={{ fontWeight: 500 }}
        type="button"
      >
        Continue with Google
      </Button>
      <Button
        onClick={handleFacebookResponse}
        variant="default"
        leftSection={<ICONS.IconBrandFacebook size={18} color="#1877f3" />}
        fullWidth
        size="md"
        radius="md"
        style={{ fontWeight: 500 }}
        type="button"
      >
        Continue with Facebook
      </Button>
    </Stack>
  );
};
