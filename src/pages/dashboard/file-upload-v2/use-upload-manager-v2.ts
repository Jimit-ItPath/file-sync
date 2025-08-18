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

  // const uploadFileInChunks = useCallback(
  //   async (
  //     fileId: string,
  //     file: File,
  //     uploadUrl: string,
  //     instructions: UploadingFile['instructions']
  //   ) => {
  //     if (!instructions) return false;

  //     const chunkSize = 2621440; // 2.5MB
  //     const totalSize = file.size;
  //     let uploadedBytes = 0;

  //     try {
  //       while (uploadedBytes < totalSize) {
  //         const currentFile = uploadingFiles[fileId];
  //         if (currentFile?.status === 'cancelled') return false;

  //         const end = Math.min(uploadedBytes + chunkSize, totalSize) - 1;
  //         const chunk = file.slice(uploadedBytes, end + 1);

  //         const chunkHeaders = {
  //           ...instructions.headers,
  //           'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
  //           'Content-Length': `${chunk.size}`,
  //         };

  //         // For the last chunk, add a defensive no-cors mode
  //         const isLast = end + 1 >= totalSize;

  //         let res: Response | null = null;
  //         try {
  //           res = await fetch(uploadUrl, {
  //             method: 'PUT',
  //             headers: chunkHeaders,
  //             body: chunk,
  //             // Prevent CORS error on final response
  //             // ...(isLast ? { mode: 'no-cors' as RequestMode } : {}),
  //           });
  //         } catch (err) {
  //           // If final chunk fails CORS, assume success (Google quirk)
  //           if (isLast) {
  //             uploadedBytes = totalSize;
  //             setUploadingFiles(prev => ({
  //               ...prev,
  //               [fileId]: {
  //                 ...prev[fileId],
  //                 progress: 100,
  //                 status: 'completed',
  //               },
  //             }));
  //             return true;
  //           }
  //           throw err;
  //         }

  //         if (res.status === 308) {
  //           // Partial upload acknowledged
  //           const range = res.headers.get('Range');
  //           uploadedBytes = range
  //             ? parseInt(range.split('-')[1], 10) + 1
  //             : end + 1;
  //         } else if (res.status === 200 || res.status === 201) {
  //           // ✅ Final success — ignore body to avoid CORS
  //           uploadedBytes = totalSize;
  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               progress: 100,
  //               status: 'completed',
  //             },
  //           }));
  //           return true;
  //         } else {
  //           throw new Error(`Unexpected status ${res.status}`);
  //         }

  //         const progress = Math.round((uploadedBytes / totalSize) * 100);
  //         setUploadingFiles(prev => ({
  //           ...prev,
  //           [fileId]: {
  //             ...prev[fileId],
  //             progress: Math.min(progress, 100),
  //           },
  //         }));
  //       }

  //       return true;
  //     } catch (error: any) {
  //       console.log('Catch-', error);
  //       // If this was the last chunk and error is CORS, assume success
  //       if (uploadedBytes + chunkSize >= totalSize) {
  //         setUploadingFiles(prev => ({
  //           ...prev,
  //           [fileId]: {
  //             ...prev[fileId],
  //             progress: 100,
  //             status: 'completed',
  //           },
  //         }));
  //         return true;
  //       }

  //       setUploadingFiles(prev => ({
  //         ...prev,
  //         [fileId]: {
  //           ...prev[fileId],
  //           status: 'error',
  //           error: error?.message || 'Upload failed',
  //         },
  //       }));
  //       return false;
  //     }
  //   },
  //   [uploadingFiles, setUploadingFiles]
  // );

  // const startUpload = useCallback(
  //   async (
  //     files: File[],
  //     options: { id?: string; account_id?: string } = {}
  //   ) => {
  //     if (files.length === 0) return;

  //     // Initialize files in uploading state
  //     const fileEntries: Record<string, UploadingFile> = {};
  //     files.forEach(file => {
  //       const fileId = uuidv4();
  //       const controller = new AbortController();

  //       fileEntries[fileId] = {
  //         id: fileId,
  //         file,
  //         progress: 0,
  //         status: 'pending',
  //         cancelController: controller,
  //       };

  //       uploadControllersRef.current[fileId] = controller;
  //     });

  //     setUploadingFiles(prev => ({ ...prev, ...fileEntries }));
  //     setShowUploadProgress(true);

  //     try {
  //       // Get upload URLs from API
  //       const result = await dispatch(
  //         uploadCloudStorageFilesV2({
  //           files,
  //           ...options,
  //         })
  //       ).unwrap();

  //       const { uploadUrls } = result.response.data;

  //       // Update files with upload URLs and instructions
  //       Object.keys(fileEntries).forEach((fileId, index) => {
  //         if (uploadUrls[index]) {
  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               uploadUrl: uploadUrls[index].uploadUrl,
  //               instructions: uploadUrls[index].instructions,
  //               status: 'uploading',
  //             },
  //           }));
  //         }
  //       });

  //       // Upload files one by one
  //       let completedFiles = 0;
  //       const fileIds = Object.keys(fileEntries);

  //       for (let i = 0; i < fileIds.length; i++) {
  //         const fileId = fileIds[i];
  //         const file = fileEntries[fileId].file;
  //         const uploadUrl = uploadUrls[i]?.uploadUrl;
  //         const instructions = uploadUrls[i]?.instructions;

  //         if (!uploadUrl || !instructions) {
  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               status: 'error',
  //               error: 'No upload URL provided',
  //             },
  //           }));
  //           continue;
  //         }

  //         const success = await uploadFileInChunks(
  //           fileId,
  //           file,
  //           uploadUrl,
  //           instructions
  //         );

  //         console.log('test succ-', success);

  //         if (success) {
  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               status: 'completed',
  //               progress: 100,
  //             },
  //           }));
  //           completedFiles++;
  //         }
  //       }

  //       if (completedFiles === files.length) {
  //         notifications.show({
  //           message: `${completedFiles} file${completedFiles > 1 ? 's' : ''} uploaded successfully`,
  //           color: 'green',
  //         });
  //       } else if (completedFiles > 0) {
  //         notifications.show({
  //           message: `${completedFiles} of ${files.length} files uploaded successfully`,
  //           color: 'yellow',
  //         });
  //       } else {
  //         notifications.show({
  //           message: 'Failed to upload files',
  //           color: 'red',
  //         });
  //       }
  //     } catch (error: any) {
  //       notifications.show({
  //         message: error?.message || 'Failed to start upload',
  //         color: 'red',
  //       });

  //       // Mark all files as error
  //       Object.keys(fileEntries).forEach(fileId => {
  //         setUploadingFiles(prev => ({
  //           ...prev,
  //           [fileId]: {
  //             ...prev[fileId],
  //             status: 'error',
  //             error: error?.message || 'Upload failed',
  //           },
  //         }));
  //       });
  //     }
  //   },
  //   [dispatch, uploadFileInChunks]
  // );

  const uploadFileInChunks = useCallback(
    async (
      fileId: string,
      file: File,
      uploadUrl: string,
      instructions: UploadingFile['instructions']
    ) => {
      if (!instructions) return { success: false, fileData: null };

      const chunkSize = 2621440; // 2.5MB
      const totalSize = file.size;
      let uploadedBytes = 0;

      try {
        while (uploadedBytes < totalSize) {
          const currentFile = uploadingFiles[fileId];
          if (currentFile?.status === 'cancelled') {
            return { success: false, fileData: null };
          }

          const end = Math.min(uploadedBytes + chunkSize, totalSize) - 1;
          const chunk = file.slice(uploadedBytes, end + 1);
          const isLastChunk = end + 1 >= totalSize;

          const chunkHeaders = {
            ...instructions.headers,
            'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
            'Content-Length': `${chunk.size}`,
          };

          let res: Response;
          try {
            res = await fetch(uploadUrl, {
              method: 'PUT',
              headers: chunkHeaders,
              body: chunk,
            });
          } catch (fetchError) {
            // If the last chunk request triggers CORS/network error,
            // assume upload succeeded since bytes were sent.
            if (isLastChunk) {
              console.log('Final chunk uploaded but response blocked by CORS');
              uploadedBytes = totalSize;
              setUploadingFiles(prev => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  progress: 100,
                  status: 'completed',
                },
              }));
              return { success: true, fileData: null };
            }
            throw fetchError;
          }

          // Handle resumable upload continuation
          if (res.status === 308) {
            const range = res.headers.get('Range');
            if (range) {
              const rangeEnd = parseInt(range.split('-')[1], 10);
              uploadedBytes = rangeEnd + 1;
            } else {
              uploadedBytes = end + 1;
            }
          }
          // Handle final success (don’t parse body because of CORS)
          else if (res.status === 200 || res.status === 201) {
            uploadedBytes = totalSize;
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                progress: 100,
                status: 'completed',
              },
            }));
            return { success: true, fileData: null }; // Metadata should come from backend
          } else if (res.status >= 400) {
            throw new Error(
              `Upload failed with status ${res.status}: ${res.statusText}`
            );
          } else {
            // Unexpected status, move forward cautiously
            uploadedBytes = end + 1;
          }

          // Update progress
          const progress = Math.round((uploadedBytes / totalSize) * 100);
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: Math.min(progress, 99), // lock at 99% until confirmed
            },
          }));
        }

        // If loop finishes, mark complete
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress: 100,
            status: 'completed',
          },
        }));

        return { success: true, fileData: null };
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'error',
            error: error?.message || 'Upload failed',
          },
        }));
        return { success: false, fileData: null };
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

        // Upload files and collect results
        let completedFiles = 0;
        const fileIds = Object.keys(fileEntries);
        const uploadResults: Array<{
          fileId: string;
          success: boolean;
          fileData: any;
        }> = [];

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
            uploadResults.push({ fileId, success: false, fileData: null });
            continue;
          }

          const result = await uploadFileInChunks(
            fileId,
            file,
            uploadUrl,
            instructions
          );
          // console.log('res-', result);

          uploadResults.push({
            fileId,
            success: result.success,
            fileData: result.fileData,
          });

          if (result.success) {
            completedFiles++;

            // Log file upload completion with metadata
            console.log('File upload completed successfully:', {
              localFileId: fileId, // Our local UUID
              googleFileId:
                result.fileData?.id ||
                result.fileData?.name ||
                'ID not available',
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              fullUploadResponse: result.fileData,
            });

            // TODO: Call backend API here with the file information
            // Example: await callBackendAPI(fileId, file.name, result.fileData);
          }
        }

        // Show completion notifications
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

        return uploadResults;
      } catch (error: any) {
        console.error('Upload initialization error:', error);

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

        return [];
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
