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
import { DateInput, DatePickerInput } from '@mantine/dates';
import { ICONS } from '../../../assets/icons';
import './css/DashboardFilters.css';

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

const getModifiedRange = (value: string) => {
  const now = new Date();
  switch (value) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return { after: today };
    case 'last7days':
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return { after: sevenDaysAgo };
    case 'last30days':
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return { after: thirtyDaysAgo };
    case 'thisyear':
      const janFirst = new Date(now.getFullYear(), 0, 1);
      return { after: janFirst };
    case 'lastyear':
      const lastYearJanFirst = new Date(now.getFullYear() - 1, 0, 1);
      const lastYearDecEnd = new Date(
        now.getFullYear() - 1,
        11,
        31,
        23,
        59,
        59
      );
      return { after: lastYearJanFirst, before: lastYearDecEnd };
    default:
      return null;
  }
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
  const [selectedModified, setSelectedModified] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{
    after?: Date;
    before?: Date;
  }>({});
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Close dropdowns when clicking outside
  const typeRef = useRef<HTMLDivElement>(null);
  const modifiedRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // const handleClick = (e: MouseEvent) => {
    //   if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
    //     setTypeDropdownOpen(false);
    //   }
    //   if (
    //     modifiedRef.current &&
    //     !modifiedRef.current.contains(e.target as Node)
    //   ) {
    //     setModifiedDropdownOpen(false);
    //   }
    // };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Skip if click is inside a date picker
      if (
        target.closest('.mantine-DatePicker-day') ||
        target.closest('.mantine-DatePicker-input')
      ) {
        return;
      }

      if (typeRef.current && !typeRef.current.contains(target)) {
        setTypeDropdownOpen(false);
      }
      if (modifiedRef.current && !modifiedRef.current.contains(target)) {
        setModifiedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getModifiedFilterLabel = () => {
    if (!activeModifiedFilter) return 'Modified';
    const { after, before } = activeModifiedFilter;
    if (after && before)
      return `${after.toLocaleDateString()} - ${before.toLocaleDateString()}`;
    if (after) return `After ${after.toLocaleDateString()}`;
    if (before) return `Before ${before.toLocaleDateString()}`;
    return 'Modified';
  };

  const handleModifiedSelect = (value: string) => {
    setSelectedModified(value);
    if (value === 'custom') {
      setShowCustomDate(!showCustomDate);
      return;
    }
    setShowCustomDate(false);
    setCustomDateRange({});
    onModifiedFilter(getModifiedRange(value));
    setModifiedDropdownOpen(false);
  };

  const handleCustomApply = () => {
    onModifiedFilter(customDateRange);
    setModifiedDropdownOpen(false);
    setShowCustomDate(false);
    setSelectedModified('custom');
  };

  const handleClearAll = () => {
    setSelectedModified(null);
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
    setSelectedModified(null);
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
                    selectedModified === option.value ? (
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
                top: '100%', // Position below button
                marginTop: 4, // Small gap
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

          {/* Always show as menu chip style */}
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
                {modifiedOptions.map(option => (
                  <Box
                    key={option.value}
                    className={`filterOption ${selectedModified === option.value ? 'filterOptionActive' : ''}`}
                    onClick={() => handleModifiedSelect(option.value)}
                  >
                    <Text fz={'sm'}>{option.label}</Text>
                    {selectedModified === option.value ? (
                      <ICONS.IconCheck
                        size={16}
                        className="filterOptionCheck"
                      />
                    ) : option.value === 'custom' ? (
                      <ICONS.IconChevronRight size={16} />
                    ) : null}
                  </Box>
                ))}
              </Box>

              {/* Right column: custom date range */}
              {showCustomDate && (
                <Box className="customDateColumn">
                  <Stack gap="md" p="md">
                    <Box>
                      {/* <Text className="dateLabel">From</Text> */}
                      {/* <DatePickerInput
                        className="dateInput"
                        placeholder="Select date"
                        value={customDateRange.after}
                        onChange={date =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            after: date || undefined,
                          }))
                        }
                        size="sm"
                        clearable
                        popoverProps={{
                          withinPortal: false,
                          position: 'bottom',
                        }}
                      /> */}
                      <DateInput
                        label="After"
                        placeholder="Pick date"
                        value={customDateRange.after}
                        onChange={date =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            after: date || undefined,
                          }))
                        }
                        clearable
                        popoverProps={{
                          //   position: 'top',
                          //   withinPortal: false,
                          clickOutsideEvents: [],
                          onClose: () => {},
                        }}
                      />
                    </Box>
                    <Box>
                      <Text className="dateLabel">To</Text>
                      {/* <DatePickerInput
                        className="dateInput"
                        placeholder="Select date"
                        value={customDateRange.before}
                        onChange={date =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            before: date || undefined,
                          }))
                        }
                        size="sm"
                        clearable
                        popoverProps={{
                          withinPortal: false,
                          position: 'top',
                        }}
                      /> */}
                      <DateInput
                        label="Before"
                        placeholder="Pick date"
                        value={customDateRange.before}
                        onChange={date =>
                          setCustomDateRange(prev => ({
                            ...prev,
                            before: date || undefined,
                          }))
                        }
                        clearable
                        // popoverProps={{
                        //   position: 'top',
                        //   withinPortal: false,
                        // }}
                      />
                    </Box>
                  </Stack>
                  <Box className="filterActions">
                    <Button variant="subtle" size="sm" onClick={handleClearAll}>
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
