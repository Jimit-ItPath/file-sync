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

const Register = () => {
  const { methods, handleRegisterSubmit, isLoading, registerFormData } =
    useRegister();

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
          <Box w="100%" maw={400} mx="auto" mt={{ xs: 100, sm: 0 }}>
            <Stack gap={32}>
              <Box>
                <Title
                  order={2}
                  ta="center"
                  fw={600}
                  mb={8}
                  fz={{ base: 24, md: 32 }}
                >
                  Create your account
                </Title>
                <Text ta="center" c="dimmed" fz="md">
                  Get started with your cloud file management
                </Text>
              </Box>

              <SocialLoginButtons />

              <Group align="center" gap={8} mb={8}>
                <Divider w="100%" />
                <Text c="dimmed" fz="sm" px={8}>
                  or create an account with email
                </Text>
                <Divider w="100%" />
              </Group>

              <Form methods={methods} onSubmit={handleRegisterSubmit}>
                <Stack gap={20}>
                  <FormFields
                    methods={methods}
                    registerFormData={registerFormData}
                  />

                  <Button
                    type="submit"
                    disabled={Boolean(isLoading)}
                    loading={Boolean(isLoading)}
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      fontWeight: 500,
                      fontSize: 16,
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginBottom: 8,
                    }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </Form>

              <Text ta="center" fz="sm" c="dimmed">
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
  );
};

export default Register;
