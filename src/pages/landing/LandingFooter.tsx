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

interface FooterProps {
  isSm: boolean;
  isMd: boolean;
}

const LandingFooter: React.FC<FooterProps> = ({ isSm, isMd }) => {
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
          © 2025 AllCloudHub. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};

export default LandingFooter;
