import { Grid, Paper, Stack, Title, Text, Box, Group } from '@mantine/core';
import { FeatureList } from './FeatureList';
import { SocialLoginButtons } from './SocialLoginButtons';
import { FormFields } from './FormFields';
import { Link } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import { Button, Form } from '../../../components';
import useRegister from './use-register';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';

const Register = () => {
  const {
    methods,
    handleRegisterSubmit,
    isLoading,
    registerFormData,
    onCaptchaChange,
    recaptchaRef,
    showRegisterForm,
    toggleRegisterForm,
  } = useRegister();
  const { isXs, isMd, isSm } = useResponsive();

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
                    Create your account
                  </Title>
                  <Text ta="center" c="dimmed" fz={isXs ? 14 : 16}>
                    Get started with your cloud file management
                  </Text>
                </Box>

                {showRegisterForm ? (
                  <>
                    <Form methods={methods} onSubmit={handleRegisterSubmit}>
                      <Stack gap={16}>
                        <Group fz="sm" c="dimmed" align="center" lh={1}>
                          <Link
                            to={AUTH_ROUTES.REGISTER.url}
                            style={{
                              textDecoration: 'none',
                              color: '#0284c7',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                            onClick={toggleRegisterForm}
                          >
                            <ICONS.IconArrowLeft size={18} /> Back
                          </Link>
                        </Group>
                        <FormFields
                          methods={methods}
                          registerFormData={registerFormData}
                          onCaptchaChange={onCaptchaChange}
                          recaptchaRef={recaptchaRef}
                        />

                        <Button
                          type="submit"
                          disabled={
                            Boolean(isLoading)
                            // || !methods.formState.isValid
                          }
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
                    <Text ta="center" fz={isXs ? 12 : 14} c="dimmed" mt={-20}>
                      Already have an account?{' '}
                      <Link
                        to={AUTH_ROUTES.LOGIN.url}
                        style={{
                          textDecoration: 'none',
                          color: '#0284c7',
                          fontWeight: 500,
                        }}
                      >
                        Log in
                      </Link>
                    </Text>
                  </>
                ) : (
                  <>
                    <SocialLoginButtons {...{ isXs, toggleRegisterForm }} />
                    <Text ta="center" fz={isXs ? 12 : 14} c="dimmed">
                      Already have an account?{' '}
                      <Link
                        to={AUTH_ROUTES.LOGIN.url}
                        style={{
                          textDecoration: 'none',
                          color: '#0284c7',
                          fontWeight: 500,
                        }}
                      >
                        Log in
                      </Link>
                    </Text>
                  </>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default Register;
