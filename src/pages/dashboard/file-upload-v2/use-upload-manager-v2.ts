import { useState, useCallback, useRef } from 'react';
import { useAppDispatch } from '../../../store';
import { uploadCloudStorageFilesV2 } from '../../../store/slices/cloudStorage.slice';
import { notifications } from '@mantine/notifications';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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

interface UploadResponse {
  success: boolean;
  fileData?: any;
}

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

  // const uploadFileInChunks = useCallback(
  //   async (
  //     fileId: string,
  //     file: File,
  //     uploadUrl: string,
  //     instructions: UploadingFile['instructions']
  //   ) => {
  //     if (!instructions) return { success: false, fileData: null };

  //     const chunkSize = 2621440; // 2.5MB
  //     const totalSize = file.size;
  //     let uploadedBytes = 0;

  //     try {
  //       while (uploadedBytes < totalSize) {
  //         const currentFile = uploadingFiles[fileId];
  //         if (currentFile?.status === 'cancelled') {
  //           return { success: false, fileData: null };
  //         }

  //         const end = Math.min(uploadedBytes + chunkSize, totalSize) - 1;
  //         const chunk = file.slice(uploadedBytes, end + 1);
  //         const isLastChunk = end + 1 >= totalSize;

  //         const chunkHeaders = {
  //           ...instructions.headers,
  //           'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
  //           'Content-Length': `${chunk.size}`,
  //         };

  //         let res;
  //         try {
  //           res = await axios.put(uploadUrl, chunk, {
  //             headers: chunkHeaders,
  //             validateStatus: () => true, // prevent axios from throwing automatically
  //           });
  //         } catch (axiosError) {
  //           if (isLastChunk) {
  //             console.log('Final chunk uploaded but response blocked by CORS');
  //             uploadedBytes = totalSize;
  //             setUploadingFiles(prev => ({
  //               ...prev,
  //               [fileId]: {
  //                 ...prev[fileId],
  //                 progress: 100,
  //                 status: 'completed',
  //               },
  //             }));
  //             return { success: true, fileData: null };
  //           }
  //           throw axiosError;
  //         }

  //         // Handle resumable continuation
  //         if (res.status === 308) {
  //           const range = res.headers['range'];
  //           if (range) {
  //             const rangeEnd = parseInt(range.split('-')[1], 10);
  //             uploadedBytes = rangeEnd + 1;
  //           } else {
  //             uploadedBytes = end + 1;
  //           }
  //         }
  //         // Final success (don’t parse body because of CORS)
  //         else if (res.status === 200 || res.status === 201) {
  //           uploadedBytes = totalSize;
  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               progress: 100,
  //               status: 'completed',
  //             },
  //           }));
  //           return { success: true, fileData: null }; // Metadata comes from backend
  //         } else if (res.status >= 400) {
  //           throw new Error(
  //             `Upload failed with status ${res.status}: ${res.statusText}`
  //           );
  //         } else {
  //           // Unexpected but advance cautiously
  //           uploadedBytes = end + 1;
  //         }

  //         // Update progress
  //         const progress = Math.round((uploadedBytes / totalSize) * 100);
  //         setUploadingFiles(prev => ({
  //           ...prev,
  //           [fileId]: {
  //             ...prev[fileId],
  //             progress: Math.min(progress, 99), // lock at 99% until confirmed
  //           },
  //         }));
  //       }

  //       // Loop finished → mark complete
  //       setUploadingFiles(prev => ({
  //         ...prev,
  //         [fileId]: {
  //           ...prev[fileId],
  //           progress: 100,
  //           status: 'completed',
  //         },
  //       }));

  //       return { success: true, fileData: null };
  //     } catch (error: any) {
  //       console.error('Upload error:', error);
  //       setUploadingFiles(prev => ({
  //         ...prev,
  //         [fileId]: {
  //           ...prev[fileId],
  //           status: 'error',
  //           error: error?.message || 'Upload failed',
  //         },
  //       }));
  //       return { success: false, fileData: null };
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
  //       // Get upload URLs from API (resumable session creation)
  //       const result = await dispatch(
  //         uploadCloudStorageFilesV2({
  //           files,
  //           ...options,
  //         })
  //       ).unwrap();
  //       console.log('res-', result);

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

  //       // Upload files sequentially (can parallelize if needed)
  //       let completedFiles = 0;
  //       const fileIds = Object.keys(fileEntries);
  //       const uploadResults: Array<{
  //         fileId: string;
  //         success: boolean;
  //         fileData: any;
  //       }> = [];

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
  //           uploadResults.push({ fileId, success: false, fileData: null });
  //           continue;
  //         }

  //         try {
  //           // 🔑 Pass fileId from instructions to uploadFileInChunks
  //           const result = await uploadFileInChunks(
  //             fileId,
  //             file,
  //             uploadUrl,
  //             instructions
  //           );
  //           console.log('result', result);

  //           uploadResults.push({
  //             fileId,
  //             success: result.success,
  //             fileData: result.fileData,
  //           });

  //           if (result.success) {
  //             completedFiles++;

  //             // Log file upload completion with metadata
  //             console.log('File upload completed successfully:', {
  //               localFileId: fileId, // Our local UUID
  //               googleFileId:
  //                 result.fileData?.id ||
  //                 result.fileData?.name ||
  //                 'ID not available',
  //               fileName: file.name,
  //               fileSize: file.size,
  //               fileType: file.type,
  //               fullUploadResponse: result.fileData,
  //             });

  //             // TODO: Call backend API here with the file information
  //             // Example: await callBackendAPI(fileId, file.name, result.fileData);
  //           } else {
  //             setUploadingFiles(prev => ({
  //               ...prev,
  //               [fileId]: {
  //                 ...prev[fileId],
  //                 status: 'error',
  //                 error: 'Upload failed',
  //               },
  //             }));
  //           }
  //         } catch (err: any) {
  //           console.error('Chunk upload error:', err);

  //           setUploadingFiles(prev => ({
  //             ...prev,
  //             [fileId]: {
  //               ...prev[fileId],
  //               status: 'error',
  //               error: err?.message || 'Upload failed',
  //             },
  //           }));

  //           uploadResults.push({ fileId, success: false, fileData: null });
  //         }
  //       }

  //       // Show completion notifications
  //       if (completedFiles === files.length) {
  //         notifications.show({
  //           message: `${completedFiles} file${
  //             completedFiles > 1 ? 's' : ''
  //           } uploaded successfully`,
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

  //       return uploadResults;
  //     } catch (error: any) {
  //       console.error('Upload initialization error:', error);

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

  //       return [];
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

          const chunkHeaders: Record<string, string> = {
            ...instructions.headers,
            'Content-Range': `bytes ${uploadedBytes}-${end}/${totalSize}`,
            'Content-Length': `${chunk.size}`,
          };

          let res;
          try {
            res = await axios.put(uploadUrl, chunk, {
              headers: chunkHeaders,
              validateStatus: () => true, // don’t throw on non-2xx
            });
          } catch (axiosError) {
            // Google Drive often blocks last-chunk response via CORS
            if (isLastChunk) {
              console.log(
                'Final chunk uploaded but response blocked by CORS (Google Drive case)'
              );
              uploadedBytes = totalSize;
              setUploadingFiles(prev => ({
                ...prev,
                [fileId]: {
                  ...prev[fileId],
                  progress: 100,
                  status: 'completed',
                },
              }));
              return { success: true, fileData: null }; // metadata comes later from backend
            }
            throw axiosError;
          }

          // --- Resumable continuation ---
          if (res.status === 308) {
            const range = res.headers['range'];
            if (range) {
              const rangeEnd = parseInt(range.split('-')[1], 10);
              uploadedBytes = rangeEnd + 1;
            } else {
              uploadedBytes = end + 1;
            }
          }
          // --- Final success (Google Drive / OneDrive) ---
          else if (res.status === 200 || res.status === 201) {
            uploadedBytes = totalSize;

            let fileData = null;
            try {
              // OneDrive usually returns JSON
              if (typeof res.data === 'object') {
                fileData = res.data;
              }
            } catch (err) {
              // Google Drive CORS case: ignore
              fileData = null;
            }

            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                progress: 100,
                status: 'completed',
              },
            }));
            return { success: true, fileData };
          }
          // --- Error case ---
          else if (res.status >= 400) {
            throw new Error(
              `Upload failed with status ${res.status}: ${res.statusText}`
            );
          } else {
            // Unexpected response → still advance
            uploadedBytes = end + 1;
          }

          // Update progress
          const progress = Math.round((uploadedBytes / totalSize) * 100);
          setUploadingFiles(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: Math.min(progress, 99),
            },
          }));
        }

        // Completed loop → mark finished
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
      options: { id?: string; account_id?: string } = {},
      accountType?: string
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
        // 🔑 Backend decides Google Drive vs OneDrive and creates session
        const result = await dispatch(
          uploadCloudStorageFilesV2({ files, ...options })
        ).unwrap();

        const { uploadUrls } = result.response.data;

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

        const fileIds = Object.keys(fileEntries);
        const uploadResults: Array<{
          fileId: string;
          success: boolean;
          fileData: any;
        }> = [];

        let completedFiles = 0;

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

          try {
            const result = await uploadFileInChunks(
              fileId,
              file,
              uploadUrl,
              instructions
            );

            uploadResults.push({
              fileId,
              success: result.success,
              fileData: result.fileData,
            });

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
            console.error('Chunk upload error:', err);

            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: {
                ...prev[fileId],
                status: 'error',
                error: err?.message || 'Upload failed',
              },
            }));

            uploadResults.push({ fileId, success: false, fileData: null });
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
        return uploadResults;
      } catch (error: any) {
        console.error('Upload initialization error:', error);
        notifications.show({
          message: error?.message || 'Failed to start upload',
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
