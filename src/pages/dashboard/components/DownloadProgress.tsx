import { Box, Group, Text, Progress, ActionIcon } from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { formatBytes, formatTime } from '../../../utils/helper';
import useResponsive from '../../../hooks/use-responsive';

interface DownloadProgressProps {
  downloadProgress: any;
  onCancelDownload: () => void;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  downloadProgress,
  onCancelDownload,
  onClose,
  // onPause,
  // onResume,
}) => {
  const isComplete = downloadProgress?.status === 'completed';
  const isFailed = downloadProgress?.status === 'failed';
  const isCancelled = downloadProgress?.status === 'cancelled';
  const isDownloading = downloadProgress?.status === 'downloading';
  const isPaused = downloadProgress?.status === 'paused';
  const { isXs } = useResponsive();

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: isXs ? 100 : 20,
        right: isXs ? 20 : 100,
        width: isXs ? '80%' : 350,
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
            {isPaused && 'Download Paused'}
            {isDownloading &&
              `Downloading ${downloadProgress?.fileCount} file${
                downloadProgress?.fileCount > 1 ? 's' : ''
              }`}
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
              {(() => {
                if (!downloadProgress) return null;

                if (downloadProgress.status === 'downloading') {
                  return downloadProgress.totalSize > 0
                    ? formatBytes(downloadProgress.totalSize)
                    : 'Calculating...';
                }

                if (downloadProgress.status === 'paused') {
                  return `Paused • ${formatBytes(downloadProgress.downloadedSize)} of ${
                    downloadProgress.totalSize > 0
                      ? formatBytes(downloadProgress.totalSize)
                      : 'unknown size'
                  }`;
                }

                if (downloadProgress.status === 'completed') {
                  return `Completed • ${formatBytes(downloadProgress.totalSize)}`;
                }

                if (downloadProgress.status === 'failed') {
                  return 'Download failed';
                }

                if (downloadProgress.status === 'cancelled') {
                  return 'Download cancelled';
                }

                return null;
              })()}
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

        {isDownloading || isPaused ? (
          <Group justify="space-between" mt={8}>
            <Text size="xs" c="gray.6">
              {formatBytes(downloadProgress?.downloadedSize)} /{' '}
              {formatBytes(downloadProgress?.totalSize)}
            </Text>
            <Text size="xs" c="gray.6">
              {downloadProgress?.speed
                ? `${formatBytes(downloadProgress?.speed)}/s`
                : ''}
              {downloadProgress?.timeRemaining
                ? ` • ${formatTime(downloadProgress?.timeRemaining)} left`
                : null}
            </Text>
          </Group>
        ) : null}

        {/* Buttons */}
        {/* {(isDownloading || isPaused) && (
          <Group justify="flex-end" mt={12}>
            {isDownloading && (
              <Button
                size="xs"
                variant="light"
                color="yellow"
                onClick={onPause}
              >
                Pause
              </Button>
            )}
            {isPaused && (
              <Button size="xs" variant="light" color="blue" onClick={onResume}>
                Resume
              </Button>
            )}
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={onCancelDownload}
            >
              Cancel
            </Button>
          </Group>
        )} */}
      </Box>
    </Box>
  );
};

export default DownloadProgress;
