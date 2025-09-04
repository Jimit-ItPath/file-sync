import { Box, Group, Stack, Text } from '@mantine/core';
import useContactUs from './use-contact-us';
import { Button, Card, Form, Input, Modal } from '../../../components';
import { DataTable } from 'mantine-datatable';
import useResponsive from '../../../hooks/use-responsive';
import SelectFilter from '../../../components/inputs/select/SelectFilter';
import SearchBox from '../../../components/inputs/input/SearchBox';

const ContactUs = () => {
  const {
    handleSearchChange,
    searchTerm,
    closeContactUsModal,
    columns,
    contactUsModalOpen,
    data,
    handleStatusChange,
    handleUpdateContactUs,
    updateContactUsLoading,
    updateContactUsMethods,
    currentPage,
    handlePageChange,
    handleLimitChange,
    totalRecords,
    limit,
    updateContactUsFormData,
    statusOptions,
    status,
    handleClearStatus,
  } = useContactUs();
  const { isXs } = useResponsive();

  return (
    <Box>
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
        <Group justify="flex-end" w={'100%'} mt={16}>
          {/* Status */}
          <SelectFilter
            {...{
              data: statusOptions,
              label: '',
              value: status,
              onChange: handleStatusChange,
              onClear: handleClearStatus,
              placeholder: 'Select status',
              width: 150,
            }}
          />
          <SearchBox
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
            placeholder="Search contact us..."
            maw={500}
          />
        </Group>
        <Box mt={20}>
          <Card>
            {data.length > 0 ? (
              <div className="datatable-wrapper">
                <DataTable
                  withTableBorder
                  borderRadius="md"
                  records={data}
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
                  className="mantine-user-data-table"
                  styles={{
                    pagination: {
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '10px',
                    },
                    table: {
                      tableLayout: 'fixed',
                    },
                  }}
                  rowExpansion={{
                    allowMultiple: true,
                    content: ({ record }) => (
                      <Box
                        p="md"
                        bg="gray.0"
                        style={{
                          borderRadius: 8,
                          display: 'grid',
                          gridTemplateColumns: '1fr',
                          gap: '1rem',
                        }}
                        className="expansion-grid"
                      >
                        <Stack gap="xs">
                          <Group gap="xs">
                            <Text size="sm" fw={600} c="gray.7">
                              📞 Contact Number:
                            </Text>
                            <Text size="sm" c="gray.8">
                              {record.contact_number || '--'}
                            </Text>
                          </Group>

                          <Group gap="xs">
                            <Text size="sm" fw={600} c="gray.7">
                              🌐 IP Address:
                            </Text>
                            <Text size="sm" c="gray.8">
                              {record.ip_address || '--'}
                            </Text>
                          </Group>

                          <Group align="flex-start" gap="xs">
                            <Text size="sm" fw={600} c="gray.7">
                              💻 User Agent:
                            </Text>
                            <Text
                              size="sm"
                              c="gray.8"
                              style={{ wordBreak: 'break-word' }}
                            >
                              {record.user_agent || '--'}
                            </Text>
                          </Group>

                          <Group gap="xs" align="center">
                            <Text size="sm" fw={600} c="gray.7">
                              📨 Message:
                            </Text>
                            <Text
                              size="sm"
                              c="gray.8"
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {record.message || '--'}
                            </Text>
                          </Group>

                          <Group gap="xs" align="center">
                            <Text size="sm" fw={600} c="gray.7">
                              📝 Notes:
                            </Text>
                            <Text
                              size="sm"
                              c="gray.8"
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {record.notes || '--'}
                            </Text>
                          </Group>
                        </Stack>

                        <style>
                          {`
                            @media (min-width: 768px) {
                                .expansion-grid {
                                    grid-template-columns: 1fr 1fr;
                                }
                            }
                          `}
                        </style>
                      </Box>
                    ),
                  }}
                />
                <style>
                  {`
                    /* Wrapper handles scroll */
                    .datatable-wrapper {
                        width: 100%;
                        overflow-x: auto;
                        cursor: pointer;
                    }

                    @media (min-width: 1261px) {
                        .mantine-user-data-table table {
                            width: 100%;
                        }
                        .datatable-wrapper {
                            overflow-x: hidden;
                        }
                    }

                    @media (max-width: 1260px) {
                       .mantine-user-data-table table {
                            min-width: 900px;
                            table-layout: fixed;
                        }
                        .datatable-wrapper {
                            overflow-x: auto;
                        }
                    }
                    `}
                </style>
              </div>
            ) : (
              <Text ta="center" py="xl" c="dimmed">
                No data available.
              </Text>
            )}
          </Card>
        </Box>
      </Box>

      {/* Update Contact Us Modal */}
      <Modal
        opened={contactUsModalOpen}
        onClose={closeContactUsModal}
        title={`Update Contact Us`}
      >
        <Form methods={updateContactUsMethods} onSubmit={handleUpdateContactUs}>
          <Stack gap="md">
            {updateContactUsFormData.map(item => (
              <Input
                key={item.id}
                id={item.id}
                label={item.label}
                name={item.name}
                placeholder={item.placeholder}
                type={item.type}
                isRequired={item.isRequired}
                error={item.error}
                data={item.data}
                maxCharCount={item.maxCharCount}
              />
            ))}
            <Button
              type="submit"
              loading={updateContactUsLoading}
              disabled={
                !updateContactUsMethods.formState.isValid ||
                updateContactUsLoading
              }
              maw={150}
            >
              Submit
            </Button>
          </Stack>
        </Form>
      </Modal>
    </Box>
  );
};

export default ContactUs;
