import { useEffect, useState } from 'react';
import { Container } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router';
import { usePageData } from '../../hooks/use-page-data';
import useSearchParamsObject from '../../hooks/use-search-params-object';
import useAuth from '../../auth/use-auth';
import { AUTH_ROUTES, PRIVATE_ROUTES } from '../../routing/routes';
import {
  AUTH_MESSAGES,
  CACHED_URL_LOCAL_STORAGE_KEY,
} from '../../utils/constants';
import { api } from '../../api';
import {
  apiAsyncHandler,
  decodeToken,
  removeLocalStorage,
} from '../../utils/helper';
import { getAuth } from '../../auth';
import { notifications } from '@mantine/notifications';
import { ScreenLoader } from '../../components';
import classes from './auth-layout.module.css';
import useEmailVerificationStore from '../../pages/email-verification/use-email-verification-store';
import type { JwtPayload } from 'jwt-decode';
// import { decodeToken } from '../../utils/helper';
// import type { JwtPayload } from 'jwt-decode';

const AuthLayout = () => {
  usePageData();
  const searchParams = useSearchParamsObject();

  const navigate = useNavigate();
  const { login } = useAuth() as any;

  const isLoginPage = location?.pathname === AUTH_ROUTES.LOGIN.url;

  const [isRedirecting, setIsRedirecting] = useState(
    Boolean(searchParams?.token && isLoginPage)
  );

  const [isVerified, setIsVerified] = useState(false);

  const { setData } = useEmailVerificationStore();

  useEffect(() => {
    if (searchParams?.token && !isVerified && isLoginPage) {
      apiAsyncHandler(
        async () => {
          const res = await api.auth.getAuthToken({
            params: { token: searchParams.token },
          });
          login(res?.data?.data?.token);
          const { redirectUrl } = getAuth({});
          navigate(redirectUrl);
          removeLocalStorage(CACHED_URL_LOCAL_STORAGE_KEY);
        },
        (error: any) => {
          notifications.show({
            message: error?.message || AUTH_MESSAGES.verificationLinkExpired,
            color: 'red',
          });
          if (error?.data?.status === 400) {
            const tokenData = decodeToken(searchParams.token) as {
              email?: string;
            } & JwtPayload;
            setData({
              email: tokenData?.email,
              startTime: 0,
            });
            navigate(PRIVATE_ROUTES.DASHBOARD.url);
          } else {
            navigate(location?.pathname);
            setIsRedirecting(false);
          }
        }
      );
      setIsVerified(true);
    }
  }, [isLoginPage, isVerified, login, navigate, searchParams.token, setData]);

  return !isRedirecting ? (
    <Container fluid px={0} className={classes.container}>
      <Outlet />
      {/* <Grid w="100%" gutter={0} styles={{ inner: { height: '100%' } }}>
        <Grid.Col
          span={{ base: 12, md: 7 }}
          visibleFrom="md"
          className={classes.leftSection}
        >
          <Center
            h="100%"
            mih={{ base: '100%', md: '100dvh' }}
            px={16}
            py={{ base: 0, md: 32 }}
            bg="#2f4858"
          >
            Swiper Section || Image Section
          </Center>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Center
            h="100%"
            bg="linear-gradient(180deg, rgba(18, 184, 134, 0.1) 0%, rgba(255, 255, 255, 1) 82%)"
          >
            <Stack
              w="100%"
              maw={450}
              mih="100dvh"
              px={16}
              py={32}
              justify="center"
              align="center"
              gap={48}
            >
              <Outlet />
            </Stack>
          </Center>
        </Grid.Col>
      </Grid> */}
    </Container>
  ) : (
    <ScreenLoader />
  );
};

export default AuthLayout;
