import { Anchor } from '@mantine/core';
import type React from 'react';
import type { NavigateFunction } from 'react-router';
import { AUTH_ROUTES } from '../../routing/routes';

interface NavigationItemsProps {
  navigate: NavigateFunction;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  navigate = () => {},
}) => (
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
          const element = document.getElementById('powerful-features');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      Features
    </Anchor>
    <Anchor
      c="dimmed"
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
          const element = document.getElementById('security-features');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      Security
    </Anchor>
    <Anchor
      c="dimmed"
      size="sm"
      style={{ textDecoration: 'none' }}
      onClick={() => navigate(AUTH_ROUTES.FAQ.url)}
    >
      FAQ
    </Anchor>
  </>
);

export default NavigationItems;
