import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const useResponsive = () => {
  const theme = useMantineTheme();
  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  return {
    isXs,
    isSm,
    isMd,
    theme,
  };
};

export default useResponsive;
