import {
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Box,
  Group,
  ThemeIcon,
} from '@mantine/core';
import useAdminLogin from './use-admin-login';
import { ICONS } from '../../../assets/icons';
import { Button, Form, Input } from '../../../components';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';

export default function AdminLogin() {
  const {
    isSm,
    isXs,
    isMd,
    handleLoginSubmit,
    isLoading,
    loginFormData,
    methods,
  } = useAdminLogin();

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
        <ICONS.IconCloud
          size={32}
          color={isXs || isSm || isMd ? '#0ea5e9' : '#ffffff'}
        />
        <Text
          fw={700}
          fz={20}
          style={{
            color: isXs || isSm || isMd ? '#0ea5e9' : '#ffffff',
            letterSpacing: -0.5,
          }}
        >
          AllCloudHub
        </Text>
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
                    Welcome back! Please enter your details.
                  </Text>
                </Box>
                <Form methods={methods} onSubmit={handleLoginSubmit}>
                  <Stack gap={16}>
                    {loginFormData.map(
                      ({
                        id,
                        label,
                        placeholder,
                        type,
                        error,
                        name,
                        isRequired,
                      }) => (
                        <Input
                          key={id}
                          name={name}
                          label={label}
                          placeholder={placeholder}
                          type={type}
                          error={error}
                          radius="md"
                          size="md"
                          withAsterisk={isRequired}
                          // autoComplete={type === 'password-input' ? 'new-password' : 'off'}
                        />
                      )
                    )}
                    <Group justify="flex-end">
                      <Link
                        to={AUTH_ROUTES.FORGOT_PASSWORD.url}
                        style={{ textDecoration: 'none', color: '#0284c7' }}
                      >
                        Forgot your password?
                      </Link>
                    </Group>
                    <Button
                      type="submit"
                      fullWidth
                      loading={Boolean(isLoading)}
                      disabled={
                        Boolean(isLoading) || !methods.formState.isValid
                      }
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
                      Log in
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
          <Paper
            p={0}
            style={{
              background: 'linear-gradient(120deg, #0ea5e9 0%, #0369a1 100%)',
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'stretch',
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              maw={600}
              mx="auto"
              p={{ base: 16, sm: 24, md: 32 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 0,
                zIndex: 2,
              }}
            >
              <Title
                order={1}
                mb={{ base: 16, sm: 20 }}
                fw={700}
                fz={{ base: 24, sm: 28, md: 32 }}
                c="#fff"
              >
                Welcome Back to Your Unified Cloud Dashboard
              </Title>
              <Text
                c="#e0e7ef"
                mb={{ base: 24, sm: 32 }}
                fz={{ base: 14, sm: 16 }}
              >
                Securely manage files from Google Drive, Dropbox, and OneDrive
                in one place.
              </Text>
              <Stack gap={isXs ? 16 : 24}>
                <Group align="center" gap={isXs ? 12 : 16}>
                  <ThemeIcon
                    color="white"
                    size={isXs ? 28 : 36}
                    radius="md"
                    variant="light"
                  >
                    <ICONS.IconLockPassword size={isXs ? 16 : 20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
                      Secure login & session management
                    </Text>
                  </Box>
                </Group>
                <Group align="center" gap={isXs ? 12 : 16}>
                  <ThemeIcon
                    color="white"
                    size={isXs ? 28 : 36}
                    radius="md"
                    variant="light"
                  >
                    <ICONS.IconFolder size={isXs ? 16 : 20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
                      Unified file access across providers
                    </Text>
                  </Box>
                </Group>
                <Group align="center" gap={isXs ? 12 : 16}>
                  <ThemeIcon
                    color="white"
                    size={isXs ? 28 : 36}
                    radius="md"
                    variant="light"
                  >
                    <ICONS.IconCpu size={isXs ? 16 : 20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
                      Personalized Smart File Distribution (SFD)
                    </Text>
                  </Box>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
