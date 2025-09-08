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
  const isQueued = downloadProgress?.status === 'queued';
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
            {isQueued &&
              `Queued (${downloadProgress?.queuePosition} of ${downloadProgress?.totalInQueue})`}
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

                if (downloadProgress.status === 'queued') {
                  return `${downloadProgress.fileCount} file${downloadProgress.fileCount > 1 ? 's' : ''} • Waiting in queue`;
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
            ) : isQueued ? (
              <Box
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ICONS.IconClock size={12} color="white" />
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
          value={isQueued ? 0 : downloadProgress?.percentage}
          size="sm"
          color={
            isComplete
              ? 'green'
              : isFailed
                ? 'red'
                : isCancelled
                  ? 'orange'
                  : isQueued
                    ? 'gray'
                    : 'blue'
          }
          style={{
            opacity:
              isComplete || isFailed || isCancelled || isQueued ? 0.7 : 1,
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

        {/* Queue Display */}
        {downloadProgress?.queuedFiles &&
          downloadProgress.queuedFiles.length > 0 && (
            <Box mt={12} pt={12} style={{ borderTop: '1px solid #e5e7eb' }}>
              <Text size="xs" fw={500} c="gray.7" mb={8}>
                Queue ({downloadProgress.queuedFiles.length} files)
              </Text>
              <Box style={{ maxHeight: 120, overflowY: 'auto' }}>
                {downloadProgress.queuedFiles
                  .slice(0, 3)
                  .map((queuedFile: any, index: number) => (
                    <Group key={index} justify="space-between" mb={4}>
                      <Text size="xs" c="gray.6" truncate style={{ flex: 1 }}>
                        {index + 1}. {queuedFile.fileName}
                      </Text>
                      <Text size="xs" c="gray.5">
                        {queuedFile.fileCount} file
                        {queuedFile.fileCount > 1 ? 's' : ''}
                      </Text>
                    </Group>
                  ))}
                {downloadProgress.queuedFiles.length > 3 && (
                  <Text size="xs" c="gray.5" ta="center" mt={4}>
                    +{downloadProgress.queuedFiles.length - 3} more
                  </Text>
                )}
              </Box>
            </Box>
          )}

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
