import { useCallback } from 'react';

declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: unknown) => void,
        options: { scope: string }
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

const useSocialLogin = () => {
  const handleGoogleLogin = useCallback(() => {
    window.open(
      `${import.meta.env.VITE_REACT_APP_BASE_URL}/google/auth`,
      '_self' // same window
    );
  }, []);

  const handleFacebookLogin = useCallback(() => {
    window.open(
      `${import.meta.env.VITE_REACT_APP_BASE_URL}/facebook/auth`,
      '_self' // same window
    );
  }, []);

  const handleFacebookResponse = useCallback(() => {
    window.FB.login(
      (response: any) => {
        console.log('facebook res-', response);
      },
      { scope: 'public_profile,email' }
    );
  }, []);

  return {
    handleFacebookResponse,
    handleGoogleLogin,
    handleFacebookLogin,
  };
};

export default useSocialLogin;
