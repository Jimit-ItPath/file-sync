import {
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Box,
  Group,
  Image,
} from '@mantine/core';
import { LoginForm } from './LoginForm';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import useLogin from './use-login';
import { SocialLoginButtons } from './SocialLoginButtons';
import { FeatureList } from '../register/FeatureList';
import useResponsive from '../../../hooks/use-responsive';
import AllCloudHubLogo from '../../../assets/svgs/AllCloudHub-Logo.svg';

export default function Login() {
  const { showLoginForm, toggleLoginForm, navigate } = useLogin();
  const { isMd, isSm, isXs } = useResponsive();
  return (
    <Box>
      <Group
        align="center"
        style={{
          position: 'absolute',
          top: 12,
          left: 100,
          zIndex: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate(AUTH_ROUTES.LANDING.url)}
      >
        <Image src={AllCloudHubLogo} w={150} h={50} fit="contain" />
        {/* <ICONS.IconCloud size={32} color={'#0ea5e9'} />
        <Text
          fw={700}
          fz={20}
          style={{
            color: isXs || isSm || isMd ? '#0ea5e9' : '#000000',
            letterSpacing: -0.5,
          }}
        >
          All Cloud Hub
        </Text> */}
      </Group>
      <Grid gutter={0} style={{ minHeight: '100vh' }}>
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
                    Sign in to your account
                  </Title>
                  <Text ta="center" c="dimmed" fz={isXs ? 14 : 16}>
                    Welcome back!{' '}
                    {showLoginForm && 'Please enter your details.'}
                  </Text>
                </Box>
                {showLoginForm ? (
                  <LoginForm onBack={toggleLoginForm} isXs={isXs} />
                ) : (
                  <>
                    <SocialLoginButtons
                      onEmailClick={toggleLoginForm}
                      isXs={isXs}
                    />
                    <Text ta="center" fz={isXs ? 12 : 14} c="dimmed">
                      Don't have an account?{' '}
                      <Link
                        to={AUTH_ROUTES.REGISTER.url}
                        style={{
                          textDecoration: 'none',
                          color: '#0284c7',
                          fontWeight: 500,
                        }}
                      >
                        Sign up
                      </Link>
                    </Text>
                  </>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
          <FeatureList {...{ isXs, isMd }} />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
