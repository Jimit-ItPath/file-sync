import React from 'react';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Box,
  Avatar,
  Badge,
  Divider,
  ScrollArea,
  Center,
  Paper,
  ThemeIcon,
  Image,
  Loader,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { FileType } from '../use-dashboard';
import { formatDateAndTime, getFileMimeTypeLabel } from '../../../utils/helper';
import GoogleDriveIcon from '../../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../../assets/svgs/Dropbox.svg';
import OnedriveIcon from '../../../assets/svgs/OneDrive.svg';
import { IMAGE_FILE_TYPES } from '../../../utils/constants';

interface FileDetailsDrawerProps {
  opened: boolean;
  onClose: () => void;
  item: FileType | null;
  onNavigateToFolder?: (folder: { id: string; name: string }) => void;
  onPreview?: (item: FileType) => void;
  detailsFile: {
    url: string;
    type: string;
    name: string;
    size?: number | undefined;
    isVideo?: boolean | undefined;
    isDocument?: boolean | undefined;
    share?: string | null | undefined;
  } | null;
  detailsFileLoading?: boolean;
}

const FileDetailsDrawer: React.FC<FileDetailsDrawerProps> = ({
  opened,
  onClose,
  item,
  onNavigateToFolder,
  onPreview,
  detailsFile = null,
  detailsFileLoading = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!item) return null;

  const isFolder =
    item.type === 'folder' ||
    item.mimeType === 'application/vnd.google-apps.folder';

  const handleFolderNavigation = () => {
    if (isFolder && onNavigateToFolder) {
      onNavigateToFolder({ id: item.id, name: item.name });
      onClose();
    }
  };

  const getFileTypeLabel = () => {
    if (isFolder) return 'Folder';
    if (item.mimeType) {
      if (item.mimeType.startsWith('image/')) return 'Image';
      if (item.mimeType.startsWith('video/')) return 'Video';
      if (item.mimeType.startsWith('audio/')) return 'Audio';
      if (item.mimeType.includes('pdf')) return 'PDF Document';
      if (item.mimeType.includes('document')) return 'Document';
      if (item.mimeType.includes('spreadsheet')) return 'Spreadsheet';
      if (item.mimeType.includes('presentation')) return 'Presentation';
    }
    if (item.fileExtension) {
      return `${item.fileExtension.toUpperCase()} File`;
    }
    return 'File';
  };

  const getStorageProvider = () => {
    if (item.UserConnectedAccount?.account_type || item?.account_type) {
      let type = '';
      if (item?.account_type) {
        type = item?.account_type!?.toLowerCase();
      } else {
        type = item.UserConnectedAccount?.account_type!?.toLowerCase();
      }
      if (type.includes('google_drive'))
        return {
          name: 'Google Drive',
          icon: <Image src={GoogleDriveIcon} w={12} />,
        };
      if (type.includes('dropbox'))
        return { name: 'Dropbox', icon: <Image src={DropboxIcon} w={12} /> };
      if (type.includes('onedrive'))
        return { name: 'OneDrive', icon: <Image src={OnedriveIcon} w={12} /> };
    }
    return null;
  };

  const renderPreviewSection = () => {
    if (isFolder) {
      return (
        <Paper
          p="xl"
          style={{
            backgroundColor: '#f6faff',
            // border: '2px dashed #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={handleFolderNavigation}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.backgroundColor = '#eff6ff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.backgroundColor = '#f6faff';
          }}
        >
          <Center>
            <Stack align="center" gap="sm">
              <ThemeIcon size="xl" variant="light" color="blue" radius="xl">
                {item.icon(48)}
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">
                Click to open folder
              </Text>
            </Stack>
          </Center>
        </Paper>
      );
    }
    return (
      <Paper
        p="xl"
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
        }}
      >
        <Center>
          {detailsFileLoading ? (
            <Loader />
          ) : detailsFile && IMAGE_FILE_TYPES.includes(detailsFile?.type) ? (
            <Stack
              align="center"
              style={{ cursor: 'pointer' }}
              onClick={() => onPreview?.(item)}
            >
              <Image src={detailsFile.url} alt={detailsFile.name} w={200} />
            </Stack>
          ) : (
            <Stack align="center" gap="sm">
              <ThemeIcon size="xl" variant="light" radius="xl">
                {item.icon(48)}
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">
                {getFileTypeLabel()}
              </Text>
              <Box onClick={() => onPreview?.(item)}>
                <Group gap="sm">
                  <Badge color="blue" style={{ cursor: 'pointer' }}>
                    Preview
                  </Badge>
                </Group>
              </Box>
            </Stack>
          )}
        </Center>
      </Paper>
    );
  };

  const renderMetadataItem = (
    label: string,
    value: string | React.ReactNode
  ) => (
    <Group justify="space-between" wrap="nowrap">
      <Group gap="xs" miw={0}>
        <Text size="sm" c="dimmed" style={{ minWidth: 'fit-content' }}>
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={500} ta="right" style={{ wordBreak: 'break-word' }}>
        {value}
      </Text>
    </Group>
  );

  const storageProvider = getStorageProvider();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      title={`${item.name}`}
      size={isMobile ? '100%' : 480}
      transitionProps={{
        // transition: 'slide-left',
        duration: 300,
        timingFunction: 'ease-out',
        keepMounted: false,
      }}
      styles={{
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        title: {
          fontWeight: 600,
          maxWidth: '90%',
          fontSize: '18px',
          paddingLeft: '16px',
        },
      }}
    >
      <style>
        {`
          .drawer-content {
            background-color: #fff;
          }
        `}
      </style>
      <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
        <Stack gap="lg" p="md">
          {/* Preview Section */}
          <Box>{renderPreviewSection()}</Box>

          {/* File Name */}
          <Stack gap="xs">
            {/* <Text fw={600} size="xl" style={{ wordBreak: 'break-word' }}>
              {item.name}
            </Text> */}
            <Group gap="xs">
              <Badge variant="light" color="blue" size="sm">
                {getFileTypeLabel()}
              </Badge>
              {storageProvider && (
                <Badge variant="light" color="gray" size="sm">
                  <Group gap={4}>
                    {/* <storageProvider.icon size={12} /> */}
                    {storageProvider.icon}
                    {storageProvider.name}
                  </Group>
                </Badge>
              )}
            </Group>
          </Stack>

          <Divider />

          {/* Metadata */}
          <Stack gap="md">
            <Text fw={600} size="md">
              Information
            </Text>
            <Stack gap="sm">
              {renderMetadataItem('Type', getFileTypeLabel())}

              {item.size && renderMetadataItem('Size', item.size)}

              {renderMetadataItem(
                'Modified',
                item.lastModified ? formatDateAndTime(item.lastModified) : '-'
              )}

              {renderMetadataItem(
                'Owner',
                <Group gap="xs" justify="flex-end">
                  <Avatar size="sm" radius="xl" color="blue">
                    {item.owner.initials}
                  </Avatar>
                  <Text size="sm">{item.owner.name}</Text>
                </Group>
              )}

              {item.UserConnectedAccount &&
                renderMetadataItem(
                  'Account',
                  item.UserConnectedAccount.account_name
                )}

              {/* {item.mimeType && renderMetadataItem('MIME Type', item.mimeType)} */}

              {item.mimeType ? (
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" miw={0}>
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{ minWidth: 'fit-content' }}
                    >
                      MIME TYPE
                    </Text>
                  </Group>
                  <Text
                    size="sm"
                    fw={500}
                    ta="right"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {item.mimeType} ({getFileMimeTypeLabel(item.mimeType)})
                  </Text>
                </Group>
              ) : null}

              {item.fileExtension &&
                renderMetadataItem('Extension', item.fileExtension)}
            </Stack>
          </Stack>
        </Stack>
      </ScrollArea>
    </Drawer>
  );
};

export default FileDetailsDrawer;
