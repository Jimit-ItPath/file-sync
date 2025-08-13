import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Popover,
  SegmentedControl,
  Stack,
  Text,
  Tooltip,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconCalendar,
  IconFilter,
  IconX,
} from '@tabler/icons-react';

type ModifiedFilter = 'today' | 'last7' | 'last30' | 'custom' | null;

interface DriveFiltersBarProps {
  selectedCount: number;
  onTypeFilter: (type: string | null) => void;
  onModifiedFilter: (dateRange: { after?: Date; before?: Date } | null) => void;
  onClearFilters: () => void;
  activeTypeFilter: string | null;
  activeModifiedFilter: { after?: Date; before?: Date } | null;
  renderSelectionBar?: React.ReactNode;
}

const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Documents', value: 'documents' },
  { label: 'Sheets', value: 'sheets' },
  { label: 'Presentations', value: 'presentations' },
  { label: 'Photos', value: 'photos' },
  { label: 'PDFs', value: 'pdfs' },
  { label: 'Videos', value: 'videos' },
  { label: 'Archives', value: 'archives' },
  { label: 'Audio', value: 'audio' },
];

const MODIFIED_OPTIONS: {
  label: string;
  value: Exclude<ModifiedFilter, null>;
}[] = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last7' },
  { label: 'Last 30 days', value: 'last30' },
  { label: 'Custom range', value: 'custom' },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function DriveFiltersBar({
  selectedCount,
  onTypeFilter,
  onModifiedFilter,
  onClearFilters,
  activeTypeFilter,
  activeModifiedFilter,
  renderSelectionBar,
}: DriveFiltersBarProps) {
  const theme = useMantineTheme();
  const isSmall = useMediaQuery('(max-width: 768px)');

  // Local UI state for dropdowns and custom dates
  const [typeOpened, setTypeOpened] = useState(false);
  const [modifiedOpened, setModifiedOpened] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [customAfter, setCustomAfter] = useState<Date | null>(null);
  const [customBefore, setCustomBefore] = useState<Date | null>(null);

  // Compute which modified preset is active
  let modifiedPreset: ModifiedFilter = null;
  if (activeModifiedFilter?.after && activeModifiedFilter?.before) {
    // Check for today, last7, last30
    const afterISO = activeModifiedFilter.after.toISOString();
    const beforeISO = activeModifiedFilter.before.toISOString();
    if (
      afterISO === startOfDay(new Date()).toISOString() &&
      beforeISO === endOfDay(new Date()).toISOString()
    ) {
      modifiedPreset = 'today';
    } else if (
      afterISO === startOfDay(daysAgo(6)).toISOString() &&
      beforeISO === endOfDay(new Date()).toISOString()
    ) {
      modifiedPreset = 'last7';
    } else if (
      afterISO === startOfDay(daysAgo(29)).toISOString() &&
      beforeISO === endOfDay(new Date()).toISOString()
    ) {
      modifiedPreset = 'last30';
    } else {
      modifiedPreset = 'custom';
    }
  } else if (activeModifiedFilter?.after || activeModifiedFilter?.before) {
    modifiedPreset = 'custom';
  }

  const hasFilters =
    !!activeTypeFilter ||
    !!activeModifiedFilter?.after ||
    !!activeModifiedFilter?.before;

  // Selection bar if files are selected
  if (selectedCount > 0) {
    return (
      <Box
        px="sm"
        py={8}
        style={{
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
          background:
            theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#fff',
        }}
      >
        {renderSelectionBar ?? (
          <Group justify="space-between">
            <Group gap="xs">
              <Badge variant="light">{selectedCount}</Badge>
              <Text size="sm">selected</Text>
            </Group>
            <Text size="sm" c="dimmed">
              (Selection bar placeholder)
            </Text>
          </Group>
        )}
      </Box>
    );
  }

  // Handle type filter apply
  const handleTypeApply = (type: TypeFilter) => {
    onTypeFilter(type);
    setTypeOpened(false);
  };

  // Handle modified filter apply
  const handleModifiedApply = (preset: ModifiedFilter) => {
    if (preset === 'today') {
      onModifiedFilter({
        after: startOfDay(new Date()),
        before: endOfDay(new Date()),
      });
      setShowCustomDates(false);
      setCustomAfter(null);
      setCustomBefore(null);
      setModifiedOpened(false);
    } else if (preset === 'last7') {
      onModifiedFilter({
        after: startOfDay(daysAgo(6)),
        before: endOfDay(new Date()),
      });
      setShowCustomDates(false);
      setCustomAfter(null);
      setCustomBefore(null);
      setModifiedOpened(false);
    } else if (preset === 'last30') {
      onModifiedFilter({
        after: startOfDay(daysAgo(29)),
        before: endOfDay(new Date()),
      });
      setShowCustomDates(false);
      setCustomAfter(null);
      setCustomBefore(null);
      setModifiedOpened(false);
    } else if (preset === 'custom') {
      setShowCustomDates(true);
    }
  };

  // Commit custom date range
  const commitCustomDates = () => {
    if (customAfter || customBefore) {
      onModifiedFilter({
        after: customAfter ?? undefined,
        before: customBefore ?? undefined,
      });
      setModifiedOpened(false);
      setShowCustomDates(false);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    onClearFilters();
    setCustomAfter(null);
    setCustomBefore(null);
    setShowCustomDates(false);
    setTypeOpened(false);
    setModifiedOpened(false);
  };

  // Desktop layout
  const desktopFilters = (
    <Group gap="xs" wrap="nowrap">
      {/* Type */}
      <Popover
        opened={typeOpened}
        onChange={setTypeOpened}
        position="bottom-start"
        offset={6}
        shadow="md"
        withinPortal
      >
        <Popover.Target>
          <Button
            variant="subtle"
            leftSection={<IconFilter size={16} />}
            rightSection={<IconChevronDown size={16} />}
            onClick={() => setTypeOpened(o => !o)}
          >
            {activeTypeFilter
              ? TYPE_OPTIONS.find(t => t.value === activeTypeFilter)?.label
              : 'Type'}
          </Button>
        </Popover.Target>
        <Popover.Dropdown p="xs" maw={280}>
          <Stack gap="xs">
            <SegmentedControl
              fullWidth
              orientation="vertical"
              value={activeTypeFilter ?? ''}
              onChange={val => handleTypeApply(val as TypeFilter)}
              data={TYPE_OPTIONS.map(t => ({
                label: t.label,
                value: t.value,
              }))}
            />
            <Group justify="space-between" mt="xs">
              <Button
                variant="light"
                onClick={() => handleTypeApply(null)}
                leftSection={<IconX size={14} />}
              >
                Clear
              </Button>
              <Button onClick={() => setTypeOpened(false)}>Done</Button>
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      <Divider orientation="vertical" />

      {/* Modified */}
      <Popover
        opened={modifiedOpened}
        onChange={setModifiedOpened}
        position="bottom-start"
        offset={6}
        shadow="md"
        withinPortal
      >
        <Popover.Target>
          <Button
            variant="subtle"
            leftSection={<IconCalendar size={16} />}
            rightSection={<IconChevronDown size={16} />}
            onClick={() => setModifiedOpened(o => !o)}
          >
            {modifiedPreset
              ? MODIFIED_OPTIONS.find(m => m.value === modifiedPreset)?.label
              : 'Modified'}
          </Button>
        </Popover.Target>

        <Popover.Dropdown p="xs" maw={360}>
          <Stack gap="xs">
            <SegmentedControl
              fullWidth
              orientation="vertical"
              value={modifiedPreset ?? ''}
              onChange={val => handleModifiedApply(val as ModifiedFilter)}
              data={MODIFIED_OPTIONS.map(m => ({
                label: m.label,
                value: m.value,
              }))}
            />

            {/* Custom range area */}
            <Transition
              mounted={showCustomDates}
              transition="pop"
              duration={160}
              timingFunction="ease-out"
            >
              {styles => (
                <Box style={styles}>
                  <Stack gap="xs" pt="xs">
                    <Group grow>
                      <DateInput
                        label="After"
                        placeholder="Pick date"
                        value={customAfter}
                        onChange={setCustomAfter}
                        clearable
                        popoverProps={{
                          // position: 'top'
                          withinPortal: false,
                        }}
                      />
                      <DateInput
                        label="Before"
                        placeholder="Pick date"
                        value={customBefore}
                        onChange={setCustomBefore}
                        popoverProps={{
                          // position: 'top'
                          withinPortal: false,
                        }}
                        clearable
                      />
                    </Group>
                    <Group justify="space-between" mt="xs">
                      <Button
                        variant="light"
                        onClick={() => {
                          setCustomAfter(null);
                          setCustomBefore(null);
                          setShowCustomDates(false);
                          onModifiedFilter(null);
                        }}
                        leftSection={<IconX size={14} />}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={commitCustomDates}
                        disabled={!customAfter && !customBefore}
                      >
                        Apply
                      </Button>
                    </Group>
                  </Stack>
                </Box>
              )}
            </Transition>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      {hasFilters && (
        <>
          <Divider orientation="vertical" />
          <Tooltip label="Clear filters">
            <ActionIcon
              variant="light"
              onClick={handleClearAll}
              aria-label="Clear filters"
            >
              <IconAdjustmentsHorizontal size={16} />
            </ActionIcon>
          </Tooltip>
        </>
      )}
    </Group>
  );

  // Mobile layout
  const mobileFilters = (
    <Menu shadow="md" width={320} withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          leftSection={<IconFilter size={16} />}
          rightSection={<IconChevronDown size={16} />}
        >
          Filters
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Box p="xs">
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Type
          </Text>
          <SegmentedControl
            fullWidth
            orientation="vertical"
            value={activeTypeFilter ?? ''}
            onChange={val => handleTypeApply(val as TypeFilter)}
            data={TYPE_OPTIONS.map(t => ({ label: t.label, value: t.value }))}
          />
        </Box>
        <Divider />
        <Box p="xs">
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Modified
          </Text>
          <SegmentedControl
            fullWidth
            orientation="vertical"
            value={modifiedPreset ?? ''}
            onChange={val => handleModifiedApply(val as ModifiedFilter)}
            data={MODIFIED_OPTIONS.map(m => ({
              label: m.label,
              value: m.value,
            }))}
          />
          <Transition
            mounted={showCustomDates}
            transition="pop"
            duration={160}
            timingFunction="ease-out"
          >
            {styles => (
              <Box style={styles} pt="xs">
                <Stack gap="xs">
                  <DateInput
                    label="After"
                    value={customAfter}
                    onChange={setCustomAfter}
                    clearable
                  />
                  <DateInput
                    label="Before"
                    value={customBefore}
                    onChange={setCustomBefore}
                    clearable
                  />
                  <Group justify="space-between" mt="xs">
                    <Button
                      variant="light"
                      onClick={() => {
                        setCustomAfter(null);
                        setCustomBefore(null);
                        setShowCustomDates(false);
                        onModifiedFilter(null);
                      }}
                      leftSection={<IconX size={14} />}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={commitCustomDates}
                      disabled={!customAfter && !customBefore}
                    >
                      Apply
                    </Button>
                  </Group>
                </Stack>
              </Box>
            )}
          </Transition>
        </Box>
        <Divider />
        <Group p="xs" justify="space-between">
          <Button
            variant="light"
            onClick={handleClearAll}
            leftSection={<IconAdjustmentsHorizontal size={14} />}
          >
            Clear all
          </Button>
          <Button
            onClick={() => {
              setTypeOpened(false);
              setModifiedOpened(false);
            }}
          >
            Done
          </Button>
        </Group>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <Box
      px="sm"
      py={8}
      style={{
        zIndex: 10,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 9999,
        margin: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(200, 200, 200, 0.4)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
      //   style={{
      //     position: 'sticky',
      //     top: 0,
      //     zIndex: 10,
      //     borderBottom: `1px solid ${theme.colors.gray[3]}`,
      //     background:
      //       theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#fff',
      //   }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          {isSmall ? mobileFilters : desktopFilters}
        </Group>

        {/* Active badges (right side), like Drive chips */}
        {/* <Group gap={6} wrap="wrap">
          {activeTypeFilter && (
            <Badge
              variant="light"
              rightSection={
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() => onTypeFilter(null)}
                >
                  <IconX size={12} />
                </ActionIcon>
              }
            >
              {TYPE_OPTIONS.find(t => t.value === activeTypeFilter)?.label}
            </Badge>
          )}
          {modifiedPreset && modifiedPreset !== 'custom' && (
            <Badge
              variant="light"
              rightSection={
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() => onModifiedFilter(null)}
                >
                  <IconX size={12} />
                </ActionIcon>
              }
            >
              {MODIFIED_OPTIONS.find(m => m.value === modifiedPreset)?.label}
            </Badge>
          )}
          {modifiedPreset === 'custom' &&
            (activeModifiedFilter?.after || activeModifiedFilter?.before) && (
              <Badge
                variant="light"
                rightSection={
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={() => onModifiedFilter(null)}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                }
              >
                {`Custom: ${
                  activeModifiedFilter?.after
                    ? startOfDay(
                        activeModifiedFilter.after
                      ).toLocaleDateString()
                    : '—'
                } → ${
                  activeModifiedFilter?.before
                    ? endOfDay(activeModifiedFilter.before).toLocaleDateString()
                    : '—'
                }`}
              </Badge>
            )}
        </Group> */}
      </Group>
    </Box>
  );
}
