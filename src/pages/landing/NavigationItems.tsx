import { Anchor } from '@mantine/core';

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
    <Anchor href="#faq" c="dimmed" size="sm" style={{ textDecoration: 'none' }}>
      FAQ
    </Anchor>
  </>
);

export default NavigationItems;
