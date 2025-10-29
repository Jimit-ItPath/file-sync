import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';

export const useMobileResponsive = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [shouldShowMobileMenu, setShouldShowMobileMenu] = useState(false);

  // Enhanced breakpoint checks
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const isMediumScreen = useMediaQuery('(max-width: 1024px)'); // Include tablets
  const isLargeScreen = useMediaQuery('(min-width: 1200px)'); // Desktop with plenty of space

  // Mobile device detection
  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|webos|windows phone/i.test(
        userAgent
      );
      setIsMobileDevice(isMobile);
    };

    checkMobileDevice();
  }, []);

  // Orientation detection
  useEffect(() => {
    const checkOrientation = () => {
      const orientation = window.screen?.orientation?.angle ?? 0;
      const isLandscapeMode =
        orientation === 90 || orientation === -90 || orientation === 270;
      setIsLandscape(isLandscapeMode);
    };

    checkOrientation();

    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 100); // Small delay for orientation to settle
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Determine if mobile menu should be shown
  useEffect(() => {
    // Show mobile menu if:
    // 1. Small screen (width <= 768px) OR
    // 2. Mobile device in landscape mode OR
    // 3. Medium screens (tablets) where navigation might overflow
    const shouldShow =
      isSmallScreen ||
      (isMobileDevice && isLandscape) ||
      (isMediumScreen && !isLargeScreen); // This catches tablet devices

    setShouldShowMobileMenu(shouldShow);
  }, [
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isMobileDevice,
    isLandscape,
  ]);

  return {
    isMobileDevice,
    isLandscape,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    shouldShowMobileMenu,
  };
};
