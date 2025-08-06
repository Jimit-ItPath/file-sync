import { ActionIcon, Box, Group, Text, TextInput } from '@mantine/core';
import { Button, Card, CustomAutocomplete } from '../../../components';
import useAuditLogs from './use-audit-logs';
import { ICONS } from '../../../assets/icons';
import useResponsive from '../../../hooks/use-responsive';
import { LoaderOverlay } from '../../../components/loader';
import { DataTable } from 'mantine-datatable';

const AdminAuditLogs = () => {
  const {
    auditLogs,
    columns,
    handleSearchChange,
    searchTerm,
    handleUserSearch,
    userSearchResults,
    selectedUser,
    handleUserSelect,
    handleClearSelection,
    handleExportLogs,
    downloadLogsLoading,
    handlePageChange,
    currentPage,
    totalRecords,
    limit,
    handleLimitChange,
  } = useAuditLogs();
  const { isMd } = useResponsive();

  return (
    <Box>
      <LoaderOverlay visible={downloadLogsLoading} opacity={1} />
      <Box
        px={32}
        pb={20}
        bg="#f8fafc"
        style={{
          position: 'relative',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.2s ease-in-out',
        }}
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
          <Card>
            {auditLogs.length > 0 ? (
              <DataTable
                withTableBorder
                borderRadius="md"
                records={auditLogs}
                columns={columns}
                totalRecords={totalRecords}
                recordsPerPage={limit}
                page={currentPage}
                onPageChange={handlePageChange}
                onRecordsPerPageChange={handleLimitChange}
                recordsPerPageOptions={[10, 20, 50, 100]}
                paginationWithEdges
                textSelectionDisabled
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
                paginationActiveBackgroundColor="blue"
                paginationActiveTextColor="white"
                noRecordsText=""
                className="mantine-user-data-table"
                styles={{
                  pagination: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                  },
                }}
              />
            ) : (
              <Text ta="center" py="xl" c="dimmed">
                No audit logs available.
              </Text>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAuditLogs;
