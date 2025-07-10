import { Box, ScrollArea } from '@mantine/core';
import ActionButtons from './ActionButtons';
import FileTable from './FileTable';
import RecentFiles from './RecentFiles';

const Dashboard = () => {
  return (
    <Box bg="#fff" h="100vh">
      <ScrollArea h="100vh">
        <Box p={32} bg="#f8fafc">
          <ActionButtons />
          <RecentFiles />
          <FileTable />
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default Dashboard;
