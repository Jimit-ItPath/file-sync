import { useCallback, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

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
  // Initialize Facebook SDK
  useEffect(() => {
    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: import.meta.env.VITE_REACT_APP_FACEBOOK_APP_ID || '123',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
      };

      (function (d: Document, s: string, id: string) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        const js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        if (fjs && fjs.parentNode) {
          fjs.parentNode.insertBefore(js, fjs);
        }
      })(document, 'script', 'facebook-jssdk');
    }
  }, []);

  const handleGoogleSuccess = useCallback(async (tokenResponse: any) => {
    console.log('res-', tokenResponse);
    // tokenResponse contains access_token
    // Send tokenResponse.access_token to your backend for verification and registration/login
    // Example:
    // const response = await api.auth.googleLogin({ token: tokenResponse.access_token });
    // handle response as you do in normal registration
  }, []);

  // const [handleGoogleLogin, loading] = useAsyncOperation(
  //   async () => {
  //     const res = await api.auth.googleSignIn();
  //     console.log("res-", res)
  //     // return res;
  //   }
  // );

  const handleGoogleLogin = useCallback(() => {
    // Redirect the browser to the backend Google login endpoint
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

  const handleGoogleError = useCallback(() => {
    // Handle error (show notification, etc.)
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
  });

  const handleFacebookResponse = useCallback(() => {
    window.FB.login(
      (response: any) => {
        console.log('facebook res-', response);
        // if (response.authResponse) {
        //   const { accessToken } = response.authResponse;
        //   // Send to your backend
        //   api.auth
        //     .facebookLogin({ token: accessToken })
        //     .then(res => {
        //       // Handle successful login
        //     })
        //     .catch(error => {
        //       console.error('Facebook login failed:', error);
        //     });
        // } else {
        //   console.log('User cancelled login or did not fully authorize.');
        // }
      },
      { scope: 'public_profile,email' }
    );
  }, []);

  return {
    googleLogin,
    handleFacebookResponse,
    handleGoogleLogin,
    handleFacebookLogin,
  };
};

export default useSocialLogin;
