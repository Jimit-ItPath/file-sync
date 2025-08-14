import { useState, useCallback, useRef } from 'react';
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

  const createFileChunks = useCallback(
    (file: File, chunkSize: number): Blob[] => {
      const chunks: Blob[] = [];
      let start = 0;

      while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        chunks.push(file.slice(start, end));
        start = end;
      }

      return chunks;
    },
    []
  );

const uploadFileInChunks = useCallback(
  async (
    fileId: string,
    file: File,
    uploadUrl: string,
    instructions: UploadingFile['instructions']
  ) => {
    if (!instructions) return false;

    const chunkSize = 2621440; // 2.5MB chunks
    const totalSize = file.size;
    let uploadedBytes = 0;

    try {
      while (uploadedBytes < totalSize) {
        // Cancel check
        const currentFile = uploadingFiles[fileId];
        if (currentFile?.status === 'cancelled') {
          return false;
        }

        const end = Math.min(uploadedBytes + chunkSize, totalSize) - 1;
        const chunk = file.slice(uploadedBytes, end + 1);

        const chunkHeaders = {
          ...instructions.headers,
          'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
          'Content-Length': `${chunk.size}`,
        };

        const res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: chunkHeaders,
          body: chunk,
        });

        if (res.status === 308) {
          const range = res.headers.get('Range');
          if (range) {
            const lastByte = parseInt(range.split('-')[1], 10);
            uploadedBytes = lastByte + 1;
          } else {
            uploadedBytes = end + 1;
          }
        } else if (res.status === 200 || res.status === 201) {
          // Upload finished — don’t try to read body to avoid CORS error
          uploadedBytes = totalSize;
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: 100,
              status: 'completed',
              metadata: null, // Fetch later if needed
            },
          }));
          return await res.json();
          break;
        } else {
          throw new Error(`Unexpected status ${res.status}`);
        }

        const progress = Math.round((uploadedBytes / totalSize) * 100);
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: Math.min(progress, 100),
          },
        }));
      }

      return true;
    } catch (error: any) {
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'error',
          error: error?.message || 'Upload failed',
        },
      }));
      return false;
    }
  },
  [uploadingFiles, setUploadingFiles]
);



  const startUpload = useCallback(
    async (
      files: File[],
      options: { id?: string; account_id?: string } = {}
    ) => {
      if (files.length === 0) return;

      // Initialize files in uploading state
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
        // Get upload URLs from API
        const result = await dispatch(
          uploadCloudStorageFilesV2({
            files,
            ...options,
          })
        ).unwrap();

        const { uploadUrls } = result.response.data;

        // Update files with upload URLs and instructions
        Object.keys(fileEntries).forEach((fileId, index) => {
          if (uploadUrls[index]) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                uploadUrl: uploadUrls[index].uploadUrl,
                instructions: uploadUrls[index].instructions,
                status: 'uploading',
              },
            }));
          }
        });

        // Upload files one by one
        let completedFiles = 0;
        const fileIds = Object.keys(fileEntries);

        for (let i = 0; i < fileIds.length; i++) {
          const fileId = fileIds[i];
          const file = fileEntries[fileId].file;
          const uploadUrl = uploadUrls[i]?.uploadUrl;
          const instructions = uploadUrls[i]?.instructions;

          if (!uploadUrl || !instructions) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                status: 'error',
                error: 'No upload URL provided',
              },
            }));
            continue;
          }

          const success = await uploadFileInChunks(
            fileId,
            file,
            uploadUrl,
            instructions
          );

          if (success) {
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                status: 'completed',
                progress: 100,
              },
            }));
            completedFiles++;
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
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to start upload',
          color: 'red',
        });

        // Mark all files as error
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
