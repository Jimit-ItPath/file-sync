import { useState, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { useAppDispatch } from '../../../store';

interface DownloadProgress {
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
}

// StreamSaver types
declare global {
  interface Window {
    streamSaver: any;
  }
}

const useFileDownloader = () => {
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const dispatch = useAppDispatch();

  const calculateSpeed = (
    downloadedBytes: number,
    startTime: number
  ): number => {
    const elapsedTime = (Date.now() - startTime) / 1000;
    return elapsedTime > 0 ? downloadedBytes / elapsedTime : 0;
  };

  const calculateTimeRemaining = (
    totalBytes: number,
    downloadedBytes: number,
    speed: number
  ): number => {
    if (speed <= 0) return 0;
    const remainingBytes = totalBytes - downloadedBytes;
    return remainingBytes / speed;
  };

  const updateProgress = useCallback((update: Partial<DownloadProgress>) => {
    setDownloadProgress(prev => (prev ? { ...prev, ...update } : null));
    if (
      update.status === 'completed' ||
      update.status === 'failed' ||
      update.status === 'cancelled'
    ) {
      setTimeout(() => setDownloadProgress(null), 5000);
    }
  }, []);

  const downloadFile = useCallback(
    async (selectedIds: string[]) => {
      // Cancel any existing download
      if (abortController.current) {
        abortController.current.abort();
      }

      const controller = new AbortController();
      abortController.current = controller;

      try {
        const fileName =
          selectedIds.length > 1
            ? `files-${Date.now()}.zip`
            : `download-${Date.now()}.zip`;

        // Initialize download progress
        const initialProgress: DownloadProgress = {
          isDownloading: true,
          fileName,
          totalSize: 0,
          downloadedSize: 0,
          percentage: 0,
          status: 'downloading',
          startTime: Date.now(),
          fileCount: selectedIds.length,
        };

        setDownloadProgress(initialProgress);

        // Use your existing Redux action but intercept the response for streaming
        const response = await fetch(
          'http://192.168.0.26:3051/cloud-storage/download',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              // Add any auth headers your API needs
            },
            body: JSON.stringify({ ids: selectedIds }),
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get total file size from Content-Length header
        const contentLength = response.headers.get('Content-Length');
        const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

        updateProgress({ totalSize });

        // For small files or when StreamSaver is not available, use blob download
        if (totalSize < 10 * 1024 * 1024 || !window.streamSaver) {
          // Less than 10MB
          const blob = await response.blob();

          // Extract filename from Content-Disposition header if available
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          const match = contentDisposition?.match(/filename="?([^"]+)"?/);
          const finalFileName = match?.[1] || fileName;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = finalFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          updateProgress({
            downloadedSize: totalSize || blob.size,
            percentage: 100,
            status: 'completed',
          });

          notifications.show({
            message: `${selectedIds.length > 1 ? 'Files' : 'File'} downloaded successfully`,
            color: 'green',
          });

          // Clear progress after 3 seconds
          // setTimeout(() => setDownloadProgress(null), 3000);
          return;
        }

        // Use StreamSaver for large files
        const contentDisposition = response.headers.get('Content-Disposition');
        const match = contentDisposition?.match(/filename="?([^"]+)"?/);
        const finalFileName = match?.[1] || fileName;

        const fileStream = window.streamSaver.createWriteStream(finalFileName);
        const writer = fileStream.getWriter();
        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        let downloadedSize = 0;
        const startTime = Date.now();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // Write chunk to file
            await writer.write(value);
            downloadedSize += value.length;

            // Calculate progress
            const percentage =
              totalSize > 0
                ? Math.round((downloadedSize / totalSize) * 100)
                : 0;
            const speed = calculateSpeed(downloadedSize, startTime);
            const timeRemaining = calculateTimeRemaining(
              totalSize,
              downloadedSize,
              speed
            );

            // Update progress
            updateProgress({
              downloadedSize,
              percentage,
              speed,
              timeRemaining,
            });
          }

          // Complete the download
          await writer.close();
          updateProgress({
            percentage: 100,
            status: 'completed',
          });

          notifications.show({
            message: `${selectedIds.length > 1 ? 'Files' : 'File'} downloaded successfully`,
            color: 'green',
          });

          // Clear progress after 3 seconds
          // setTimeout(() => setDownloadProgress(null), 3000);
        } catch (writeError) {
          await writer.abort();
          throw writeError;
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          updateProgress({
            status: 'cancelled',
          });
          notifications.show({
            message: 'Download was cancelled',
            color: 'orange',
          });
        } else {
          updateProgress({
            status: 'failed',
          });
          notifications.show({
            message: `Failed to download: ${error.message}`,
            color: 'red',
          });
        }

        // Clear progress after 3 seconds for failed/cancelled downloads
        // setTimeout(() => setDownloadProgress(null), 3000);
      } finally {
        abortController.current = null;
      }
    },
    [updateProgress, dispatch]
  );

  const cancelDownload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const clearDownload = useCallback(() => {
    // setDownloadProgress(null);
  }, []);

  return {
    downloadProgress,
    downloadFile,
    cancelDownload,
    clearDownload,
  };
};

export default useFileDownloader;
