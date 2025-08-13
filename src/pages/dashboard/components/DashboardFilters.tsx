import React, { useState, useRef } from 'react';
import {
  Group,
  Button,
  Box,
  Text,
  Stack,
  Paper,
  ActionIcon,
  Menu,
  rem,
  CloseButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { ICONS } from '../../../assets/icons';
import './css/DashboardFilters.css';

type ModifiedFilter =
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisyear'
  | 'lastyear'
  | 'custom'
  | null;

interface DashboardFiltersProps {
  onTypeFilter: (type: string | null) => void;
  onModifiedFilter: (dateRange: { after?: Date; before?: Date } | null) => void;
  onClearFilters: () => void;
  activeTypeFilter: string | null;
  activeModifiedFilter: { after?: Date; before?: Date } | null;
  isMobile?: boolean;
}

const typeOptions = [
  { value: 'documents', label: 'Documents', icon: ICONS.IconFile },
  { value: 'sheets', label: 'Sheets', icon: ICONS.IconFileSpreadsheet },
  {
    value: 'presentations',
    label: 'Presentations',
    icon: ICONS.IconPresentation,
  },
  { value: 'photos', label: 'Photos', icon: ICONS.IconPhoto },
  { value: 'pdfs', label: 'PDFs', icon: ICONS.IconPdf },
  { value: 'videos', label: 'Videos', icon: ICONS.IconVideo },
  { value: 'archives', label: 'Archives', icon: ICONS.IconArchive },
  { value: 'audio', label: 'Audio', icon: ICONS.IconMusic },
];

const modifiedOptions = [
  { value: 'today', label: 'Today' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thisyear', label: `This year (${new Date().getFullYear()})` },
  { value: 'lastyear', label: `Last year (${new Date().getFullYear() - 1})` },
  { value: 'custom', label: 'Custom range', icon: ICONS.IconChevronRight },
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
  value: ModifiedFilter
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
    default:
      return null;
  }
};

// Helper to detect which preset is currently active
const getActivePreset = (
  activeModifiedFilter: { after?: Date; before?: Date } | null
): ModifiedFilter => {
  if (!activeModifiedFilter?.after || !activeModifiedFilter?.before) {
    if (activeModifiedFilter?.after || activeModifiedFilter?.before) {
      return 'custom';
    }
    return null;
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

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onTypeFilter,
  onModifiedFilter,
  onClearFilters,
  activeTypeFilter,
  activeModifiedFilter,
  isMobile = false,
}) => {
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [modifiedDropdownOpen, setModifiedDropdownOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    after?: Date;
    before?: Date;
  }>({});
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Close dropdowns when clicking outside
  const typeRef = useRef<HTMLDivElement>(null);
  const modifiedRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Skip if click is inside a date picker
      if (
        target.closest('.mantine-DatePicker-day') ||
        target.closest('.mantine-DatePicker-input') ||
        target.closest('.mantine-Popover-dropdown')
      ) {
        return;
      }

      if (typeRef.current && !typeRef.current.contains(target)) {
        setTypeDropdownOpen(false);
      }
      if (modifiedRef.current && !modifiedRef.current.contains(target)) {
        setModifiedDropdownOpen(false);
        setShowCustomDate(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getModifiedFilterLabel = () => {
    const preset = getActivePreset(activeModifiedFilter);
    if (preset && preset !== 'custom') {
      return (
        modifiedOptions.find(opt => opt.value === preset)?.label || 'Modified'
      );
    }
    if (!activeModifiedFilter) return 'Modified';

    const { after, before } = activeModifiedFilter;
    if (after && before) {
      return `${after.toLocaleDateString()} - ${before.toLocaleDateString()}`;
    }
    if (after) return `After ${after.toLocaleDateString()}`;
    if (before) return `Before ${before.toLocaleDateString()}`;
    return 'Modified';
  };

  const handleModifiedSelect = (value: string) => {
    if (value === 'custom') {
      setShowCustomDate(!showCustomDate);
      return;
    }
    setShowCustomDate(false);
    setCustomDateRange({});
    const range = getModifiedRange(value as ModifiedFilter);
    onModifiedFilter(range);
    setModifiedDropdownOpen(false);
  };

  const handleCustomApply = () => {
    const range = {
      ...(customDateRange.after && {
        after: startOfDay(customDateRange.after),
      }),
      ...(customDateRange.before && {
        before: endOfDay(customDateRange.before),
      }),
    };
    onModifiedFilter(Object.keys(range).length > 0 ? range : null);
    setModifiedDropdownOpen(false);
    setShowCustomDate(false);
  };

  const handleClearAll = () => {
    setCustomDateRange({});
    setShowCustomDate(false);
    onClearFilters();
  };

  const handleTypeSelect = (value: string) => {
    onTypeFilter(value === activeTypeFilter ? null : value);
    setTypeDropdownOpen(false);
  };

  const handleClearTypeFilter = () => {
    onTypeFilter(null);
    setTypeDropdownOpen(false);
  };

  const handleClearModifiedFilter = () => {
    onModifiedFilter(null);
    setCustomDateRange({});
    setShowCustomDate(false);
    setModifiedDropdownOpen(false);
  };

  if (isMobile) {
    return (
      <Box className="filterContainer">
        <Group justify="space-between">
          <Menu
            shadow="md"
            width={280}
            styles={{
              dropdown: {
                border: '1px solid #dadce0',
                borderRadius: rem(8),
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
                padding: '8px 0',
              },
              item: {
                padding: '8px 16px',
                fontSize: rem(14),
                borderRadius: 0,
                margin: 0,
                '&:hover': {
                  backgroundColor: '#f1f3f4',
                },
              },
              label: {
                padding: '8px 16px 4px',
                fontSize: rem(11),
                fontWeight: 500,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              },
            }}
          >
            <Menu.Target>
              <Button
                className="mobileButton"
                leftSection={<ICONS.IconFilter size={16} />}
                rightSection={<ICONS.IconChevronDown size={16} />}
              >
                Filters
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Type</Menu.Label>
              {typeOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  leftSection={<option.icon size={16} />}
                  rightSection={
                    activeTypeFilter === option.value ? (
                      <ICONS.IconCheck size={16} />
                    ) : null
                  }
                  onClick={() => handleTypeSelect(option.value)}
                  style={{
                    backgroundColor:
                      activeTypeFilter === option.value ? '#e8f0fe' : undefined,
                  }}
                >
                  {option.label}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Label>Modified</Menu.Label>
              {modifiedOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  rightSection={
                    getActivePreset(activeModifiedFilter) === option.value ? (
                      <ICONS.IconCheck size={16} />
                    ) : option.value === 'custom' ? (
                      <ICONS.IconChevronRight size={16} />
                    ) : null
                  }
                  onClick={() => handleModifiedSelect(option.value)}
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          {(activeTypeFilter || activeModifiedFilter) && (
            <ActionIcon
              variant="subtle"
              onClick={onClearFilters}
              size={36}
              style={{ borderRadius: rem(18) }}
            >
              <ICONS.IconClearAll size={16} />
            </ActionIcon>
          )}
        </Group>
      </Box>
    );
  }

  return (
    <Box className="filterContainer">
      <Group gap={8} align="center">
        {/* Type Filter */}
        <Box style={{ position: 'relative' }} ref={typeRef}>
          {typeDropdownOpen && (
            <Paper
              className="filterDropdown"
              shadow="md"
              style={{
                width: 240,
                top: '100%',
                marginTop: 4,
              }}
            >
              <Text className="filterDropdownLabel">Type</Text>
              {typeOptions.map(option => (
                <Box
                  key={option.value}
                  className={`filterOption ${activeTypeFilter === option.value ? 'filterOptionActive' : ''}`}
                  onClick={() => handleTypeSelect(option.value)}
                >
                  <option.icon size={16} />
                  <Text fz={'sm'}>{option.label}</Text>
                  {activeTypeFilter === option.value && (
                    <ICONS.IconCheck size={16} className="filterOptionCheck" />
                  )}
                </Box>
              ))}
            </Paper>
          )}

          <Box
            className={`filterOption ${activeTypeFilter ? 'filterOptionActive' : ''}`}
            style={{
              display: 'inline-flex',
              borderRadius: '16px',
              border: '1px solid #dadce0',
              padding: '0 12px',
              height: '32px',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: activeTypeFilter ? '#e8f0fe' : '#ffffff',
            }}
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
          >
            {activeTypeFilter ? (
              <>
                <Text fz={'sm'} ml={8}>
                  {typeOptions.find(t => t.value === activeTypeFilter)?.label}
                </Text>
                <CloseButton
                  size={16}
                  onClick={e => {
                    e.stopPropagation();
                    handleClearTypeFilter();
                  }}
                  style={{ marginLeft: 4 }}
                />
              </>
            ) : (
              <>
                <Text fz={'sm'}>Type</Text>
                <ICONS.IconChevronDown size={14} style={{ marginLeft: 4 }} />
              </>
            )}
          </Box>
        </Box>

        {/* Modified Filter */}
        <Box style={{ position: 'relative' }} ref={modifiedRef}>
          {activeModifiedFilter ? (
            <Button
              className="filterButtonActive"
              rightSection={
                <CloseButton
                  size={16}
                  onClick={e => {
                    e.stopPropagation();
                    handleClearModifiedFilter();
                  }}
                  style={{ marginLeft: 4 }}
                />
              }
              onClick={() => setModifiedDropdownOpen(true)}
            >
              {getModifiedFilterLabel()}
            </Button>
          ) : (
            <Button
              className="filterButton"
              rightSection={<ICONS.IconChevronDown size={14} />}
              onClick={() => setModifiedDropdownOpen(true)}
            >
              Modified
            </Button>
          )}
          {modifiedDropdownOpen && (
            <Paper
              className="filterDropdown"
              shadow="md"
              style={{
                width: showCustomDate ? 500 : 240,
                display: 'flex',
                overflow: 'hidden',
                transition: 'width 0.2s ease',
              }}
            >
              {/* Left column: options */}
              <Box className="filterOptionsColumn">
                <Text className="filterDropdownLabel">Modified</Text>
                {modifiedOptions.map(option => {
                  const isActive =
                    getActivePreset(activeModifiedFilter) === option.value;
                  return (
                    <Box
                      key={option.value}
                      className={`filterOption ${isActive ? 'filterOptionActive' : ''}`}
                      onClick={() => handleModifiedSelect(option.value)}
                    >
                      <Text fz={'sm'}>{option.label}</Text>
                      {isActive ? (
                        <ICONS.IconCheck
                          size={16}
                          className="filterOptionCheck"
                        />
                      ) : option.value === 'custom' ? (
                        <ICONS.IconChevronRight size={16} />
                      ) : null}
                    </Box>
                  );
                })}
              </Box>

              {/* Right column: custom date range */}
              {showCustomDate && (
                <Box className="customDateColumn">
                  <Stack gap="md" p="md">
                    <Box>
                      <DateInput
                        label="After"
                        placeholder="Pick date"
                        value={customDateRange.after}
                        onChange={(date: any) =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            after: date || undefined,
                          }))
                        }
                        clearable
                        popoverProps={{
                          withinPortal: true,
                          position: 'bottom-end',
                          offset: 5,
                          shadow: 'md',
                        }}
                        styles={{
                          input: {
                            borderRadius: 4,
                            border: '1px solid #dadce0',
                            fontSize: '0.875rem',
                            height: '2.25rem',
                            '&:focus': {
                              borderColor: '#1a73e8',
                              boxShadow: '0 0 0 1px #1a73e8',
                            },
                          },
                          label: {
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#5f6368',
                            marginBottom: 4,
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <DateInput
                        label="Before"
                        placeholder="Pick date"
                        value={customDateRange.before}
                        onChange={(date: any) =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            before: date || undefined,
                          }))
                        }
                        clearable
                        popoverProps={{
                          withinPortal: true,
                          position: 'bottom-end',
                          offset: 5,
                          shadow: 'md',
                        }}
                        styles={{
                          input: {
                            borderRadius: 4,
                            border: '1px solid #dadce0',
                            fontSize: '0.875rem',
                            height: '2.25rem',
                            '&:focus': {
                              borderColor: '#1a73e8',
                              boxShadow: '0 0 0 1px #1a73e8',
                            },
                          },
                          label: {
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#5f6368',
                            marginBottom: 4,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                  <Box className="filterActions">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setCustomDateRange({});
                        handleClearAll();
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      className="applyButton"
                      size="sm"
                      onClick={handleCustomApply}
                      disabled={
                        !customDateRange.after && !customDateRange.before
                      }
                    >
                      Apply
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {(activeTypeFilter || activeModifiedFilter) && (
          <Button
            className="clearButton"
            leftSection={<ICONS.IconX size={14} />}
            onClick={onClearFilters}
          >
            Clear
          </Button>
        )}
      </Group>
    </Box>
  );
};

export default DashboardFilters;
