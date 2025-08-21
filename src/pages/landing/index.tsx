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
import { AUTH_ROUTES } from '../../routing/routes';
import GooggleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import LandingPagwSvg from '../../assets/svgs/LandingPage.svg';
import useResponsive from '../../hooks/use-responsive';
import { ICONS } from '../../assets/icons';
import LandingHeader from './LandingHeader';
import LandingFooter from './LandingFooter';
import AnimatedSection from './components/AnimatedSection';
import StaggerContainer from './components/StaggerContainer';
import MobileCarousel from './components/MobileCarousel';
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

export default function UnifidriveLanding() {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isMd, isSm, isXs } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === AUTH_ROUTES.LANDING.url) {
      document.title = 'AllCloudHub';
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
                      size={isXs ? 'sm' : isMobile ? 'md' : 'lg'}
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
                      fz={isXs ? 13 : isMobile ? 14 : 16}
                      onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                    >
                      Get Started For Free
                    </Button>
                    <Button
                      variant="outline"
                      size={isXs ? 'sm' : isMobile ? 'md' : 'lg'}
                      fz={isXs ? 13 : isMobile ? 14 : 16}
                    >
                      See How It Works
                    </Button>
                  </Group>

                  <Group gap={isMobile ? 'md' : 'xl'}>
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

        {/* How It Works Section */}
        <Box py={isMobile ? 40 : 60}>
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
            style={{ overflow: 'hidden' }}
          >
            <AnimatedSection>
              <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
                <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                  How It Works
                </Title>
                <Text ta="center" c="dimmed" fz={isMobile ? 14 : 16}>
                  Get started in just 3 simple steps
                </Text>
              </Stack>
            </AnimatedSection>

            {isMobile ? (
              <Box mt="xl">
                <MobileCarousel items={features} isMobile={isMobile} />
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
              </StaggerContainer>
            )}
          </Container>
        </Box>

        {/* Powerful Features Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobile ? 40 : 60}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
          id="powerful-features"
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                Powerful Features
              </Title>
              <Text ta="center" c="dimmed" maw={600} fz={isMobile ? 14 : 16}>
                Everything you need to manage your cloud storage efficiently
              </Text>
            </Stack>
          </AnimatedSection>

          {isMobile ? (
            <Box mt="xl">
              <MobileCarousel items={powerfulFeatures} isMobile={isMobile} />
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
            </StaggerContainer>
          )}
        </Container>

        {/* Why Choose Section */}
        <Box py={isMobile ? 40 : 60}>
          <Container
            size="var(--mantine-breakpoint-xxl)"
            px={isSm ? 20 : isMd ? 40 : 120}
            style={{ overflow: 'hidden' }}
          >
            <AnimatedSection>
              <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
                <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                  Why Choose AllCloudHub?
                </Title>
              </Stack>
            </AnimatedSection>

            {isMobile ? (
              <Box mt="xl">
                <MobileCarousel items={benefits} isMobile={isMobile} />
              </Box>
            ) : (
              <StaggerContainer staggerDelay={0.1}>
                <SimpleGrid cols={{ base: 2, md: 4 }} mt={20} spacing="xl">
                  {benefits.map((benefit, index) => (
                    <Stack key={index} align="center" gap="md">
                      <ThemeIcon
                        size={isMobile ? 40 : 60}
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
                        <benefit.icon size={isMobile ? 20 : 30} />
                      </ThemeIcon>
                      <Title order={5} ta="center" fz={isMobile ? 14 : 16}>
                        {benefit.title}
                      </Title>
                      <Text
                        ta="center"
                        c="dimmed"
                        size={isMobile ? 'xs' : 'sm'}
                      >
                        {benefit.description}
                      </Text>
                    </Stack>
                  ))}
                </SimpleGrid>
              </StaggerContainer>
            )}
          </Container>
        </Box>

        {/* Security Section */}
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          py={isMobile ? 40 : 60}
          bg={'linear-gradient(120deg, #f8fafc 0%, #f0f9ff 100%)'}
          id="security-features"
        >
          <AnimatedSection>
            <Stack align="center" gap={isMobile ? 'md' : 'xl'}>
              <Title order={2} ta="center" fz={isMobile ? 24 : 30}>
                Your Data is Secure
              </Title>
              <Text ta="center" c="dimmed" maw={600} fz={isMobile ? 14 : 16}>
                We prioritize your privacy and security above everything else
              </Text>
            </Stack>
          </AnimatedSection>

          {isMobile ? (
            <Box mt="xl">
              <MobileCarousel items={security} isMobile={isMobile} />
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
                      <Text
                        ta="center"
                        c="dimmed"
                        size={isMobile ? 'xs' : 'sm'}
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

        {/* CTA Section */}
        <AnimatedSection>
          <Box
            py={isMobile ? 40 : 60}
            style={{
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
                  Join thousands of users who have simplified their cloud
                  storage management
                </Text>
                <Button
                  size={isXs ? 'sm' : isMobile ? 'md' : 'lg'}
                  variant="white"
                  c={'#0284c7'}
                  style={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                    },
                  }}
                  fz={isXs ? 13 : isMobile ? 14 : 16}
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
    </AppShell>
  );
}
