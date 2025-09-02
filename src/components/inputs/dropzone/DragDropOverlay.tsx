import React from 'react';
import { Box, Text, Center, Stack } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface DragDropOverlayProps {
  isDragging: boolean;
  message?: string;
  subMessage?: string;
}

const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  isDragging,
  message = 'Drop files here',
  subMessage = 'Release to upload your files',
}) => {
  if (!isDragging) return null;

  return (
    <Box
      style={{
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        position: 'fixed',
        top: 60,
        left: 250,
        right: 32,
        bottom: 0,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        border: '3px solid #2563eb',
        borderRadius: '12px',
        zIndex: 2000,
        pointerEvents: 'none',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Center h="100%">
        <Stack align="center" h="100%" justify="center" gap={16} pb={20}>
          <Box
            style={{
              padding: '20px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: 'white',
              animation: 'pulse 2s infinite',
            }}
          >
            <ICONS.IconUpload size={36} />
          </Box>
          <Stack align="center" gap={8}>
            <Text
              size="xl"
              fw={600}
              c="#2563eb"
              style={{ textAlign: 'center' }}
            >
              {message}
            </Text>
            <Text size="sm" c="#2563eb" style={{ textAlign: 'center' }}>
              {subMessage}
            </Text>
          </Stack>
        </Stack>
      </Center>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `,
        }}
      />
    </Box>
  );
};

export default DragDropOverlay;
