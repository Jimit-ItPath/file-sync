import { Box, Group, ScrollArea } from '@mantine/core';
import ActionButtons from './components/ActionButtons';
import FileTable from './components/FileTable';
// import RecentFiles from './RecentFiles';
import useDashboard from './use-dashboard';
import { Button, SelectionBar, Tooltip } from '../../components';
import { ICONS } from '../../assets/icons';
import FileGrid from './components/FileGrid';
import DragDropOverlay from '../../components/inputs/dropzone/DragDropOverlay';
import UploadProgress from './components/UploadProgress';

const controlBoxStyles = {
  height: 40,
  display: 'flex',
  alignItems: 'center',
  borderRadius: 6,
};

const Dashboard = () => {
  const {
    layout,
    switchLayout,
    files,
    folders,
    regularFiles,
    handleDeleteSelected,
    handleDownloadSelected,
    handleSelect,
    handleShareSelected,
    handleUnselectAll,
    selectedIds,
    handleKeyDown,
    setSelectedIds,
    setLastSelectedIndex,
    getIndexById,
    onSelectAll,
    onSelectRow,
    dragRef,
    isDragging,
    uploadProgress,
    handleCancelUpload,
    uploadingFiles,
  } = useDashboard();

  return (
    <Box bg="#fff" h="100vh">
      <ScrollArea h="100vh">
        <Box
          p={32}
          bg="#f8fafc"
          ref={dragRef}
          style={{
            position: 'relative',
            minHeight: 'calc(100vh - 120px)',
            transition: 'all 0.2s ease-in-out',
            ...(isDragging && {
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
            }),
          }}
        >
          <DragDropOverlay
            isDragging={isDragging}
            message="Drop files here to upload"
            subMessage="Support for PDF, DOC, XLS, PPT, images and more"
          />
          <ActionButtons />
          {/* <RecentFiles /> */}
          <Group mb={30} align="center" style={{ width: '100%' }}>
            {selectedIds.length > 0 ? (
              <Box style={{ ...controlBoxStyles, flex: 1, marginRight: 12 }}>
                <SelectionBar
                  count={selectedIds.length}
                  onCancel={handleUnselectAll}
                  onDelete={handleDeleteSelected}
                  onDownload={handleDownloadSelected}
                  onShare={handleShareSelected}
                />
              </Box>
            ) : (
              <Box style={{ flex: 1, marginRight: 12 }} />
            )}

            <Box
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                border: '1px solid #a5b4fc',
                overflow: 'hidden',
                height: 45,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Tooltip label="List View" withArrow fz="xs">
                <Button
                  style={{
                    background: layout === 'list' ? '#4f46e5' : 'transparent',
                    border: 'none',
                    borderRight: '1px solid #a5b4fc',
                    padding: '0 14px',
                    height: '100%',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.3s ease',
                  }}
                  borderRadius={0}
                  onClick={() => switchLayout('list')}
                  aria-label="List View"
                >
                  <ICONS.IconList
                    size={20}
                    color={layout === 'list' ? '#e0e7ff' : '#64748b'}
                  />
                </Button>
              </Tooltip>
              <Tooltip label="Grid View" withArrow fz="xs">
                <Button
                  style={{
                    background: layout === 'grid' ? '#4f46e5' : 'transparent',
                    border: 'none',
                    padding: '0 14px',
                    height: '100%',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.3s ease',
                  }}
                  bdrs={0}
                  onClick={() => switchLayout('grid')}
                  aria-label="Grid View"
                >
                  <ICONS.IconGridDots
                    size={20}
                    color={layout === 'grid' ? '#e0e7ff' : '#64748b'}
                  />
                </Button>
              </Tooltip>
            </Box>
          </Group>
          {layout === 'list' ? (
            <FileTable
              {...{
                files,
                handleSelect,
                handleKeyDown,
                onSelectAll,
                onSelectRow,
                selectedIds,
              }}
            />
          ) : (
            <FileGrid
              {...{
                files: regularFiles,
                handleSelect,
                selectedIds,
                folders,
                handleKeyDown,
                handleUnselectAll,
                getIndexById,
                setLastSelectedIndex,
                setSelectedIds,
              }}
            />
          )}
        </Box>
      </ScrollArea>
      <UploadProgress
        uploadProgress={uploadProgress}
        uploadingFiles={uploadingFiles}
        onCancelUpload={handleCancelUpload}
      />
    </Box>
  );
};

export default Dashboard;
