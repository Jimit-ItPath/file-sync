import { useMemo } from 'react';
import { AUTH_ROUTES, PLAIN_ROUTES, PRIVATE_ROUTES } from '../routing/routes';
import { APP_TITLE } from '../utils/constants';
import { useLocation } from 'react-router';
import { useDocumentTitle } from '@mantine/hooks';

export const usePageData = () => {
  const location = useLocation();

  const title = useMemo(() => {
    interface Route {
      url: string;
      title: string;
      [key: string]: any;
    }

    const transformRoutes = (data: Record<string, any>): Route[] => {
      return Object.values(data).filter(
        route =>
          typeof route.url === 'string' && typeof route.title === 'string'
      );
    };

    const routes = [
      ...transformRoutes(PLAIN_ROUTES),
      ...transformRoutes(AUTH_ROUTES),
      ...transformRoutes(PRIVATE_ROUTES),
    ];

    return (
      routes?.find(({ url }) => url === location?.pathname)?.title || APP_TITLE
    );
  }, [location?.pathname]);

  if (location.pathname?.includes('google-drive')) {
    useDocumentTitle('Google Drive | All Cloud Hub');
  } else if (location.pathname?.includes('dropbox')) {
    useDocumentTitle('Dropbox | All Cloud Hub');
  } else if (location.pathname?.includes('onedrive')) {
    useDocumentTitle('OneDrive | All Cloud Hub');
  } else {
    useDocumentTitle(`${title} | All Cloud Hub`);
  }

  return [title];
};
