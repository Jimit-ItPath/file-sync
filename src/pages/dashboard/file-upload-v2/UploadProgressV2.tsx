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
  Tooltip,
  Flex,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { formatFileSize } from '../../../utils/helper';
import {
  type UploadingFile,
  type FileUploadStatus,
} from './use-upload-manager-v2';
import useResponsive from '../../../hooks/use-responsive';

interface UploadProgressV2Props {
  uploadingFiles: Record<string, UploadingFile>;
  onCancelUpload: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onClose: () => void;
}

// const getStatusColor = (status: FileUploadStatus): string => {
//   switch (status) {
//     case 'completed':
//       return 'green';
//     case 'error':
//       return 'red';
//     case 'cancelled':
//       return 'gray';
//     case 'uploading':
//       return 'blue';
//     default:
//       return 'gray';
//   }
// };

const getStatusIcon = (status: FileUploadStatus, progress?: number) => {
  switch (status) {
    case 'completed':
      return (
        <Box
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ICONS.IconCheck size={12} color="white" />
        </Box>
      );
    case 'error':
      return (
        <Box
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ICONS.IconX size={12} color="white" />
        </Box>
      );
    case 'cancelled':
      return (
        <Box
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ICONS.IconX size={12} color="white" />
        </Box>
      );
    case 'uploading':
      return (
        <Box
          style={{
            width: 20,
            height: 20,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Background circle */}
          <Box
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              position: 'absolute',
            }}
          />
          {/* Progress circle */}
          <svg
            width="20"
            height="20"
            style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray={`${(2 * Math.PI * 8 * (progress || 0)) / 100} ${2 * Math.PI * 8}`}
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <Text
            size="8px"
            fw={600}
            c="blue"
            style={{ fontSize: '8px', lineHeight: 1 }}
          >
            {progress || 0}%
          </Text>
        </Box>
      );
    default:
      return (
        <Box
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ICONS.IconClock size={12} color="#6b7280" />
        </Box>
      );
  }
};

const getFileIcon = (fileName: string) => {
  const extension = fileName?.split('.')?.pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return <ICONS.IconFileTypePdf size={20} color="#dc2626" />;
    case 'doc':
    case 'docx':
      return <ICONS.IconFileTypeDoc size={20} color="#2563eb" />;
    case 'xls':
    case 'xlsx':
      return <ICONS.IconFileTypeXls size={20} color="#16a34a" />;
    case 'ppt':
    case 'pptx':
      return <ICONS.IconFileTypePpt size={20} color="#ea580c" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return <ICONS.IconPhoto size={20} color="#7c3aed" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <ICONS.IconVideo size={20} color="#dc2626" />;
    case 'mp3':
    case 'wav':
      return <ICONS.IconMusic size={20} color="#059669" />;
    case 'zip':
    case 'rar':
      return <ICONS.IconFileZip size={20} color="#374151" />;
    default:
      return <ICONS.IconFile size={20} color="#6b7280" />;
  }
};

