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
  onTypeFilter: (type: string[] | null) => void;
  onModifiedFilter: (dateRange: { after?: Date; before?: Date } | null) => void;
  onClearFilters: () => void;
  activeTypeFilter: string[] | null;
  activeModifiedFilter: { after?: Date; before?: Date } | null;
  isMobile?: boolean;
}

const typeOptions = [
  { value: 'folder', label: 'Folders', icon: ICONS.IconFolder },
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    activeTypeFilter || []
  );

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

  React.useEffect(() => {
    setSelectedTypes(activeTypeFilter || []);
  }, [activeTypeFilter]);

  const handleTypeApply = () => {
    onTypeFilter(selectedTypes.length > 0 ? selectedTypes : null);
    setTypeDropdownOpen(false);
  };

  const handleTypeClear = () => {
    setSelectedTypes([]);
    onTypeFilter(null);
    setTypeDropdownOpen(false);
  };

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

  const handleCustomApply = (e: any) => {
    e.stopPropagation();
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

  const handleClearAll = (e: any) => {
    e.stopPropagation();
    setCustomDateRange({});
    setShowCustomDate(false);
    onClearFilters();
  };

  const handleTypeSelect = (value: string) => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
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
    const hasActiveFilters =
      (activeTypeFilter && activeTypeFilter?.length) || activeModifiedFilter;

    return (
      <Group gap={4} align="center" wrap="nowrap">
        {/* Active filters display */}
        {hasActiveFilters && (
          <Group gap={4} wrap="nowrap">
            {activeTypeFilter && activeTypeFilter?.length && (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  backgroundColor: '#e8f0fe',
                  border: '1px solid #1e7ae8',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1e7ae8',
                  gap: '4px',
                  maxWidth: '80px',
                }}
              >
                <Text truncate fz={11} fw={500}>
                  {activeTypeFilter.length} type
                  {activeTypeFilter.length > 1 ? 's' : ''}
                </Text>
                <CloseButton
                  size={12}
                  onClick={e => {
                    e.stopPropagation();
                    handleClearTypeFilter();
                  }}
                  style={{
                    minWidth: '12px',
                    minHeight: '12px',
                    color: '#1e7ae8',
                  }}
                />
              </Box>
            )}

            {activeModifiedFilter && (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  backgroundColor: '#e8f0fe',
                  border: '1px solid #1e7ae8',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1e7ae8',
                  gap: '4px',
                  maxWidth: '100px',
                }}
              >
                <Text truncate fz={11} fw={500}>
                  {getModifiedFilterLabel()}
                </Text>
                <CloseButton
                  size={12}
                  onClick={e => {
                    e.stopPropagation();
                    handleClearModifiedFilter();
                  }}
                  style={{
                    minWidth: '12px',
                    minHeight: '12px',
                    color: '#1e7ae8',
                  }}
                />
              </Box>
            )}
          </Group>
        )}

        {/* Filter menu button */}
        <Menu
          shadow="lg"
          width={300}
          position="bottom-end"
          offset={5}
          styles={{
            dropdown: {
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              padding: '8px 0',
              height: '400px',
              overflowY: 'auto',
            },
            item: {
              padding: '10px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              margin: '2px 8px',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: '#f1f3f4',
              },
              '&[data-selected]': {
                backgroundColor: '#e8f0fe',
                color: '#1e7ae8',
                fontWeight: 500,
              },
            },
            label: {
              padding: '12px 16px 6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#5f6368',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              borderBottom: hasActiveFilters ? 'none' : '1px solid #e5e7eb',
              marginBottom: hasActiveFilters ? '0' : '4px',
            },
            divider: {
              margin: '8px 16px',
              borderColor: '#e5e7eb',
            },
          }}
        >
          <Menu.Target>
            <ActionIcon
              size={36}
              variant={hasActiveFilters ? 'filled' : 'outline'}
              style={{
                borderRadius: '8px',
                border: hasActiveFilters ? 'none' : '1.5px solid #dadce0',
                backgroundColor: hasActiveFilters ? '#1e7ae8' : '#ffffff',
                color: hasActiveFilters ? '#ffffff' : '#5f6368',
                transition: 'all 0.2s ease',
                boxShadow: hasActiveFilters
                  ? '0 2px 8px rgba(30, 122, 232, 0.3)'
                  : 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: hasActiveFilters
                    ? '0 4px 12px rgba(30, 122, 232, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <ICONS.IconFilter size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {hasActiveFilters && (
              <>
                <Box style={{ padding: '8px 16px' }}>
                  <Group justify="space-between" align="center">
                    <Text fz="sm" fw={500} c="#374151">
                      Active Filters
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      // compact
                      leftSection={<ICONS.IconX size={12} />}
                      onClick={() => {
                        setCustomDateRange({});
                        setShowCustomDate(false);
                        onClearFilters();
                        setSelectedTypes([]);
                      }}
                      style={{
                        color: '#ef4444',
                        fontSize: '11px',
                        height: '24px',
                        padding: '0 8px',
                      }}
                    >
                      Clear All
                    </Button>
                  </Group>
                </Box>
                <Menu.Divider />
              </>
            )}

            <Menu.Label>File Type</Menu.Label>
            {typeOptions.map(option => (
              <Menu.Item
                key={option.value}
                leftSection={<option.icon size={18} />}
                rightSection={
                  selectedTypes.includes(option.value) ? (
                    <ICONS.IconCheck size={16} color="#1e7ae8" />
                  ) : null
                }
                onClick={() => handleTypeSelect(option.value)}
                style={{
                  backgroundColor: selectedTypes.includes(option.value)
                    ? '#e8f0fe'
                    : undefined,
                  fontWeight: selectedTypes.includes(option.value) ? 500 : 400,
                  color: selectedTypes.includes(option.value)
                    ? '#1e7ae8'
                    : '#374151',
                }}
              >
                {option.label}
              </Menu.Item>
            ))}

            {/* Apply/Clear buttons for type filter */}
            <Box style={{ padding: '8px 16px' }}>
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={handleTypeClear}
                  disabled={selectedTypes.length === 0}
                  style={{ height: '28px' }}
                >
                  Clear
                </Button>
                <Button
                  size="xs"
                  onClick={handleTypeApply}
                  disabled={selectedTypes.length === 0}
                  style={{
                    backgroundColor: '#1e7ae8',
                    color: 'white',
                    height: '28px',
                  }}
                >
                  Apply
                </Button>
              </Group>
            </Box>

            <Menu.Divider />
            <Menu.Label>Date Modified</Menu.Label>
            {modifiedOptions.map(option => {
              const isActive =
                getActivePreset(activeModifiedFilter) === option.value;
              const isCustom = option.value === 'custom';
              const isCustomOpen = isCustom && showCustomDate;
              return (
                <Menu.Item
                  key={option.value}
                  // rightSection={
                  //   isActive ? (
                  //     <ICONS.IconCheck size={16} color="#1e7ae8" />
                  //   ) : option.value === 'custom' ? (
                  //     <ICONS.IconChevronRight size={16} />
                  //   ) : null
                  // }
                  rightSection={
                    isCustom ? (
                      isCustomOpen ? (
                        <ICONS.IconChevronDown size={16} />
                      ) : (
                        <ICONS.IconChevronRight size={16} />
                      )
                    ) : isActive ? (
                      <ICONS.IconCheck size={16} color="#1e7ae8" />
                    ) : null
                  }
                  closeMenuOnClick={option.value !== 'custom'}
                  // onClick={() => handleModifiedSelect(option.value)}
                  onClick={() => {
                    handleModifiedSelect(option.value);

                    // 👇 only scroll when custom is opened
                    if (isCustom && !showCustomDate) {
                      setTimeout(() => {
                        const dropdown = document.querySelector(
                          '.mantine-Menu-dropdown'
                        );
                        if (dropdown) {
                          dropdown.scrollTo({
                            top: dropdown.scrollHeight,
                            behavior: 'smooth',
                          });
                        }
                      }, 100);
                    }
                  }}
                  style={{
                    backgroundColor: isActive ? '#e8f0fe' : undefined,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#1e7ae8' : '#374151',
                  }}
                >
                  {option.label}
                </Menu.Item>
              );
            })}

            {/* Custom date picker for mobile - simplified */}
            {showCustomDate && (
              <>
                <Menu.Divider />
                <Box style={{ padding: '12px 16px' }}>
                  <Stack gap="sm">
                    <Text
                      fz="xs"
                      fw={500}
                      c="#5f6368"
                      tt="uppercase"
                      lts="0.5px"
                    >
                      Custom Date Range
                    </Text>
                    <DateInput
                      placeholder="After date"
                      value={customDateRange.after || null}
                      onChange={(date: any) =>
                        setCustomDateRange(prev => ({
                          ...prev,
                          after: date || undefined,
                        }))
                      }
                      clearable
                      maxDate={customDateRange.before || new Date()}
                      size="sm"
                      styles={{
                        input: {
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          height: '32px',
                          '&:focus': {
                            borderColor: '#1e7ae8',
                            boxShadow: '0 0 0 2px rgba(30, 122, 232, 0.1)',
                          },
                        },
                      }}
                    />
                    <DateInput
                      placeholder="Before date"
                      value={customDateRange.before || null}
                      onChange={(date: any) =>
                        setCustomDateRange(prev => ({
                          ...prev,
                          before: date || undefined,
                        }))
                      }
                      clearable
                      minDate={customDateRange.after}
                      maxDate={new Date()}
                      size="sm"
                      styles={{
                        input: {
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '13px',
                          height: '32px',
                          '&:focus': {
                            borderColor: '#1e7ae8',
                            boxShadow: '0 0 0 2px rgba(30, 122, 232, 0.1)',
                          },
                        },
                      }}
                    />
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => setShowCustomDate(false)}
                        style={{ height: '28px' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        onClick={handleCustomApply}
                        disabled={
                          !customDateRange.after && !customDateRange.before
                        }
                        style={{
                          backgroundColor: '#1e7ae8',
                          color: 'white',
                          height: '28px',
                        }}
                      >
                        Apply
                      </Button>
                    </Group>
                  </Stack>
                </Box>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
    );
  }

  return (
    <Group gap={4} align="center" wrap="nowrap">
      {/* Compact Type Filter */}
      <Box style={{ position: 'relative' }} ref={typeRef}>
        {typeDropdownOpen && (
          <Paper
            shadow="md"
            style={{
              width: 220,
              top: '100%',
              marginTop: 4,
              position: 'absolute',
              right: 0,
              zIndex: 1000,
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '8px 0',
            }}
          >
            <Text
              style={{
                padding: '8px 16px 4px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#5f6368',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
              }}
            >
              Type
            </Text>
            {typeOptions.map(option => (
              <Box
                key={option.value}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedTypes.includes(option.value)
                    ? '#e8f0fe'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f1f3f4',
                  },
                }}
                className={`filterOption ${selectedTypes.includes(option.value) ? 'filterOptionActive' : ''}`}
                onClick={() => handleTypeSelect(option.value)}
              >
                <option.icon size={16} />
                <Text fz={'sm'}>{option.label}</Text>
                {selectedTypes.includes(option.value) ? (
                  <ICONS.IconCheck
                    size={16}
                    style={{ marginLeft: 'auto', color: '#1e7ae8' }}
                  />
                ) : null}
              </Box>
            ))}

            {/* Apply/Clear buttons */}
            <Box
              style={{
                padding: '8px 16px',
                borderTop: '1px solid #e5e7eb',
                marginTop: '8px',
              }}
            >
              <Group justify="space-between">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={handleTypeClear}
                  disabled={selectedTypes.length === 0}
                >
                  Clear
                </Button>
                <Button
                  size="xs"
                  onClick={handleTypeApply}
                  disabled={selectedTypes.length === 0}
                  style={{
                    backgroundColor: '#1e7ae8',
                    color: 'white',
                  }}
                >
                  Apply
                </Button>
              </Group>
            </Box>
          </Paper>
        )}

        <Box
          style={{
            display: 'inline-flex',
            borderRadius: '8px',
            border: '1px solid #dadce0',
            padding: '0 8px',
            height: '36px',
            alignItems: 'center',
            cursor: 'pointer',
            backgroundColor: selectedTypes?.length ? '#e8f0fe' : '#ffffff',
            minWidth: selectedTypes?.length ? 'auto' : '60px',
            transition: 'all 0.2s ease',
          }}
          onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
        >
          {selectedTypes?.length ? (
            <Group gap={4} wrap="nowrap">
              <Text fz={12} fw={500}>
                {selectedTypes.length} type{selectedTypes.length > 1 ? 's' : ''}
              </Text>
              <CloseButton
                size={14}
                onClick={e => {
                  e.stopPropagation();
                  handleClearTypeFilter();
                }}
              />
            </Group>
          ) : (
            <Group gap={4} wrap="nowrap">
              <ICONS.IconFile size={14} />
              <ICONS.IconChevronDown size={12} />
            </Group>
          )}
        </Box>
      </Box>

      {/* Compact Modified Filter */}
      <Box
        style={{
          position: 'relative',
          display: 'inline-flex',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '0 8px',
          height: '36px',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: activeModifiedFilter ? '#e8f0fe' : '#ffffff',
          minWidth: activeModifiedFilter ? 'auto' : '60px',
          transition: 'all 0.2s ease',
        }}
        ref={modifiedRef}
        onClick={() => setModifiedDropdownOpen(true)}
      >
        {activeModifiedFilter ? (
          <Group gap={4} wrap="nowrap">
            <Text fz={12} fw={500} truncate maw={80}>
              {getModifiedFilterLabel()}
            </Text>
            <CloseButton
              size={14}
              onClick={e => {
                e.stopPropagation();
                handleClearModifiedFilter();
              }}
            />
          </Group>
        ) : (
          <Group gap={4} wrap="nowrap">
            <ICONS.IconCalendar size={14} />
            <ICONS.IconChevronDown size={12} />
          </Group>
        )}

        {modifiedDropdownOpen && (
          <Paper
            shadow="md"
            style={{
              width: showCustomDate ? 480 : 220,
              display: 'flex',
              overflow: 'hidden',
              transition: 'width 0.2s ease',
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              zIndex: 1000,
              borderRadius: '8px',
              border: '1px solid #dadce0',
            }}
          >
            {/* Left column: options */}
            <Box
              style={{
                width: showCustomDate ? '240px' : '100%',
                borderRight: showCustomDate ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <Text
                style={{
                  padding: '8px 16px 4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#5f6368',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                Modified
              </Text>
              {modifiedOptions.map(option => {
                const isActive =
                  getActivePreset(activeModifiedFilter) === option.value;
                return (
                  <Box
                    key={option.value}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f4',
                      },
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      handleModifiedSelect(option.value);
                    }}
                    className={`filterOption ${selectedTypes.includes(option.value) ? 'filterOptionActive' : ''}`}
                  >
                    <Text fz={'sm'}>{option.label}</Text>
                    {isActive ? (
                      <ICONS.IconCheck size={16} style={{ color: '#1e7ae8' }} />
                    ) : option.value === 'custom' ? (
                      <ICONS.IconChevronRight size={16} />
                    ) : null}
                  </Box>
                );
              })}
            </Box>

            {/* Right column: custom date range */}
            {showCustomDate && (
              <Box style={{ width: '240px' }}>
                <Stack gap="md" p="md">
                  <Box>
                    <DateInput
                      label="After"
                      placeholder="Pick date"
                      value={customDateRange.after || null}
                      onChange={(date: any) =>
                        setCustomDateRange(prev => ({
                          ...prev,
                          after: date || undefined,
                        }))
                      }
                      clearable
                      maxDate={customDateRange.before || new Date()}
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
                      value={customDateRange.before || null}
                      onChange={(date: any) =>
                        setCustomDateRange(prev => ({
                          ...prev,
                          before: date || undefined,
                        }))
                      }
                      clearable
                      minDate={customDateRange.after}
                      maxDate={new Date()}
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
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 16px 16px',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: '8px',
                    paddingTop: '12px',
                  }}
                >
                  <Button variant="subtle" size="sm" onClick={handleClearAll}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomApply}
                    disabled={!customDateRange.after && !customDateRange.before}
                    style={{
                      backgroundColor: '#1e7ae8',
                      color: 'white',
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Clear All - Compact */}
      {((activeTypeFilter && activeTypeFilter?.length) ||
        activeModifiedFilter) && (
        <ActionIcon
          size={36}
          variant="subtle"
          onClick={() => {
            setCustomDateRange({});
            setShowCustomDate(false);
            onClearFilters();
          }}
          style={{
            color: '#5f6368',
            borderRadius: '8px',
          }}
        >
          <ICONS.IconX size={14} />
        </ActionIcon>
      )}
    </Group>
  );
};

export default DashboardFilters;
