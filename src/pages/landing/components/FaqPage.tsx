import {
  AppShell,
  Container,
  Title,
  Text,
  Stack,
  Accordion,
  SimpleGrid,
} from '@mantine/core';
import useResponsive from '../../../hooks/use-responsive';
import AnimatedSection from './AnimatedSection';
import LandingHeader from '../LandingHeader';
import LandingFooter from '../LandingFooter';
import { useNavigate } from 'react-router';
import { useDisclosure } from '@mantine/hooks';
import { Card } from '../../../components';

const FaqPage = () => {
  const { isMd, isSm } = useResponsive();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

  const faqs = [
    {
      q: 'Can I use AllCloudHub for free?',
      a: 'Yes! We offer a free plan with basic features such as connecting a single cloud account and limited file transfers. You can upgrade anytime to unlock more storage, integrations, and premium support.',
    },
    {
      q: 'Do you store my files?',
      a: 'No. Your files always remain in your own cloud provider accounts. We only manage secure access and never copy or permanently store your files on our servers.',
    },
    {
      q: 'Which cloud services do you support?',
      a: 'We currently support Google Drive, OneDrive, and Dropbox. Our team is actively working to bring support for Box, iCloud, and other popular cloud storage providers in upcoming updates.',
    },
    {
      q: 'Is my data safe?',
      a: 'Absolutely. We use industry-standard security protocols such as OAuth 2.0 and AES-256 encryption to protect your data. In addition, you can revoke access at any time directly from your connected cloud accounts.',
    },
    {
      q: 'Can I move files between different cloud services?',
      a: 'Yes, with our cross-cloud transfer feature, you can seamlessly move files from one provider to another. The process is fast, secure, and requires no downloads to your local device.',
    },
    {
      q: 'Does AllCloudHub work on mobile devices?',
      a: 'Yes, our platform is fully responsive and works smoothly on desktops, tablets, and smartphones. You can manage your files anywhere without needing to install extra software.',
    },
    {
      q: 'What happens if I exceed my plan’s limits?',
      a: 'If you reach your free or paid plan limits, you’ll still have access to your files. However, advanced actions may be paused until you upgrade or free up space by deleting files.',
    },
    {
      q: 'Can I collaborate with my team using AllCloudHub?',
      a: 'Yes, our Business plan includes team collaboration features such as shared folders, permissions, and role-based access. It’s perfect for small businesses and growing teams.',
    },
    {
      q: 'Do you provide customer support?',
      a: 'Yes, all users get access to our support center with guides and tutorials. Pro and Business plan subscribers receive priority support with faster response times.',
    },
    {
      q: 'How do I cancel or change my subscription?',
      a: 'You can manage your subscription anytime from your account settings. Cancelling is easy and you’ll continue to have access until the end of your billing cycle.',
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
      <LandingHeader {...{ close, navigate, open, opened }} />
      <AppShell.Main pt={70} px={0} pb={0}>
        <Container
          size="lg"
          py={isSm ? 40 : 80}
          px={isSm ? 20 : 60}
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef6ff 100%)',
            borderRadius: 16,
          }}
        >
          <AnimatedSection>
            <Stack align="center" gap="md" mb={isSm ? 30 : 50}>
              <Title order={2} fz={isSm ? 26 : 34} fw={700}>
                Frequently Asked Questions
              </Title>
              <Text c="dimmed" ta="center" maw={700} fz={isSm ? 14 : 16}>
                Everything you need to know about AllCloudHub, from pricing to
                security and features.
              </Text>
            </Stack>
          </AnimatedSection>

          <SimpleGrid spacing={isSm ? 'lg' : 'xl'}>
            {/* FAQ Accordion */}
            <Card shadow="sm" radius="md" padding="xl" withBorder>
              <Accordion transitionDuration={400}>
                {faqs.map((item, i) => (
                  <Accordion.Item key={i} value={item.q}>
                    <Accordion.Control fw={500}>{item.q}</Accordion.Control>
                    <Accordion.Panel>{item.a}</Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card>
          </SimpleGrid>
        </Container>

        <LandingFooter {...{ isMd, isSm, navigate }} />
      </AppShell.Main>
    </AppShell>
  );
};

export default FaqPage;
