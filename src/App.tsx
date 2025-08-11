import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme, colorSchemeManager } from './theme';
import { AuthProvider } from './auth/auth-provider';
import Routing from './routing';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID || ''}
    >
      <MantineProvider
        {...{
          theme,
          colorSchemeManager,
          defaultColorScheme: 'light',
        }}
      >
        <Notifications position="top-right" />
        <AuthProvider>
          <Routing />
        </AuthProvider>
      </MantineProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
