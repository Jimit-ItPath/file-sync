import { Link, useSearchParams } from 'react-router';
import useResetPassword from './use-reset-password';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { Button, Card, Form, Input } from '../../../components';
import { AUTH_ROUTES } from '../../../routing/routes';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const validation_code = searchParams.get('validation_code');

  const {
    methods,
    handleResetPasswordSubmit,
    isLoading,
    resetPasswordFormData,
  } = useResetPassword({ email, validation_code });

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
            Reset Password
          </Title>
          <Form methods={methods} onSubmit={handleResetPasswordSubmit}>
            <Stack gap={16}>
              {resetPasswordFormData.map(
                ({ id, label, placeholder, type, error, name, isRequired }) => (
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
                  />
                )
              )}
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
                Reset Password
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
};

export default ResetPassword;
