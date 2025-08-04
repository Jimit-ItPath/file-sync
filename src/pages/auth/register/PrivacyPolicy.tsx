import { Box, Grid, Paper, Stack, Title, Text, Group } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import { Link, useNavigate } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';

const PrivacyPolicy = () => {
  const { isXs, isSm, isMd } = useResponsive();
  const navigate = useNavigate();

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
        onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
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
        <Grid.Col span={12}>
          <Paper
            radius={0}
            h="100%"
            p={isXs ? 16 : isSm ? 24 : 40}
            style={{
              display: 'flex',
              justifyContent: 'center',
              background: '#fff',
            }}
          >
            <Box w="100%" maw={750} mx="auto">
              <Stack gap={isXs ? 16 : 24}>
                <Title order={2} fw={700} fz={isXs ? 20 : 28} ta="center">
                  Privacy Policy
                </Title>
                <Text c="dimmed" fz={14}>
                  Last updated: August 1, 2025
                </Text>

                <Text fz={16}>
                  At AllCloudHub, we value your privacy. This Privacy Policy
                  explains how we collect, use, and protect your personal
                  information when using our platform.
                </Text>

                <Text fw={600}>1. Information We Collect</Text>
                <Text fz={15}>
                  We collect your name, email, and authentication tokens when
                  you sign up or connect third-party services like Google Drive,
                  Dropbox, or OneDrive.
                </Text>

                <Text fw={600}>2. How We Use Your Data</Text>
                <Text fz={15}>
                  We use your data to provide file management functionality,
                  allow account integration, and improve your experience. We do
                  not store your files — all operations are performed directly
                  on your connected accounts.
                </Text>

                <Text fw={600}>3. Security</Text>
                <Text fz={15}>
                  We use secure authentication methods (e.g., OAuth 2.0), HTTPS
                  encryption, and do not share your information with third
                  parties without consent.
                </Text>

                <Text fw={600}>4. Your Rights</Text>
                <Text fz={15}>
                  You may revoke access or delete your account at any time. If
                  you have questions or requests, email us at{' '}
                  <Text span fw={600}>
                    support@allcloudhub.com
                  </Text>
                  .
                </Text>

                <Text fw={600}>5. Changes</Text>
                <Text fz={15}>
                  We may update this policy. Continued use of the platform
                  indicates acceptance of changes.
                </Text>

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
                  >
                    <ICONS.IconArrowLeft size={18} /> Go Back
                  </Link>
                </Group>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default PrivacyPolicy;
