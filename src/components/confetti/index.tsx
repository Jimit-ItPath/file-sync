import { Box, Stack, Text, Title } from '@mantine/core';
import { ICONS } from '../../assets/icons';
import { Button } from '../button';
import Confetti from 'react-confetti';

interface ShowConfettiProps {
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
  width: number;
  height: number;
}

const ShowConfetti = ({
  showConfetti,
  setShowConfetti,
  width,
  height,
}: ShowConfettiProps) => {
  if (!showConfetti) {
    return null;
  }

  return (
    <>
      <Box
        pos="fixed"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0,0,0,0.6)"
        style={{
          zIndex: 9999,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        display="flex"
        onClick={() => setShowConfetti(false)}
      >
        <Stack
          align="center"
          bg="white"
          px={32}
          py={24}
          gap={16}
          style={{
            borderRadius: '12px',
            animation: 'scaleFadeIn 0.6s ease-out forwards',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            maxWidth: '90%',
            textAlign: 'center',
          }}
          onClick={e => e.stopPropagation()}
        >
          <ICONS.IconSparkles size={42} color="#10b981" />
          <Title order={2} style={{ fontWeight: 700, fontSize: 24 }}>
            Hooray! Your first cloud account is connected 🎉
          </Title>
          <Text size="sm" c="dimmed">
            You can now manage files from Google Drive, Dropbox, and OneDrive —
            all in one unified place.
          </Text>
          <Button
            size="md"
            radius="md"
            onClick={() => setShowConfetti(false)}
            style={{ background: '#0284c7' }}
          >
            Let’s Get Started
          </Button>
        </Stack>
      </Box>

      <Confetti
        height={height}
        width={width}
        recycle={false}
        numberOfPieces={500}
      />
    </>
  );
};

export default ShowConfetti;
