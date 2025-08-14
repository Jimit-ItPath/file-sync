import React from 'react';
import { Box, Text, Progress, Group, ActionIcon } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { formatBytes, formatTime } from '../../../utils/helper';

type DownloadProgressType = {
  isDownloading: boolean;
  fileName: string;
  totalSize: number;
  downloadedSize: number;
  percentage: number;
  status: 'downloading' | 'completed' | 'failed' | 'cancelled';
  startTime: number;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  fileCount: number;
};

interface DownloadProgressProps {
  downloadProgress: DownloadProgressType;
  onCancelDownload: () => void;
  onClose: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  downloadProgress,
  onCancelDownload,
  onClose,
}) => {
  // if (!downloadProgress) return null;

  const isComplete = downloadProgress?.status === 'completed';
  const isFailed = downloadProgress?.status === 'failed';
  const isCancelled = downloadProgress?.status === 'cancelled';
  const isDownloading = downloadProgress?.status === 'downloading';

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 20,
        right: 100,
        width: 350,
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
            {isComplete && 'Download Complete'}
            {isFailed && 'Download Failed'}
            {isCancelled && 'Download Cancelled'}
            {isDownloading &&
              `Downloading ${downloadProgress?.fileCount} file${downloadProgress?.fileCount > 1 ? 's' : ''}`}
          </Text>
          <ActionIcon
            onClick={onClose}
            color="gray"
            radius={9999}
            variant="subtle"
          >
            <ICONS.IconX size={16} />
          </ActionIcon>
        </Group>
      </Box>

      <Box p={16}>
        <Group justify="space-between" align="flex-start" mb={8}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {downloadProgress?.fileName}
            </Text>
            <Text size="xs" c="gray.6">
              {downloadProgress?.totalSize > 0
                ? formatBytes(downloadProgress?.totalSize)
                : 'Calculating...'}
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
            ) : isFailed ? (
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
            ) : isCancelled ? (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ICONS.IconX size={12} color="white" />
              </Box>
            ) : (
              <>
                <Text size="xs" c="gray.6">
                  {Math.round(downloadProgress?.percentage)}%
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={onCancelDownload}
                >
                  <ICONS.IconX size={14} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Group>

        <Progress
          value={downloadProgress?.percentage}
          size="sm"
          color={
            isComplete
              ? 'green'
              : isFailed
                ? 'red'
                : isCancelled
                  ? 'orange'
                  : 'blue'
          }
          style={{
            opacity: isComplete || isFailed || isCancelled ? 0.7 : 1,
          }}
        />

        {isDownloading && downloadProgress?.speed ? (
          <Group justify="space-between" mt={8}>
            <Text size="xs" c="gray.6">
              {formatBytes(downloadProgress?.downloadedSize)} /{' '}
              {formatBytes(downloadProgress?.totalSize)}
            </Text>
            <Text size="xs" c="gray.6">
              {formatBytes(downloadProgress?.speed)}/s
              {downloadProgress?.timeRemaining &&
                ` • ${formatTime(downloadProgress?.timeRemaining)} left`}
            </Text>
          </Group>
        ) : null}
      </Box>
    </Box>
  );
};

export default DownloadProgress;
