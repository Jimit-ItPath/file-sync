import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';

const useResponsive = () => {
  const theme = useMantineTheme();
  const [orientationKey, setOrientationKey] = useState(0);

  const isXs = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);
  const isSm = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMd = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleOrientationChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setOrientationKey(prev => prev + 1);
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    isXs,
    isSm,
    isMd,
    theme,
    orientationKey,
  };
};

export default useResponsive;
