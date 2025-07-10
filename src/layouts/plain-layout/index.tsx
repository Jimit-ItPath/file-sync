import { Outlet } from 'react-router';
import { usePageData } from '../../hooks/use-page-data';

const PlainLayout = () => {
  usePageData();
  return <Outlet />;
};
export default PlainLayout;
