import React from 'react';
import { Box, Text, Progress, Stack, Group, ActionIcon } from '@mantine/core';
import { ICONS } from '../../../assets/icons';

interface UploadProgressProps {
  uploadProgress: { [key: string]: number };
  uploadingFiles: { [key: string]: { name: string; size: string } };
  onCancelUpload: (fileId: string) => void;
  onClose: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploadProgress,
  uploadingFiles,
  onCancelUpload = () => {},
  onClose = () => {},
}) => {
  const activeUploads = Object.entries(uploadProgress);

  if (activeUploads.length === 0) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 20,
        right: 100,
        width: 350,
        maxHeight: 400,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        zIndex: 1001,
        overflow: 'hidden',
      }}
    >
      <Box
        p={16}
        style={{
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
        }}
      >
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">
            Uploading {activeUploads.length} file
            {activeUploads.length > 1 ? 's' : ''}
          </Text>
          <Text size="xs" c="gray.6">
            {activeUploads.filter(([_, progress]) => progress === 100).length}{' '}
            of {activeUploads.length} complete
          </Text>
          <ActionIcon
            onClick={onClose}
            color="gray"
            bdrs={9999}
            variant="subtle"
          >
            <ICONS.IconX size={16} />
          </ActionIcon>
        </Group>
      </Box>

      <Box
        style={{
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        <Stack gap={0}>
          {activeUploads.map(([fileId, progress]) => {
            const file = uploadingFiles[fileId];
            const isComplete = progress === 100;

            return (
              <Box
                key={fileId}
                p={16}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <Group justify="space-between" align="flex-start" mb={8}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {file?.name || 'Unknown file'}
                    </Text>
                    <Text size="xs" c="gray.6">
                      {file?.size || ''}
                    </Text>
                  </Box>

                  <Group gap={8} align="center">
                    {isComplete ? (
                      <Box
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ICONS.IconCheck size={12} color="white" />
                      </Box>
                    ) : (
                      <>
                        <Text size="xs" c="gray.6">
                          {Math.round(progress)}%
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => onCancelUpload(fileId)}
                        >
                          <ICONS.IconX size={14} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Group>

                <Progress
                  value={progress}
                  size="sm"
                  color={isComplete ? 'green' : 'blue'}
                  style={{
                    opacity: isComplete ? 0.7 : 1,
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};

export default UploadProgress;
