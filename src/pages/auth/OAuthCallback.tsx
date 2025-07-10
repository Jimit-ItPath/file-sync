// pages/auth/oauth-callback.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');

    if (accessToken) {
      localStorage.setItem('token', accessToken);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return <div>Processing login...</div>;
}
