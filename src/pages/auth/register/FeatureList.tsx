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

export const FeatureList: React.FC = () => {
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
        height: '100vh',
        position: 'relative',
      }}
    >
      <Group
        align="center"
        mb={40}
        style={{
          width: 152,
          height: 32,
        }}
      >
        <Stack style={{ flexDirection: 'row' }}>
          <ICONS.IconCloud size={32} color="#0284c7" />
          <Text fw={700} fz={20} style={{ letterSpacing: -0.5 }}>
            CloudSync
          </Text>
        </Stack>
      </Group>
      <Box maw={400}>
        <Title order={1} mb={20} fw={700} fz={{ base: 28, md: 32 }}>
          All Your Cloud Files. One Smart Dashboard.
        </Title>
        <Text c="dimmed" mb={32} fz="md">
          Connect your Google Drive, Dropbox, and OneDrive accounts. Manage,
          search, and smart-distribute files across platforms—securely.
        </Text>
        <Stack gap={24}>
          {features.map((feature, idx) => (
            <Group key={idx} align="flex-start">
              <ThemeIcon color="cyan" size={40} radius="md">
                <feature.icon size={20} />
              </ThemeIcon>
              <Box>
                <Text fw={600} fz="md" mb={2}>
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
      <Box style={{ position: 'absolute', bottom: 24, right: 24 }}>
        <ICONS.IconCloud size={75} color="#dbeafe" style={{ opacity: 0.7 }} />
      </Box>
    </Paper>
  );
};
