import { Box, Text, Card, Stack, SimpleGrid } from '@mantine/core';
import useResponsive from '../../../hooks/use-responsive';
import useAdminDashboard from './use-admin-dashboard';
import AdminDashboardSkeleton from '../../../components/skeleton/AdminDashboardSkeleton';
import { Tooltip } from '../../../components';
import { ICONS } from '../../../assets/icons';

const AdminDashboard = () => {
  const { isXs } = useResponsive();
  const {
    animate,
    userAnalytics,
    // userAnalyticsLoading,
    connectedAccountAnalytics,
    allAnalyticsLoading,
    contactUsAnalytics,
    // connectedAccountAnalyticsLoading,
  } = useAdminDashboard();

  return (
    <Box
      px={isXs ? 16 : 32}
      pb={20}
      bg="#f8fafc"
      style={{
        position: 'relative',
        height: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Title */}
      {/* <Text fw={700} size="xl" mt={20} mb={24}>
        Admin Dashboard
      </Text> */}

      {/* Stats Cards */}
      {allAnalyticsLoading ? (
        <AdminDashboardSkeleton />
      ) : (
        <>
          {/* User Analytics */}
          <Box>
            <Text fw={700} size="md" mt={20} mb={24}>
              User Analytics
            </Text>
            <SimpleGrid
              spacing="lg"
              mb={20}
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              {userAnalytics?.map((item, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className={`dashboard-card ${animate ? 'enter' : ''}`}
                  style={{
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Stack gap="xs" align="center">
                    <Text fw={700} size="xl">
                      {item.value.toLocaleString()}
                    </Text>
                    {/* <Text size="sm" c="dimmed">
                      {item.label}
                    </Text> */}
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {item.label}
                      <Tooltip label={item.description} fz={'xs'} withArrow position='bottom'>
                        <ICONS.IconInfoCircle
                          size={16}
                          style={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Connected Account Analytics */}
          <Box>
            <Text fw={700} size="md" mt={40} mb={24}>
              Connected Account Analytics
            </Text>
            <SimpleGrid
              spacing="lg"
              mb={20}
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              }}
            >
              {connectedAccountAnalytics?.map((item, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className={`dashboard-card ${animate ? 'enter' : ''}`}
                  style={{
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Stack gap="xs" align="center">
                    <Text fw={700} size="xl">
                      {item.value.toLocaleString()}
                    </Text>
                    {/* <Text size="sm" c="dimmed">
                      {item.label}
                    </Text> */}
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {item.label}
                      <Tooltip label={item.description} fz={'xs'} withArrow position='bottom'>
                        <ICONS.IconInfoCircle
                          size={16}
                          style={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Contact Us Analytics */}
          <Box>
            <Text fw={700} size="md" mt={40} mb={24}>
              Contact Us Analytics
            </Text>
            <SimpleGrid
              spacing="lg"
              mb={20}
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              {contactUsAnalytics?.map((item, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className={`dashboard-card ${animate ? 'enter' : ''}`}
                  style={{
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 120,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Stack gap="xs" align="center">
                    <Text fw={700} size="xl">
                      {item.value.toLocaleString()}
                    </Text>
                    {/* <Text size="sm" c="dimmed">
                      {item.label}
                    </Text> */}
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {item.label}
                      <Tooltip label={item.description} fz={'xs'} withArrow position='bottom'>
                        <ICONS.IconInfoCircle
                          size={16}
                          style={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </>
      )}

      <style>
        {`
          .dashboard-card {
            opacity: 0;
            transform: translateY(20px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .dashboard-card.enter {
            animation: fadeSlideIn 0.5s forwards;
          }
          .dashboard-card:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          }
          @keyframes fadeSlideIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default AdminDashboard;
