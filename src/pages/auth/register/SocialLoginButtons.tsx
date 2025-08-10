import { Image, Stack } from '@mantine/core';
import { Button } from '../../../components';
import useSocialLogin from '../useSocialLogin';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import FacebookIcon from '../../../assets/svgs/Facebook.svg';
import { ICONS } from '../../../assets/icons';

interface ISocialLoginButtonsProps {
  isXs: boolean;
  toggleRegisterForm: () => void;
}

export const SocialLoginButtons = ({
  isXs,
  toggleRegisterForm,
}: ISocialLoginButtonsProps) => {
  const { handleFacebookLogin, handleGoogleLogin } = useSocialLogin();

  return (
    <Stack gap={isXs ? 'xs' : 'sm'} mb={isXs ? 'xs' : 'sm'}>
      <Button
        onClick={handleGoogleLogin}
        variant="default"
        // leftSection={<ICONS.IconBrandGoogle size={18} color="#ef4444" />}
        leftSection={
          <Image src={GoogleDriveIcon} alt="Google Drive" w={16} h={16} />
        }
        fullWidth
        size="md"
        radius="md"
        fw={500}
        type="button"
      >
        Continue with Google
      </Button>
      <Button
        onClick={handleFacebookLogin}
        variant="default"
        // leftSection={<ICONS.IconBrandFacebook size={18} color="#1877f3" />}
        leftSection={<Image src={FacebookIcon} alt="Facebook" w={16} h={16} />}
        fullWidth
        size="md"
        radius="md"
        fw={500}
        type="button"
      >
        Continue with Facebook
      </Button>
      <Button
        onClick={toggleRegisterForm}
        variant="default"
        leftSection={<ICONS.IconMail size={18} color="#0284c7" />}
        fullWidth
        size="md"
        radius="md"
        fw={500}
        type="button"
      >
        Continue with Email
      </Button>
    </Stack>
  );
};
