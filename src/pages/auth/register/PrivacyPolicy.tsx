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
import { useEffect } from 'react';

const PrivacyPolicy = () => {
  const { isXs, isSm } = useResponsive();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy | All Cloud Hub';
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
            <Box w="100%" maw={950} mx="auto">
              <Stack gap={isXs ? 16 : 28} mt={isXs ? 10 : 0}>
                {/* Page Title */}
                <Title order={2} fw={700} fz={isXs ? 22 : 32} ta="center">
                  Privacy Policy
                </Title>
                <Text c="dimmed" fz={14} ta="center">
                  Last Updated: September 1, 2025
                </Text>

                <Divider />

                {/* Introduction */}
                <Text fz={isXs ? 14 : 16}>
                  At <strong>All Cloud Hub</strong>, we respect your privacy and
                  are committed to protecting your personal information. This
                  Privacy Policy explains what information we collect, how we
                  use it, and your rights when using our platform.
                </Text>

                {/* Sections */}
                <Stack gap={20}>
                  <Section
                    title="1. Information We Collect"
                    content={[
                      <Text fz={15}>
                        <b>Account Information: </b> Your name and email address
                        when you sign up or log in (including via Google or
                        other providers).
                      </Text>,
                      <Text fz={15}>
                        <b>Authentication Data: </b> Secure OAuth tokens used to
                        connect third-party services such as Google Drive,
                        Dropbox, and OneDrive.
                      </Text>,
                      <Text fz={15}>
                        <b>Usage Information: </b> Metadata about your connected
                        accounts (e.g., file/folder names, modification
                        timestamps, and storage provider type).
                      </Text>,
                      <Text fz={15}>
                        <b>Profile Information: </b> Details you choose to
                        update in your user profile.
                      </Text>,
                      'We do not store or copy the contents of your files. All operations are executed directly through the APIs of the connected providers.',
                    ]}
                  />

                  <Section
                    title="2. How We Use Your Information"
                    content={[
                      'Authenticate and log you into All Cloud Hub.',
                      'Allow you to connect, manage, and disconnect cloud accounts.',
                      'Enable file operations such as upload, create folder, rename, move, and delete.',
                      'Maintain and improve our services.',
                      'Provide customer support and communicate important updates.',
                      'We do not sell, rent, or share your information with third parties for advertising or marketing.',
                    ]}
                  />

                  <Section
                    title="3. Third-Party Services"
                    content={[
                      // ---------------- GOOGLE ----------------
                      <Text key="google-title">
                        <strong>Google Services</strong>
                      </Text>,
                      <Text key="google-desc" fz={15}>
                        When you connect your Google account, All Cloud Hub
                        requests the following OAuth scopes:
                      </Text>,
                      <Text
                        key="scope-profile"
                        fz={15}
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <Text span c="blue" fw={600} fz={15}>
                          https://www.googleapis.com/auth/userinfo.profile
                        </Text>{' '}
                        – Access your basic profile information (name).
                      </Text>,
                      <Text
                        key="scope-email"
                        fz={15}
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <Text span c="blue" fw={600} fz={15}>
                          https://www.googleapis.com/auth/userinfo.email
                        </Text>{' '}
                        – Access your email address to identify your account.
                      </Text>,
                      <Text
                        key="scope-drive"
                        fz={15}
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <Text span c="blue" fw={600} fz={15}>
                          https://www.googleapis.com/auth/drive
                        </Text>{' '}
                        – Allow file management actions (create, view, rename,
                        move, and delete files/folders in your Google Drive).
                      </Text>,
                      <Text key="google-note" fz={15}>
                        We use these permissions only to provide the described
                        functionality. We do not use your Google data for any
                        other purpose. If you disconnect your Google account or
                        delete your All Cloud Hub account, all Google access
                        tokens are permanently revoked.
                      </Text>,
                      <Text key="google-link" fz={15}>
                        You can review Google’s privacy policy{' '}
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0284c7',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          here
                        </a>
                        .
                      </Text>,

                      // ---------------- DROPBOX ----------------
                      <Text key="dropbox-title">
                        <strong>Dropbox Services</strong>
                      </Text>,
                      <Text key="dropbox-desc" fz={15}>
                        When you connect Dropbox, All Cloud Hub requests OAuth
                        permissions limited to managing your Dropbox files and
                        folders.
                      </Text>,
                      <Text key="dropbox-auth" fz={15}>
                        • Authenticate your Dropbox account securely using OAuth
                        2.0.
                      </Text>,
                      <Text key="dropbox-file" fz={15}>
                        • Perform file operations such as upload, create
                        folders, rename, move, and delete within your Dropbox
                        storage.
                      </Text>,
                      <Text key="dropbox-metadata" fz={15}>
                        • Access file metadata (e.g., file names, folder names,
                        and timestamps) to display your storage contents in the
                        dashboard.
                      </Text>,
                      <Text key="dropbox-note" fz={15}>
                        We do not store your Dropbox files on our servers. All
                        operations are executed directly with Dropbox’s official
                        API. If you disconnect Dropbox or delete your All Cloud
                        Hub account, all Dropbox OAuth tokens are revoked
                        immediately.
                      </Text>,
                      <Text key="dropbox-link" fz={15}>
                        Dropbox Privacy Policy:{' '}
                        <a
                          href="https://www.dropbox.com/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0284c7',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          https://www.dropbox.com/privacy
                        </a>
                      </Text>,

                      // ---------------- ONEDRIVE ----------------
                      <Text key="onedrive-title">
                        <strong>Microsoft OneDrive Services</strong>
                      </Text>,
                      <Text key="onedrive-desc" fz={15}>
                        When you connect OneDrive, All Cloud Hub requests OAuth
                        permissions limited to working with your OneDrive
                        account.
                      </Text>,
                      <Text key="onedrive-auth" fz={15}>
                        • Authenticate your Microsoft account securely using
                        OAuth 2.0.
                      </Text>,
                      <Text key="onedrive-file" fz={15}>
                        • Allow file management actions such as upload, folder
                        creation, renaming, moving, and deleting files within
                        OneDrive.
                      </Text>,
                      <Text key="onedrive-metadata" fz={15}>
                        • Read file metadata (names, sizes, modification dates)
                        so that your dashboard view is always in sync with your
                        OneDrive storage.
                      </Text>,
                      <Text key="onedrive-sharing" fz={15}>
                        • Optionally create and manage shareable links so you
                        can collaborate on files stored in OneDrive directly
                        from All Cloud Hub.
                      </Text>,
                      <Text key="onedrive-note" fz={15}>
                        We never copy or store your OneDrive files. Tokens are
                        revoked as soon as you disconnect OneDrive or delete
                        your All Cloud Hub account.
                      </Text>,
                      <Text key="onedrive-link" fz={15}>
                        Microsoft Privacy Statement:{' '}
                        <a
                          href="https://privacy.microsoft.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#0284c7',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          https://privacy.microsoft.com/
                        </a>
                      </Text>,
                    ]}
                  />

                  <Section
                    title="4. Security"
                    content={[
                      'Secure authentication via OAuth 2.0.',
                      'Encrypted transmission of data using HTTPS.',
                      'Strict access controls to ensure OAuth tokens are never exposed.',
                      'Although no system is 100% secure, we continually monitor and update our security practices.',
                    ]}
                  />

                  <Section
                    title="5. Data Retention and Deletion"
                    content={[
                      'We retain your account information only while your account remains active.',
                      'You may delete your account at any time, which will permanently remove your profile and revoke all linked OAuth tokens.',
                      'We do not retain your files after operations are completed.',
                    ]}
                  />

                  <Section
                    title="6. Your Rights"
                    content={[
                      'Access and review the information we hold about you.',
                      'Revoke permissions for connected accounts at any time.',
                      'Request deletion of your All Cloud Hub account and all related data.',
                      'Contact us with questions or concerns regarding your data.',
                    ]}
                  />

                  <Section
                    title="7. Changes to This Policy"
                    content={[
                      'We may update this Privacy Policy periodically. Any significant updates will be posted on our homepage.',
                      'By continuing to use All Cloud Hub after changes, you agree to the updated terms.',
                    ]}
                  />

                  <Section
                    title="8. Contact Us"
                    content={[
                      'If you have any questions, requests, or concerns about this Privacy Policy, please contact us at:',
                      <a
                        key="contact-email"
                        href="mailto:hello@allcloudhub.com"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
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

export default PrivacyPolicy;
