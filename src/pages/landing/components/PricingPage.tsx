import {
  AppShell,
  Container,
  Title,
  Text,
  Card,
  Button,
  Stack,
  SimpleGrid,
  Group,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router';
import LandingHeader from '../LandingHeader';
import AnimatedSection from './AnimatedSection';
import StaggerContainer from './StaggerContainer';
import { AUTH_ROUTES } from '../../../routing/routes';
import LandingFooter from '../LandingFooter';
import useResponsive from '../../../hooks/use-responsive';
import { useEffect } from 'react';
import { ICONS } from '../../../assets/icons';

const PricingPage = () => {
  const { isMd, isSm, isXs } = useResponsive();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const plans = [
    {
      title: 'Free',
      price: '$0',
      features: [
        'Linking multiple accounts',
        'Linking multiple platforms',
        'Unlimited linked accounts',
        'Recent Files',
        'Multi-cloud file search',
        'Real-time Sync',
        'Email Support',
      ],
      highlight: true,
    },
    {
      title: 'Pro',
      // price: '$9.99/mo',
      features: [
        'Everything in Free plan plus more',
        'Coming Soon',
        'Exciting Features',
      ],
      highlight: false,
    },
    {
      title: 'Business',
      // price: '$29.99/mo',
      features: [
        'Everything in Pro plan plus more',
        'Coming Soon',
        'Exciting Features',
      ],
      highlight: false,
    },
  ];

  // const comparison = [
  //   { feature: 'Connected Clouds', free: '1', pro: '3', business: 'Unlimited' },
  //   {
  //     feature: 'File Transfer',
  //     free: '5GB / mo',
  //     pro: 'Unlimited',
  //     business: 'Unlimited',
  //   },
  //   {
  //     feature: 'Collaboration',
  //     free: '—',
  //     pro: '—',
  //     business: 'Teams & Roles',
  //   },
  //   {
  //     feature: 'Support',
  //     free: 'Basic',
  //     pro: 'Priority',
  //     business: 'Dedicated Manager',
  //   },
  //   {
  //     feature: 'Security',
  //     free: 'Standard',
  //     pro: 'Advanced',
  //     business: 'Enterprise-grade',
  //   },
  // ];

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
      <LandingHeader {...{ opened, open, close, navigate }} />

      <AppShell.Main pt={70} px={0} pb={0}>
        {/* Pricing Plans */}
        <Container size="xl" py={isSm ? 40 : 80}>
          <AnimatedSection>
            <Stack align="center" gap="md">
              <Title order={isXs ? 3 : 2}>Choose Your Plan</Title>
              <Text c="dimmed" ta="center" maw={600}>
                Flexible pricing for individuals and business
              </Text>
            </Stack>
          </AnimatedSection>

          <StaggerContainer staggerDelay={0.15}>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3 }}
              spacing={isXs ? 'md' : 'xl'}
              mt={isXs ? 'md' : 'xl'}
            >
              {plans.map((plan, i) => (
                <Card
                  key={i}
                  shadow="md"
                  radius="md"
                  padding={isXs ? 'md' : 'xl'}
                  style={{
                    border: plan.highlight
                      ? '2px solid #0284c7'
                      : '1px solid #e9ecef',
                    transform: plan.highlight ? 'scale(1.05)' : 'scale(1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {plan.title !== 'Free' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: '#fbbf24',
                        color: '#000',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Coming Soon
                    </div>
                  )}

                  <Stack
                    gap={isXs ? 'sm' : 'md'}
                    align="center"
                    style={{ flexGrow: 1 }}
                  >
                    <Title order={isXs ? 4 : 3}>{plan.title}</Title>
                    <Title order={isXs ? 3 : 2} c="blue">
                      {plan.price}
                    </Title>

                    <Stack gap="xs" style={{ flexGrow: 1, width: '100%' }}>
                      {plan.features.map((f, idx) => {
                        const isComingSoon =
                          f.toLowerCase().includes('coming soon') ||
                          f.toLowerCase().includes('exciting');

                        return (
                          <Group key={idx} align="flex-start" gap="xs">
                            <ThemeIcon
                              size={20}
                              radius="xl"
                              color={isComingSoon ? 'gray' : 'teal'}
                              variant="light"
                            >
                              {isComingSoon ? (
                                <ICONS.IconClock size={14} />
                              ) : (
                                <ICONS.IconCheck size={14} />
                              )}
                            </ThemeIcon>
                            <Text
                              fz={isXs ? '13px' : 'sm'}
                              c={isComingSoon ? 'gray.6' : 'dimmed'}
                              style={{
                                fontStyle: isComingSoon ? 'italic' : 'normal',
                              }}
                            >
                              {f}
                            </Text>
                          </Group>
                        );
                      })}
                    </Stack>
                  </Stack>

                  {plan.title !== 'Free' && (
                    <Stack
                      align="center"
                      gap="xs"
                      mt="lg"
                      style={{ opacity: 0.7 }}
                    >
                      <ThemeIcon
                        size={50}
                        radius="xl"
                        color="blue"
                        variant="light"
                      >
                        {plan.title === 'Pro' ? (
                          <ICONS.IconRocket size={28} />
                        ) : (
                          <ICONS.IconBuilding size={28} />
                        )}
                      </ThemeIcon>
                      <Text
                        fz={isXs ? 'sm' : 'md'}
                        fw={500}
                        style={{
                          animation: 'fadePulse 2s infinite',
                          textAlign: 'center',
                        }}
                      >
                        {plan.title === 'Pro'
                          ? 'More powerful features '
                          : 'More Business features '}
                        coming Soon
                      </Text>
                    </Stack>
                  )}

                  {/* CTA Button fixed at bottom */}
                  {plan.title === 'Free' ? (
                    <Button
                      size={isXs ? 'sm' : 'md'}
                      fullWidth
                      mt="md"
                      disabled={plan.title !== 'Free'} // disable Pro/Business until features are ready
                      onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                    >
                      {plan.title === 'Free' ? 'Get Started' : 'Notify Me'}
                    </Button>
                  ) : null}
                </Card>
              ))}
            </SimpleGrid>
          </StaggerContainer>
        </Container>

        {/* Contact Section */}
        <Container size="xl" py={40}>
          <Card
            shadow="lg"
            radius="xl"
            p={40}
            style={{
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: 'white',
            }}
          >
            <SimpleGrid
              // cols={{ base: 1, md: 2 }}
              cols={2}
              spacing="lg"
              style={{ minHeight: '220px' }}
            >
              {/* Left Content */}
              <Stack gap="md" align="flex-start" justify="center">
                <Title order={isXs ? 4 : 2} c="white">
                  Be Free to Contact Us
                </Title>
                <Text fz={isXs ? 'sm' : 'md'} c="gray.3" maw={500}>
                  Have questions or run into any issues?
                </Text>
                <Text fz={isXs ? 'sm' : 'md'} c="gray.3" maw={500}>
                  We’re here to help — reach out anytime.
                </Text>
                <Button
                  size={isXs ? 'sm' : 'md'}
                  radius="md"
                  color="blue"
                  mt={10}
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform =
                      'scale(1)';
                  }}
                  onClick={() => navigate('/contact')}
                >
                  Contact Us
                </Button>
              </Stack>

              {/* Right Side Icon */}
              <Group justify="flex-end">
                <ThemeIcon
                  size={isSm ? 110 : 150}
                  radius="xl"
                  variant="light"
                  color="blue"
                  style={{
                    background: 'white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <ICONS.IconMail size={isSm ? 60 : 80} color="#0284c7" />
                </ThemeIcon>
              </Group>
            </SimpleGrid>
          </Card>
        </Container>

        {/* Comparison Table */}
        {/* <Container size="lg">
          <AnimatedSection>
            <Stack gap="md" align="center" mb="lg">
              <Title order={isXs ? 3 : 2}>Compare Plans</Title>
              <Text c="dimmed" ta="center" maw={700}>
                See what you get with each plan
              </Text>
            </Stack>
          </AnimatedSection>

          {!isSm ? (
            <Card shadow="sm" radius={'md'} withBorder>
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" p="md">
                <Text fw={600}>Features</Text>
                <Text fw={600} ta="center">
                  Free
                </Text>
                <Text fw={600} ta="center">
                  Pro
                </Text>
                <Text fw={600} ta="center">
                  Business
                </Text>
              </SimpleGrid>

              {comparison.map((row, idx) => (
                <SimpleGrid
                  key={idx}
                  cols={{ base: 2, sm: 4 }}
                  spacing="md"
                  p="md"
                  style={{ borderTop: '1px solid #e9ecef' }}
                >
                  <Text>{row.feature}</Text>
                  <Text ta="center">{row.free}</Text>
                  <Text ta="center">{row.pro}</Text>
                  <Text ta="center">{row.business}</Text>
                </SimpleGrid>
              ))}
            </Card>
          ) : (
            <Stack p="sm" gap="sm">
              {comparison.map(row => (
                <Card key={row.feature} withBorder radius="md" padding="md">
                  <Stack gap={8}>
                    <Text fw={600} fz={'sm'}>
                      {row.feature}
                    </Text>

                    <SimpleGrid cols={2} spacing={6}>
                      <Text c="dimmed" fz={'sm'}>
                        Free
                      </Text>
                      <Text ta="right" fz={'sm'}>
                        {row.free}
                      </Text>

                      <Text c="dimmed" fz={'sm'}>
                        Pro
                      </Text>
                      <Text ta="right" fz={'sm'}>
                        {row.pro}
                      </Text>

                      <Text c="dimmed" fz={'sm'}>
                        Business
                      </Text>
                      <Text ta="right" fz={'sm'}>
                        {row.business}
                      </Text>
                    </SimpleGrid>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Container> */}

        {/* Why Upgrade Section */}
        {/* <Container
          size="xl"
          py={isSm ? 40 : 80}
          mt={10}
          bg="linear-gradient(120deg,#f8fafc,#f0f9ff)"
        >
          <AnimatedSection>
            <Stack align="center" gap="md">
              <Title order={isXs ? 3 : 2}>Why Upgrade?</Title>
              <Text c="dimmed" ta="center" maw={600}>
                Unlock powerful features and better support to boost your
                productivity
              </Text>
            </Stack>
          </AnimatedSection>
          <StaggerContainer staggerDelay={0.15}>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={isXs ? 5 : 4}>Save Time</Title>
                <Text c="dimmed" fz={isXs ? '13px' : 'sm'}>
                  Automate file transfers and manage all your drives from one
                  dashboard.
                </Text>
              </Card>
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={isXs ? 5 : 4}>Better Security</Title>
                <Text c="dimmed" fz={isXs ? '13px' : 'sm'}>
                  Get enterprise-grade security with OAuth, encryption, and
                  role-based access.
                </Text>
              </Card>
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={isXs ? 5 : 4}>Team Collaboration</Title>
                <Text c="dimmed" fz={isXs ? '13px' : 'sm'}>
                  Share access with your team and manage permissions with ease.
                </Text>
              </Card>
            </SimpleGrid>
          </StaggerContainer>
        </Container> */}

        <LandingFooter {...{ isMd, isSm, navigate }} />
      </AppShell.Main>
      <style>
        {`
          @keyframes fadePulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
    </AppShell>
  );
};

export default PricingPage;
