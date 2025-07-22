import { Stack, Group, Text, ActionIcon } from '@mantine/core';
import { Button, Form, Input } from '../../../components';
import useLogin from './use-login';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import { ICONS } from '../../../assets/icons';

interface LoginFormProps {
  onBack: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBack }) => {
  const { loginFormData, isLoading, handleLoginSubmit, methods } = useLogin();

  return (
    <Form methods={methods} onSubmit={handleLoginSubmit}>
      <Stack gap={16}>
        <ActionIcon radius={'50%'} onClick={onBack}>
          <ICONS.IconArrowLeft size={18} />
        </ActionIcon>
        {loginFormData.map(
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
          Log in
        </Button>
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
    </Form>
  );
};
