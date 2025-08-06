import React from 'react';
import { Modal } from '../../../components';
import { Group, Image, Loader } from '@mantine/core';
import {
  DOCUMENT_FILE_TYPES,
  IMAGE_FILE_TYPES,
} from '../../../utils/constants';

type PreviewFileType = {
  url: string;
  type: string;
  name: string;
  isVideo?: boolean;
  isDocument?: boolean;
};

interface FilePreviewModalProps {
  previewModalOpen: boolean;
  previewFile: PreviewFileType | null;
  previewFileLoading: boolean;
  setPreviewModalOpen: (value: React.SetStateAction<boolean>) => void;
  setPreviewFile: (value: React.SetStateAction<PreviewFileType | null>) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  previewFile,
  previewFileLoading,
  previewModalOpen,
  setPreviewFile,
  setPreviewModalOpen,
}) => {
  const modalStyles = {
    maxWidth: '90vw',
    // maxHeight: '90vh',
    aspectRatio: previewFile?.isVideo ? '16/9' : undefined,
  };
  return (
    <Modal
      opened={previewModalOpen}
      onClose={() => {
        setPreviewModalOpen(false);
        if (previewFile?.url) URL.revokeObjectURL(previewFile.url);
        setPreviewFile(null);
      }}
      title={`Preview: ${previewFile?.name || ''}`}
      size="xl"
      styles={{ content: modalStyles }}
    >
      {previewFileLoading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : previewFile?.isVideo ? (
        <video controls style={{ width: '100%', height: '100%' }}>
          <source src={previewFile.url} type={`video/${previewFile.type}`} />
          Your browser does not support the video tag.
        </video>
      ) : previewFile?.type && IMAGE_FILE_TYPES.includes(previewFile?.type) ? (
        <Image
          src={previewFile.url}
          alt={previewFile.name}
          fit="contain"
          h={500}
        />
      ) : previewFile?.type &&
        DOCUMENT_FILE_TYPES.includes(previewFile?.type) ? (
        <iframe
          src={previewFile.url}
          title={previewFile.name}
          style={{ width: '100%', height: '80vh' }}
        />
      ) : (
        <div>
          <p>Preview not supported for this file type.</p>
          <a href={previewFile?.url} download={previewFile?.name}>
            Download
          </a>
        </div>
      )}
    </Modal>
  );
};

export default FilePreviewModal;
