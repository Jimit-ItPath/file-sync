import { useEffect } from 'react';
import { getAuth } from '../auth';
import { ROLES } from '../utils/constants';

// Declare TawkTo types
declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
    };
    Tawk_LoadStart?: any;
  }
}

const TawkToWidget = () => {
  const { role } = getAuth({});

  useEffect(() => {
    const initializeTawkTo = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="tawk.to"]');

      // If we already have the script
      if (existingScript && window.Tawk_API) {
        window.Tawk_API.showWidget();
        return;
      }

      // If we need to create new script
      const script = document.createElement('script');
      script.src = `https://embed.tawk.to/${import.meta.env.VITE_REACT_APP_TAWK_TO_WIDGET_ID}/1j0qqhvqk`;
      script.async = true;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    };

    // Handle cleanup
    const cleanupTawkTo = () => {
      if (window.Tawk_API) {
        window.Tawk_API.hideWidget();
      }
    };

    // Handle route changes
    const handleRouteChange = () => {
      if (
        window.location.pathname === '/' &&
        role !== ROLES.USER &&
        role !== ROLES.ADMIN
      ) {
        initializeTawkTo();
      } else {
        cleanupTawkTo();
      }
    };

    // Initial setup
    if (
      window.location.pathname === '/' &&
      role !== ROLES.USER &&
      role !== ROLES.ADMIN
    ) {
      initializeTawkTo();
    } else {
      cleanupTawkTo();
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      cleanupTawkTo();
    };
  }, [location.pathname, role]);

  return null;
};

export default TawkToWidget;
