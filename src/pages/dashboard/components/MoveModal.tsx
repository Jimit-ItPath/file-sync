import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Group,
  Text,
  ActionIcon,
  Box,
  Loader,
  Center,
} from '@mantine/core';
import { ICONS } from '../../../assets/icons';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchMoveModalFolders,
  setMoveModalPath,
  resetMoveModalState,
} from '../../../store/slices/cloudStorage.slice';
import type { FileType } from '../use-dashboard';
import getFileIcon from '../../../components/file-icon';
import { Breadcrumbs, Button, Modal, Tooltip } from '../../../components';
import InfiniteScroll from 'react-infinite-scroll-component';
import useResponsive from '../../../hooks/use-responsive';

type MoveModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedItems: FileType[];
  onMoveConfirm: (
    destinationId: string | null,
    destinationName: string
  ) => void;
  currentFolderId: string | null;
  checkLocation: boolean;
  accountId?: string;
  currentAccountId?: string;
};

type FolderData = {
  id: string;
  name: string;
  type: 'folder';
  icon: (size: number) => React.ReactNode;
  parent_id: string | null;
  external_parent_id?: string | null;
};

const MoveModal: React.FC<MoveModalProps> = ({
  opened,
  onClose,
  selectedItems,
  onMoveConfirm,
  currentFolderId,
  checkLocation,
  accountId,
  currentAccountId,
}) => {
  if (!opened) return null;
  const dispatch = useAppDispatch();
  const { isXs } = useResponsive();

  const { moveModal } = useAppSelector(state => state.cloudStorage);
  const { folders, loading, currentPath, pagination } = moveModal;
  const [moveLoading, setMoveLoading] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<{
    id: string | null;
    name: string;
  } | null>(null);

  // Convert CloudStorageType to FolderData
  const folderData = useMemo<FolderData[]>(() => {
    return folders.map(item => ({
      id: item.id,
      name: item.name,
      type: 'folder' as const,
      icon: getFileIcon({
        entry_type: item.entry_type,
        mime_type: item.mime_type,
        file_extension: item.file_extension,
        name: item.name,
      }),
      parent_id: item.parent_id,
      external_parent_id: item.external_parent_id,
    }));
  }, [folders]);

  // Get modal title based on selected items
  const modalTitle = useMemo(() => {
    if (selectedItems.length === 1) {
      return `Move "${selectedItems[0].name}"`;
    }
    return `Move ${selectedItems.length} items`;
  }, [selectedItems]);

  // Get current location display
  const currentLocationText = useMemo(() => {
    if (currentPath.length === 0) {
      return 'All Files';
    }
    return currentPath[currentPath.length - 1].name;
  }, [currentPath]);

  // Check if moving folders is allowed
  const canMoveFolders = useMemo(() => {
    return checkLocation || currentFolderId;
  }, [checkLocation, currentFolderId]);

  // Filter selected items based on move permissions
  const validSelectedItems = useMemo(() => {
    if (canMoveFolders) {
      return selectedItems;
    }
    return selectedItems.filter(item => item.type === 'file');
  }, [selectedItems, canMoveFolders]);

  // Check if move is valid
  const isMoveValid = useMemo(() => {
    if (!selectedDestination) return false;

    // Prevent moving into same folder as currentFolderId
    if (selectedDestination.id === currentFolderId) return false;

    // Prevent moving to root if already at root
    if (selectedDestination.id === null && currentFolderId === null)
      return false;

    // Prevent moving a folder into itself
    const movingFolderIds = validSelectedItems
      .filter(item => item.type === 'folder')
      .map(item => item.id);
    if (movingFolderIds.includes(selectedDestination.id || '')) return false;

    return true;
  }, [selectedDestination, currentFolderId, validSelectedItems]);

  // Fetch folders for current level
  const fetchFolders = useCallback(
    async (folderId: string | null = null, page = 1) => {
      try {
        const requestParams: any = {
          limit: 20,
          page,
        };

        if (folderId) {
          requestParams.id = folderId;
        }

        if (checkLocation && currentAccountId) {
          requestParams.account_id = Number(currentAccountId);
        } else if (!checkLocation && accountId !== 'all') {
          requestParams.account_id = accountId;
        }

        await dispatch(fetchMoveModalFolders(requestParams)).unwrap();
      } catch (error: any) {
        notifications.show({
          message: error?.message || 'Failed to load folders',
          color: 'red',
        });
      }
    },
    [dispatch, checkLocation, currentAccountId, accountId]
  );

  // Navigate to folder
  const navigateToFolder = useCallback(
    (folder: { id: string; name: string } | null) => {
      if (folder) {
        const newPath = [...currentPath, { id: folder.id, name: folder.name }];
        dispatch(setMoveModalPath(newPath));
        setSelectedDestination({ id: folder.id, name: folder.name });
        fetchFolders(folder.id);
      } else {
        dispatch(setMoveModalPath([]));
        setSelectedDestination({ id: null, name: 'All Files' });
        fetchFolders(null);
      }
    },
    [dispatch, currentPath, fetchFolders]
  );

  // Navigate back
  const navigateBack = useCallback(() => {
    if (currentPath.length === 0) return;

    if (currentPath.length === 1) {
      navigateToFolder(null);
    } else {
      const newPath = currentPath.slice(0, -1);
      const parentFolder = newPath[newPath.length - 1];
      dispatch(setMoveModalPath(newPath));
      setSelectedDestination(
        parentFolder
          ? { id: parentFolder.id ?? null, name: parentFolder.name }
          : { id: null, name: 'All Files' }
      );
      fetchFolders(parentFolder?.id || null);
    }
  }, [dispatch, currentPath, navigateToFolder]);

  const selectedFolderIds = useMemo(
    () => selectedItems.filter(i => i.type === 'folder').map(i => i.id),
    [selectedItems]
  );

  // build set of disabled folders = selected folders + their descendants (from current folderData)
  const disabledFolderIds = useMemo(() => {
    if (!selectedFolderIds.length) return new Set<string>();

    // parent -> [children]
    const childrenMap = new Map<string | null, string[]>();
    folderData.forEach(f => {
      const pid = f.parent_id ?? null;
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid)!.push(f.id);
    });

    const result = new Set<string>(selectedFolderIds);
    const stack = [...selectedFolderIds];

    while (stack.length) {
      const id = stack.pop()!;
      const children = childrenMap.get(id) || [];
      children.forEach(childId => {
        if (!result.has(childId)) {
          result.add(childId);
          stack.push(childId);
        }
      });
    }

    return result;
  }, [selectedFolderIds, folderData]);

  const isFolderDisabled = useCallback(
    (folderId: string) => disabledFolderIds.has(folderId),
    [disabledFolderIds]
  );

  // if the current selectedDestination becomes disabled, fallback to current location
  useEffect(() => {
    if (
      selectedDestination?.id &&
      disabledFolderIds.has(selectedDestination.id)
    ) {
      if (currentPath.length > 0) {
        const currentFolder = currentPath[currentPath.length - 1];
        setSelectedDestination({
          id: currentFolder.id ?? null,
          name: currentFolder.name,
        });
      } else {
        setSelectedDestination({ id: null, name: 'All Files' });
      }
    }
  }, [disabledFolderIds, selectedDestination, currentPath]);

  // Handle folder selection/deselection

  const handleFolderSelect = useCallback(
    (folder: FolderData) => {
      if (isFolderDisabled(folder.id)) return;
      setSelectedDestination(prev => {
        const isSameFolder = prev?.id === folder.id;

        // CASE 1: From root level
        if (currentFolderId === null) {
          if (isSameFolder && folder.parent_id === null) {
            // Root folder is the current path — don't allow deselect
            return prev;
          }
        }

        // CASE 2: From nested level
        // Allow toggling root folders freely
        if (isSameFolder) {
          // Deselect → fallback to current location
          if (currentPath.length > 0) {
            const currentFolder = currentPath[currentPath.length - 1];
            return { id: currentFolder.id ?? null, name: currentFolder.name };
          } else {
            return { id: null, name: 'All Files' };
          }
        }

        // Selecting a new folder
        return { id: folder.id, name: folder.name };
      });
    },
    [currentPath, currentFolderId, isFolderDisabled]
  );

  // Handle folder double click (navigate into)
  const handleFolderDoubleClick = useCallback(
    (folder: FolderData) => {
      if (isFolderDisabled(folder.id)) return;
      navigateToFolder({ id: folder.id, name: folder.name });
    },
    [navigateToFolder, isFolderDisabled]
  );

  // Handle clicking outside folders (deselect)
  // const handleContentClick = useCallback((e: React.MouseEvent) => {
  //   const target = e.target as HTMLElement;
  //   // Check if click is not on a folder card or its children
  //   if (!target.closest('[data-folder-card]')) {
  //     setSelectedDestination(null);
  //   }
  // }, []);

  // Handle move confirmation
  const handleMoveConfirm = useCallback(async () => {
    if (!selectedDestination || !isMoveValid) return;
    setMoveLoading(true);
    const res: any = await onMoveConfirm(
      selectedDestination.id,
      selectedDestination.name
    );
    setMoveLoading(false);
    if (res?.status === 200 || res?.data?.success) {
      handleMoveModalClose();
    }
  }, [selectedDestination, isMoveValid, onMoveConfirm]);

  const handleMoveModalClose = useCallback(() => {
    onClose();
    dispatch(resetMoveModalState());
    setSelectedDestination(null);
  }, [onClose, dispatch]);

  useEffect(() => {
    if (opened) {
      fetchFolders(currentFolderId || null);
    }
  }, [opened, fetchFolders]);

  //   useEffect(() => {
  //     if (opened) {
  //       // If currentPath is not root, set move modal path to currentPath
  //       if (currentPath && currentPath.length > 0) {
  //         dispatch(setMoveModalPath(currentPath));
  //         fetchFolders(currentPath[currentPath.length - 1].id || null, 1);
  //       } else {
  //         dispatch(setMoveModalPath([]));
  //         fetchFolders(null, 1);
  //       }
  //     }
  //   }, [opened, currentPath, dispatch, fetchFolders]);

  const hasUnmovableItems = selectedItems.length !== validSelectedItems.length;

  return (
    <Modal
      opened={opened}
      onClose={handleMoveModalClose}
      title={modalTitle}
      closeOnClickOutside={false}
      size="lg"
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '80vh',
        },
        close: {
          background: '#fff',
        },
        header: {
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 0,
          background: '#0056b3',
          color: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
        title: {
          fontSize: isXs ? '14px !important' : '18px',
          fontWeight: 600,
        },
      }}
    >
      <Stack gap={0} style={{ height: '100%', overflow: 'hidden' }}>
        {hasUnmovableItems && (
          <Box
            p="lg"
            style={{
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#fef3c7',
              flexShrink: 0,
            }}
          >
            <Group gap="sm">
              <ICONS.IconAlertTriangle size={18} color="#d97706" />
              <Text size="sm" c="orange.7" fw={500}>
                Note: Folders cannot be moved from this location. Only files
                will be moved.
              </Text>
            </Group>
          </Box>
        )}

        {/* Navigation Header */}
        <Box
          px={20}
          py={15}
          style={{
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              {currentPath.length > 0 && (
                <ActionIcon
                  variant="subtle"
                  size="md"
                  onClick={navigateBack}
                  style={{
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#e2e8f0',
                    },
                  }}
                >
                  <ICONS.IconArrowLeft size={18} />
                </ActionIcon>
              )}
              <Group align="center">
                <Text size="xs" c="dimmed" fw={500} tt="uppercase" lts={0.5}>
                  Current Location:
                </Text>
                <Text size="sm" fw={600} c="dark">
                  {currentLocationText}
                </Text>
              </Group>
            </Group>
          </Group>
        </Box>

        {/* Folders List */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
          // onClick={handleContentClick}
        >
          {/* {loading && (
            <Center h="100%">
              <Stack align="center" gap="md">
                <Loader size="md" color="blue" />
                <Text size="sm" c="dimmed" fw={500}>
                  Loading folders...
                </Text>
              </Stack>
            </Center>
          )} */}
          <InfiniteScroll
            dataLength={folderData.length}
            next={() => {
              if (
                pagination &&
                pagination.page_no < pagination.total_pages &&
                !loading
              ) {
                fetchFolders(
                  currentPath.length > 0
                    ? currentPath[currentPath.length - 1].id
                    : null,
                  pagination.page_no + 1
                );
              }
            }}
            hasMore={
              pagination ? pagination.page_no < pagination.total_pages : false
            }
            loader={
              <Center>
                <Loader size="md" color="blue" />
              </Center>
            }
            // height={'100%'}
            height={folderData?.length ? 400 : '100%'}
            style={{ padding: '10px' }}
            scrollThreshold={0.8}
          >
            {folderData.length === 0 ? (
              <Center h="100%">
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ICONS.IconFolder size={28} color="#64748b" />
                  </Box>
                  <Text size="sm" c="dimmed" fw={500} ta="center">
                    No folders available in this location
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap={5}>
                {folderData.map(folder => {
                  const disabled = isFolderDisabled(folder.id);
                  return (
                    <Box
                      key={folder.id}
                      data-folder-card
                      p={5}
                      style={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        pointerEvents: disabled ? 'none' : 'auto',
                        border:
                          selectedDestination?.id === folder.id
                            ? '2px solid #2563eb'
                            : '2px solid transparent',
                        backgroundColor:
                          selectedDestination?.id === folder.id
                            ? '#eff6ff'
                            : '#ffffff',
                        borderRadius: '12px',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onClick={() => handleFolderSelect(folder)}
                      onDoubleClick={() => handleFolderDoubleClick(folder)}
                      className="folder-card"
                    >
                      <Group justify="space-between" gap={10} align="center">
                        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                          <Box
                            style={{
                              padding: '4px',
                              borderRadius: '4px',
                              backgroundColor:
                                selectedDestination?.id === folder.id
                                  ? '#dbeafe'
                                  : '#f8fafc',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {folder.icon(22)}
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Tooltip
                              label={
                                disabled
                                  ? "Can't move into this folder"
                                  : folder.name
                              }
                              fz={'xs'}
                            >
                              <Text
                                size="sm"
                                fw={500}
                                truncate
                                style={{
                                  color:
                                    selectedDestination?.id === folder.id
                                      ? '#1e40af'
                                      : '#374151',
                                  transition: 'color 0.15s ease',
                                }}
                              >
                                {folder.name}
                              </Text>
                            </Tooltip>
                          </Box>
                        </Group>

                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleFolderDoubleClick(folder);
                          }}
                          style={{
                            borderRadius: '6px',
                            transition: 'all 0.15s ease',
                            opacity: 0,
                          }}
                          mr={10}
                          className="folder-arrow"
                        >
                          <ICONS.IconChevronRight size={16} />
                        </ActionIcon>
                      </Group>

                      {/* Selection indicator */}
                      {selectedDestination?.id === folder.id && (
                        <Box
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: '#2563eb',
                            borderRadius: '0 4px 4px 0',
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </InfiniteScroll>
        </Box>

        {/* Footer */}
        <Box
          p="lg"
          style={{
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <Breadcrumbs
            items={currentPath}
            onNavigate={folderId => {
              if (folderId === null) {
                dispatch(setMoveModalPath([]));
                setSelectedDestination({ id: null, name: 'All Files' });
                fetchFolders(null);
              } else {
                const folderIndex = currentPath.findIndex(
                  f => f.id === folderId
                );
                if (folderIndex >= 0) {
                  const newPath = currentPath.slice(0, folderIndex + 1);
                  dispatch(setMoveModalPath(newPath));
                  setSelectedDestination({
                    id: folderId!,
                    name: newPath[folderIndex].name,
                  });
                  fetchFolders(folderId);
                }
              }
            }}
          />
          <Group justify="space-between" align="center" mt={isXs ? 10 : 0}>
            <Text size="xs" c="dimmed">
              {selectedDestination
                ? `Moving to: ${selectedDestination.name}`
                : 'Select a destination folder'}
            </Text>
            <Group gap="sm">
              <Button
                variant="outline"
                onClick={handleMoveModalClose}
                style={{
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                }}
                disabled={moveLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMoveConfirm}
                disabled={!isMoveValid || moveLoading}
                style={{
                  backgroundColor:
                    !isMoveValid || moveLoading ? '#9ca3af' : '#2563eb',
                }}
              >
                Move Here
              </Button>
            </Group>
          </Group>
        </Box>
      </Stack>

      <style>{`
        .folder-card:hover {
          background-color: #f8fafc !important;
          border-color: #d1d5db !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .folder-card:hover .folder-arrow {
          opacity: 1 !important;
          background-color: #e2e8f0;
        }
        
        .folder-card:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Override hover styles for selected folder */
        .folder-card:hover {
          background-color: ${selectedDestination ? '#eff6ff' : '#f8fafc'} !important;
        }
      `}</style>
    </Modal>
  );
};

export default MoveModal;
