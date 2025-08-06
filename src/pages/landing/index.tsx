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
  Center,
  Paper,
  ThemeIcon,
  SimpleGrid,
  Anchor,
  AppShell,
  Burger,
  Avatar,
  Divider,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconCloud,
  IconDatabase,
  IconShare,
  IconDashboard,
  IconUpload,
  IconRefresh,
  IconEye,
  IconTransfer,
  IconFolders,
  IconDragDrop,
  IconDeviceDesktop,
  IconShield,
  IconLock,
  IconCheck,
  IconDownload,
  IconArrowRight,
} from '@tabler/icons-react';

export default function UnifidriveLanding() {
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const features = [
    {
      icon: IconCloud,
      title: 'Connect Your Cloud Drives',
      description:
        'Securely link your Google Drive, OneDrive, and Dropbox accounts with OAuth authentication.',
      color: 'blue',
    },
    {
      icon: IconDatabase,
      title: 'Manage Files in One Place',
      description:
        'Access all your cloud files through a single, intuitive dashboard interface.',
      color: 'cyan',
    },
    {
      icon: IconShare,
      title: 'Smart Distribution',
      description:
        'Let our AI automatically optimize storage by distributing files based on available space.',
      color: 'teal',
    },
  ];

  const powerfulFeatures = [
    {
      icon: IconDashboard,
      title: 'Unified Dashboard',
      description:
        'View and manage all your cloud storage accounts from one central location.',
      color: 'blue',
    },
    {
      icon: IconUpload,
      title: 'Smart Distribution',
      description:
        'Automatically upload files to drives with the most available space.',
      color: 'green',
    },
    {
      icon: IconDragDrop,
      title: 'Drag & Drop Upload',
      description:
        'Effortlessly upload files with intuitive drag-and-drop functionality.',
      color: 'orange',
    },
    {
      icon: IconTransfer,
      title: 'Cross-Cloud Transfer',
      description:
        'Move files between different cloud storage providers seamlessly.',
      color: 'indigo',
    },
    {
      icon: IconFolders,
      title: 'Folder Sync',
      description:
        'Keep folders synchronized across multiple cloud storage platforms.',
      color: 'violet',
    },
    {
      icon: IconEye,
      title: 'File Preview',
      description:
        'Preview documents, images, and videos without downloading them.',
      color: 'pink',
    },
  ];

  const benefits = [
    {
      icon: IconDownload,
      title: 'Save Storage Costs',
      description: 'Optimize usage across accounts',
      color: 'green',
    },
    {
      icon: IconShield,
      title: 'Centralized Access',
      description: 'One place for all your files',
      color: 'blue',
    },
    {
      icon: IconDeviceDesktop,
      title: 'Cross-Platform',
      description: 'Works on desktop and mobile',
      color: 'orange',
    },
    {
      icon: IconRefresh,
      title: 'Seamless Integration',
      description: 'Native cloud provider APIs',
      color: 'purple',
    },
  ];

  const security = [
    {
      icon: IconLock,
      title: 'OAuth 2.0 Security',
      description:
        'Industry-standard authentication protocol ensures secure access to your accounts.',
      color: 'green',
    },
    {
      icon: IconDatabase,
      title: 'No Data Storage',
      description:
        'We never store your files on our servers. Everything stays in your cloud accounts.',
      color: 'blue',
    },
    {
      icon: IconCheck,
      title: 'Revoke Anytime',
      description:
        'Full control over permissions. Revoke access securely whenever you want.',
      color: 'red',
    },
  ];

  const NavigationItems = () => (
    <>
      <Anchor
        href="#features"
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
      >
        Features
      </Anchor>
      <Anchor
        href="#pricing"
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
      >
        Pricing
      </Anchor>
      <Anchor
        href="#security"
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
      >
        Security
      </Anchor>
      <Anchor
        href="#faq"
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
      >
        FAQ
      </Anchor>
    </>
  );

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
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            <Group>
              <ThemeIcon
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                <IconCloud size={20} />
              </ThemeIcon>
              <Title order={3} c="blue">
                Unifidrive
              </Title>
            </Group>

            {!isMobile ? (
              <Group>
                <NavigationItems />
                <Group gap="xs">
                  <Button variant="subtle">Sign In</Button>
                  <Button>Get Started</Button>
                </Group>
              </Group>
            ) : (
              <Burger
                opened={opened}
                onClick={opened ? close : open}
                size="sm"
              />
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <NavigationItems />
          <Divider />
          <Button variant="subtle" fullWidth>
            Sign In
          </Button>
          <Button fullWidth>Get Started</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Hero Section */}
        <Container size="xl" py={80}>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Title order={1} size={isMobile ? 'h2' : 'h1'} fw={800}>
                  One Platform.{' '}
                  <Text span c="blue" inherit>
                    All Your Cloud Drives.
                  </Text>
                </Title>

                <Text size="lg" c="dimmed" maw={500}>
                  Unifidrive lets you connect Google Drive, OneDrive, and
                  Dropbox in one place and smartly manage your storage.
                </Text>

                <Group>
                  <Button
                    size="lg"
                    rightSection={<IconArrowRight size={18} />}
                    style={{
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button variant="outline" size="lg">
                    See How It Works
                  </Button>
                </Group>

                <Group gap="xl">
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      Under 2.0 Second
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      No files Stored
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Center h="100%">
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
                    {/* Cloud Icons */}
                    <Group justify="center" gap="lg">
                      <ThemeIcon size={40} variant="white" color="gray">
                        <IconCloud size={24} />
                      </ThemeIcon>
                      <ThemeIcon size={40} variant="white" color="gray">
                        <IconCloud size={24} />
                      </ThemeIcon>
                    </Group>

                    {/* File Icons */}
                    <SimpleGrid cols={5} spacing="sm">
                      {Array.from({ length: 10 }).map((_, i) => (
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
              </Center>
            </Grid.Col>
          </Grid>
        </Container>

        {/* How It Works Section */}
        <Box bg="gray.0" py={80}>
          <Container size="xl">
            <Stack align="center" gap="xl">
              <Title order={2} ta="center">
                How It Works
              </Title>
              <Text ta="center" c="dimmed">
                Get started in just 3 simple steps
              </Text>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    style={{
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon
                        size={60}
                        radius="xl"
                        color={feature.color}
                        variant="light"
                      >
                        <feature.icon size={30} />
                      </ThemeIcon>
                      <Title order={4} ta="center">
                        {feature.title}
                      </Title>
                      <Text ta="center" c="dimmed" size="sm">
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
        <Container size="xl" py={80}>
          <Stack align="center" gap="xl">
            <Title order={2} ta="center">
              Powerful Features
            </Title>
            <Text ta="center" c="dimmed" maw={600}>
              Everything you need to manage your cloud storage efficiently
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" w="100%">
              {powerfulFeatures.map((feature, index) => (
                <Paper
                  key={index}
                  p="xl"
                  radius="md"
                  style={{
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#228be6',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack gap="md">
                    <ThemeIcon
                      size={50}
                      radius="md"
                      color={feature.color}
                      variant="light"
                    >
                      <feature.icon size={24} />
                    </ThemeIcon>
                    <Title order={5}>{feature.title}</Title>
                    <Text c="dimmed" size="sm">
                      {feature.description}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>

        {/* Why Choose Section */}
        <Box bg="gray.0" py={80}>
          <Container size="xl">
            <Stack align="center" gap="xl">
              <Title order={2} ta="center">
                Why Choose Unifidrive?
              </Title>

              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl" w="100%">
                {benefits.map((benefit, index) => (
                  <Stack key={index} align="center" gap="md">
                    <ThemeIcon
                      size={60}
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
                      <benefit.icon size={30} />
                    </ThemeIcon>
                    <Title order={5} ta="center">
                      {benefit.title}
                    </Title>
                    <Text ta="center" c="dimmed" size="sm">
                      {benefit.description}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>

        {/* Security Section */}
        <Container size="xl" py={80}>
          <Stack align="center" gap="xl">
            <Title order={2} ta="center">
              Your Data is Secure
            </Title>
            <Text ta="center" c="dimmed" maw={600}>
              We prioritize your privacy and security above everything else
            </Text>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" w="100%">
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
                    <Title order={4} ta="center">
                      {item.title}
                    </Title>
                    <Text ta="center" c="dimmed" size="sm">
                      {item.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            <Text ta="center" c="dimmed" size="sm" mt="xl">
              Trusted by cloud storage providers
            </Text>
            <Group justify="center" gap="xl">
              <Avatar size="lg" radius="md" bg="gray.1">
                G
              </Avatar>
              <Avatar size="lg" radius="md" bg="gray.1">
                M
              </Avatar>
              <Avatar size="lg" radius="md" bg="gray.1">
                D
              </Avatar>
            </Group>
          </Stack>
        </Container>

        {/* CTA Section */}
        <Box
          py={80}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Container size="xl">
            <Stack align="center" gap="xl">
              <Title order={2} ta="center" c="white">
                Start Managing Your Cloud Storage Smarter
              </Title>
              <Text ta="center" c="white" maw={600} opacity={0.9}>
                Join thousands of users who have simplified their cloud storage
                management
              </Text>
              <Button
                size="xl"
                variant="white"
                color="dark"
                style={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Get Started For Free
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Footer */}
        <Box bg="dark" py={40}>
          <Container size="xl">
            <Grid>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Stack gap="sm">
                  <Group>
                    <ThemeIcon
                      size="sm"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      <IconCloud size={16} />
                    </ThemeIcon>
                    <Title order={4} c="white">
                      Unifidrive
                    </Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Simply your cloud storage management for everyone.
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 9 }}>
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xl">
                  <Stack gap="sm">
                    <Title order={6} c="white">
                      Product
                    </Title>
                    <Anchor size="sm" c="dimmed">
                      Features
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Pricing
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Security
                    </Anchor>
                  </Stack>
                  <Stack gap="sm">
                    <Title order={6} c="white">
                      Support
                    </Title>
                    <Anchor size="sm" c="dimmed">
                      FAQ
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Contact
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Help Center
                    </Anchor>
                  </Stack>
                  <Stack gap="sm">
                    <Title order={6} c="white">
                      Legal
                    </Title>
                    <Anchor size="sm" c="dimmed">
                      Privacy Policy
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Terms of Service
                    </Anchor>
                  </Stack>
                </SimpleGrid>
              </Grid.Col>
            </Grid>

            <Divider my="xl" color="dark.4" />
            <Text ta="center" size="sm" c="dimmed">
              © 2024 Unifidrive. All rights reserved.
            </Text>
          </Container>
        </Box>
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
