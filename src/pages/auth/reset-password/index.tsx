import { Link, useSearchParams } from 'react-router';
import useResetPassword from './use-reset-password';
import { Box, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Button, Form, Input } from '../../../components';
import { AUTH_ROUTES } from '../../../routing/routes';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import { FeatureList } from '../register/FeatureList';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const validation_code = searchParams.get('validation_code');

  const {
    methods,
    handleResetPasswordSubmit,
    isLoading,
    resetPasswordFormData,
    navigate,
  } = useResetPassword({ email, validation_code });
  const { isMd, isSm, isXs } = useResponsive();

  return (
    <Box>
      <Group
        align="center"
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate(AUTH_ROUTES.LANDING.url)}
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
      <Grid gutter={0} style={{ minHeight: '100vh' }}>
        <Grid.Col
          span={{ base: 12, md: 6 }}
          order={isXs || isSm || isMd ? 2 : 1}
        >
          <FeatureList {...{ isMd, isXs }} />
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, md: 6 }}
          order={isXs || isSm || isMd ? 1 : 2}
        >
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
                    Reset Password
                  </Title>
                </Box>

                <Form methods={methods} onSubmit={handleResetPasswordSubmit}>
                  <Stack gap={16}>
                    {resetPasswordFormData.map(
                      ({
                        id,
                        label,
                        placeholder,
                        type,
                        error,
                        name,
                        isRequired,
                        strengthMeter,
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
                          strengthMeter={strengthMeter}
                          withAsterisk={isRequired}
                        />
                      )
                    )}
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
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default ResetPassword;
