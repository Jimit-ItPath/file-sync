import React from 'react';
import {
  Box,
  Paper,
  Text,
  Progress,
  ActionIcon,
  Group,
  Stack,
  ScrollArea,
  Badge,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { formatFileSize } from '../../../utils/helper';
import {
  type UploadingFile,
  type FileUploadStatus,
} from './use-upload-manager-v2';

interface UploadProgressV2Props {
  uploadingFiles: Record<string, UploadingFile>;
  onCancelUpload: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onClose: () => void;
}

const getStatusColor = (status: FileUploadStatus): string => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'error':
      return 'red';
    case 'cancelled':
      return 'gray';
    case 'uploading':
      return 'blue';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: FileUploadStatus) => {
  switch (status) {
    case 'completed':
      return <ICONS.IconCheck size={16} color="green" />;
    case 'error':
      return <ICONS.IconX size={16} color="red" />;
    case 'cancelled':
      return <ICONS.IconX size={16} color="gray" />;
    case 'uploading':
      return <ICONS.IconLoader size={16} color="blue" />;
    default:
      return <ICONS.IconClock size={16} color="gray" />;
  }
};

const UploadProgressV2: React.FC<UploadProgressV2Props> = ({
  uploadingFiles,
  onCancelUpload,
  onRemoveFile,
  onClose,
}) => {
  const fileEntries = Object.entries(uploadingFiles);

  if (fileEntries.length === 0) {
    return null;
  }

  const completedCount = fileEntries.filter(
    ([, file]) => file.status === 'completed'
  ).length;
  const totalCount = fileEntries.length;
  const hasActiveUploads = fileEntries.some(
    ([, file]) => file.status === 'uploading' || file.status === 'pending'
  );

  const overallProgress =
    fileEntries.reduce((acc, [, file]) => acc + file.progress, 0) / totalCount;

  return (
    <Paper
      shadow="xl"
      p="md"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 120,
        width: 400,
        maxHeight: 500,
        zIndex: 1000,
        border: '1px solid #e5e7eb',
      }}
    >
      <Group justify="space-between" align="center" mb="sm">
        <Group gap="xs">
          <Text size="sm" fw={600}>
            {hasActiveUploads ? 'Uploading files...' : 'Upload complete'}
          </Text>
          <Badge size="sm" color={hasActiveUploads ? 'blue' : 'green'}>
            {completedCount}/{totalCount}
          </Badge>
        </Group>
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={onClose}
          disabled={hasActiveUploads}
        >
          <ICONS.IconX size={16} />
        </ActionIcon>
      </Group>

      {hasActiveUploads && (
        <Box mb="sm">
          <Progress
            value={overallProgress}
            size="sm"
            color="blue"
            striped
            animated
          />
          <Text size="xs" c="dimmed" mt={4}>
            Overall progress: {Math.round(overallProgress)}%
          </Text>
        </Box>
      )}

      <ScrollArea style={{ maxHeight: 300 }}>
        <Stack gap="xs">
          {fileEntries.map(([fileId, file]) => (
            <Paper
              key={fileId}
              p="xs"
              bg="gray.0"
              style={{ border: '1px solid #f1f3f4' }}
            >
              <Group justify="space-between" align="flex-start" gap="xs">
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" align="center">
                    {getStatusIcon(file.status)}
                    <Text
                      size="sm"
                      fw={500}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                      title={file.file.name}
                    >
                      {file.file.name}
                    </Text>
                  </Group>

                  <Text size="xs" c="dimmed" mt={2}>
                    {formatFileSize(file.file.size.toString())}
                  </Text>

                  {file.status === 'uploading' || file.status === 'pending' ? (
                    <Box mt="xs">
                      <Progress
                        value={file.progress}
                        size="xs"
                        color="blue"
                        striped
                        animated
                      />
                      <Text size="xs" c="dimmed" mt={2}>
                        {file.progress}% uploaded
                      </Text>
                    </Box>
                  ) : file.status === 'error' ? (
                    <Text size="xs" c="red" mt={2}>
                      {file.error || 'Upload failed'}
                    </Text>
                  ) : file.status === 'completed' ? (
                    <Text size="xs" c="green" mt={2}>
                      Upload completed
                    </Text>
                  ) : file.status === 'cancelled' ? (
                    <Text size="xs" c="gray" mt={2}>
                      Upload cancelled
                    </Text>
                  ) : null}
                </Box>

                <Group gap="xs">
                  {(file.status === 'uploading' ||
                    file.status === 'pending') && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => onCancelUpload(fileId)}
                    >
                      <ICONS.IconX size={14} />
                    </ActionIcon>
                  )}

                  {(file.status === 'completed' ||
                    file.status === 'error' ||
                    file.status === 'cancelled') && (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="gray"
                      onClick={() => onRemoveFile(fileId)}
                    >
                      <ICONS.IconX size={14} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

export default UploadProgressV2;
