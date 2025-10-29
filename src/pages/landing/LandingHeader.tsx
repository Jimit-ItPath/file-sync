import {
  AppShell,
  Burger,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Image,
  ScrollArea,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import React from 'react';
import useResponsive from '../../hooks/use-responsive';
import { AUTH_ROUTES } from '../../routing/routes';
import type { NavigateFunction } from 'react-router';
import NavigationItems from './NavigationItems';
import AllCloudHubLogo from '../../assets/svgs/AllCloudHub-Logo.svg';

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

  // Simple breakpoint logic
  const isBelow992px = useMediaQuery('(max-width: 991px)');
  const isBetween990And1180 = useMediaQuery(
    '(min-width: 990px) and (max-width: 1180px)'
  );
  const is1040px = useMediaQuery('(max-width: 1040px)');

  return (
    <>
      <AppShell.Header>
        <Container
          size="var(--mantine-breakpoint-xxl)"
          px={isSm ? 20 : isMd ? 40 : is1040px ? 100 : 120}
          h="100%"
        >
          <Group justify="space-between" h="100%" w={'100%'} wrap="nowrap">
            <Group
              onClick={() => navigate(AUTH_ROUTES.LANDING.url)}
              style={{ cursor: 'pointer' }}
              h={'100%'}
              gap="xs"
            >
              <Image
                src={AllCloudHubLogo}
                w={isSm ? 120 : 150}
                h="100%"
                fit="contain"
              />
            </Group>

            {/* Show full navigation for screens 992px and above */}
            {!isBelow992px ? (
              <Group gap={isBetween990And1180 ? 'xs' : 'md'} wrap="nowrap">
                <NavigationItems {...{ navigate }} />
                <Group gap="xs" wrap="nowrap">
                  <Button
                    variant="subtle"
                    size={isBetween990And1180 ? 'xs' : 'sm'}
                    onClick={() => navigate(AUTH_ROUTES.LOGIN.url)}
                  >
                    Sign In
                  </Button>
                  <Button
                    size={isBetween990And1180 ? 'xs' : 'sm'}
                    onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
                  >
                    Get Started
                  </Button>
                </Group>
              </Group>
            ) : (
              /* Show hamburger menu for screens below 992px */
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
        <ScrollArea h="100%" scrollbarSize={6}>
          <Stack>
            <NavigationItems {...{ navigate, close }} />
            <Divider />
            <Button
              variant="subtle"
              fullWidth
              onClick={() => {
                navigate(AUTH_ROUTES.LOGIN.url);
                close();
              }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              onClick={() => {
                navigate(AUTH_ROUTES.REGISTER.url);
                close();
              }}
            >
              Get Started
            </Button>
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>
    </>
  );
};

export default LandingHeader;
