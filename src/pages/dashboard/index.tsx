import { Box, ScrollArea } from '@mantine/core';
import ActionButtons from './components/ActionButtons';
import FileTable from './components/FileTable';
// import RecentFiles from './RecentFiles';
import useDashboard from './use-dashboard';
import { Button, Tooltip } from '../../components';
import { ICONS } from '../../assets/icons';
import FileGrid from './components/FileGrid';

const pillStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  background: '#f3f4f6',
  borderRadius: 999,
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  height: 30,
};

const iconButtonStyles = (active: boolean) => ({
  background: active ? '#e0e7ff' : 'transparent',
  border: 'none',
  borderRight: '1px solid',
  padding: '0 16px',
  height: '100%',
  cursor: 'pointer',
  outline: 'none',
});

const lastIconButtonStyles = (active: boolean) => ({
  background: active ? '#e0e7ff' : 'transparent',
  border: 'none',
  padding: '0 16px',
  height: '100%',
  cursor: 'pointer',
  outline: 'none',
});

const Dashboard = () => {
  const { layout, switchLayout, files, folders, regularFiles } = useDashboard();
  return (
    <Box bg="#fff" h="100vh">
      <ScrollArea h="100vh">
        <Box p={32} bg="#f8fafc">
          <ActionButtons />
          {/* <RecentFiles /> */}
          <Box mb={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box style={pillStyles}>
              <Tooltip label="List View" withArrow>
                <Button
                  style={iconButtonStyles(layout === 'list')}
                  onClick={() => switchLayout('list')}
                  aria-label="List View"
                >
                  <ICONS.IconList
                    size={20}
                    color={layout === 'list' ? '#2563eb' : '#64748b'}
                  />
                </Button>
              </Tooltip>
              <Tooltip label="Grid View" withArrow>
                <Button
                  style={lastIconButtonStyles(layout === 'grid')}
                  onClick={() => switchLayout('grid')}
                  aria-label="Grid View"
                >
                  <ICONS.IconGridDots
                    size={20}
                    color={layout === 'grid' ? '#2563eb' : '#64748b'}
                  />
                </Button>
              </Tooltip>
            </Box>
          </Box>
          {/* <Group justify="flex-end" mb={16} gap={0}>
            <Tooltip label="List View" withArrow>
              <ActionIcon
                variant={layout === 'list' ? 'filled' : 'light'}
                color="blue"
                size="lg"
                onClick={() => switchLayout('list')}
                aria-label="List View"
              >
                <ICONS.IconList size={22} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Grid View" withArrow>
              <ActionIcon
                variant={layout === 'grid' ? 'filled' : 'light'}
                color="blue"
                size="lg"
                onClick={() => switchLayout('grid')}
                aria-label="Grid View"
              >
                <ICONS.IconGridDots size={22} />
              </ActionIcon>
            </Tooltip>
          </Group> */}
          {layout === 'list' ? (
            <FileTable files={files} />
          ) : (
            <FileGrid files={regularFiles} folders={folders} />
          )}
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default Dashboard;
