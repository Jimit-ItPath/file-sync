import { Box, Group, ScrollArea, SegmentedControl } from '@mantine/core';
import ActionButtons from './components/ActionButtons';
import FileTable from './components/FileTable';
// import RecentFiles from './RecentFiles';
import useDashboard from './use-dashboard';
import { SelectionBar, Tooltip } from '../../components';
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
            <SegmentedControl
              value={layout}
              onChange={(value: string) =>
                switchLayout(value as 'list' | 'grid')
              }
              p={7}
              color="#1c7ed6"
              data={[
                {
                  value: 'list',
                  label: (
                    <Tooltip label="List View" withArrow fz="xs">
                      <ICONS.IconList
                        // size={20}
                        color={layout === 'list' ? '#ffffff' : '#1c7ed6'}
                      />
                    </Tooltip>
                  ),
                },
                {
                  value: 'grid',
                  label: (
                    <Tooltip label="Grid View" withArrow fz="xs">
                      <ICONS.IconGridDots
                        // size={20}
                        color={layout === 'grid' ? '#ffffff' : '#1c7ed6'}
                      />
                    </Tooltip>
                  ),
                },
              ]}
              styles={() => ({
                root: {
                  // backgroundColor: theme.colors.gray[2],
                  backgroundColor: '#f3f4f6'
                },
              })}
            />
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
