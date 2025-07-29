import {
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Divider,
  Box,
  Group,
} from '@mantine/core';
import { FeatureList } from './FeatureList';
import { SocialLoginButtons } from './SocialLoginButtons';
import { FormFields } from './FormFields';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import { Button, Form } from '../../../components';
import useRegister from './use-register';
import { ICONS } from '../../../assets/icons';
import useLogin from '../login/use-login';

const Register = () => {
  const {
    methods,
    handleRegisterSubmit,
    isLoading,
    registerFormData,
    onCaptchaChange,
    recaptchaRef,
  } = useRegister();
  const { isXs, isMd, isSm } = useLogin();

  return (
    <Box>
      <Group
        align="center"
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
        }}
      >
        <ICONS.IconCloud size={32} color={'#0ea5e9'} />
        <Text
          fw={700}
          fz={20}
          style={{
            color: isXs || isSm || isMd ? '#0ea5e9' : '#000000',
            letterSpacing: -0.5,
          }}
        >
          AllCloudHub
        </Text>
      </Group>
      <Grid gutter={0}>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
          <FeatureList {...{ isMd, isXs }} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 1, md: 2 }}>
          <Paper
            radius={0}
            h="100%"
            p={isXs ? 16 : isSm ? 24 : 32}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
            }}
          >
            <Box
              w="100%"
              maw={isXs ? 300 : 400}
              mx="auto"
              mt={isXs || isSm || isMd ? 50 : 0}
            >
              <Stack gap={isXs ? 16 : isSm ? 24 : 32}>
                <Box>
                  <Title
                    order={2}
                    ta="center"
                    fw={700}
                    mb={isXs ? 4 : 8}
                    fz={isXs ? 20 : isSm ? 24 : 32}
                  >
                    Create your account
                  </Title>
                  <Text ta="center" c="dimmed" fz={isXs ? 14 : 16}>
                    Get started with your cloud file management
                  </Text>
                </Box>

                <SocialLoginButtons {...{ isXs }} />

                <Group align="center" gap={8} mb={8}>
                  <Divider w="100%" />
                  <Text ta={'center'} w={'100%'} c="dimmed" fz="sm" px={8}>
                    or create an account with email
                  </Text>
                  <Divider w="100%" />
                </Group>

                <Form methods={methods} onSubmit={handleRegisterSubmit}>
                  <Stack gap={16}>
                    <FormFields
                      methods={methods}
                      registerFormData={registerFormData}
                      onCaptchaChange={onCaptchaChange}
                      recaptchaRef={recaptchaRef}
                    />

                    <Button
                      type="submit"
                      disabled={Boolean(isLoading)}
                      loading={Boolean(isLoading)}
                      size="md"
                      radius="md"
                      style={{
                        fontWeight: 500,
                        fontSize: 16,
                        background: '#0284c7',
                        color: '#fff',
                        marginTop: 8,
                      }}
                    >
                      Create Account
                    </Button>
                  </Stack>
                </Form>

                <Text ta="center" fz={isXs ? 12 : 14} c="dimmed">
                  Already have an account?{' '}
                  <Link
                    to={AUTH_ROUTES.LOGIN.url}
                    style={{ textDecoration: 'none', color: '#0284c7' }}
                  >
                    Log in
                  </Link>
                </Text>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default Register;
