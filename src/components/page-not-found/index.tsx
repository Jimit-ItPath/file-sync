import { Center, Container, Group, Stack, Text, Title } from '@mantine/core';
import { Button } from '../button';
import useAuth from '../../auth/use-auth';
import { Link } from 'react-router';
import { SVGS } from '../../assets/svgs';
import Svg from '../../assets/svgs/svg';

type AuthType = {
  redirectUrl: string;
};

export const PageNotFound = () => {
  const { redirectUrl } = useAuth() as AuthType;
  return (
    <Container>
      <Center mih="100dvh" py="xl">
        <Stack
          w="100%"
          align="center"
          pos="relative"
          gap="xl"
          pt={{ xs: 220 }}
          mb={{ xs: 110 }}
        >
          <Svg
            svgData={SVGS.NotFound}
            w="100%"
            pos={{ xs: 'absolute' }}
            justify="center"
            opacity={0.1}
            top={0}
          />
          <Title ta="center" order={2}>
            Nothing to see here
          </Title>
          <Text c="gray" ta="center" maw={540}>
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error, contact support.
          </Text>
          <Group justify="center">
            <Button component={Link} to={redirectUrl}>
              Back to Home
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
};
