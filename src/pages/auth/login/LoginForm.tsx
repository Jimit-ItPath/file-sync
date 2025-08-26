import { Stack, Group, Text } from '@mantine/core';
import { Button, Form, Input } from '../../../components';
import useLogin from './use-login';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import { ICONS } from '../../../assets/icons';

interface LoginFormProps {
  onBack: () => void;
  isXs: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBack, isXs }) => {
  const { loginFormData, isLoading, handleLoginSubmit, methods } = useLogin();

  return (
    <Form methods={methods} onSubmit={handleLoginSubmit}>
      <Stack gap={16}>
        <Group fz="sm" c="dimmed" align="center" lh={1}>
          <Link
            to={AUTH_ROUTES.LOGIN.url}
            style={{
              textDecoration: 'none',
              color: '#0284c7',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
            onClick={onBack}
          >
            <ICONS.IconArrowLeft size={18} /> Back
          </Link>
        </Group>
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
        <Group justify="flex-end" mt={-10}>
          <Link
            to={AUTH_ROUTES.FORGOT_PASSWORD.url}
            style={{
              textDecoration: 'none',
              color: '#0284c7',
              fontSize: isXs ? 12 : 14,
            }}
          >
            Forgot your password?
          </Link>
        </Group>
        <Button
          type="submit"
          fullWidth
          loading={Boolean(isLoading)}
          disabled={Boolean(isLoading) || !methods.formState.isValid}
          size={isXs ? 'sm' : 'md'}
          radius="md"
          style={{
            fontWeight: 500,
            fontSize: isXs ? 14 : 16,
            background: '#0284c7',
            color: '#fff',
          }}
        >
          Log in
        </Button>
        <Text ta="center" fz={isXs ? 12 : 14} c="dimmed" mt={-5}>
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
      </Stack>
    </Form>
  );
};
