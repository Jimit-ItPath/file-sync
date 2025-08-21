import { Anchor } from '@mantine/core';
import type React from 'react';
import { useLocation, type NavigateFunction } from 'react-router';
import { AUTH_ROUTES } from '../../routing/routes';

interface NavigationItemsProps {
  navigate: NavigateFunction;
  close?: () => void;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  navigate = () => {},
  close = () => {},
}) => {
  const location = useLocation();

  const isActive = (route: string) => {
    return location.pathname === route;
  };

  return (
    <>
      <Anchor
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
        onClick={() => {
          if (location.pathname !== AUTH_ROUTES.LANDING.url) {
            navigate(AUTH_ROUTES.LANDING.url, {
              state: { scrollTo: 'powerful-features' },
            });
          } else {
            close?.();
            const element = document.getElementById('powerful-features');
            if (element) {
              const yOffset = -70;
              const y =
                element.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }
        }}
      >
        Features
      </Anchor>
      <Anchor
        c={isActive(AUTH_ROUTES.PRICING.url) ? 'blue' : 'dimmed'}
        size="sm"
        style={{ textDecoration: 'none' }}
        onClick={() => navigate(AUTH_ROUTES.PRICING.url)}
      >
        Pricing
      </Anchor>
      <Anchor
        c="dimmed"
        size="sm"
        style={{ textDecoration: 'none' }}
        onClick={() => {
          if (location.pathname !== AUTH_ROUTES.LANDING.url) {
            navigate(AUTH_ROUTES.LANDING.url, {
              state: { scrollTo: 'security-features' },
            });
          } else {
            close?.();
            const element = document.getElementById('security-features');
            if (element) {
              const yOffset = -70;
              const y =
                element.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }
        }}
      >
        Security
      </Anchor>
      <Anchor
        c={isActive(AUTH_ROUTES.FAQ.url) ? 'blue' : 'dimmed'}
        size="sm"
        style={{ textDecoration: 'none' }}
        onClick={() => navigate(AUTH_ROUTES.FAQ.url)}
      >
        FAQ
      </Anchor>
    </>
  );
};

export default NavigationItems;
