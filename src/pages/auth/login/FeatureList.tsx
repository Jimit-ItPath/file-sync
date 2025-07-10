import {
  Paper,
  Group,
  Stack,
  Text,
  Box,
  ThemeIcon,
  Title,
} from '@mantine/core';
// import LoginCloud from '../../../assets/svgs/LoginCloud.png';
import { ICONS } from '../../../assets/icons';
// import { Image } from '../../../components';

export const FeatureList = () => (
  <Paper
    p={0}
    style={{
      background: 'linear-gradient(120deg, #0ea5e9 0%, #0369a1 100%)',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'stretch',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Logo at top left */}
    <Group
      align="center"
      style={{
        position: 'absolute',
        top: 24,
        left: 32,
        width: 152,
        height: 32,
        zIndex: 2,
      }}
    >
      <ICONS.IconCloud size={32} color="#fff" />
      <Text fw={700} fz={20} style={{ color: '#fff', letterSpacing: -0.5 }}>
        CloudSync
      </Text>
    </Group>

    {/* Centered feature content */}
    <Box
      maw={600}
      mx="auto"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 0,
        zIndex: 2,
      }}
    >
      <Title order={1} mb={20} fw={700} fz={{ base: 28, md: 32 }} c="#fff">
        Welcome Back to Your Unified Cloud Dashboard
      </Title>
      <Text c="#e0e7ef" mb={32} fz="md">
        Securely manage files from Google Drive, Dropbox, and OneDrive in one
        place.
      </Text>
      <Stack gap={24}>
        <Group align="center" gap={16}>
          <ThemeIcon color="white" size={36} radius="md" variant="light">
            <ICONS.IconLockPassword size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz="md" mb={2} c="#fff">
              Secure login & session management
            </Text>
          </Box>
        </Group>
        <Group align="center" gap={16}>
          <ThemeIcon color="white" size={36} radius="md" variant="light">
            <ICONS.IconFolder size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz="md" mb={2} c="#fff">
              Unified file access across providers
            </Text>
          </Box>
        </Group>
        <Group align="center" gap={16}>
          <ThemeIcon color="white" size={36} radius="md" variant="light">
            <ICONS.IconCpu size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz="md" mb={2} c="#fff">
              Personalized Smart File Distribution (SFD)
            </Text>
          </Box>
        </Group>
      </Stack>
    </Box>

    {/* Absolutely positioned image at the very bottom */}
    {/* <Box
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 3,
        pointerEvents: 'none',
        paddingBottom: 0,
        marginBottom: 0,
      }}
    >
      <Image
        src={LoginCloud}
        alt="Cloud Illustration"
        w={120}
        h={120}
        radius={0}
        hasAspectRatio={false}
        style={{
          objectFit: 'contain',
          marginBottom: 0,
          paddingBottom: 0,
          boxShadow: 'none',
        }}
      />
    </Box> */}
  </Paper>
);
