import { downloadFilesEnhanced } from './../../../utils/helper/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  downloadFiles,
  fetchRecentFiles,
  removeCloudStorageFiles,
  renameCloudStorageFile,
  resetRecentFiles,
  syncCloudStorage,
} from '../../../store/slices/cloudStorage.slice';
import useAsyncOperation from '../../../hooks/use-async-operation';
import getFileIcon from '../../../components/file-icon';
import { formatDate, formatFileSize } from '../../../utils/helper';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import type { FileType } from '../use-dashboard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DOCUMENT_FILE_TYPES,
  PREVIEW_FILE_TYPES,
  VIDEO_FILE_TYPES,
} from '../../../utils/constants';

const renameSchema = z.object({
  newName: z.string().trim().min(1, 'New name is required'),
});

type RenameFormData = z.infer<typeof renameSchema>;

type UseRecentFilesProps = {
  downloadFile: (ids: string[]) => Promise<void>;
};

const useRecentFiles = ({ downloadFile }: UseRecentFilesProps) => {
  const { loading, recentFiles } = useAppSelector(state => state.cloudStorage);
  const dispatch = useAppDispatch();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileType | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileType | null>(null);
  const [removeFilesModalOpen, setRemoveFilesModalOpen] = useState(false);
  const [previewFileLoading, setPreviewFileLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: string;
    name: string;
    isVideo?: boolean;
    isDocument?: boolean;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  const renameMethods = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    mode: 'onChange',
  });

  const { reset: resetRenameForm } = renameMethods;

  const getRecentFiles = useCallback(async () => {
    await dispatch(fetchRecentFiles({}));
  }, [dispatch]);

  const [onGetRecentFiles] = useAsyncOperation(getRecentFiles);

  const recentFilesData = useMemo(() => {
    return recentFiles.map(item => ({
      id: item.id,
      name: item.name,
      type:
        item.entry_type === 'folder' ? 'folder' : ('file' as 'file' | 'folder'),
      icon: getFileIcon({
        entry_type: 'file',
        mime_type: item.mime_type,
        file_extension: item.file_extension,
        name: item.name,
      }),
      owner: { name: 'You', avatar: null, initials: 'JS' },
      lastModified: item.modified_at
        ? formatDate(item.modified_at)
        : formatDate(item.updatedAt),
      size: item.size ? formatFileSize(item.size.toString()) : null,
      mimeType: item.mime_type,
      fileExtension: item.file_extension,
      preview: item.download_url,
      parent_id: item.parent_id,
      web_view_url: item.web_view_url,
      external_parent_id: item.external_parent_id,
      UserConnectedAccount: item.UserConnectedAccount,
    }));
  }, [recentFiles]);

  useEffect(() => {
    onGetRecentFiles({});

    return () => {
      dispatch(resetRecentFiles());
    };
  }, []);

  const handleMenuItemClick = (actionId: string, row: FileType) => {
    if (
      actionId === 'download' &&
      (row.type !== 'folder' ||
        row.mimeType !== 'application/vnd.google-apps.folder')
    ) {
      downloadItems([row.id]);
    } else if (actionId === 'rename') {
      setItemToRename(row);
      setRenameModalOpen(true);
      resetRenameForm({ newName: row.name });
    } else if (actionId === 'delete') {
      setItemToDelete(row);
      setDeleteModalOpen(true);
    } else if (actionId === 'share' && row.web_view_url) {
      window.open(row.web_view_url, '_blank');
    } else if (actionId === 'preview') {
      // preview code
      previewItems(row);
    }
  };

  const [renameFile, renameFileLoading] = useAsyncOperation(
    async ({ fileId, newName }: { fileId: string; newName: string }) => {
      try {
        await dispatch(
          renameCloudStorageFile({ id: fileId, name: newName })
        ).unwrap();
        onGetRecentFiles({});
        notifications.show({
          message: 'Item renamed successfully',
          color: 'green',
        });
        setRenameModalOpen(false);
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to rename item',
          color: 'red',
        });
      }
    }
  );

  const handleRenameConfirm = renameMethods.handleSubmit(data => {
    if (itemToRename?.id) {
      renameFile({ fileId: itemToRename.id, newName: data.newName });
    }
  });

  // File deletion functionality
  const [removeFile, removeFileLoading] = useAsyncOperation(
    async (fileId: string) => {
      try {
        const res = await dispatch(removeCloudStorageFiles({ ids: [fileId] }));

        if (res?.payload?.status === 200 || res?.payload?.success !== false) {
          onGetRecentFiles({});
          notifications.show({
            message: res?.payload?.message || 'Item deleted successfully',
            color: 'green',
          });
          setDeleteModalOpen(false);
        } else {
          notifications.show({
            message: res?.payload?.message || 'Failed to delete item',
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message: error || 'Failed to delete item',
          color: 'red',
        });
      }
    }
  );

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete?.id) {
      removeFile(itemToDelete.id);
    }
  }, [itemToDelete, removeFile]);

  const allIds = useMemo(
    () => recentFilesData.map(f => f.id),
    [recentFilesData]
  );

  const getIndexById = useCallback(
    (id: string) => allIds.findIndex(i => i === id),
    [allIds]
  );

  const handleSelect = useCallback(
    (id: string, event: React.MouseEvent) => {
      const idx = getIndexById(id);

      const isCheckboxClick = (event.target as HTMLElement).closest(
        '[type="checkbox"]'
      );

      if (isCheckboxClick) {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else if (event.shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, idx);
        const end = Math.max(lastSelectedIndex, idx);
        const rangeIds = allIds.slice(start, end + 1);
        setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])));
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedIds(prev =>
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
        setLastSelectedIndex(idx);
      } else {
        setSelectedIds([id]);
        setLastSelectedIndex(idx);
      }
    },
    [allIds, lastSelectedIndex, getIndexById]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(recentFilesData.map(f => f.id));
  }, [recentFilesData]);

  const handleUnselectAll = useCallback(() => {
    setSelectedIds([]);
    setLastSelectedIndex(null);
  }, []);

  const onSelectRow = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds(prev =>
        checked ? [...prev, id] : prev.filter(i => i !== id)
      );
      setLastSelectedIndex(getIndexById(id));
    },
    [getIndexById]
  );

  const onSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        handleSelectAll();
      } else {
        handleUnselectAll();
      }
    },
    [handleSelectAll, handleUnselectAll]
  );

  // Actions for selected items
  const handleDeleteSelected = useCallback(() => {
    setRemoveFilesModalOpen(true);
  }, []);

  const closeRemoveFilesModal = useCallback(() => {
    setRemoveFilesModalOpen(false);
  }, []);

  const [handleRemoveFilesConfirm, removeFilesLoading] = useAsyncOperation(
    async () => {
      try {
        const res = await dispatch(
          removeCloudStorageFiles({ ids: selectedIds })
        );

        if (res?.payload?.status === 200 || res?.payload?.success) {
          onGetRecentFiles({});
          notifications.show({
            message:
              res?.payload?.message ||
              `${selectedIds?.length > 1 ? 'Items' : 'Item'} deleted successfully`,
            color: 'green',
          });
          setSelectedIds([]);
          setLastSelectedIndex(null);
          closeRemoveFilesModal();
        } else {
          notifications.show({
            message:
              res?.payload?.message ||
              `Failed to delete ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
            color: 'red',
          });
        }
      } catch (error: any) {
        notifications.show({
          message:
            error ||
            `Failed to delete ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
          color: 'red',
        });
      }
    }
  );

  const handleShareSelected = useCallback(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    if (checkFiles?.web_view_url) {
      window.open(checkFiles.web_view_url, '_blank');
    }
  }, [recentFilesData, selectedIds]);

  const previewItems = async (row: FileType) => {
    try {
      setPreviewFileLoading(true);
      setPreviewModalOpen(true);
      const res = await dispatch(downloadFiles({ ids: [row.id] }));
      if (res.payload?.status === 200 && res.payload?.data instanceof Blob) {
        const url = URL.createObjectURL(res.payload?.data);
        const isVideo = row.fileExtension
          ? VIDEO_FILE_TYPES.includes(row.fileExtension.toLowerCase())
          : false;
        const isDocument = row.fileExtension
          ? DOCUMENT_FILE_TYPES.includes(row.fileExtension.toLowerCase())
          : false;
        setPreviewFile({
          url,
          type: row.fileExtension || row.mimeType || '',
          name: row.name,
          isVideo,
          isDocument,
        });
      } else {
        notifications.show({
          message: res?.payload?.message || 'Failed to preview file',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        message: error || 'Failed to preview file',
        color: 'red',
      });
    } finally {
      setPreviewFileLoading(false);
    }
  };

  const [downloadItems] = useAsyncOperation(async data => {
    try {
      const idsToDownload = Array.isArray(data) ? data : selectedIds;

      // Use the enhanced download system
      await downloadFilesEnhanced(idsToDownload, downloadFile);
    } catch (error: any) {
      notifications.show({
        message:
          error ||
          `Failed to download ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
        color: 'red',
      });
    }
  });

  // const [downloadItems] = useAsyncOperation(async data => {
  //   try {
  //     const res = await dispatch(
  //       downloadFiles({ ids: Array.isArray(data) ? data : selectedIds })
  //     );
  //     if (res?.payload?.status !== 200) {
  //       notifications.show({
  //         message:
  //           res?.payload?.message ||
  //           `Failed to download ${selectedIds.length > 1 ? 'items' : 'item'}`,
  //         color: 'red',
  //       });
  //       return;
  //     }
  //     downloadFilesHelper(res.payload.data, res);
  //   } catch (error: any) {
  //     notifications.show({
  //       message:
  //         error ||
  //         `Failed to download ${selectedIds?.length > 1 ? 'Items' : 'Item'}`,
  //       color: 'red',
  //     });
  //   }
  // });

  const handleDownloadSelected = useCallback(() => {
    downloadItems({});
  }, [selectedIds]);

  const [syncStorage, syncCloudStorageLoading] = useAsyncOperation(async () => {
    try {
      const res = await dispatch(syncCloudStorage({})).unwrap();

      if (res?.status === 200) {
        onGetRecentFiles({});
        notifications.show({
          message: res?.data?.message || 'Items synced successfully',
          color: 'green',
        });
      } else {
        notifications.show({
          message: res?.message || res?.data?.message || 'Failed to sync items',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        message: error?.message || 'Failed to sync items',
        color: 'red',
      });
    }
  });

  const handleSyncStorage = useCallback(() => {
    syncStorage({});
  }, [syncStorage]);

  const displayDownloadIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.type === 'file' ? true : false;
  }, [selectedIds, recentFilesData]);

  const displayShareIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.web_view_url ? true : false;
  }, [selectedIds, recentFilesData]);

  const displayPreviewIcon = useMemo(() => {
    const checkFiles = recentFilesData.find(file =>
      selectedIds.includes(file.id)
    );
    return checkFiles?.type === 'file' &&
      checkFiles.fileExtension &&
      PREVIEW_FILE_TYPES.includes(checkFiles?.fileExtension)
      ? true
      : false;
  }, [selectedIds, recentFilesData]);

  return {
    loading,
    selectedIds,
    setSelectedIds,
    setLastSelectedIndex,
    handleSelect,
    handleUnselectAll,
    handleDeleteSelected,
    handleDownloadSelected,
    handleShareSelected,
    getIndexById,
    onSelectAll,
    onSelectRow,
    getFileIcon,

    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    removeFileLoading,
    handleDeleteConfirm,
    removeFilesModalOpen,
    removeFilesLoading,

    renameModalOpen,
    setRenameModalOpen,
    itemToRename,
    renameMethods,
    handleRenameConfirm,
    renameFileLoading,
    handleRemoveFilesConfirm,
    closeRemoveFilesModal,

    handleMenuItemClick,
    allIds,
    lastSelectedIndex,
    handleSyncStorage,
    syncCloudStorageLoading,
    recentFiles: recentFilesData,
    displayDownloadIcon,
    displayShareIcon,
    location,

    // preview
    previewModalOpen,
    setPreviewModalOpen,
    previewFile,
    setPreviewFile,
    previewFileLoading,
    displayPreviewIcon,
  };
};

export default useRecentFiles;
