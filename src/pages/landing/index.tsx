import {
  Container,
  Title,
  Text,
  Button,
  Grid,
  Card,
  Group,
  Stack,
  Box,
  ThemeIcon,
  SimpleGrid,
  AppShell,
  Divider,
  Image,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router';
import { AUTH_ROUTES } from '../../routing/routes';
import GooggleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import LandingPagwSvg from '../../assets/svgs/LandingPage.svg';
import useResponsive from '../../hooks/use-responsive';
import { ICONS } from '../../assets/icons';
import NavigationItems from './NavigationItems';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';

export default function UnifidriveLanding() {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isMd, isSm } = useResponsive();
  const navigate = useNavigate();

  const features = [
    {
      icon: ICONS.IconCloud,
      title: 'Connect Your Cloud Drives',
      description:
        'Securely link your Google Drive, OneDrive, and Dropbox accounts with OAuth authentication.',
      color: 'blue',
    },
    {
      icon: ICONS.IconDatabase,
      title: 'Manage Files in One Place',
      description:
        'Access all your cloud files through a single, intuitive dashboard interface.',
      color: 'cyan',
    },
    {
      icon: ICONS.IconLayoutDistributeVertical,
      title: 'Smart Distribution',
      description:
        'Let our AI automatically optimize storage by distributing files based on available space.',
      color: 'teal',
    },
  ];

  const powerfulFeatures = [
    {
      icon: ICONS.IconDashboard,
      title: 'Unified Dashboard',
      description:
        'View and manage all your cloud storage accounts from one central location.',
      color: 'blue',
    },
    {
      icon: ICONS.IconLayoutDistributeVertical,
      title: 'Smart Distribution',
      description:
        'Automatically upload files to drives with the most available space.',
      color: 'green',
    },
    {
      icon: ICONS.IconDragDrop2,
      title: 'Drag & Drop Upload',
      description:
        'Effortlessly upload files with intuitive drag-and-drop functionality.',
      color: 'orange',
    },
    {
      icon: ICONS.IconTransfer,
      title: 'Cross-Cloud Transfer',
      description:
        'Move files between different cloud storage providers seamlessly.',
      color: 'indigo',
    },
    {
      icon: ICONS.IconFolders,
      title: 'Folder Sync',
      description:
        'Keep folders synchronized across multiple cloud storage platforms.',
      color: 'violet',
    },
    {
      icon: ICONS.IconEye,
      title: 'File Preview',
      description:
        'Preview documents, images, and videos without downloading them.',
      color: 'pink',
    },
  ];

  const benefits = [
    {
      icon: ICONS.IconDownload,
      title: 'Save Storage Costs',
      description: 'Optimize usage across accounts',
      color: 'green',
    },
    {
      icon: ICONS.IconShield,
      title: 'Centralized Access',
      description: 'One place for all your files',
      color: 'blue',
    },
    {
      icon: ICONS.IconDeviceDesktop,
      title: 'Cross-Platform',
      description: 'Works on desktop and mobile',
      color: 'orange',
    },
    {
      icon: ICONS.IconRefresh,
      title: 'Seamless Integration',
      description: 'Native cloud provider APIs',
      color: 'purple',
    },
  ];

  const security = [
    {
      icon: ICONS.IconShieldHalfFilled,
      title: 'OAuth 2.0 Security',
      description:
        'Industry-standard authentication protocol ensures secure access to your accounts.',
      color: 'green',
    },
    {
      icon: ICONS.IconForbid,
      title: 'No Data Storage',
      description:
        'We never store your files on our servers. Everything stays in your cloud accounts.',
      color: 'blue',
    },
    {
      icon: ICONS.IconCheck,
      title: 'Revoke Anytime',
      description:
        'Full control over permissions. Revoke access securely whenever you want.',
      color: 'red',
    },
  ];

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <LandingHeader {...{ close, navigate, open, opened }} />

      <AppShell.Navbar p="md">
        <Stack>
          <NavigationItems />
          <Divider />
          <Button
            variant="subtle"
            fullWidth
            onClick={() => navigate(AUTH_ROUTES.LOGIN.url)}
          >
            Sign In
          </Button>
          <Button fullWidth onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}>
            Get Started
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main px={0} pt={70} pb={0}>
        {/* Hero Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={20}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
        >
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap={isMobile ? 'md' : 'xl'}>
                <Title order={1} fw={700} fz={isMobile ? 36 : 60}>
                  One Platform.{' '}
                </Title>
                <Title c="blue" fw={700} fz={isMobile ? 36 : 60} maw={600}>
                  All Your Cloud Drives.
                </Title>

                <Text size="lg" c="dimmed" maw={600} fz={isMobile ? 16 : 18}>
                  AllCloudHub lets you connect Google Drive, OneDrive, and
                  Dropbox in one place and smartly manage your storage.
                </Text>

                <Group>
                  <Button
                    size="lg"
                    rightSection={<ICONS.IconArrowRight size={18} />}
                    style={{
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                    fz={isMobile ? 14 : 16}
                    onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                  >
                    Get Started For Free
                  </Button>
                  <Button variant="outline" size="lg" fz={isMobile ? 14 : 16}>
                    See How It Works
                  </Button>
                </Group>

                <Group gap="xl">
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light">
                      <ICONS.IconShieldHalfFilled size={14} />
                    </ThemeIcon>
                    <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                      OAuth 2.0 Secured
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size={'sm'} variant="light">
                      <ICONS.IconLock size={14} />
                    </ThemeIcon>
                    <Text size={isMobile ? 'xs' : 'sm'} c="dimmed">
                      No Data Stored
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{
                display: isMd ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                src={LandingPagwSvg}
                w={{ base: 300, sm: 400, md: 500, lg: 600 }}
                h={{ base: 200, sm: 300, md: 350, lg: 400 }}
                my={{ base: 20, md: 50 }}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {/* <Center h="100%">
                <Paper
                  shadow="xl"
                  p="xl"
                  radius="lg"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                  }}
                  w="100%"
                  maw={400}
                >
                  <Stack gap="md" align="center">
                    <Group justify="center" gap="lg">
                      <ThemeIcon size={40} variant="white" color="gray">
                        <IconCloud size={24} />
                      </ThemeIcon>
                      <ThemeIcon size={40} variant="white" color="gray">
                        <IconCloud size={24} />
                      </ThemeIcon>
                    </Group>

                    <SimpleGrid cols={6} spacing="sm">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Paper
                          key={i}
                          h={40}
                          w={40}
                          bg="white"
                          radius="md"
                          style={{
                            animation: `float ${2 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </SimpleGrid>
                  </Stack>
                </Paper>
              </Center> */}
            </Grid.Col>
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box py={isMobile ? 40 : 60}>
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
          >
            <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                How It Works
              </Title>
              <Text ta="center" c="dimmed" fz={isMobile ? 14 : 16}>
                Get started in just 3 simple steps
              </Text>

              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing="xl"
                w="100%"
              >
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    style={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon
                        size={isMobile ? 40 : 60}
                        radius="xl"
                        color={feature.color}
                        variant="light"
                      >
                        <feature.icon size={isMobile ? 24 : 30} />
                      </ThemeIcon>
                      <Title order={4} ta="center" fz={isMobile ? 14 : 16}>
                        {feature.title}
                      </Title>
                      <Text
                        ta="center"
                        c="dimmed"
                        size={isMobile ? 'xs' : 'sm'}
                      >
                        {feature.description}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        {/* Powerful Features Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobile ? 40 : 60}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
        >
          <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
            <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
              Powerful Features
            </Title>
            <Text ta="center" c="dimmed" maw={600} fz={isMobile ? 14 : 16}>
              Everything you need to manage your cloud storage efficiently
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" w="100%">
              {powerfulFeatures.map((feature, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  style={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={isMobile ? 40 : 50}
                      radius="md"
                      color={feature.color}
                      variant="light"
                    >
                      <feature.icon size={isMobile ? 20 : 24} />
                    </ThemeIcon>
                    <Title order={5} fz={isMobile ? 14 : 16}>
                      {feature.title}
                    </Title>
                    <Text c="dimmed" size={isMobile ? 'xs' : 'sm'}>
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>

        {/* Why Choose Section */}
        <Box py={isMobile ? 40 : 60}>
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
          >
            <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                Why Choose AllCloudHub?
              </Title>

              <SimpleGrid
                cols={{ base: 2, md: 4 }}
                mt={20}
                spacing="xl"
                w="100%"
              >
                {benefits.map((benefit, index) => (
                  <Stack key={index} align="center" gap="md">
                    <ThemeIcon
                      size={isMobile ? 40 : 60}
                      radius="xl"
                      color={benefit.color}
                      variant="light"
                      style={{
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <benefit.icon size={isMobile ? 20 : 30} />
                    </ThemeIcon>
                    <Title order={5} ta="center" fz={isMobile ? 14 : 16}>
                      {benefit.title}
                    </Title>
                    <Text ta="center" c="dimmed" size={isMobile ? 'xs' : 'sm'}>
                      {benefit.description}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        {/* Security Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobile ? 40 : 60}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
        >
          <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
            <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
              Your Data is Secure
            </Title>
            <Text ta="center" c="dimmed" maw={600} fz={isMobile ? 14 : 16}>
              We prioritize your privacy and security above everything else
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" w="100%">
              {security.map((item, index) => (
                <Card
                  key={index}
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  style={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Stack align="center" gap="md">
                    <ThemeIcon
                      size={60}
                      radius="xl"
                      color={item.color}
                      variant="light"
                    >
                      <item.icon size={30} />
                    </ThemeIcon>
                    <Title order={4} ta="center" fz={isMobile ? 16 : 18}>
                      {item.title}
                    </Title>
                    <Text ta="center" c="dimmed" size={isMobile ? 'xs' : 'sm'}>
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            <Text ta="center" c="dimmed" size="sm" mt="xl">
              Trusted by cloud storage providers
            </Text>
            <Group justify="center" gap="lg">
              <Image src={GooggleDriveIcon} w={30} />
              <Image src={DropboxIcon} w={30} />
              <Image src={OneDriveIcon} w={30} />
            </Group>
          </Stack>
        </Container>

        {/* CTA Section */}
        <Box
          py={isMobile ? 40 : 60}
          style={{
            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundColor: '#0284c7',
          }}
        >
          <Container size="var(--mantine-breakpoint-xxxl)">
            <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
              <Title order={2} ta="center" c="white" fz={isMobile ? 24 : 30}>
                Start Managing Your Cloud Storage Smarter
              </Title>
              <Text
                ta="center"
                c="white"
                opacity={0.9}
                fz={isMobile ? 14 : 16}
                maw={600}
              >
                Join thousands of users who have simplified their cloud storage
                management
              </Text>
              <Button
                size={isMobile ? 'md' : 'xl'}
                variant="white"
                c={'#0284c7'}
                style={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                }}
                fz={isMobile ? 14 : 16}
                onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
              >
                Get Started For Free
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Footer */}
        <LandingFooter />
      </AppShell.Main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .mantine-Card-root:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
        
        .mantine-Button-root:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
      `}</style>
    </AppShell>
  );
}
