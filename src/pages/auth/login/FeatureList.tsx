import {
  Paper,
  Group,
  Stack,
  Text,
  Box,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface FeatureListProps {
  isXs: boolean;
  isMd: boolean;
}

export const FeatureList: React.FC<FeatureListProps> = ({ isXs, isMd }) => (
  <Paper
    p={0}
    style={{
      background: 'linear-gradient(120deg, #0ea5e9 0%, #0369a1 100%)',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'stretch',
      minHeight: isMd ? '50vh' : '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box
      maw={600}
      mx="auto"
      p={{ base: 16, sm: 24, md: 32 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 0,
        zIndex: 2,
      }}
    >
      <Title
        order={1}
        mb={{ base: 16, sm: 20 }}
        fw={700}
        fz={{ base: 24, sm: 28, md: 32 }}
        c="#fff"
      >
        Welcome Back to Your Unified Cloud Dashboard
      </Title>
      <Text c="#e0e7ef" mb={{ base: 24, sm: 32 }} fz={{ base: 14, sm: 16 }}>
        Securely manage files from Google Drive, Dropbox, and OneDrive in one
        place.
      </Text>
      <Stack gap={isXs ? 16 : 24}>
        <Group align="center" gap={isXs ? 12 : 16}>
          <ThemeIcon
            color="white"
            size={isXs ? 28 : 36}
            radius="md"
            variant="light"
          >
            <ICONS.IconLockPassword size={isXs ? 16 : 20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
              Secure login & session management
            </Text>
          </Box>
        </Group>
        <Group align="center" gap={isXs ? 12 : 16}>
          <ThemeIcon
            color="white"
            size={isXs ? 28 : 36}
            radius="md"
            variant="light"
          >
            <ICONS.IconFolder size={isXs ? 16 : 20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
              Unified file access across providers
            </Text>
          </Box>
        </Group>
        <Group align="center" gap={isXs ? 12 : 16}>
          <ThemeIcon
            color="white"
            size={isXs ? 28 : 36}
            radius="md"
            variant="light"
          >
            <ICONS.IconCpu size={isXs ? 16 : 20} />
          </ThemeIcon>
          <Box>
            <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2} c="#fff">
              Personalized Smart File Distribution (SFD)
            </Text>
          </Box>
        </Group>
      </Stack>
    </Box>
  </Paper>
);
