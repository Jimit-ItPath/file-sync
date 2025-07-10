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
import { LoginForm } from './LoginForm';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import { SocialLoginButtons } from '../register/SocialLoginButtons';

export default function Login() {
  return (
    <Grid gutter={0} style={{ minHeight: '100vh' }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <FeatureList />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper
          radius={0}
          h="100vh"
          p={{ base: 32, md: 56 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
          }}
        >
          <Box w="100%" maw={400} mx="auto">
            <Stack gap={32}>
              <Box>
                <Title
                  order={2}
                  ta="center"
                  fw={700}
                  mb={8}
                  fz={{ base: 24, md: 32 }}
                >
                  Sign in to your account
                </Title>
                <Text ta="center" c="dimmed" fz="md">
                  Welcome back! Please enter your details.
                </Text>
              </Box>
              <SocialLoginButtons />
              <Group align="center" gap={8} mb={8}>
                <Divider w="100%" />
                <Text c="dimmed" fz="sm" px={8}>
                  or sign in with email
                </Text>
                <Divider w="100%" />
              </Group>
              <LoginForm />
              <Text ta="center" fz="sm" c="dimmed">
                Don't have an account?{' '}
                <Link
                  to={AUTH_ROUTES.REGISTER.url}
                  style={{ textDecoration: 'none', color: '#0284c7' }}
                >
                  Sign up
                </Link>
              </Text>
            </Stack>
          </Box>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
