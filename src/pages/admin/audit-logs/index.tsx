import { ActionIcon, Box, Group, Text, TextInput } from '@mantine/core';
import { Button, Card, CustomAutocomplete } from '../../../components';
import useAuditLogs from './use-audit-logs';
import { ICONS } from '../../../assets/icons';
import { LoaderOverlay } from '../../../components/loader';
import { DataTable } from 'mantine-datatable';
import SelectFilter from '../../../components/inputs/select/SelectFilter';
import useResponsive from '../../../hooks/use-responsive';

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
    handleClearSuccessFilter,
    handleSuccessFilterChange,
    successFilterOptions,
    successFilter,
    handleReset,
    disableReset,
  } = useAuditLogs();
  const { isXs } = useResponsive();

  return (
    <Box>
      <LoaderOverlay visible={downloadLogsLoading} opacity={1} />
      <Box
        px={isXs ? 16 : 32}
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
          {/* Action Type */}
          <SelectFilter
            {...{
              data: actionTypeOptions,
              label: 'Action Type',
              value: selectedActionType,
              onChange: handleActionTypeSelect,
              onClear: handleClearActionType,
              placeholder: 'Select action type',
            }}
          />
          {/* Type */}
          <SelectFilter
            {...{
              data: typeOptions,
              label: 'Type',
              value: selectedType,
              onChange: handleTypeSelect,
              onClear: handleClearType,
              placeholder: 'Select type',
              width: 150,
            }}
          />
          {/* Success Filter */}
          <SelectFilter
            {...{
              data: successFilterOptions,
              label: 'Status',
              value: successFilter,
              onChange: handleSuccessFilterChange,
              onClear: handleClearSuccessFilter,
              placeholder: 'Select status',
              width: 150,
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
          <Button mt={26} onClick={handleReset} disabled={disableReset}>
            Reset
          </Button>
          <Button
            mt={26}
            onClick={handleExportLogs}
            disabled={downloadLogsLoading || !auditLogs?.length}
          >
            Export Logs
          </Button>
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
