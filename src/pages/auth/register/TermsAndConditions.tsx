import { Box, Grid, Paper, Stack, Title, Text, Group } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import { Link, useNavigate } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';

const TermsAndConditions = () => {
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
                  Terms & Conditions
                </Title>
                <Text c="dimmed" fz={14}>
                  Last updated: August 1, 2025
                </Text>

                <Text fz={16}>
                  Welcome to AllCloudHub. By using our service, you agree to the
                  following terms and conditions.
                </Text>

                <Text fw={600}>1. Account Usage</Text>
                <Text fz={15}>
                  You are responsible for maintaining the confidentiality of
                  your login credentials. You may not share your account or
                  allow unauthorized access.
                </Text>

                <Text fw={600}>2. Acceptable Use</Text>
                <Text fz={15}>
                  You agree not to use AllCloudHub to upload, store, or
                  distribute unlawful content, violate intellectual property
                  rights, or misuse integrated cloud services (Google Drive,
                  Dropbox, OneDrive).
                </Text>

                <Text fw={600}>3. Third-Party Integrations</Text>
                <Text fz={15}>
                  Our platform connects with third-party services. By using
                  those features, you agree to their respective terms and
                  privacy policies.
                </Text>

                <Text fw={600}>4. Termination</Text>
                <Text fz={15}>
                  We reserve the right to suspend or terminate your access to
                  the platform if you violate these terms.
                </Text>

                <Text fw={600}>5. Disclaimer</Text>
                <Text fz={15}>
                  AllCloudHub is provided "as is" without warranties. We are not
                  liable for data loss or third-party service interruptions.
                </Text>

                <Text fw={600}>6. Governing Law</Text>
                <Text fz={15}>
                  These terms are governed by and interpreted in accordance with
                  the laws of your local jurisdiction.
                </Text>

                <Text fw={600}>7. Privacy</Text>
                <Text fz={15}>
                  For information on how we collect and use data, please refer
                  to our{' '}
                  <Link
                    to={AUTH_ROUTES.PRIVACY_POLICY.url}
                    style={{
                      color: '#0284c7',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Privacy Policy
                  </Link>
                  .
                </Text>

                {/* <Group fz="sm" c="dimmed" align="center" lh={1}>
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
                </Group> */}
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default TermsAndConditions;
