import { useEffect } from 'react';
import { getAuth } from '../auth';
import { ROLES } from '../utils/constants';

const TawkToWidget = () => {
  const { role } = getAuth({});

  useEffect(() => {
    if (role === ROLES.USER) {
      const script = document.createElement('script');
      script.src = `https://embed.tawk.to/${import.meta.env.VITE_REACT_APP_TAWK_TO_WIDGET_ID}/1j0qqhvqk`;
      script.async = true;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [role]);

  return null;
};

export default TawkToWidget;
