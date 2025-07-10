import {
  createTheme,
  localStorageColorSchemeManager,
  rem,
} from '@mantine/core';
import {
  primary,
  danger,
  dark,
  info,
  light,
  secondary,
  success,
  warning,
} from './colors';

export const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'primary',
  colors: {
    primary,
    secondary,
    success,
    danger,
    warning,
    info,
    light,
    dark,
  },
  defaultRadius: 'sm',
  cursorType: 'pointer',
  headings: {
    fontFamily: 'Poppins, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
      h2: { fontSize: rem(30) },
      h3: { fontSize: rem(24) },
    },
  },
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
});

export const colorSchemeManager = localStorageColorSchemeManager({
  key: 'mantine-color-scheme',
});
