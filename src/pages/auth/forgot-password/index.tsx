import { Box, Stack, Title, Text, Group } from '@mantine/core';
import { Form, Input, Button, Card } from '../../../components';
import { Link } from 'react-router';
import useForgotPassword from './use-forgot-password';
import { AUTH_ROUTES } from '../../../routing/routes';

export default function ForgotPassword() {
  const { methods, handleForgotSubmit, isLoading } = useForgotPassword();

  return (
    <Box
      h="100vh"
      w="100vw"
      style={{
        background: 'linear-gradient(120deg, #0ea5e9 0%, #0369a1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        shadow="md"
        radius={16}
        p={32}
        style={{
          minWidth: 340,
          maxWidth: 380,
          width: '100%',
          background: '#fff',
        }}
      >
        <Stack gap={24}>
          <Title order={3} ta="center" fw={700} fz={26}>
            Forgot Password
          </Title>
          <Form methods={methods} onSubmit={handleForgotSubmit}>
            <Stack gap={16}>
              <Input
                name="email"
                label="Email address"
                placeholder="Enter your email"
                type="email"
                radius="md"
                size="md"
                withAsterisk
              />
              <Button
                type="submit"
                fullWidth
                loading={Boolean(isLoading)}
                disabled={Boolean(isLoading)}
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
                Send Reset Link
              </Button>
            </Stack>
          </Form>
          <Group justify="center" mt={8}>
            <Text fz="sm" c="dimmed">
              <Link
                to={AUTH_ROUTES.LOGIN.url}
                style={{ textDecoration: 'none', color: '#0284c7' }}
              >
                Back to login
              </Link>
            </Text>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
}
