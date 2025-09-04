import {
  Box,
  Stack,
  Title,
  Text,
  Group,
  Grid,
  Paper,
  Image,
} from '@mantine/core';
import { Form, Input, Button } from '../../../components';
import { Link } from 'react-router';
import useForgotPassword from './use-forgot-password';
import { AUTH_ROUTES } from '../../../routing/routes';
import useResponsive from '../../../hooks/use-responsive';
import { FeatureList } from '../register/FeatureList';
import AllCloudHubLogo from '../../../assets/svgs/AllCloudHub-Logo.svg';

export default function ForgotPassword() {
  const { methods, handleForgotSubmit, isLoading, navigate } =
    useForgotPassword();
  const { isXs, isSm, isMd } = useResponsive();

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
        <Image src={AllCloudHubLogo} w={150} h={50} fit="contain" />
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
                    Forgot Password
                  </Title>
                </Box>

                <Form methods={methods} onSubmit={handleForgotSubmit}>
                  <Stack gap={16}>
                    <Input
                      name="email"
                      label="Email address"
                      placeholder="Enter email"
                      type="email"
                      radius="md"
                      size="md"
                      withAsterisk
                    />
                    <Button
                      type="submit"
                      fullWidth
                      loading={Boolean(isLoading)}
                      disabled={
                        Boolean(isLoading) || !methods.formState.isValid
                      }
                      size={isXs ? 'sm' : 'md'}
                      radius="md"
                      style={{
                        fontWeight: 500,
                        fontSize: isXs ? 14 : 16,
                        background: '#0284c7',
                        color: '#fff',
                        marginTop: 8,
                      }}
                    >
                      Send Reset Link
                    </Button>
                  </Stack>
                </Form>
                <Group justify="center" mt={isXs ? 0 : 8}>
                  <Text fz={isXs ? 'xs' : 'sm'} c="dimmed">
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
}
