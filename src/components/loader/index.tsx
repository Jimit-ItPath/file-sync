import { Overlay, Loader, Center, Box } from '@mantine/core';

type LoaderOverlayProps = {
  visible: boolean;
  opacity?: number;
  loaderSize?: number;
};

export const LoaderOverlay = ({
  visible,
  opacity = 0.6,
  loaderSize = 50,
}: LoaderOverlayProps) => {
  if (!visible) {
    return null;
  }

  return (
    <Box pos="fixed" inset={0} style={{ zIndex: 999 }}>
      <Overlay opacity={opacity} color="#000" zIndex={999} />
      <Center style={{ height: '100vh', zIndex: 999, position: 'relative' }}>
        <Loader size={loaderSize} variant="dots" />
      </Center>
    </Box>
  );
};
