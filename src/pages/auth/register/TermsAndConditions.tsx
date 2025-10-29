import {
  Box,
  Grid,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Image,
  Divider,
} from '@mantine/core';
import useResponsive from '../../../hooks/use-responsive';
import { useNavigate } from 'react-router';
import { AUTH_ROUTES } from '../../../routing/routes';
import AllCloudHubLogo from '../../../assets/svgs/AllCloudHub-Logo.svg';
import type React from 'react';
import { useEffect } from 'react';

const TermsAndConditions = () => {
  const { isXs, isSm } = useResponsive();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms And Conditions | All Cloud Hub';
  }, []);

  return (
    <Box>
      {/* Logo */}
      <Group
        align="center"
        style={{
          position: !isSm ? 'absolute' : 'relative',
          top: 12,
          left: !isSm ? 100 : 'auto',
          marginLeft: isSm ? 16 : 0,
          zIndex: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate(AUTH_ROUTES.REGISTER.url)}
      >
        <Image src={AllCloudHubLogo} w={150} h={50} fit="contain" />
      </Group>

      <Grid gutter={0} style={{ minHeight: '100vh' }}>
        <Grid.Col span={12}>
          <Paper
            radius={0}
            h="100%"
            p={isXs ? 16 : isSm ? 24 : 48}
            style={{
              display: 'flex',
              justifyContent: 'center',
              background: '#f9fafb',
            }}
          >
            <Box
              w="100%"
              maw={950}
              mx="auto"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              <Stack gap={isXs ? 16 : 28} mt={isXs ? 10 : 0}>
                {/* Page Title */}
                <Title order={2} fw={700} fz={isXs ? 22 : 32} ta="center">
                  Terms and Conditions
                </Title>
                <Text c="dimmed" fz={14} ta="center">
                  Last Updated: September 1, 2025
                </Text>

                <Divider />

                {/* Intro */}
                <Text fz={isXs ? 14 : 16}>
                  Welcome to <strong>All Cloud Hub</strong>. These Terms and
                  Conditions (“Terms”) govern your access to and use of our
                  platform and services (“Services”). By using All Cloud Hub,
                  you agree to be bound by these Terms. If you do not agree,
                  please do not use our Services.
                </Text>

                {/* Sections */}
                <Stack gap={20}>
                  <Section
                    title="1. Overview of Services"
                    content={[
                      'All Cloud Hub provides a platform that allows users to connect, manage, and operate across multiple cloud storage accounts (including Google Drive, Dropbox, and OneDrive).',
                      'Our Services enable actions such as uploading, renaming, moving, deleting files, and managing folders.',
                      'We do not provide cloud storage ourselves. Instead, we act as a secure interface between you and your chosen third-party storage providers.',
                    ]}
                  />

                  <Section
                    title="2. Eligibility"
                    content={[
                      'You must be at least 18 years old or have legal parental/guardian consent to use our Services.',
                      'You must provide accurate and complete registration information.',
                      'You are responsible for maintaining the confidentiality of your account credentials.',
                    ]}
                  />

                  <Section
                    title="3. User Responsibilities"
                    content={[
                      'Use the Services only for lawful purposes.',
                      'Not use the Services to upload, share, or manage files that violate laws, regulations, or the rights of others.',
                      'Not attempt to interfere with or disrupt our systems, security measures, or networks.',
                      'Not reverse-engineer, decompile, or copy our Services.',
                      'You are solely responsible for the files you manage through our platform.',
                    ]}
                  />

                  <Section
                    title="4. Third-Party Services"
                    content={[
                      'All Cloud Hub integrates with third-party services, including Google Drive, Dropbox, and OneDrive.',
                      'You must comply with the terms and policies of these providers in addition to our Terms.',
                      'When you connect your account, you authorize All Cloud Hub to access your account data as permitted by the selected provider’s OAuth scopes.',
                      'We do not own, control, or manage the terms, policies, or availability of these third-party services.',
                      'You acknowledge that if these providers restrict or suspend their APIs, our Services may be impacted.',
                    ]}
                  />

                  <Section
                    title="5. Privacy and Data Use"
                    content={[
                      'Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your data.',
                      'By using All Cloud Hub, you consent to the processing of your information as described in the Privacy Policy.',
                    ]}
                  />

                  <Section
                    title="6. Security"
                    content={[
                      'We take security seriously and implement industry-standard protections such as OAuth 2.0 authentication and HTTPS encryption.',
                      'However, no system is completely secure. You are responsible for safeguarding your login information and immediately notifying us of any unauthorized access.',
                    ]}
                  />

                  <Section
                    title="7. Account Termination"
                    content={[
                      'We may suspend or terminate your account if you violate these Terms.',
                      'You misuse the Services in ways that cause harm to us, other users, or third parties.',
                      'We are required to do so by law or due to third-party service provider restrictions.',
                      'You may delete your account at any time. Upon deletion, all your connected accounts will be revoked, and associated data will be permanently removed.',
                    ]}
                  />

                  <Section
                    title="8. Service Availability"
                    content={[
                      'We aim to provide continuous access to our Services, but availability is not guaranteed.',
                      'We may suspend or limit access for maintenance, updates, or unforeseen disruptions.',
                      'We are not responsible for downtime caused by third-party providers (Google, Dropbox, Microsoft).',
                    ]}
                  />

                  <Section
                    title="9. Intellectual Property"
                    content={[
                      'All Cloud Hub and its logo, design, and software are our intellectual property.',
                      'You may not copy, modify, distribute, or resell any part of our Services without written permission.',
                      'You retain ownership of your files; we claim no rights over your content.',
                    ]}
                  />

                  <Section
                    title="10. Disclaimer of Warranties"
                    content={[
                      'Our Services are provided on an “as is” and “as available” basis.',
                      'We do not warrant that the Services will be error-free, uninterrupted, or completely secure.',
                      'We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
                    ]}
                  />

                  <Section
                    title="11. Limitation of Liability"
                    content={[
                      'To the maximum extent permitted by law:',
                      'All Cloud Hub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Services.',
                      'Our total liability for any claim shall not exceed the amount you paid (if any) for using the Services in the 12 months preceding the claim.',
                    ]}
                  />

                  <Section
                    title="12. Indemnification"
                    content={[
                      'You agree to indemnify and hold harmless All Cloud Hub, its affiliates, employees, and partners from any claims, damages, or liabilities arising from your use of the Services, violation of these Terms, or infringement of third-party rights.',
                    ]}
                  />

                  <Section
                    title="13. Changes to Terms"
                    content={[
                      'We may update these Terms at any time.',
                      'Significant changes will be communicated on our homepage or via email.',
                      'Continued use of the Services after changes means you accept the updated Terms.',
                    ]}
                  />

                  <Section
                    title="14. Governing Law"
                    content={[
                      'These Terms are governed by and construed under the laws of your country of residence, unless otherwise required by law.',
                      'Any disputes will be subject to the jurisdiction of competent courts.',
                    ]}
                  />

                  <Section
                    title="15. Contact Us"
                    content={[
                      'For questions or concerns regarding these Terms, please contact us at:',
                      <a
                        key="contact-email"
                        href="mailto:hello@allcloudhub.com"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          color: '#0284c7',
                        }}
                      >
                        📧 hello@allcloudhub.com
                      </a>,
                    ]}
                  />
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

// Reusable section component
const Section = ({
  title,
  content,
}: {
  title: string;
  content: React.ReactNode[];
}) => {
  return (
    <Stack
      gap={8}
      style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
    >
      <Text fw={600} fz={18}>
        {title}
      </Text>
      {content.map((line, i) => (
        <Text
          key={i}
          fz={15}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {line}
        </Text>
      ))}
    </Stack>
  );
};

export default TermsAndConditions;
