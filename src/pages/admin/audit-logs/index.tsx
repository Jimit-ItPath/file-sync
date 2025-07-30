import { Box, Group, Stack, Text, TextInput } from '@mantine/core';
import { Button, Form, Modal, Table } from '../../../components';
import useAuditLogs from './use-audit-logs';

const AdminAuditLogs = () => {
  const {
    auditLogs,
    columns,
    handleScroll,
    handleSearchChange,
    scrollBoxRef,
    searchTerm,
  } = useAuditLogs();

  return (
    <Box>
      {/* <LoaderOverlay visible={loading} opacity={1} /> */}
      <Box
        px={32}
        pb={20}
        bg="#f8fafc"
        ref={scrollBoxRef}
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.2s ease-in-out',
        }}
        onScroll={handleScroll}
      >
        <Group justify="flex-end" w={'100%'} mt={16}>
          <TextInput
            placeholder="Search logs..."
            value={searchTerm}
            onChange={event => handleSearchChange(event.currentTarget.value)}
            maw={500}
            w={'100%'}
          />
        </Group>
        <Box mt={20}>
          <Table
            data={auditLogs}
            columns={columns}
            idKey="id"
            emptyMessage="No logs available."
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAuditLogs;
