import {
  Anchor,
  Box,
  Container,
  Divider,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { AUTH_ROUTES } from '../../routing/routes';
import type { NavigateFunction } from 'react-router';

interface FooterProps {
  isSm: boolean;
  isMd: boolean;
  navigate: NavigateFunction;
}

const LandingFooter: React.FC<FooterProps> = ({
  isSm,
  isMd,
  navigate = () => {},
}) => {
  return (
    <Box bg="dark" py={40}>
      <Container
        size="var(--mantine-breakpoint-xxl)"
        px={isSm ? 20 : isMd ? 40 : 120}
      >
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack gap="sm">
              <Group>
                <ThemeIcon
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                >
                  <ICONS.IconCloud size={16} />
                </ThemeIcon>
                <Title order={4} c="white">
                  AllCloudHub
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                Simply your cloud storage management for everyone.
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={isSm ? 'md' : 'xl'}>
              <Stack gap="sm">
                <Title order={6} c="white">
                  Product
                </Title>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() => {
                    if (location.pathname !== AUTH_ROUTES.LANDING.url) {
                      navigate(AUTH_ROUTES.LANDING.url, {
                        state: { scrollTo: 'powerful-features' },
                      });
                    } else {
                      const element =
                        document.getElementById('powerful-features');
                      if (element) {
                        const yOffset = -70;
                        const y =
                          element.getBoundingClientRect().top +
                          window.scrollY +
                          yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Features
                </Anchor>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() => navigate(AUTH_ROUTES.PRICING.url)}
                >
                  Pricing
                </Anchor>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() => {
                    if (location.pathname !== AUTH_ROUTES.LANDING.url) {
                      navigate(AUTH_ROUTES.LANDING.url, {
                        state: { scrollTo: 'security-features' },
                      });
                    } else {
                      const element =
                        document.getElementById('security-features');
                      if (element) {
                        const yOffset = -70;
                        const y =
                          element.getBoundingClientRect().top +
                          window.scrollY +
                          yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  Security
                </Anchor>
              </Stack>
              <Stack gap="sm">
                <Title order={6} c="white">
                  Support
                </Title>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() => navigate(AUTH_ROUTES.FAQ.url)}
                >
                  FAQ
                </Anchor>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() => navigate(AUTH_ROUTES.CONTACT.url)}
                >
                  Contact
                </Anchor>
                {/* <Anchor size="sm" c="dimmed">
                  Help Center
                </Anchor> */}
              </Stack>
              <Stack gap="sm">
                <Title order={6} c="white">
                  Legal
                </Title>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() =>
                    window.open(AUTH_ROUTES.PRIVACY_POLICY.url, '_blank')
                  }
                >
                  Privacy Policy
                </Anchor>
                <Anchor
                  size="sm"
                  c="dimmed"
                  onClick={() =>
                    window.open(AUTH_ROUTES.TERMS_OF_SERVICE.url, '_blank')
                  }
                >
                  Terms of Service
                </Anchor>
              </Stack>
            </SimpleGrid>
          </Grid.Col>
        </Grid>

        <Divider my="xl" color="dark.4" />
        <Text ta="center" size="sm" c="dimmed">
          © 2025 AllCloudHub. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};

export default LandingFooter;
