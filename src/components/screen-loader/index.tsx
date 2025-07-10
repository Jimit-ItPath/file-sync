import { Center, Loader } from '@mantine/core';

export const ScreenLoader = () => {
  return (
    <Center w="100%" mih="100dvh">
      <Loader size="xl" type="dots" />
    </Center>
  );
};
