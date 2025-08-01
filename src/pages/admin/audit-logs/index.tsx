import { ActionIcon, Box, Group, TextInput } from '@mantine/core';
import { Button, CustomAutocomplete, Table } from '../../../components';
import useAuditLogs from './use-audit-logs';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import { LoaderOverlay } from '../../../components/loader';

const AdminAuditLogs = () => {
  const {
    auditLogs,
    columns,
    handleScroll,
    handleSearchChange,
    scrollBoxRef,
    searchTerm,
    handleUserSearch,
    userSearchResults,
    selectedUser,
    handleUserSelect,
    handleClearSelection,
    handleExportLogs,
    downloadLogsLoading,
  } = useAuditLogs();
  const { isMd } = useResponsive();

  return (
    <Box>
      <LoaderOverlay visible={downloadLogsLoading} opacity={1} />
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
        <Group justify={isMd ? 'flex-start' : 'flex-end'} mt={16} gap="md">
          {auditLogs?.length ? (
            <Button
              mt={26}
              onClick={handleExportLogs}
              disabled={downloadLogsLoading}
            >
              Export Logs
            </Button>
          ) : null}
          <CustomAutocomplete
            data={userSearchResults}
            placeholder="Search users..."
            value={selectedUser}
            onChange={handleUserSelect}
            onSearchChange={handleUserSearch}
            onClear={handleClearSelection}
            searchable
            clearable
            maw={300}
            w={'100%'}
            label="Filter by User"
            size="sm"
          />
          <TextInput
            placeholder="Search logs..."
            value={searchTerm}
            onChange={event => handleSearchChange(event.currentTarget.value)}
            rightSection={
              searchTerm ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => handleSearchChange('')}
                  style={{ cursor: 'pointer' }}
                >
                  <ICONS.IconX size={14} />
                </ActionIcon>
              ) : null
            }
            maw={300}
            w={'100%'}
            size="sm"
            label="Search Logs"
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
