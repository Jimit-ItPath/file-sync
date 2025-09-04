import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme, colorSchemeManager } from './theme';
import { AuthProvider } from './auth/auth-provider';
import Routing from './routing';

function App() {
  return (
    <MantineProvider
      {...{
        theme,
        colorSchemeManager,
        defaultColorScheme: 'light',
      }}
    >
      <Notifications position="top-right" autoClose={3000} />
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
