import { useEffect } from 'react';
import { getAuth } from '../auth';
import { ROLES } from '../utils/constants';

declare global {
  interface Window {
    Tawk_API?: {
      customStyle?: {
        zIndex?: number;
        [key: string]: any;
      };
      onLoad?: () => void;
      [key: string]: any;
    };
    Tawk_LoadStart?: Date;
  }
}

const TawkToWidget = () => {
  const { role } = getAuth({});

  useEffect(() => {
    if (role === ROLES.USER) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      window.Tawk_API.customStyle = {
        // - If you want the widget ABOVE everything: 2147483647
        // - If you want it BELOW parts of your UI: set a smaller number than those elements
        zIndex: 10,
      };

      // 2) Avoid double-injecting in React Strict Mode
      const existing = document.querySelector(
        'script[src^="https://embed.tawk.to/"]'
      );
      if (!existing) {
        const script = document.createElement('script');
        script.src = `https://embed.tawk.to/${import.meta.env.VITE_REACT_APP_TAWK_TO_WIDGET_ID}/1j0qqhvqk`;
        script.async = true;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);

        // Optional: as a fallback, force the container z-index when the widget reports ready
        window.Tawk_API.onLoad = function () {
          const el =
            document.getElementById('tawkchat-container') ||
            document.querySelector('[id^="tawk"], [class*="tawk"]');
          if (el) el.style.setProperty('z-index', '2147483647', 'important');
        };

        return () => {
          try {
            document.body.removeChild(script);
          } catch {}
          delete window.Tawk_API;
        };
      }
    }
  }, [role]);

  return null;
};

export default TawkToWidget;
