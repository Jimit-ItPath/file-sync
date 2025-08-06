import { ActionIcon, Box, Group, Select, Text, TextInput } from '@mantine/core';
import { Button, Card, CustomAutocomplete } from '../../../components';
import useAuditLogs from './use-audit-logs';
import { ICONS } from '../../../assets/icons';
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
    actionTypeOptions,
    typeOptions,
    handleActionTypeSelect,
    handleTypeSelect,
    selectedActionType,
    selectedType,
    handleClearActionType,
    handleClearType,
  } = useAuditLogs();

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
        <Group justify={'flex-start'} align="center" mt={16} gap="md">
          {auditLogs?.length ? (
            <Button
              mt={26}
              onClick={handleExportLogs}
              disabled={downloadLogsLoading}
            >
              Export Logs
            </Button>
          ) : null}
          {/* Action Type */}
          <Select
            data={actionTypeOptions}
            value={selectedActionType}
            label="Action Type"
            onChange={handleActionTypeSelect}
            onClear={handleClearActionType}
            placeholder="Select action type"
            clearable
            w={200}
            styles={{
              input: {
                border: '1px solid #ced4da',
                backgroundColor: '#ffffff',
                zIndex: 10,
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: '#1e7ae8',
                  boxShadow: '0 0 0 3px rgba(30, 122, 232, 0.1)',
                },
                '&:hover': {
                  borderColor: '#d1d5db',
                },
              },
              dropdown: {
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
              option: {
                padding: '6px',
                fontSize: '14px',
                borderRadius: '4px',
                margin: '2px',
                '&[data-selected]': {
                  backgroundColor: '#1e7ae8',
                  color: '#ffffff',
                },
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              },
            }}
          />
          {/* Type */}
          <Select
            data={typeOptions}
            value={selectedType}
            label="Type"
            onChange={handleTypeSelect}
            onClear={handleClearType}
            placeholder="Select type"
            clearable
            w={150}
            styles={{
              input: {
                border: '1px solid #ced4da',
                backgroundColor: '#ffffff',
                zIndex: 10,
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: '#1e7ae8',
                  boxShadow: '0 0 0 3px rgba(30, 122, 232, 0.1)',
                },
                '&:hover': {
                  borderColor: '#d1d5db',
                },
              },
              dropdown: {
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
              option: {
                padding: '6px',
                fontSize: '14px',
                borderRadius: '4px',
                margin: '2px',
                '&[data-selected]': {
                  backgroundColor: '#1e7ae8',
                  color: '#ffffff',
                },
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              },
            }}
          />
          <CustomAutocomplete
            data={userSearchResults}
            placeholder="Search users..."
            value={selectedUser}
            onChange={handleUserSelect}
            onSearchChange={handleUserSearch}
            onClear={handleClearSelection}
            searchable
            clearable
            maw={250}
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
            maw={250}
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
