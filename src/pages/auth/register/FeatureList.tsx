import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Group,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface FeatureListProps {
  isXs: boolean;
  isMd: boolean;
}

export const FeatureList: React.FC<FeatureListProps> = ({ isXs, isMd }) => {
  const features = [
    {
      icon: ICONS.IconShieldCheck,
      title: 'End-to-end secure access',
      description: 'Your files are protected with enterprise-grade encryption',
    },
    {
      icon: ICONS.IconRefresh,
      title: 'Fast file syncing across cloud drives',
      description: 'Real-time synchronization across all your platforms',
    },
    {
      icon: ICONS.IconCpu,
      title: 'Smart file distribution engine',
      description: 'AI-powered organization and intelligent file management',
    },
  ];

  return (
    <Paper
      radius={0}
      p={{ base: 32, md: 56 }}
      style={{
        background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: isMd ? '100%' : '100vh',
        position: 'relative',
      }}
    >
      <Box
        maw={600}
        mx="auto"
        p={{ base: 16, sm: 24, md: 32 }}
        pt={isMd ? 40 : 0}
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
        >
          All Your Cloud Files. One Smart Dashboard.
        </Title>
        <Text c="dimmed" mb={{ base: 24, sm: 32 }} fz={{ base: 14, sm: 16 }}>
          Connect your Google Drive, Dropbox, and OneDrive accounts. Manage,
          search, and smart-distribute files across platforms—securely.
        </Text>
        <Stack gap={isXs ? 16 : 24}>
          {features.map((feature, idx) => (
            <Group key={idx} align="flex-start" gap={isXs ? 12 : 16}>
              <ThemeIcon color="cyan" size={isXs ? 28 : 36} radius="md">
                <feature.icon size={isXs ? 16 : 20} />
              </ThemeIcon>
              <Box>
                <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2}>
                  {feature.title}
                </Text>
                <Text c="dimmed" fz="sm">
                  {feature.description}
                </Text>
              </Box>
            </Group>
          ))}
        </Stack>
      </Box>
      {/* <Box style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <ICONS.IconCloud size={75} color="#dbeafe" style={{ opacity: 0.7 }} />
      </Box> */}
    </Paper>
  );
};
