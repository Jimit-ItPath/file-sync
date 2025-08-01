import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Input,
  Paper,
  Text,
  Group,
  ActionIcon,
  Badge,
  Loader,
  Flex,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { ICONS } from '../../../assets/icons';
import { Tooltip } from '../../tooltip';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomAutocompleteProps {
  data?: SelectOption[];
  value?: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  onSearchChange?: (query: string) => Promise<SelectOption[]> | SelectOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  maxDropdownHeight?: number;
  limit?: number;
  debounceTime?: number;
  nothingFoundMessage?: string;
  loadingMessage?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  w?: string | number;
  maw?: string | number;
  miw?: string | number;
  onClear?: () => void;
}

export const CustomAutocomplete: React.FC<CustomAutocompleteProps> = ({
  data = [],
  value,
  onChange,
  onSearchChange,
  placeholder = 'Select option...',
  label,
  description,
  error,
  multiple = false,
  searchable = true,
  clearable = true,
  disabled = false,
  required = false,
  maxDropdownHeight = 200,
  limit = 50,
  debounceTime = 300,
  nothingFoundMessage = 'No options found',
  //   loadingMessage = 'Loading...',
  size = 'sm',
  w = '100%',
  maw,
  miw,
  onClear = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<SelectOption[]>(data);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [debouncedQuery] = useDebouncedValue(searchQuery, debounceTime);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchable || !isOpen) return;

    const performSearch = async () => {
      if (onSearchChange && debouncedQuery.trim()) {
        setLoading(true);
        try {
          const results = await onSearchChange(debouncedQuery);
          if (Array.isArray(results)) {
            setOptions(results.slice(0, limit));
          }
        } catch (err) {
          console.error('Search failed:', err);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else if (!debouncedQuery.trim()) {
        setOptions(data.slice(0, limit));
      } else {
        // Local filtering
        const filtered = data.filter(option =>
          option.label.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setOptions(filtered.slice(0, limit));
      }
      setHighlightedIndex(-1);
    };

    performSearch();
  }, [debouncedQuery, isOpen]); // Removed onSearchChange, searchable, data, limit from dependencies

  // Initialize options
  useEffect(() => {
    setOptions(data.slice(0, limit));
  }, [data, limit]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === 'ArrowDown') {
          setIsOpen(true);
          event.preventDefault();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            handleOptionSelect(options[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, options, highlightedIndex]
  );

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
      setSearchQuery('');
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
    setHighlightedIndex(-1);
  };

  const handleRemoveValue = (
    valueToRemove: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== valueToRemove));
    }
  };

  const handleClear = (_: React.MouseEvent) => {
    onChange(multiple ? [] : null);
    setSearchQuery('');
    onClear?.();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getSelectedLabels = (): SelectOption[] => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return values
      .map(v => {
        const option = [...data, ...options].find(opt => opt.value === v);
        return option || { value: v, label: v };
      })
      .filter(Boolean);
  };

  const selectedLabels = getSelectedLabels();
  const hasValue = multiple ? selectedLabels.length > 0 : Boolean(value);
  const showClearButton = clearable && hasValue && !disabled;

  const renderSelectedValues = () => {
    if (!hasValue) return null;

    if (multiple) {
      return (
        <Group gap={4} wrap="wrap">
          {selectedLabels.map(option => (
            <Badge
              key={option.value}
              variant="light"
              size={size}
              style={{ maxWidth: '120px' }}
              rightSection={
                !disabled ? (
                  <ActionIcon
                    size={12}
                    variant="transparent"
                    onClick={e => handleRemoveValue(option.value, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ICONS.IconX size={8} />
                  </ActionIcon>
                ) : null
              }
            >
              <Text truncate size="xs">
                {option.label}
              </Text>
            </Badge>
          ))}
        </Group>
      );
    }

    return (
      <Tooltip label={selectedLabels[0]?.label} fz={'xs'}>
      <Text size={size} truncate style={{ color: '#000' }}>
        {selectedLabels[0]?.label}
      </Text>
      </Tooltip>
    );
  };

  const renderOptions = () => {
    if (options.length === 0) {
      return (
        <Text size="sm" c="dimmed" p="md" ta="center">
          {nothingFoundMessage}
        </Text>
      );
    }

    return (
      <>
        {options.map((option, index) => (
          <Box
            key={option.value}
            ref={(el: any) => (optionRefs.current[index] = el)}
            p="xs"
            style={theme => ({
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              backgroundColor:
                highlightedIndex === index || selectedLabels.includes(option)
                  ? theme.colors.blue[1]
                  : 'transparent',
              opacity: option.disabled ? 0.5 : 1,
              transition: 'background-color 150ms ease',
              borderRadius: '4px',
              margin: '2px 4px',
            })}
            onClick={() => !option.disabled && handleOptionSelect(option)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" truncate>
                {option.label}
              </Text>
              {multiple &&
                Array.isArray(value) &&
                value.includes(option.value) && (
                  <Text size="xs" c="blue" fw={600}>
                    ✓
                  </Text>
                )}
            </Group>
          </Box>
        ))}
      </>
    );
  };

  return (
    <Box
      w={w}
      maw={maw}
      miw={miw}
      ref={containerRef}
      style={{ position: 'relative' }}
    >
      {label && (
        <Input.Label required={required} size={size} mb={2}>
          {label}
        </Input.Label>
      )}

      {description && (
        <Input.Description size={size} mb={2}>
          {description}
        </Input.Description>
      )}

      <Input
        ref={inputRef}
        placeholder={hasValue ? '' : placeholder}
        value={searchable && isOpen ? searchQuery : ''}
        onChange={e => searchable && setSearchQuery(e.target.value)}
        onFocus={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        error={error}
        size={size}
        rightSection={
          <Flex align="center" gap={4} mr={showClearButton ? 15 : 0}>
            {loading && <Loader size="xs" />}
            {showClearButton && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={handleClear}
                style={{ cursor: 'pointer' }}
              >
                <ICONS.IconX size={14} />
              </ActionIcon>
            )}
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
              }}
            >
              <ICONS.IconChevronDown size={14} />
            </ActionIcon>
          </Flex>
        }
        styles={{
          input: {
            cursor: 'text',
            paddingRight: 60,
          },
          section: {
            pointerEvents: 'auto',
            paddingRight: 8,
          },
        }}
      />

      {hasValue && (
        <Box
          pl={10}
          style={{
            position: 'absolute',
            // top: '100%',
            top: '36px',
            left: 0,
            right: 0,
            pointerEvents: 'auto',
          }}
          // w={120}
          w={'80%'}
        >
          {renderSelectedValues()}
        </Box>
      )}

      {isOpen && (
        <Paper
          ref={dropdownRef}
          shadow="lg"
          radius="md"
          withBorder
          style={{
            position: 'absolute',
            top: '100%',
            // top: 'calc(100% + 24px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: 4,
            maxHeight: maxDropdownHeight,
            overflow: 'hidden',
            border: '1px solid #e9ecef',
            boxShadow:
              '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
        >
          <Box style={{ maxHeight: maxDropdownHeight, overflowY: 'auto' }}>
            {renderOptions()}
          </Box>
        </Paper>
      )}

      {error && (
        <Input.Error size={size} mt={4}>
          {error}
        </Input.Error>
      )}
    </Box>
  );
};
