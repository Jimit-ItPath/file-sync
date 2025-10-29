import React, { useEffect } from 'react';
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
  Image,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useLocation, useNavigate } from 'react-router';
import { AUTH_ROUTES, PLAIN_ROUTES } from '../../routing/routes';
import GooggleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import LandingPagwSvg from '../../assets/svgs/LandingPage.svg';
import useResponsive from '../../hooks/use-responsive';
import { useMobileResponsive } from '../../hooks/use-mobile-responsive';
import { ICONS } from '../../assets/icons';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import AnimatedSection from './components/AnimatedSection';
import StaggerContainer from './components/StaggerContainer';
import MobileCarousel from './components/MobileCarousel';
import TawkToWidget from '../../widget/TawkToWidget';
interface FeatureItem {
  icon: React.ComponentType<{ size: number }>;
  title: string;
  description: string;
  color: string;
}

const features: FeatureItem[] = [
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

const powerfulFeatures: FeatureItem[] = [
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

const benefits: FeatureItem[] = [
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

const security: FeatureItem[] = [
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

const dataFlow: FeatureItem[] = [
  {
    icon: ICONS.IconLogin2,
    title: 'Authentication',
    description:
      'You authenticate with cloud providers using OAuth 2.0. We receive only access tokens, never your passwords.',
    color: 'blue',
  },
  {
    icon: ICONS.IconApi,
    title: 'API Calls',
    description:
      'We make API calls to cloud providers on your behalf using your tokens. All calls are logged for transparency.',
    color: 'cyan',
  },
  {
    icon: ICONS.IconEye,
    title: 'Data Display',
    description:
      'File metadata is displayed in your browser. File content is streamed directly from cloud providers when needed.',
    color: 'teal',
  },
  {
    icon: ICONS.IconTrash,
    title: 'No Storage',
    description:
      'We never store your files. Temporary metadata is cleared when you log out or revoke access.',
    color: 'green',
  },
];

export default function UnifidriveLanding() {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isMd, isSm, isXs } = useResponsive();
  const { shouldShowMobileMenu } = useMobileResponsive();
  const navigate = useNavigate();
  const location = useLocation();

  // Use shouldShowMobileMenu for better mobile detection
  const isMobileView = shouldShowMobileMenu || isMobile;

  useEffect(() => {
    if (location.pathname === AUTH_ROUTES.LANDING.url) {
      document.title = 'All Cloud Hub';
    }
  }, [location]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          const yOffset = -70;
          const y =
            element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.state]);

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

      <AppShell.Main px={0} pt={70} pb={0}>
        {/* Hero Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={20}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
          style={{ overflow: 'hidden' }}
        >
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <AnimatedSection delay={0.2}>
                <Stack gap={isMobileView ? 'md' : 'xl'}>
                  <Title
                    order={1}
                    fw={700}
                    fz={isXs ? 28 : isSm ? 36 : isMd ? 44 : 60}
                  >
                    One Platform.{' '}
                  </Title>
                  <Title
                    c="blue"
                    fw={700}
                    fz={isXs ? 28 : isSm ? 36 : isMd ? 44 : 60}
                    maw={600}
                  >
                    All Your Cloud Drives.
                  </Title>

                  <Text
                    size="lg"
                    c="dimmed"
                    maw={600}
                    fz={isMobileView ? 16 : 18}
                  >
                    All Cloud Hub is a cloud storage management platform that
                    helps you organize, transfer, and manage files across Google
                    Drive, OneDrive, and Dropbox from a single dashboard.
                    <br />
                    <br />
                    <strong>What we do:</strong> With your explicit permission,
                    we connect to your cloud storage accounts using secure OAuth
                    2.0 authentication to let you view, organize, transfer files
                    between services, and manage your storage space efficiently.
                    <br />
                    <br />
                    <strong>Your control:</strong> We only access what you
                    authorize, never store your files on our servers, and you
                    can revoke access anytime. Your data always remains in your
                    original cloud accounts.
                  </Text>

                  <Group>
                    <Button
                      size={isXs ? 'sm' : isMobileView ? 'md' : 'lg'}
                      rightSection={
                        isXs ? null : <ICONS.IconArrowRight size={18} />
                      }
                      style={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                        },
                      }}
                      fz={isXs ? 13 : isMobileView ? 14 : 16}
                      onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                    >
                      Get Started For Free
                    </Button>
                    <Button
                      variant="outline"
                      size={isXs ? 'sm' : isMobileView ? 'md' : 'lg'}
                      fz={isXs ? 13 : isMobileView ? 14 : 16}
                      onClick={() => {
                        const howItWorksSection =
                          document.getElementById('how-it-works');
                        if (howItWorksSection) {
                          const yOffset = -70;
                          const y =
                            howItWorksSection.getBoundingClientRect().top +
                            window.scrollY +
                            yOffset;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                    >
                      See How It Works
                    </Button>
                  </Group>

                  <Group gap={isMobileView ? 'md' : 'xl'}>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light">
                        <ICONS.IconShieldHalfFilled size={14} />
                      </ThemeIcon>
                      <Text size={isMobileView ? 'xs' : 'sm'} c="dimmed">
                        OAuth 2.0 Secured
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <ThemeIcon size={'sm'} variant="light">
                        <ICONS.IconLock size={14} />
                      </ThemeIcon>
                      <Text size={isMobileView ? 'xs' : 'sm'} c="dimmed">
                        No Data Stored
                      </Text>
                    </Group>
                  </Group>
                </Stack>
              </AnimatedSection>
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{
                display: isMd ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <AnimatedSection delay={0.4}>
                <Image
                  src={LandingPagwSvg}
                  w={{ base: 300, sm: 400, md: 500, lg: 600 }}
                  h={{ base: 200, sm: 300, md: 350, lg: 400 }}
                  my={{ base: 20, md: 50 }}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    transition: 'transform 0.6s ease',
                  }}
                />
              </AnimatedSection>
            </Grid.Col>
          </Grid>
        </Container>
        {/* --- NEW About Section --- */}
        <Box py={isMobileView ? 40 : 60} id="about">
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
            style={{ overflow: 'hidden' }}
          >
            <AnimatedSection>
              <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
                <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                  What All Cloud Hub Does
                </Title>
                <Text
                  ta="center"
                  c="dimmed"
                  maw={800}
                  fz={isMobileView ? 14 : 16}
                >
                  <strong>Purpose:</strong> All Cloud Hub is a productivity
                  platform that simplifies managing your files across multiple
                  cloud storage providers. Instead of switching between Google
                  Drive, OneDrive, and Dropbox, our application gives you a
                  centralized dashboard to access, organize, and control all
                  your files in one place.
                </Text>

                <SimpleGrid
                  cols={{ base: 1, md: 2 }}
                  spacing="xl"
                  mt="xl"
                  maw={900}
                >
                  <Card shadow="sm" padding="xl" radius="md">
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon
                          size={50}
                          radius="md"
                          color="blue"
                          variant="light"
                        >
                          <ICONS.IconShieldHalfFilled size={24} />
                        </ThemeIcon>
                        <Title order={4} fz={isMobileView ? 16 : 18}>
                          How We Access Your Data:
                        </Title>
                      </Group>
                      <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                        <strong>OAuth 2.0 Authentication:</strong> We use the
                        industry-standard secure protocol to connect with your
                        cloud accounts.
                        <br />
                        <br />
                        <strong>Secure Authorization:</strong> As part of the
                        OAuth process, you’ll grant the necessary permissions so
                        All Cloud Hub can function like your native cloud drive
                        (create, edit, move, and delete files).
                        <br />
                        <br />
                        <strong>Direct Connection:</strong> All connections
                        happen directly between your browser and the cloud
                        providers.
                        <br />
                        <br />
                        <strong>No File Storage:</strong> We never store, copy,
                        or cache your files on our servers. You always stay in
                        control of your data.
                        <br />
                        <br />
                        <strong>Revoke Anytime:</strong> You can remove All
                        Cloud Hub’s access at any time from your cloud account
                        settings.
                      </Text>
                    </Stack>
                  </Card>

                  <Card shadow="sm" padding="xl" radius="md">
                    <Stack gap="md">
                      <Group>
                        <ThemeIcon
                          size={50}
                          radius="md"
                          color="green"
                          variant="light"
                        >
                          <ICONS.IconDatabase size={24} />
                        </ThemeIcon>
                        <Title order={4} fz={isMobileView ? 16 : 18}>
                          What You Can Do:
                        </Title>
                        <Text c={'dimmed'} size={isMobileView ? 'xs' : 'sm'}>
                          With All Cloud Hub, you can perform nearly everything
                          you normally do in your cloud drives, across multiple
                          providers at once:
                        </Text>
                      </Group>
                      <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                        <strong>Unified View:</strong> Browse and search files
                        across all connected accounts in one interface.
                        <br />
                        <br />
                        <strong>Full File Management:</strong> Create folders,
                        upload new files, rename, move, copy, download, and
                        delete files.
                        <br />
                        <br />
                        <strong>Cross-Platform Transfer:</strong> Seamlessly
                        move or copy files between different cloud storage
                        providers.
                        <br />
                        <br />
                        <strong>Smart Organization:</strong> Keep your cloud
                        space tidy by easily structuring and reorganizing files.
                        <br />
                        <br />
                        <strong>Usage Monitoring:</strong> View and track
                        storage usage across all your accounts.
                      </Text>
                    </Stack>
                  </Card>
                </SimpleGrid>

                <Text ta="center" c="dimmed" size="sm" mt="xl" maw={800}>
                  <strong>Privacy Commitment:</strong> Your files remain
                  exclusively in your cloud accounts. We act only as an
                  authorized interface to help you manage your existing storage.
                  You maintain complete control and can disconnect our access at
                  any time.
                  <br />
                  <br />
                  For detailed information about our data practices, please
                  review our{' '}
                  <a
                    href={PLAIN_ROUTES.PRIVACY_POLICY.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href={PLAIN_ROUTES.TERMS_OF_SERVICE.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', textDecoration: 'underline' }}
                  >
                    Terms of Service
                  </a>
                  .
                </Text>
              </Stack>
            </AnimatedSection>
          </Container>
        </Box>
        {/* Why Choose Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobileView ? 40 : 60}
          style={{ overflow: 'hidden' }}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                Why Choose All Cloud Hub?
              </Title>
            </Stack>
          </AnimatedSection>

          {isMobileView ? (
            <Box mt="xl">
              <MobileCarousel items={benefits} isMobile={isMobileView} />
            </Box>
          ) : (
            <StaggerContainer staggerDelay={0.1}>
              <SimpleGrid cols={{ base: 2, md: 4 }} mt={20} spacing="xl">
                {benefits.map((benefit, index) => (
                  <Stack key={index} align="center" gap="md">
                    <ThemeIcon
                      size={isMobileView ? 40 : 60}
                      radius="xl"
                      color={benefit.color}
                      variant="light"
                      style={{
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.15) rotate(5deg)',
                        },
                      }}
                    >
                      <benefit.icon size={isMobileView ? 20 : 30} />
                    </ThemeIcon>
                    <Title order={5} ta="center" fz={isMobileView ? 14 : 16}>
                      {benefit.title}
                    </Title>
                    <Text
                      ta="center"
                      c="dimmed"
                      size={isMobileView ? 'xs' : 'sm'}
                    >
                      {benefit.description}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </StaggerContainer>
          )}
        </Container>
        {/* How It Works Section */}
        <Box py={isMobileView ? 40 : 60} id="how-it-works">
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
            style={{ overflow: 'hidden' }}
          >
            <AnimatedSection>
              <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
                <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                  How It Works
                </Title>
                <Text ta="center" c="dimmed" fz={isMobileView ? 14 : 16}>
                  Get started in just 3 simple steps
                </Text>
              </Stack>
            </AnimatedSection>

            {isMobileView ? (
              <Box mt="xl">
                <MobileCarousel items={features} isMobile={isMobileView} />
              </Box>
            ) : (
              <StaggerContainer staggerDelay={0.15}>
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3 }}
                  spacing="xl"
                  mt="xl"
                >
                  {features.map((feature, index) => (
                    <Card
                      key={index}
                      shadow="sm"
                      padding="xl"
                      radius="md"
                      style={{
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      <Stack align="center" gap="md">
                        <ThemeIcon
                          size={isMobileView ? 40 : 60}
                          radius="xl"
                          color={feature.color}
                          variant="light"
                        >
                          <feature.icon size={isMobileView ? 24 : 30} />
                        </ThemeIcon>
                        <Title
                          order={4}
                          ta="center"
                          fz={isMobileView ? 14 : 16}
                        >
                          {feature.title}
                        </Title>
                        <Text
                          ta="center"
                          c="dimmed"
                          size={isMobileView ? 'xs' : 'sm'}
                        >
                          {feature.description}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </StaggerContainer>
            )}
          </Container>
        </Box>
        {/* Powerful Features Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobileView ? 40 : 60}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
          id="powerful-features"
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                Powerful Features
              </Title>
              <Text
                ta="center"
                c="dimmed"
                maw={600}
                fz={isMobileView ? 14 : 16}
              >
                Everything you need to manage your cloud storage efficiently
              </Text>
            </Stack>
          </AnimatedSection>

          {isMobileView ? (
            <Box mt="xl">
              <MobileCarousel
                items={powerfulFeatures}
                isMobile={isMobileView}
              />
            </Box>
          ) : (
            <StaggerContainer staggerDelay={0.1}>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mt="xl">
                {powerfulFeatures.map((feature, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    style={{
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Stack gap="md">
                      <ThemeIcon
                        size={isMobileView ? 40 : 50}
                        radius="md"
                        color={feature.color}
                        variant="light"
                      >
                        <feature.icon size={isMobileView ? 20 : 24} />
                      </ThemeIcon>
                      <Title order={5} fz={isMobileView ? 14 : 16}>
                        {feature.title}
                      </Title>
                      <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                        {feature.description}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </StaggerContainer>
          )}
        </Container>
        {/* Security Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobileView ? 40 : 60}
          // bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
          id="security-features"
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                Your Data is Secure
              </Title>
              <Text
                ta="center"
                c="dimmed"
                maw={600}
                fz={isMobileView ? 14 : 16}
              >
                We prioritize your privacy and security above everything else
              </Text>
            </Stack>
          </AnimatedSection>

          {isMobileView ? (
            <Box mt="xl">
              <MobileCarousel items={security} isMobile={isMobileView} />
            </Box>
          ) : (
            <StaggerContainer staggerDelay={0.15}>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
                {security.map((item, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    style={{
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                      },
                    }}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon
                        size={isMobileView ? 40 : 50}
                        radius="xl"
                        color={item.color}
                        variant="light"
                      >
                        <item.icon size={30} />
                      </ThemeIcon>
                      <Title order={4} ta="center" fz={isMobileView ? 16 : 18}>
                        {item.title}
                      </Title>
                      <Text
                        ta="center"
                        c="dimmed"
                        size={isMobileView ? 'xs' : 'sm'}
                      >
                        {item.description}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </StaggerContainer>
          )}

          <AnimatedSection delay={0.4}>
            <Box mt="xl">
              <Text ta="center" c="dimmed" size="sm">
                Trusted by cloud storage providers
              </Text>
              <Group justify="center" gap="lg" mt="md">
                <Image src={GooggleDriveIcon} w={30} />
                <Image src={DropboxIcon} w={30} />
                <Image src={OneDriveIcon} w={30} />
              </Group>
            </Box>
          </AnimatedSection>
        </Container>
        {/* Data Usage & Permissions Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          style={{ overflow: 'hidden' }}
          py={isMobileView ? 40 : 60}
          id="data-usage"
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                How We Handle Your Data
              </Title>
              <Text
                ta="center"
                c="dimmed"
                maw={700}
                fz={isMobileView ? 14 : 16}
              >
                Transparency about data access, usage, and your control over
                permissions
              </Text>
            </Stack>

            <SimpleGrid
              cols={{ base: 1, md: 2 }}
              spacing={isMobileView ? 'md' : 'xl'}
              mt="xl"
            >
              <Card
                shadow="sm"
                padding={isMobileView ? 'md' : 'xl'}
                radius="md"
              >
                <Stack gap="md">
                  <Group>
                    <ThemeIcon
                      size={isMobileView ? 40 : 50}
                      radius="md"
                      color="blue"
                      variant="light"
                    >
                      <ICONS.IconShieldHalfFilled size={24} />
                    </ThemeIcon>
                    <Title order={4} fz={isMobileView ? 16 : 18}>
                      What Permissions We Request
                    </Title>
                  </Group>
                  <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                    <strong>Google Drive:</strong> Read and manage your files to
                    enable viewing, organizing, and transferring
                    <br />
                    <br />
                    <strong>OneDrive:</strong> Access to read, write, and
                    organize your files across folders
                    <br />
                    <br />
                    <strong>Dropbox:</strong> File management permissions to
                    view, move, and organize your content
                  </Text>
                </Stack>
              </Card>

              <Card
                shadow="sm"
                padding={isMobileView ? 'md' : 'xl'}
                radius="md"
              >
                <Stack gap="md">
                  <Group>
                    <ThemeIcon
                      size={isMobileView ? 40 : 50}
                      radius="md"
                      color="green"
                      variant="light"
                    >
                      <ICONS.IconCheck size={24} />
                    </ThemeIcon>
                    <Title order={4} fz={isMobileView ? 16 : 18}>
                      Your Rights & Control
                    </Title>
                  </Group>
                  <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                    <strong>Revoke Access:</strong> Disconnect All Cloud Hub
                    from your accounts anytime through your cloud provider
                    settings or our dashboard
                    <br />
                    <br />
                    <strong>Data Portability:</strong> All your files remain in
                    your original cloud accounts - you can access them directly
                    anytime
                    <br />
                    <br />
                    <strong>No Vendor Lock-in:</strong> Stop using our service
                    without losing any of your data or file organization
                    <br />
                    <br />
                    <em>
                      We provide tools to help you manage permissions and
                      monitor our access to your accounts.
                    </em>
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>
          </AnimatedSection>
        </Container>
        {/* Data Flow and Processing */}
        <Box py={isMobileView ? 40 : 60} id="data-flow">
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
            style={{ overflow: 'hidden' }}
          >
            <AnimatedSection>
              <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
                <Title order={2} ta="center" fz={isMobileView ? 24 : 30}>
                  How Your Data Flows Through Our System
                </Title>
                <Text
                  ta="center"
                  c="dimmed"
                  maw={700}
                  fz={isMobileView ? 14 : 16}
                >
                  Complete transparency about data processing and storage
                </Text>
              </Stack>
            </AnimatedSection>

            {isMobileView ? (
              <Box mt="xl">
                <MobileCarousel items={dataFlow} isMobile={isMobileView} />
              </Box>
            ) : (
              <StaggerContainer staggerDelay={0.1}>
                <SimpleGrid
                  cols={{ base: 1, sm: 2, lg: 4 }}
                  spacing="xl"
                  mt="xl"
                >
                  {dataFlow.map((data, index) => (
                    <Card
                      key={index}
                      shadow="sm"
                      padding="xl"
                      radius="md"
                      style={{
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      <Stack gap="md">
                        <ThemeIcon
                          size={isMobileView ? 40 : 50}
                          radius="md"
                          color={data.color}
                          variant="light"
                        >
                          <data.icon size={isMobileView ? 20 : 24} />
                        </ThemeIcon>
                        <Title order={5} fz={isMobileView ? 14 : 16}>
                          {data.title}
                        </Title>
                        <Text c="dimmed" size={isMobileView ? 'xs' : 'sm'}>
                          {data.description}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </StaggerContainer>
            )}
          </Container>
        </Box>
        {/* CTA Section */}
        <AnimatedSection>
          <Box
            py={isMobileView ? 40 : 60}
            style={{
              backgroundColor: '#0284c7',
            }}
          >
            <Container size="var(--mantine-breakpoint-xxxl)">
              <Stack align="center" gap={isMobileView ? 'md' : 'xl'}>
                <Title
                  order={2}
                  ta="center"
                  c="white"
                  fz={isMobileView ? 24 : 30}
                >
                  Start Managing Your Cloud Storage Smarter
                </Title>
                <Text
                  ta="center"
                  c="white"
                  opacity={0.9}
                  fz={isMobileView ? 14 : 16}
                  maw={600}
                >
                  Join thousands of users who have simplified their cloud
                  storage management
                </Text>
                <Button
                  size={isXs ? 'sm' : isMobileView ? 'md' : 'lg'}
                  variant="white"
                  c={'#0284c7'}
                  style={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    },
                  }}
                  fz={isXs ? 13 : isMobileView ? 14 : 16}
                  onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                >
                  Get Started For Free
                </Button>
              </Stack>
            </Container>
          </Box>
        </AnimatedSection>
        {/* Footer */}
        <LandingFooter {...{ isMd, isSm, navigate }} />
      </AppShell.Main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .mantine-Card-root {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mantine-Button-root {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mantine-ThemeIcon-root {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .mantine-Carousel-indicator {
          transition: all 0.3s ease;
        }

         .mantine-Card-root:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
        
        .mantine-Carousel-slide {
          transition: all 0.3s ease;
          padding: 0 4px;
        }
        
        /* Ensure no horizontal overflow */
        * {
          box-sizing: border-box;
        }
        
        .mantine-Container-root {
          max-width: 100%;
          overflow-x: hidden;
        }

        .mantine-Button-root:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
      `}</style>

      {location.pathname === '/' && <TawkToWidget />}
    </AppShell>
  );
}
