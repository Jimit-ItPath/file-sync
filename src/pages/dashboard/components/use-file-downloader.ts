import { useState, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';

interface DownloadProgress {
  isDownloading: boolean;
  fileName?: string;
  totalSize: number;
  downloadedSize: number;
  percentage: number;
  status: 'downloading' | 'completed' | 'failed' | 'cancelled' | 'paused';
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
  const writerRef = useRef<any>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const downloadedSizeRef = useRef<number>(0);
  const urlRef = useRef<string>('');
  const selectedIdsRef = useRef<string[]>([]);
  const isPausedRef = useRef<boolean>(false);
  const pumpRef = useRef<any>(null);

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
    // if (
    //   update.status === 'completed' ||
    //   update.status === 'failed' ||
    //   update.status === 'cancelled'
    // ) {
    //   setTimeout(() => setDownloadProgress(null), 5000);
    // }
  }, []);

  // const downloadFile = useCallback(
  //   async (selectedIds: string[]) => {
  //     // Cancel any existing download
  //     if (abortController.current) {
  //       abortController.current.abort();
  //     }

  //     const controller = new AbortController();
  //     abortController.current = controller;

  //     try {
  //       const fileName =
  //         selectedIds.length > 1
  //           ? `files-${Date.now()}.zip`
  //           : `download-${Date.now()}.zip`;

  //       // Initialize download progress
  //       const initialProgress: DownloadProgress = {
  //         isDownloading: true,
  //         fileName,
  //         totalSize: 0,
  //         downloadedSize: 0,
  //         percentage: 0,
  //         status: 'downloading',
  //         startTime: Date.now(),
  //         fileCount: selectedIds.length,
  //       };

  //       setDownloadProgress(initialProgress);

  //       // Create a cancellable fetch request
  //       const response = await fetch(
  //         `${import.meta.env.VITE_REACT_APP_BASE_URL}/cloud-storage/download`,
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${localStorage.getItem('token')}`,
  //           },
  //           body: JSON.stringify({ ids: selectedIds }),
  //           signal: controller.signal,
  //         }
  //       );

  //       // Immediately check if request was aborted
  //       if (controller.signal.aborted) {
  //         throw new DOMException('Aborted', 'AbortError');
  //       }

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       // Get total size
  //       let totalSize = 0;
  //       // if (selectedIds.length === 1) {
  //       //   const contentLength = response.headers.get('Content-Length');
  //       //   totalSize = contentLength ? parseInt(contentLength, 10) : 0;
  //       // } else {
  //       const approxSize = response.headers.get('approximate-size');
  //       totalSize = approxSize ? parseInt(approxSize, 10) : 0;
  //       // }

  //       updateProgress({ totalSize });

  //       const reader = response.body?.getReader();
  //       if (!reader) throw new Error('Failed to get response reader');

  //       const chunks: Uint8Array[] = [];
  //       let downloadedSize = 0;
  //       const startTime = Date.now();

  //       try {
  //         while (true) {
  //           // Check for cancellation before each read
  //           if (controller.signal.aborted) {
  //             throw new DOMException('Aborted', 'AbortError');
  //           }

  //           const { done, value } = await reader.read();

  //           if (done) break;

  //           chunks.push(value);
  //           downloadedSize += value.length;

  //           const percentage =
  //             totalSize > 0
  //               ? Math.round((downloadedSize / totalSize) * 100)
  //               : 0;
  //           const speed = calculateSpeed(downloadedSize, startTime);
  //           const timeRemaining = calculateTimeRemaining(
  //             totalSize,
  //             downloadedSize,
  //             speed
  //           );

  //           updateProgress({
  //             downloadedSize,
  //             percentage,
  //             speed,
  //             timeRemaining,
  //           });

  //           // For small files, check cancellation more frequently
  //           if (totalSize < 10 * 1024 * 1024) {
  //             await new Promise(resolve => setTimeout(resolve, 0));
  //           }
  //         }

  //         // Only create blob if not cancelled
  //         if (!controller.signal.aborted) {
  //           const blob = new Blob(chunks as any);
  //           const url = window.URL.createObjectURL(blob);
  //           const link = document.createElement('a');

  //           // Extract filename from Content-Disposition header if available
  //           const contentDisposition = response.headers.get(
  //             'Content-Disposition'
  //           );
  //           const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  //           const finalFileName = match?.[1] || fileName;

  //           link.href = url;
  //           link.download = finalFileName;
  //           document.body.appendChild(link);
  //           link.click();
  //           document.body.removeChild(link);
  //           window.URL.revokeObjectURL(url);

  //           updateProgress({
  //             downloadedSize: totalSize || blob.size,
  //             percentage: 100,
  //             status: 'completed',
  //           });

  //           notifications.show({
  //             message: `${selectedIds.length > 1 ? 'Files' : 'File'} downloaded successfully`,
  //             color: 'green',
  //           });
  //         }
  //       } catch (error: any) {
  //         if (error?.name === 'AbortError') throw error;
  //         throw new Error(`Download failed: ${error}`);
  //       }
  //     } catch (error: any) {
  //       if (error?.name === 'AbortError') {
  //         updateProgress({
  //           status: 'cancelled',
  //           fileName: downloadProgress?.fileName || '',
  //           fileCount: downloadProgress?.fileCount || 0,
  //         });
  //         notifications.show({
  //           message: 'Download was cancelled',
  //           color: 'orange',
  //         });
  //       } else {
  //         updateProgress({
  //           status: 'failed',
  //           fileName: downloadProgress?.fileName || '',
  //           fileCount: downloadProgress?.fileCount || 0,
  //         });
  //         notifications.show({
  //           message: `Failed to download: ${error?.message ? error?.message : 'given file.'}`,
  //           color: 'red',
  //         });
  //       }
  //     } finally {
  //       abortController.current = null;
  //     }
  //   },
  //   [updateProgress, dispatch]
  // );

  const downloadFile = useCallback(
    async (selectedIds: string[]) => {
      try {
        selectedIdsRef.current = selectedIds;
        urlRef.current = `${import.meta.env.VITE_REACT_APP_BASE_URL}/cloud-storage/download`;

        const controller = new AbortController();
        abortController.current = controller;

        const fileName =
          selectedIds.length > 1
            ? `files-${Date.now()}.zip`
            : `download-${Date.now()}.zip`;

        const initialProgress: DownloadProgress = {
          isDownloading: true,
          // fileName,
          totalSize: 0,
          downloadedSize: 0,
          percentage: 0,
          status: 'downloading',
          startTime: Date.now(),
          fileCount: selectedIds.length,
        };

        setDownloadProgress(initialProgress);

        // Request download stream
        const response = await fetch(urlRef.current, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get total size
        const approxSize = response.headers.get('approximate-size');
        const totalSize = approxSize ? parseInt(approxSize, 10) : 0;
        updateProgress({ totalSize });

        // Extract file name from headers if available
        const contentDisposition = response.headers.get('Content-Disposition');
        const match = contentDisposition?.match(/filename="?([^"]+)"?/);
        const finalFileName = match?.[1] || fileName;

        setDownloadProgress(prev => ({
          ...prev!,
          fileName: finalFileName,
        }));

        // StreamSaver: create write stream
        const fileStream = window.streamSaver.createWriteStream(finalFileName, {
          size: totalSize || undefined,
        });
        const writer = fileStream.getWriter();
        writerRef.current = writer;

        writer.closed?.catch(() => {
          setDownloadProgress(null);
          notifications.show({
            message: 'Download was cancelled from browser',
            color: 'orange',
          });
        });

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to get response reader');
        readerRef.current = reader;

        downloadedSizeRef.current = 0;
        const startTime = Date.now();

        const pump = async () => {
          try {
            while (true) {
              if (isPausedRef.current) {
                updateProgress({ status: 'paused' });
                return;
              }

              const { done, value } = await reader.read();
              if (done) break;

              downloadedSizeRef.current += value.length;
              await writer.write(value);

              const percentage =
                totalSize > 0
                  ? Math.round((downloadedSizeRef.current / totalSize) * 100)
                  : 0;

              const speed = calculateSpeed(
                downloadedSizeRef.current,
                startTime
              );
              const timeRemaining = calculateTimeRemaining(
                totalSize,
                downloadedSizeRef.current,
                speed
              );

              updateProgress({
                downloadedSize: downloadedSizeRef.current,
                percentage,
                speed,
                timeRemaining,
                status: 'downloading',
              });
            }

            await writer.close();
            updateProgress({ percentage: 100, status: 'completed' });
          } catch (err: any) {
            if (err?.name === 'AbortError') {
              updateProgress({ status: 'cancelled' });
            } else {
              updateProgress({ status: 'failed' });
            }
          }
        };

        pumpRef.current = pump;
        pump();
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          updateProgress({ status: 'cancelled' });
          notifications.show({
            message: 'Download was cancelled',
            color: 'orange',
          });
        } else {
          updateProgress({ status: 'failed' });
          notifications.show({
            message: `Failed to download: ${error?.message || 'given file.'}`,
            color: 'red',
          });
        }
      } finally {
        abortController.current = null;
      }
    },
    [updateProgress]
  );

  const pauseDownload = useCallback(() => {
    if (readerRef.current) {
      isPausedRef.current = true;
    }
  }, []);

  const resumeDownload = useCallback(() => {
    if (isPausedRef.current && pumpRef.current) {
      isPausedRef.current = false;
      updateProgress({ status: 'downloading' });
      pumpRef.current(); // continue same stream
    }
  }, [updateProgress]);

  const cancelDownload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (readerRef.current) {
      try {
        readerRef.current.cancel();
      } catch (err) {
        console.warn('Reader cancel failed:', err);
      }
    }
    if (writerRef.current) {
      try {
        writerRef.current?.abort?.(); // abort StreamSaver writer
      } catch (err) {
        console.warn('Writer abort failed:', err);
      }
    }
    updateProgress({ status: 'cancelled' });
  }, [updateProgress]);

  const clearDownload = useCallback(() => {
    cancelDownload();
    setDownloadProgress(null);
  }, []);

  const fetchPreviewFileWithProgress = async (
    url: string,
    signal: AbortSignal,
    selectedIds: string[],
    onProgress?: (percent: number) => void
  ): Promise<Blob> => {
    const response = await fetch(url, {
      signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) throw new Error('ReadableStream not supported');

    const approxSize = response.headers.get('approximate-size');
    // const contentLength = response.headers.get('content-length');
    const total = approxSize
      ? parseInt(approxSize, 10)
      : // : contentLength
        //   ? parseInt(contentLength, 10)
        0;

    let loaded = 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;

        if (onProgress) {
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            onProgress(percent);
          } else {
            // fallback: just tick up, never reach 100 until finished
            onProgress(Math.min(95, Math.floor((loaded / 1024 / 1024) % 100)));
          }
        }
      }
    }

    return new Blob(chunks as BlobPart[]);
  };

  return {
    downloadProgress,
    downloadFile,
    cancelDownload,
    clearDownload,
    pauseDownload,
    resumeDownload,
    fetchPreviewFileWithProgress,
  };
};

export default useFileDownloader;
