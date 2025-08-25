import {
  AppShell,
  Burger,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import React from 'react';
import { ICONS } from '../../assets/icons';
import useResponsive from '../../hooks/use-responsive';
import { AUTH_ROUTES } from '../../routing/routes';
import type { NavigateFunction } from 'react-router';
import NavigationItems from './NavigationItems';

interface LandingHeaderProps {
  opened: boolean;
  open: () => void;
  close: () => void;
  navigate: NavigateFunction;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  close = () => {},
  open = () => {},
  opened = false,
  navigate = () => {},
}) => {
  const { isSm, isMd } = useResponsive();
  return (
    <>
      <AppShell.Header>
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : 120}
          h="100%"
        >
          <Group justify="space-between" h="100%">
            <Group
              onClick={() => navigate(AUTH_ROUTES.LANDING.url)}
              style={{ cursor: 'pointer' }}
            >
              <ICONS.IconCloud size={32} color={'#0ea5e9'} />
              <Title order={3} c="#0ea5e9">
                All Cloud Hub
              </Title>
            </Group>

            {!isSm ? (
              <Group>
                <NavigationItems {...{ navigate }} />
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    onClick={() => navigate(AUTH_ROUTES.LOGIN.url)}
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}>
                    Get Started
                  </Button>
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
          <NavigationItems {...{ navigate, close }} />
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
    </>
  );
};

export default LandingHeader;
