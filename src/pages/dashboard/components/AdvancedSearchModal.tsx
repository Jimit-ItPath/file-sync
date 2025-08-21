import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Select,
  Button,
  Box,
  Checkbox,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface AdvancedSearchModalProps {
  opened: boolean;
  onClose: () => void;
  onSearch: (filters: {
    types: string[] | null;
    modified: { after?: Date; before?: Date } | null;
  }) => void;
  onReset: () => void;
  activeTypeFilter: string[] | null;
  activeModifiedFilter: { after?: Date; before?: Date } | null;
}

const typeOptions = [
  { value: 'folder', label: 'Folders' },
  { value: 'documents', label: 'Documents' },
  { value: 'sheets', label: 'Sheets' },
  { value: 'presentations', label: 'Presentations' },
  { value: 'photos', label: 'Photos' },
  { value: 'pdfs', label: 'PDFs' },
  { value: 'videos', label: 'Videos' },
  { value: 'archives', label: 'Archives' },
  { value: 'audio', label: 'Audio' },
];

const modifiedOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisyear', label: `This year (${new Date().getFullYear()})` },
  { value: 'lastyear', label: `Last year (${new Date().getFullYear() - 1})` },
  { value: 'custom', label: 'Custom range' },
];

const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const getModifiedRange = (
  value: string
): { after?: Date; before?: Date } | null => {
  const now = new Date();
  switch (value) {
    case 'today':
      return {
        after: startOfDay(new Date()),
        before: endOfDay(new Date()),
      };
    case 'last7days':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return {
        after: startOfDay(sevenDaysAgo),
        before: endOfDay(new Date()),
      };
    case 'last30days':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return {
        after: startOfDay(thirtyDaysAgo),
        before: endOfDay(new Date()),
      };
    case 'thisyear':
      const janFirst = new Date(now.getFullYear(), 0, 1);
      return {
        after: startOfDay(janFirst),
        before: endOfDay(new Date()),
      };
    case 'lastyear':
      const lastYearJanFirst = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearDecEnd = new Date(now.getFullYear() - 1, 11, 31);
      return {
        after: startOfDay(lastYearJanFirst),
        before: endOfDay(lastYearDecEnd),
      };
    case 'any':
    default:
      return null;
  }
};

