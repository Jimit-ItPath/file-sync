import { useEffect } from 'react';

const TawkToWidget = () => {
  // const { isAuthenticated } = getAuth({});

  useEffect(() => {
    // if (isAuthenticated) {
    const script = document.createElement('script');
    script.src = `https://embed.tawk.to/${import.meta.env.VITE_REACT_APP_TAWK_TO_WIDGET_ID}/1j0qqhvqk`;
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
    // }
  }, []);

  return null;
};

export default TawkToWidget;