const UploadProgressV2: React.FC<UploadProgressV2Props> = ({
  uploadingFiles,
  onCancelUpload,
  onRemoveFile,
  onClose,
}) => {
  const { isXs } = useResponsive();
  const fileEntries = Object.entries(uploadingFiles);

  if (fileEntries.length === 0) {
    return null;
  }

  const completedCount = fileEntries.filter(
    ([, file]) => file?.status === 'completed'
  ).length;
  const errorCount = fileEntries.filter(
    ([, file]) => file?.status === 'error'
  ).length;
  const cancelledCount = fileEntries.filter(
    ([, file]) => file?.status === 'cancelled'
  ).length;
  const totalCount = fileEntries.length;
  const hasActiveUploads = fileEntries.some(
    ([, file]) => file?.status === 'uploading' || file?.status === 'pending'
  );

  const overallProgress =
    fileEntries.reduce((acc, [, file]) => acc + file?.progress, 0) / totalCount;

  const getHeaderText = () => {
    if (hasActiveUploads) {
      return `Uploading ${totalCount} item${totalCount > 1 ? 's' : ''}`;
    }
    if (errorCount > 0) {
      return `Upload completed with ${errorCount} error${errorCount > 1 ? 's' : ''}`;
    }
    return 'Upload completed';
  };

  const getHeaderSubtext = () => {
    if (hasActiveUploads) {
      return `${completedCount} of ${totalCount} completed`;
    }
    if (errorCount > 0 || cancelledCount > 0) {
      return `${completedCount} successful, ${errorCount} failed`;
    }
    return `${completedCount} item${completedCount > 1 ? 's' : ''} uploaded`;
  };

  return (
    <Paper
      shadow="lg"
      radius={isXs ? 'md' : 'lg'}
      p={0}
      style={{
        position: 'fixed',
        bottom: isXs ? 100 : 24,
        right: isXs ? 10 : 100,
        width: isXs ? '70%' : 400,
        maxHeight: 600,
        zIndex: 1000,
        borderTopLeftRadius: isXs ? 16 : 'var(--mantine-radius-lg)',
        borderTopRightRadius: isXs ? 16 : 'var(--mantine-radius-lg)',
        border: '1px solid #e5e7eb',
        backgroundColor: 'white',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid #f3f4f6',
          backgroundColor: '#fafafa',
          position: isXs ? 'sticky' : 'static',
          top: 0,
          zIndex: 10,
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={600} c="dark">
              {getHeaderText()}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {getHeaderSubtext()}
            </Text>

            {hasActiveUploads && (
              <Box mt="sm">
                <Progress
                  value={overallProgress}
                  size="sm"
                  radius="xl"
                  color="blue"
                  style={{ backgroundColor: '#e5e7eb' }}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  {Math.round(overallProgress)}% complete
                </Text>
              </Box>
            )}
          </Box>

          <Tooltip
            label={hasActiveUploads ? 'Cannot close while uploading' : 'Close'}
            fz={'xs'}
            zIndex={1000}
          >
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onClose}
              disabled={hasActiveUploads}
              color="gray"
              style={{ opacity: hasActiveUploads ? 0.5 : 1 }}
            >
              <ICONS.IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      {/* File List */}
      <ScrollArea
        h={fileEntries?.length > 4 ? '400px' : 'auto'}
        scrollbars="y"
        styles={{ scrollbar: { width: 10 } }}
      >
        <Stack gap={0}>
          {fileEntries.map(([fileId, file]) => (
            <Box
              key={fileId}
              p="md"
              style={{
                borderBottom: '1px solid #f3f4f6',
                transition: 'background-color 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                if (file?.status !== 'uploading') {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Group gap="sm" align="flex-start">
                {/* File Icon */}
                <Box mt={2}>{getFileIcon(file?.file?.name)}</Box>

                {/* File Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group justify="space-between" align="flex-start" gap="xs">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="sm"
                        fw={500}
                        c="dark"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={file?.file?.name}
                      >
                        {file?.file?.name}
                      </Text>

                      <Text size="xs" c="dimmed" mt={2}>
                        {formatFileSize(file?.file?.size?.toString())}
                      </Text>

                      {/* Status Messages */}
                      {file?.status === 'uploading' && (
                        <Text size="xs" c="blue" mt={4}>
                          Uploading... {file?.progress}%
                        </Text>
                      )}

                      {file?.status === 'pending' && (
                        <Text size="xs" c="gray" mt={4}>
                          Waiting to upload...
                        </Text>
                      )}

                      {file?.status === 'completed' && (
                        <Text size="xs" c="green" mt={4} fw={500}>
                          Upload complete
                        </Text>
                      )}

                      {file?.status === 'error' && (
                        <Text size="xs" c="red" mt={4}>
                          {file?.error || 'Upload failed'}
                        </Text>
                      )}

                      {file?.status === 'cancelled' && (
                        <Text size="xs" c="gray" mt={4}>
                          Upload cancelled
                        </Text>
                      )}

                      {/* Progress Bar for Uploading Files */}
                      {file?.status === 'uploading' && (
                        <Box mt="xs">
                          <Progress
                            value={file?.progress}
                            size={4}
                            radius="xl"
                            color="blue"
                            style={{ backgroundColor: '#e5e7eb' }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Status Icon and Actions */}
                    <Flex align="center" gap="xs">
                      {getStatusIcon(file?.status, file?.progress)}

                      {/* Action Buttons */}
                      {(file?.status === 'uploading' ||
                        file?.status === 'pending') && (
                        <Tooltip label="Cancel upload" fz={'xs'} zIndex={1000}>
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="gray"
                            onClick={() => onCancelUpload(fileId)}
                            style={{ marginLeft: 4 }}
                          >
                            <ICONS.IconX size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      {(file?.status === 'completed' ||
                        file?.status === 'error' ||
                        file?.status === 'cancelled') && (
                        <Tooltip
                          label="Remove from list"
                          fz={'xs'}
                          zIndex={1000}
                        >
                          <ActionIcon
                            variant="subtle"
                            size="sm"
                            color="gray"
                            onClick={() => onRemoveFile(fileId)}
                            style={{ marginLeft: 4 }}
                          >
                            <ICONS.IconX size={14} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Flex>
                  </Group>
                </Box>
              </Group>
            </Box>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
};

export default UploadProgressV2;
