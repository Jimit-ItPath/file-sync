import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Box,
  Button,
  Loader,
  ScrollArea,
  Image,
} from '@mantine/core';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { ICONS } from '../../../assets/icons';
import {
  IMAGE_FILE_TYPES,
  VIDEO_FILE_TYPES,
  DOCUMENT_FILE_TYPES,
} from '../../../utils/constants';
import { getVideoMimeType } from '../../../utils/helper';

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// File size limit in bytes (50MB)
const FILE_SIZE_LIMIT = 50 * 1024 * 1024;

type PreviewFileType = {
  url: string;
  type: string;
  name: string;
  size?: number;
  isVideo?: boolean;
  isDocument?: boolean;
  share?: string | null;
};

interface FullScreenPreviewProps {
  previewFile: PreviewFileType | null;
  previewFileLoading: boolean;
  previewModalOpen: boolean;
  setPreviewModalOpen: (value: boolean) => void;
  setPreviewFile: (value: PreviewFileType | null) => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const minZoom = 0.5;
const maxZoom = 2;
const zoomStep = 0.2;
const defaultPdfWidth = 800;

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  previewFile,
  previewFileLoading,
  previewModalOpen,
  setPreviewModalOpen,
  setPreviewFile,
  onDownload,
  onShare,
}) => {
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState(false);
  const [pdfPages, setPdfPages] = useState<number>(0);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfWidth, setPdfWidth] = useState(defaultPdfWidth);
  const [isDragging, setIsDragging] = useState(false);

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const videoPlayer = useRef<any>(null);

  // Reset state when preview opens/closes
  useEffect(() => {
    if (previewModalOpen) {
      setImageZoom(1);
      setPdfZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setLoadError(false);
    }
  }, [previewModalOpen, previewFile]);

  useEffect(() => {
    const handleResize = () => {
      if (scrollAreaRef.current) {
        const containerWidth = scrollAreaRef.current.clientWidth;
        setPdfWidth(Math.min(containerWidth * 0.9, defaultPdfWidth));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewModalOpen) return;
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewModalOpen, imageZoom]);

  // Prevent body scroll when preview is open
  useEffect(() => {
    document.body.style.overflow = previewModalOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewModalOpen]);

  // Setup video.js when video file
  useEffect(() => {
    if (isVideoFile() && videoRef.current && previewFile?.url) {
      const mimeType = getVideoMimeType(previewFile.type);
      videoPlayer.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
      });
      videoPlayer.current.src({ src: previewFile.url, type: mimeType });
    }
    return () => {
      if (videoPlayer.current) {
        videoPlayer.current.dispose();
        videoPlayer.current = null;
      }
    };
  }, [previewFile]);

  const handleClose = useCallback(() => {
    setPreviewModalOpen(false);
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  }, [previewFile, setPreviewModalOpen, setPreviewFile]);

  const isImageFile = useCallback(() => {
    return (
      previewFile?.type &&
      IMAGE_FILE_TYPES.some(ext =>
        previewFile.type.toLowerCase().includes(ext.replace('.', ''))
      )
    );
  }, [previewFile]);

  const isVideoFile = useCallback(() => {
    return (
      previewFile?.isVideo ||
      (previewFile?.type &&
        VIDEO_FILE_TYPES.some(ext =>
          previewFile.type.toLowerCase().includes(ext.replace('.', ''))
        ))
    );
  }, [previewFile]);

  const isDocumentFile = useCallback(() => {
    return (
      previewFile?.isDocument ||
      (previewFile?.type &&
        DOCUMENT_FILE_TYPES.some(ext =>
          previewFile.type.toLowerCase().includes(ext.replace('.', ''))
        ))
    );
  }, [previewFile]);

  const handleZoomIn = useCallback(() => {
    if (isImageFile()) {
      setImageZoom(prev => Math.min(prev * 1.2, maxZoom));
    } else if (isDocumentFile()) {
      // setPdfZoom(prev => Math.min(prev + 0.2, maxZoom));
      setPdfZoom(prev => Math.min(prev + zoomStep, maxZoom));
    }
  }, [isDocumentFile, isImageFile]);

  const handleZoomOut = useCallback(() => {
    if (isImageFile()) {
      setImageZoom(prev => Math.max(prev / 1.2, minZoom));
    } else if (isDocumentFile()) {
      // setPdfZoom(prev => Math.max(prev - 0.2, minZoom)); // Decrement PDF zoom
      setPdfZoom(prev => Math.max(prev - zoomStep, minZoom));
    }
  }, [isImageFile, isDocumentFile]);

  const handleZoomReset = useCallback(() => {
    setPdfZoom(1);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isImageFile()) return;
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    },
    [handleZoomIn, handleZoomOut, isImageFile]
  );

  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey || !isDocumentFile()) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    setPdfZoom(prev => Math.min(Math.max(prev + delta, minZoom), maxZoom));
  }, []);

  const isTextFile = useCallback(() => {
    return ['txt', 'json'].some(ext =>
      previewFile?.name?.toLowerCase().endsWith(ext)
    );
  }, [previewFile]);

  const isFileTooLarge = useCallback(() => {
    return previewFile?.size && previewFile.size > FILE_SIZE_LIMIT;
  }, [previewFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollAreaRef.current) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    scrollAreaRef.current.scrollLeft = scrollPos.x - deltaX;
    scrollAreaRef.current.scrollTop = scrollPos.y - deltaY;
  };

  const handleMouseUp = () => {
    if (!isDragging || !scrollAreaRef.current) return;
    setIsDragging(false);
    setScrollPos({
      x: scrollAreaRef.current.scrollLeft,
      y: scrollAreaRef.current.scrollTop,
    });
  };

  const renderUnsupportedPreview = (message: string) => (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        gap: '20px',
      }}
    >
      <Text size="lg" c="#fff">
        {message}
      </Text>
      <Button
        variant="filled"
        size="md"
        onClick={onDownload}
        leftSection={<ICONS.IconDownload size={16} />}
      >
        Download
      </Button>
    </Box>
  );

  const renderContent = () => {
    if (previewFileLoading) {
      return (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Loader size="xl" />
        </Box>
      );
    }
    if (!previewFile) return null;
    if (loadError) {
      return (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '20px',
          }}
        >
          <Text size="lg" c="dimmed">
            Failed to load preview
          </Text>
          <Group>
            {onDownload && (
              <Button
                variant="filled"
                onClick={onDownload}
                leftSection={<ICONS.IconDownload size={16} />}
              >
                Download
              </Button>
            )}
          </Group>
        </Box>
      );
    }
    if (isFileTooLarge()) {
      return renderUnsupportedPreview(
        'File is too large to preview. Please download it.'
      );
    }
    if (isImageFile()) {
      return (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            overflow: 'hidden',
            cursor: imageZoom > 1 ? 'grab' : 'default',
          }}
          onWheel={handleWheel}
        >
          <Image
            src={previewFile.url}
            alt={previewFile.name}
            style={{
              width: previewFile.size ? 'auto' : '100%',
              height: previewFile.size ? 'auto' : '100%',
              transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
              userSelect: 'none',
              pointerEvents: 'none',
              transition: 'transform 0.2s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onError={() => setLoadError(true)}
          />
          <Box
            style={{
              position: 'absolute',
              bottom: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <Tooltip label="Zoom Out" fz={'xs'}>
              <ActionIcon
                variant="filled"
                color="dark"
                onClick={handleZoomOut}
                disabled={imageZoom <= minZoom}
              >
                <ICONS.IconMinus size={16} />
              </ActionIcon>
            </Tooltip>
            <Text
              size="sm"
              c="white"
              style={{
                minWidth: '50px',
                textAlign: 'center',
                alignSelf: 'center',
              }}
            >
              {Math.round(imageZoom * 100)}%
            </Text>
            <Tooltip label="Zoom In" fz={'xs'}>
              <ActionIcon
                variant="filled"
                color="dark"
                onClick={handleZoomIn}
                disabled={imageZoom >= maxZoom}
              >
                <ICONS.IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </Box>
      );
    }
    if (isVideoFile()) {
      const mimeType = getVideoMimeType(previewFile.type);
      if (!mimeType) {
        return renderUnsupportedPreview(
          'Preview not supported for this video format. Please download it.'
        );
      }

      return (
        <Box
          //   style={{ height: 'calc(100vh - 100px)', width: '50%' }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Box style={{ width: '100%', maxWidth: '80%', aspectRatio: '16/9' }}>
            <video
              ref={videoRef as any}
              id="video-player"
              className="video-js vjs-big-play-centered"
              controls
              preload="auto"
              style={{ width: '100%', height: '100%' }}
            >
              <source src={`${previewFile.url}`} type={mimeType} />
            </video>
          </Box>
        </Box>
      );
    }
    if (isDocumentFile()) {
      return (
        <ScrollArea
          ref={scrollAreaRef}
          style={{
            height: '100%',
            width: '100%',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheelZoom}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 0',
              transformOrigin: 'center top',
              transform: `scale(${pdfZoom})`,
              width: `${pdfWidth}px`,
              margin: '0 auto',
            }}
          >
            <Document
              file={previewFile.url}
              onLoadSuccess={({ numPages }) => setPdfPages(numPages)}
              loading={
                <Box
                  style={{
                    height: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Loader size="xl" />
                </Box>
              }
            >
              {Array.from({ length: pdfPages }, (_, idx) => (
                <Box
                  key={idx}
                  style={{
                    marginBottom: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    backgroundColor: '#fff',
                  }}
                >
                  <Page
                    pageNumber={idx + 1}
                    width={pdfWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Box>
              ))}
            </Document>
          </Box>

          {/* Enhanced Zoom Controls */}
          <Box
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '24px',
              padding: '8px 12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Tooltip label="Zoom Out (Ctrl + Scroll)" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleZoomOut}
                disabled={pdfZoom <= minZoom}
                size="lg"
              >
                <ICONS.IconMinus size={20} />
              </ActionIcon>
            </Tooltip>

            <Button
              variant="subtle"
              color="gray"
              onClick={handleZoomReset}
              size="xs"
              style={{ minWidth: '80px' }}
            >
              {Math.round(pdfZoom * 100)}%
            </Button>

            <Tooltip label="Zoom In (Ctrl + Scroll)" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleZoomIn}
                disabled={pdfZoom >= maxZoom}
                size="lg"
              >
                <ICONS.IconPlus size={20} />
              </ActionIcon>
            </Tooltip>

            <Box
              style={{
                height: '24px',
                width: '1px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                margin: '0 8px',
              }}
            />

            <Tooltip label="Fit to Width" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  if (scrollAreaRef.current) {
                    const containerWidth = scrollAreaRef.current.clientWidth;
                    setPdfZoom(containerWidth / pdfWidth);
                  }
                }}
                size="lg"
              >
                <ICONS.IconArrowsHorizontal size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Fit to Page" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => {
                  if (scrollAreaRef.current) {
                    const containerHeight = scrollAreaRef.current.clientHeight;
                    setPdfZoom((containerHeight * 0.9) / (pdfWidth * 1.414)); // A4 ratio
                  }
                }}
                size="lg"
              >
                <ICONS.IconArrowsVertical size={20} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </ScrollArea>
      );
    }
    if (isTextFile()) {
      return (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Box style={{ width: '100%', maxWidth: '80%', aspectRatio: '16/9' }}>
            <iframe
              src={previewFile.url}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#fff',
              }}
              title={previewFile.name}
            />
          </Box>
        </Box>
      );
    }
    return renderUnsupportedPreview(
      'Preview is not supported for this file. Please download it.'
    );
  };

  if (!previewModalOpen) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <style>{`@keyframes fadeIn { from {opacity:0;} to {opacity:1;} }`}</style>
      {/* Floating Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          // backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Text
          size="md"
          c="white"
          style={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '50%',
          }}
          title={previewFile?.name}
        >
          {previewFile?.name}
        </Text>
        <Group gap="sm">
          {onShare && previewFile?.share && (
            <Tooltip label="Share" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onShare}
                radius={'xl'}
                size={'lg'}
                style={{ color: 'white', transition: 'transform 0.15s ease' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'scale(1.1)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <ICONS.IconShare size={20} />
              </ActionIcon>
            </Tooltip>
          )}
          {onDownload && (
            <Tooltip label="Download" fz={'xs'}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onDownload}
                radius={'xl'}
                size={'lg'}
                style={{ color: 'white', transition: 'transform 0.15s ease' }}
                onMouseEnter={e =>
                  (e.currentTarget.style.transform = 'scale(1.1)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                <ICONS.IconDownload size={20} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Close (Esc)" fz={'xs'}>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleClose}
              radius={'xl'}
              size={'lg'}
              style={{ color: 'white', transition: 'transform 0.15s ease' }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = 'scale(1.1)')
              }
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <ICONS.IconX size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
      {/* Content */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>{renderContent()}</Box>
    </Box>
  );
};

export default FullScreenPreview;
