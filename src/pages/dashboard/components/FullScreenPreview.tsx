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
  AUDIO_FILE_TYPES,
} from '../../../utils/constants';
import { getVideoMimeType, shouldDisableDownload } from '../../../utils/helper';
import useResponsive from '../../../hooks/use-responsive';

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
  isAudio?: boolean;
  share?: string | null;
  mimeType?: string;
};

interface FullScreenPreviewProps {
  previewFile: PreviewFileType | null;
  previewFileLoading: boolean;
  previewModalOpen: boolean;
  previewProgress: number | null;
  previewAbortRef: React.RefObject<AbortController | null>;
  setPreviewModalOpen: (value: boolean) => void;
  setPreviewFile: (value: PreviewFileType | null) => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const minZoom = 0.5;
const maxZoom = 2;
// const zoomStep = 0.2;
// const defaultPdfWidth = 800;

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  previewFile,
  previewFileLoading,
  previewModalOpen,
  previewAbortRef,
  previewProgress = null,
  setPreviewModalOpen,
  setPreviewFile,
  onDownload,
  onShare,
}) => {
  const { isXs, isSm } = useResponsive();
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [loadError, setLoadError] = useState(false);
  const [pdfPages, setPdfPages] = useState<number>(0);
  // const [pdfZoom, setPdfZoom] = useState(1);
  // const [pdfWidth, setPdfWidth] = useState(defaultPdfWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDragging, setImageDragging] = useState(false);
  const [imageStartPos, setImageStartPos] = useState({ x: 0, y: 0 });
  const [imageLastPos, setImageLastPos] = useState({ x: 0, y: 0 });

  const [pdfScale, setPdfScale] = useState(1);
  // const [pdfPageDimensions, setPdfPageDimensions] = useState({
  //   width: 0,
  //   height: 0,
  // });

  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const videoPlayer = useRef<any>(null);

  // Reset state when preview opens/closes
  useEffect(() => {
    if (previewModalOpen) {
      setImageZoom(1);
      // setPdfZoom(1);
      if (isXs) {
        setPdfScale(0.5);
      } else if (isSm) {
        setPdfScale(0.7);
      } else {
        setPdfScale(1);
      }
      setImagePosition({ x: 0, y: 0 });
      setImageLastPos({ x: 0, y: 0 });
      setLoadError(false);
    }
  }, [previewModalOpen, previewFile]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (scrollAreaRef.current) {
  //       const containerWidth = scrollAreaRef.current.clientWidth;
  //       // setPdfWidth(Math.min(containerWidth * 0.9, defaultPdfWidth));
  //     }
  //   };

  //   handleResize();
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

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
    if (previewAbortRef.current) {
      previewAbortRef.current.abort();
      previewAbortRef.current = null;
    }
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

  const isAudioFile = useCallback(() => {
    return (
      previewFile?.isAudio ||
      (previewFile?.type &&
        AUDIO_FILE_TYPES.some(ext =>
          previewFile.type.toLowerCase().includes(ext.replace('.', ''))
        ))
    );
  }, [previewFile]);

  const handleZoomIn = useCallback(() => {
    if (isImageFile()) {
      setImageZoom(prev => Math.min(prev * 1.2, maxZoom));
    } else if (isDocumentFile()) {
      // setPdfZoom(prev => Math.min(prev + 0.2, maxZoom));
      // setPdfZoom(prev => Math.min(prev + zoomStep, maxZoom));
    }
  }, [isDocumentFile, isImageFile]);

  const handleZoomOut = useCallback(() => {
    if (isImageFile()) {
      setImageZoom(prev => Math.max(prev / 1.2, minZoom));
    } else if (isDocumentFile()) {
      // setPdfZoom(prev => Math.max(prev - 0.2, minZoom)); // Decrement PDF zoom
      // setPdfZoom(prev => Math.max(prev - zoomStep, minZoom));
    }
  }, [isImageFile, isDocumentFile]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!isImageFile()) return;
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    },
    [handleZoomIn, handleZoomOut, isImageFile]
  );

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

  const handleImageMouseDown = (e: React.MouseEvent) => {
    if (imageZoom <= 1) return; // Only allow dragging when zoomed in
    e.preventDefault();
    setImageDragging(true);
    setImageStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageDragging || imageZoom <= 1) return;

    const deltaX = e.clientX - imageStartPos.x;
    const deltaY = e.clientY - imageStartPos.y;

    setImagePosition({
      x: imageLastPos.x + deltaX,
      y: imageLastPos.y + deltaY,
    });
  };

  const handleImageMouseUp = () => {
    if (!imageDragging) return;
    setImageDragging(false);
    setImageLastPos(imagePosition);
  };

  const handlePdfZoomIn = useCallback(() => {
    setPdfScale(prev => Math.min(prev + 0.25, 3)); // Higher resolution increments
  }, []);

  const handlePdfZoomOut = useCallback(() => {
    setPdfScale(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handlePdfZoomReset = useCallback(() => {
    setPdfScale(1);
  }, []);

  const handlePdfWheelZoom = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setPdfScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  if (!previewFile) return null;

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
      {!shouldDisableDownload(previewFile?.mimeType!, previewFile) && (
        <Button
          variant="filled"
          size="md"
          onClick={onDownload}
          leftSection={<ICONS.IconDownload size={16} />}
        >
          Download
        </Button>
      )}
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
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <Loader size="xl" />
          {previewProgress !== null && (
            <Text size="sm" c="white">
              {previewProgress}%
            </Text>
          )}
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
            {onDownload &&
              !shouldDisableDownload(previewFile?.mimeType!, previewFile) && (
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
      const message = shouldDisableDownload(previewFile?.mimeType!, previewFile)
        ? 'File is too large to preview.'
        : 'File is too large to preview. Please download it.';
      return renderUnsupportedPreview(message);
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
            cursor:
              imageZoom > 1 ? (imageDragging ? 'grabbing' : 'grab') : 'default',
            userSelect: 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleImageMouseDown}
          onMouseMove={handleImageMouseMove}
          onMouseUp={handleImageMouseUp}
          onMouseLeave={handleImageMouseUp}
        >
          <Image
            src={previewFile.url}
            alt={previewFile.name}
            style={{
              width: 'auto',
              height: 'auto',
              transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
              userSelect: 'none',
              pointerEvents: 'none',
              transition: imageDragging ? 'none' : 'transform 0.2s ease',
              maxWidth: imageZoom <= 1 ? '100%' : 'none',
              maxHeight: imageZoom <= 1 ? '100%' : 'none',
              objectFit: 'contain',
            }}
            onError={() => setLoadError(true)}
          />

          {/* Image Zoom Controls */}
          <Box
            style={{
              position: 'absolute',
              bottom: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '24px',
              padding: '8px 12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            <Tooltip label="Zoom Out" fz={'xs'} zIndex={1000}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleZoomOut}
                disabled={imageZoom <= minZoom}
                size="lg"
              >
                <ICONS.IconMinus size={20} />
              </ActionIcon>
            </Tooltip>

            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setImageZoom(1);
                setImagePosition({ x: 0, y: 0 });
                setImageLastPos({ x: 0, y: 0 });
              }}
              size="xs"
              style={{ minWidth: '80px' }}
            >
              {Math.round(imageZoom * 100)}%
            </Button>

            <Tooltip label="Zoom In" fz={'xs'} zIndex={1000}>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={handleZoomIn}
                disabled={imageZoom >= maxZoom}
                size="lg"
              >
                <ICONS.IconPlus size={20} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Reset Position" fz={'xs'} zIndex={1000}>
              <ActionIcon
                variant="filled"
                color="dark"
                onClick={() => {
                  setImagePosition({ x: 0, y: 0 });
                  setImageLastPos({ x: 0, y: 0 });
                }}
                // disabled={imageZoom <= 1}
              >
                <ICONS.IconFocus2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Box>
        </Box>
      );
    }
    if (isVideoFile()) {
      const mimeType = getVideoMimeType(previewFile.type);
      if (!mimeType) {
        const message = shouldDisableDownload(
          previewFile?.mimeType!,
          previewFile
        )
          ? 'Preview not supported for this video format.'
          : 'Preview not supported for this video format. Please download it.';
        return renderUnsupportedPreview(message);
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
        <Box style={{ height: '100%', width: '100%', position: 'relative' }}>
          <ScrollArea
            ref={scrollAreaRef}
            style={{
              height: '100%',
              width: '100%',
              cursor: 'default',
              overflowX: 'auto',
              overflowY: 'auto',
              // cursor: isDragging ? 'grabbing' : 'grab',
            }}
            viewportProps={{
              style: {
                pointerEvents: 'auto',
                zIndex: 10,
              },
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handlePdfWheelZoom}
            scrollbars={'xy'}
            type="auto"
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                // minHeight: '100%',
                minWidth: 'max-content',
                width: 'fit-content',
                margin: '0 auto',
              }}
            >
              <Document
                file={previewFile.url}
                onLoadSuccess={({ numPages }) => {
                  setPdfPages(numPages);
                  // Get page dimensions for proper scaling
                  // const page = document.querySelector('.react-pdf__Page');
                  // if (page) {
                  //   const rect = page.getBoundingClientRect();
                  //   setPdfPageDimensions({
                  //     width: rect.width,
                  //     height: rect.height,
                  //   });
                  // }
                }}
                loading={
                  <Box
                    style={{
                      height: '50vh',
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
                    key={`${idx}-${pdfScale}`} // Force re-render on scale change
                    style={{
                      marginBottom: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      // overflow: 'hidden',
                      overflow: 'visible',
                      display: 'flex',
                      justifyContent: 'center',
                      width: 'auto',
                    }}
                  >
                    <Page
                      pageNumber={idx + 1}
                      scale={pdfScale} // This is the key - react-pdf renders at this resolution
                      renderTextLayer={true} // Enable for crisp text
                      renderAnnotationLayer={false}
                      loading={
                        <Box
                          style={{
                            height: '600px',
                            width: '450px',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Loader />
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </Document>
            </Box>

            {/* PDF Zoom Controls */}
            <Box
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderRadius: '32px',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                zIndex: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <Tooltip label="Zoom Out" fz={'xs'} zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handlePdfZoomOut}
                  disabled={pdfScale <= 0.5}
                  size="lg"
                >
                  <ICONS.IconMinus size={20} />
                </ActionIcon>
              </Tooltip>

              <Button
                variant="subtle"
                color="gray"
                onClick={handlePdfZoomReset}
                size="sm"
                style={{ minWidth: '90px', fontWeight: 500 }}
              >
                {Math.round(pdfScale * 100)}%
              </Button>

              <Tooltip label="Zoom In" fz={'xs'} zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handlePdfZoomIn}
                  disabled={pdfScale >= 3}
                  size="lg"
                >
                  <ICONS.IconPlus size={20} />
                </ActionIcon>
              </Tooltip>

              <Box
                style={{
                  height: '28px',
                  width: '1px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  margin: '0 8px',
                }}
              />

              <Tooltip label="Fit to Width" fz={'xs'} zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    if (scrollAreaRef.current) {
                      const containerWidth = scrollAreaRef.current.clientWidth;
                      const targetWidth = containerWidth - 80; // Account for padding
                      const pageWidth = 595; // Standard A4 width in points
                      const newScale = targetWidth / pageWidth;
                      // const newScale = (containerWidth * 0.85) / 595; // A4 width in points
                      setPdfScale(Math.max(0.5, Math.min(3, newScale)));
                    }
                  }}
                  size="lg"
                >
                  <ICONS.IconArrowsHorizontal size={20} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Fit to Height" fz={'xs'} zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    if (scrollAreaRef.current) {
                      const containerHeight =
                        scrollAreaRef.current.clientHeight;
                      const targetHeight = containerHeight - 140; // Account for padding and controls
                      const pageHeight = 842; // Standard A4 height in points
                      // const newScale = (containerHeight * 0.85) / 842; // A4 height in points
                      const newScale = targetHeight / pageHeight;
                      setPdfScale(Math.max(0.5, Math.min(3, newScale)));
                    }
                  }}
                  size="lg"
                >
                  <ICONS.IconArrowsVertical size={20} />
                </ActionIcon>
              </Tooltip>
            </Box>
          </ScrollArea>
        </Box>
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
    if (isAudioFile()) {
      return (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            gap: '20px',
            padding: '40px',
          }}
        >
          {/* Audio Visualization/Icon */}
          <Box
            style={{
              width: isXs ? '150px' : '200px',
              height: isXs ? '150px' : '200px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              marginBottom: '20px',
            }}
          >
            <ICONS.IconVolume
              size={isXs ? 60 : 80}
              style={{ color: 'white' }}
            />
          </Box>

          {/* File Name */}
          <Text
            size={isXs ? 'md' : 'xl'}
            fw={600}
            c="white"
            ta="center"
            style={{ marginBottom: '20px', maxWidth: '80%' }}
          >
            {previewFile.name}
          </Text>

          {/* Audio Player */}
          <Box
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <audio
              controls
              style={{
                width: '100%',
                height: '54px',
                borderRadius: '8px',
              }}
              onError={() => setLoadError(true)}
            >
              <source src={previewFile.url} type="audio/mpeg" />
              <source src={previewFile.url} type="audio/wav" />
              <source src={previewFile.url} type="audio/mp4" />
              <source src={previewFile.url} type="audio/aac" />
              <source src={previewFile.url} type="audio/ogg" />
              Your browser does not support the audio element.
            </audio>
          </Box>

          {/* Additional Info */}
          {/* {previewFile.size && (
            <Text size="sm" c="rgba(255, 255, 255, 0.7)">
              {Math.round((previewFile.size / 1024 / 1024) * 100) / 100} MB
            </Text>
          )} */}
        </Box>
      );
    }
    const message = shouldDisableDownload(previewFile?.mimeType!, previewFile)
      ? 'Preview is not supported for this file.'
      : 'Preview is not supported for this file. Please download it.';
    return renderUnsupportedPreview(message);
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
            <Tooltip label="Share" fz={'xs'} zIndex={1000}>
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
          {onDownload &&
            !shouldDisableDownload(previewFile?.mimeType!, previewFile) && (
              <Tooltip label="Download" fz={'xs'} zIndex={1000}>
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
          <Tooltip label="Close (Esc)" fz={'xs'} zIndex={1000}>
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