// Helper to detect which preset is currently active
const getActivePreset = (
  activeModifiedFilter: { after?: Date; before?: Date } | null
): string => {
  if (!activeModifiedFilter?.after || !activeModifiedFilter?.before) {
    if (activeModifiedFilter?.after || activeModifiedFilter?.before) {
      return 'custom';
    }
    return 'any';
  }

  const { after, before } = activeModifiedFilter;
  const afterTime = after.getTime();
  const beforeTime = before.getTime();

  // Check for today
  const todayStart = startOfDay(new Date()).getTime();
  const todayEnd = endOfDay(new Date()).getTime();
  if (afterTime === todayStart && beforeTime === todayEnd) {
    return 'today';
  }

  // Check for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysStart = startOfDay(sevenDaysAgo).getTime();
  const nowEnd = endOfDay(new Date()).getTime();
  if (afterTime === sevenDaysStart && beforeTime === nowEnd) {
    return 'last7days';
  }

  // Check for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStart = startOfDay(thirtyDaysAgo).getTime();
  if (afterTime === thirtyDaysStart && beforeTime === nowEnd) {
    return 'last30days';
  }

  // Check for this year
  const thisYearStart = startOfDay(
    new Date(new Date().getFullYear(), 0, 1)
  ).getTime();
  if (afterTime === thisYearStart && beforeTime === nowEnd) {
    return 'thisyear';
  }

  // Check for last year
  const lastYear = new Date().getFullYear() - 1;
  const lastYearStart = startOfDay(new Date(lastYear, 0, 1)).getTime();
  const lastYearEnd = endOfDay(new Date(lastYear, 11, 31)).getTime();
  if (afterTime === lastYearStart && beforeTime === lastYearEnd) {
    return 'lastyear';
  }

  return 'custom';
};

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  opened,
  onClose,
  onSearch,
  onReset,
  activeTypeFilter,
  activeModifiedFilter,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    activeTypeFilter || []
  );
  const [selectedModified, setSelectedModified] = useState<string>(
    getActivePreset(activeModifiedFilter)
  );
  const [customDateRange, setCustomDateRange] = useState<{
    after?: Date;
    before?: Date;
  }>({
    after: activeModifiedFilter?.after,
    before: activeModifiedFilter?.before,
  });

  // Update state when props change
  useEffect(() => {
    setSelectedTypes(activeTypeFilter || []);
    setSelectedModified(getActivePreset(activeModifiedFilter));
    setCustomDateRange({
      after: activeModifiedFilter?.after,
      before: activeModifiedFilter?.before,
    });
  }, [activeTypeFilter, activeModifiedFilter]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleModifiedChange = (value: string | null) => {
    if (!value) return;
    setSelectedModified(value);

    if (value !== 'custom') {
      // Clear custom date range when selecting preset
      setCustomDateRange({});
    }
  };

  const handleSearch = () => {
    let modifiedFilter: { after?: Date; before?: Date } | null = null;

    if (selectedModified === 'custom') {
      if (customDateRange.after || customDateRange.before) {
        modifiedFilter = {
          ...(customDateRange.after && {
            after: startOfDay(customDateRange.after),
          }),
          ...(customDateRange.before && {
            before: endOfDay(customDateRange.before),
          }),
        };
      }
    } else {
      modifiedFilter = getModifiedRange(selectedModified);
    }

    onSearch({
      types: selectedTypes.length > 0 ? selectedTypes : null,
      modified: modifiedFilter,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedModified('any');
    setCustomDateRange({});
    onReset();
  };

  const isCustomRange = selectedModified === 'custom';
  const hasFilters = selectedTypes.length > 0 || selectedModified !== 'any';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Advanced search"
      size="lg"
      centered
      styles={{
        title: {
          fontSize: '18px',
          fontWeight: 500,
          color: '#202124',
        },
        header: {
          padding: '20px 24px 0 24px',
          borderBottom: 'none',
        },
        body: {
          padding: '20px 24px 24px 24px',
        },
        content: {
          borderRadius: '8px',
        },
      }}
    >
      <Stack gap="lg">
        {/* Type Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs" c="#202124">
            Type
          </Text>
          <Box
            style={{
              border: '1px solid #dadce0',
              borderRadius: '4px',
              padding: '12px',
              backgroundColor: '#fff',
            }}
          >
            <Stack gap="xs">
              {typeOptions.map(option => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={selectedTypes.includes(option.value)}
                  onChange={() => handleTypeToggle(option.value)}
                  styles={{
                    input: {
                      '&:checked': {
                        backgroundColor: '#1a73e8',
                        borderColor: '#1a73e8',
                      },
                    },
                    label: {
                      fontSize: '14px',
                      color: '#202124',
                      cursor: 'pointer',
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Modified Filter */}
        <Box>
          <Text size="sm" fw={500} mb="xs" c="#202124">
            Date modified
          </Text>
          <Select
            data={modifiedOptions}
            value={selectedModified}
            onChange={handleModifiedChange}
            styles={{
              input: {
                border: '1px solid #dadce0',
                borderRadius: '4px',
                fontSize: '14px',
                height: '40px',
                '&:focus': {
                  borderColor: '#1a73e8',
                  boxShadow: '0 0 0 1px #1a73e8',
                },
              },
              dropdown: {
                border: '1px solid #dadce0',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              },
              option: {
                fontSize: '14px',
                padding: '8px 12px',
                '&[data-selected]': {
                  backgroundColor: '#e8f0fe',
                  color: '#1a73e8',
                },
                '&[data-hovered]': {
                  backgroundColor: '#f1f3f4',
                },
              },
            }}
          />
        </Box>

        {/* Custom Date Range */}
        {isCustomRange && (
          <Box>
            <Stack gap="md">
              <DateInput
                label="From"
                placeholder="Select start date"
                value={customDateRange.after || null}
                onChange={date =>
                  setCustomDateRange(prev => ({
                    ...prev,
                    after: date || undefined,
                  }))
                }
                clearable
                maxDate={customDateRange.before || new Date()}
                styles={{
                  label: {
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#202124',
                    marginBottom: '4px',
                  },
                  input: {
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    height: '40px',
                    '&:focus': {
                      borderColor: '#1a73e8',
                      boxShadow: '0 0 0 1px #1a73e8',
                    },
                  },
                }}
              />
              <DateInput
                label="To"
                placeholder="Select end date"
                value={customDateRange.before || null}
                onChange={date =>
                  setCustomDateRange(prev => ({
                    ...prev,
                    before: date || undefined,
                  }))
                }
                clearable
                minDate={customDateRange.after}
                maxDate={new Date()}
                styles={{
                  label: {
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#202124',
                    marginBottom: '4px',
                  },
                  input: {
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    height: '40px',
                    '&:focus': {
                      borderColor: '#1a73e8',
                      boxShadow: '0 0 0 1px #1a73e8',
                    },
                  },
                }}
              />
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            onClick={handleReset}
            disabled={!hasFilters}
            styles={{
              root: {
                color: '#1a73e8',
                fontSize: '14px',
                fontWeight: 500,
                height: '36px',
                padding: '0 16px',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                },
                '&:disabled': {
                  color: '#9aa0a6',
                  backgroundColor: 'transparent',
                },
              },
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSearch}
            styles={{
              root: {
                backgroundColor: '#1a73e8',
                fontSize: '14px',
                fontWeight: 500,
                height: '36px',
                padding: '0 24px',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#1557b0',
                },
              },
            }}
          >
            Search
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AdvancedSearchModal;
