import {
  AppShell,
  Container,
  Title,
  Text,
  Card,
  Button,
  Stack,
  SimpleGrid,
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

const PricingPage = () => {
  const { isMd, isSm } = useResponsive();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const plans = [
    {
      title: 'Free',
      price: '$0',
      features: ['1 Connected Cloud', '5GB File Transfer', 'Basic Support'],
      highlight: false,
    },
    {
      title: 'Pro',
      price: '$9.99/mo',
      features: [
        '3 Connected Clouds',
        'Unlimited File Transfer',
        'Priority Support',
      ],
      highlight: true,
    },
    {
      title: 'Business',
      price: '$29.99/mo',
      features: ['Unlimited Clouds', 'Advanced Security', 'Team Collaboration'],
      highlight: false,
    },
  ];

  const comparison = [
    { feature: 'Connected Clouds', free: '1', pro: '3', business: 'Unlimited' },
    {
      feature: 'File Transfer',
      free: '5GB / mo',
      pro: 'Unlimited',
      business: 'Unlimited',
    },
    {
      feature: 'Collaboration',
      free: '—',
      pro: '—',
      business: 'Teams & Roles',
    },
    {
      feature: 'Support',
      free: 'Basic',
      pro: 'Priority',
      business: 'Dedicated Manager',
    },
    {
      feature: 'Security',
      free: 'Standard',
      pro: 'Advanced',
      business: 'Enterprise-grade',
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
      <LandingHeader {...{ opened, open, close, navigate }} />

      <AppShell.Main pt={70} px={0} pb={0}>
        {/* Pricing Plans */}
        <Container size="xl" py={isSm ? 40 : 80}>
          <AnimatedSection>
            <Stack align="center" gap="md">
              <Title order={2}>Choose Your Plan</Title>
              <Text c="dimmed" ta="center" maw={600}>
                Flexible pricing for individuals and teams
              </Text>
            </Stack>
          </AnimatedSection>

          <StaggerContainer staggerDelay={0.15}>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="xl">
              {plans.map((plan, i) => (
                <Card
                  key={i}
                  shadow="md"
                  radius="md"
                  padding="xl"
                  style={{
                    border: plan.highlight
                      ? '2px solid #0284c7'
                      : '1px solid #e9ecef',
                    transform: plan.highlight ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Stack gap="md" align="center">
                    <Title order={3}>{plan.title}</Title>
                    <Title order={2} c="blue">
                      {plan.price}
                    </Title>
                    <Stack gap="xs">
                      {plan.features.map((f, idx) => (
                        <Text key={idx} size="sm" c="dimmed">
                          • {f}
                        </Text>
                      ))}
                    </Stack>
                    <Button
                      size="md"
                      fullWidth
                      onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                    >
                      Get Started
                    </Button>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </StaggerContainer>
        </Container>

        {/* Comparison Table */}
        <Container size="lg" py={isSm ? 40 : 80}>
          <AnimatedSection>
            <Stack gap="md" align="center" mb="lg">
              <Title order={2}>Compare Plans</Title>
              <Text c="dimmed" ta="center" maw={700}>
                See what you get with each plan
              </Text>
            </Stack>
          </AnimatedSection>

          <Card shadow="sm" radius="md" withBorder>
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
        </Container>

        {/* Why Upgrade Section */}
        <Container
          size="xl"
          py={isSm ? 40 : 80}
          bg="linear-gradient(120deg,#f8fafc,#f0f9ff)"
        >
          <AnimatedSection>
            <Stack align="center" gap="md">
              <Title order={2}>Why Upgrade?</Title>
              <Text c="dimmed" ta="center" maw={600}>
                Unlock powerful features and better support to boost your
                productivity
              </Text>
            </Stack>
          </AnimatedSection>
          <StaggerContainer staggerDelay={0.15}>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={4}>Save Time</Title>
                <Text c="dimmed" size="sm">
                  Automate file transfers and manage all your drives from one
                  dashboard.
                </Text>
              </Card>
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={4}>Better Security</Title>
                <Text c="dimmed" size="sm">
                  Get enterprise-grade security with OAuth, encryption, and
                  role-based access.
                </Text>
              </Card>
              <Card shadow="sm" radius="md" padding="lg">
                <Title order={4}>Team Collaboration</Title>
                <Text c="dimmed" size="sm">
                  Share access with your team and manage permissions with ease.
                </Text>
              </Card>
            </SimpleGrid>
          </StaggerContainer>
        </Container>

        <LandingFooter {...{ isMd, isSm, navigate }} />
      </AppShell.Main>
    </AppShell>
  );
};

export default PricingPage;
