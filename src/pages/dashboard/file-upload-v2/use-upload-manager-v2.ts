import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../../store';
import {
  uploadCloudStorageFilesV2,
  uploadFileChunk,
} from '../../../store/slices/cloudStorage.slice';
import { notifications } from '@mantine/notifications';
import { v4 as uuidv4 } from 'uuid';

export type FileUploadStatus =
  | 'pending'
  | 'uploading'
  | 'completed'
  | 'error'
  | 'cancelled';

export type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  status: FileUploadStatus;
  uploadUrl?: string;
  instructions?: {
    method: string;
    headers: Record<string, string>;
    chunkSize: number;
    maxChunkSize: number;
  };
  error?: string;
  cancelController?: AbortController;
};

const useUploadManagerV2 = () => {
  const dispatch = useAppDispatch();
  const [uploadingFiles, setUploadingFiles] = useState<
    Record<string, UploadingFile>
  >({});
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const uploadControllersRef = useRef<Record<string, AbortController>>({});
  const uploadingFilesRef = useRef<Record<string, UploadingFile>>({});

  useEffect(() => {
    uploadingFilesRef.current = uploadingFiles;
  }, [uploadingFiles]);

  const uploadFileInChunks = useCallback(
    async (fileId: string, file: File, backendSessionId: string) => {
      const chunkSize = 5242880; // 5MB
      const totalSize = file.size;
      let uploadedBytes = 0;

      try {
        while (uploadedBytes < totalSize) {
          const controller = uploadControllersRef.current[fileId];
          const currentFile = uploadingFilesRef.current[fileId];

          // Check if the upload has been canceled
          if (
            !controller ||
            controller.signal.aborted ||
            currentFile?.status === 'cancelled'
          ) {
            return { success: false, fileData: null };
          }

          const end = Math.min(uploadedBytes + chunkSize, totalSize) - 1;
          const chunk = file.slice(uploadedBytes, end + 1);

          try {
            const res: any = await dispatch(
              uploadFileChunk({
                chunk,
                headers: {
                  'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
                  'Content-Type': 'application/octet-stream',
                  'Content-Length': `${chunk.size}`,
                  'X-Upload-Session-Id': backendSessionId,
                },
                signal: controller.signal,
              })
            );

            if (res.payload?.status === 200 || res.payload?.status === 201) {
              uploadedBytes = end + 1;
            } else if (res.payload?.status >= 400) {
              throw new Error(
                `Upload failed with status ${res.payload?.status}: ${res.payload?.statusText}`
              );
            }
          } catch (error: any) {
            if (controller.signal.aborted) {
              return { success: false, fileData: null };
            }
            throw error;
          }

          // Check again before updating progress
          const currentFileAfterChunk = uploadingFilesRef.current[fileId];
          if (
            !controller ||
            controller.signal.aborted ||
            currentFileAfterChunk?.status === 'cancelled'
          ) {
            return { success: false, fileData: null };
          }

          const progress = Math.round((uploadedBytes / totalSize) * 100);
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: Math.min(progress, 99),
            },
          }));
        }

        // Final check before marking as completed
        const controller = uploadControllersRef.current[fileId];
        const finalFile = uploadingFilesRef.current[fileId];
        if (
          !controller ||
          controller.signal.aborted ||
          finalFile?.status === 'cancelled'
        ) {
          return { success: false, fileData: null };
        }

        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: 100,
            status: 'completed',
          },
        }));
        return { success: true };
      } catch (error: any) {
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'error',
            error:
              typeof error === 'string'
                ? error
                : error?.message || 'Upload failed',
          },
        }));
        return { success: false };
      }
    },
    [dispatch]
  );

  const startUpload = useCallback(
    async (
      files: File[],
      options: { id?: string; account_id?: string } = {}
    ) => {
      if (files.length === 0) return;

      const fileEntries: Record<string, UploadingFile> = {};

      files.forEach(file => {
        const fileId = uuidv4();
        const controller = new AbortController();

        fileEntries[fileId] = {
          id: fileId,
          file,
          progress: 0,
          status: 'pending',
          cancelController: controller,
        };

        uploadControllersRef.current[fileId] = controller;
      });

      setUploadingFiles(prev => ({ ...prev, ...fileEntries }));
      setShowUploadProgress(true);

      try {
        // 🔑 First step → create upload sessions

        const result = await dispatch(
          uploadCloudStorageFilesV2({
            files,
            ...options,
          })
        ).unwrap();

        const { session_ids } = result.response.data;

        // Map backend session_ids to our files
        Object.keys(fileEntries).forEach((fileId, index) => {
          if (session_ids[index]) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                backendSessionId: session_ids[index], // store backend session id
                status: 'uploading',
              },
            }));
          }
        });

        const fileIds = Object.keys(fileEntries);

        let completedFiles = 0;

        for (let i = 0; i < fileIds.length; i++) {
          const fileId = fileIds[i];
          const file = fileEntries[fileId].file;
          const backendSessionId = session_ids[i];

          if (!backendSessionId) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                status: 'error',
                error: 'No backend session ID returned',
              },
            }));
            continue;
          }

          try {
            // 🔑 Now upload chunks via our API
            const result = await uploadFileInChunks(
              fileId,
              file,
              backendSessionId // use backend session id
            );

            if (result.success) {
              completedFiles++;
            } else {
              setUploadingFiles(prev => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  status: 'error',
                  error: 'Upload failed',
                },
              }));
            }
          } catch (err: any) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                status: 'error',
                error: err?.message || 'Upload failed',
              },
            }));
          }
        }

        if (completedFiles === files.length) {
          notifications.show({
            message: `${completedFiles} file${completedFiles > 1 ? 's' : ''} uploaded successfully`,
            color: 'green',
          });
        } else if (completedFiles > 0) {
          notifications.show({
            message: `${completedFiles} of ${files.length} files uploaded successfully`,
            color: 'yellow',
          });
        } else {
          notifications.show({
            message: 'Failed to upload files',
            color: 'red',
          });
        }
        return {
          originalFiles: result?.originalFiles,
          response: result?.response,
        };
      } catch (error: any) {
        notifications.show({
          message:
            typeof error === 'string'
              ? error
              : error?.message || 'Failed to start upload',
          color: 'red',
        });

        Object.keys(fileEntries).forEach(fileId => {
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              status: 'error',
              error: error?.message || 'Upload failed',
            },
          }));
        });

        return { originalFiles: [], response: {} };
      }
    },
    [dispatch, uploadFileInChunks]
  );

  const cancelUpload = useCallback((fileId: string) => {
    const controller = uploadControllersRef.current[fileId];
    if (controller) {
      controller.abort();
    }

    setUploadingFiles(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'cancelled',
      },
    }));

    delete uploadControllersRef.current[fileId];
  }, []);

  const removeUploadedFile = useCallback((fileId: string) => {
    setUploadingFiles(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    delete uploadControllersRef.current[fileId];
  }, []);

  const closeUploadProgress = useCallback(() => {
    setShowUploadProgress(false);
    // Optionally clear completed files
    setUploadingFiles(prev => {
      const filtered: Record<string, UploadingFile> = {};
      Object.entries(prev).forEach(([id, file]) => {
        if (file.status === 'uploading' || file.status === 'pending') {
          filtered[id] = file;
        }
      });
      return filtered;
    });
  }, []);

  const clearAllUploads = useCallback(() => {
    // Cancel all ongoing uploads
    Object.keys(uploadControllersRef.current).forEach(fileId => {
      uploadControllersRef.current[fileId]?.abort();
    });

    uploadControllersRef.current = {};
    setUploadingFiles({});
    setShowUploadProgress(false);
  }, []);

  return {
    uploadingFiles,
    showUploadProgress,
    startUpload,
    cancelUpload,
    removeUploadedFile,
    closeUploadProgress,
    clearAllUploads,
  };
};

export default useUploadManagerV2;
