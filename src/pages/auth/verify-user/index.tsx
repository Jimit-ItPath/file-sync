import { Box, Stack, Title, Text, Card, Center } from '@mantine/core';
import { ICONS } from '../../../assets/icons'; // Adjust path as needed
import useVerifyUser from './use-verify-user';

export default function VerifyUser() {
  const { status, message } = useVerifyUser();

  return (
    <Box
      h="100vh"
      w="100vw"
      style={{
        background: 'linear-gradient(120deg, #0ea5e9 0%, #0369a1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        shadow="md"
        radius={16}
        p={32}
        style={{
          minWidth: 340,
          maxWidth: 380,
          width: '100%',
          background: '#fff',
        }}
      >
        <Stack gap={24} align="center">
          <Center>
            {status === 'success' && (
              <ICONS.IconCircleCheck size={56} color="#22c55e" />
            )}
            {status === 'error' && (
              <ICONS.IconCircleDashedX size={56} color="#ef4444" />
            )}
          </Center>
          <Title order={3} ta="center" fw={700} fz={26}>
            {status === 'success'
              ? 'Account Verified'
              : status === 'error'
                ? 'Verification Failed'
                : 'Verifying...'}
          </Title>
          <Text ta="center" c="dimmed">
            {message}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}
