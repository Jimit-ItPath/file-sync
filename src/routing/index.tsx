import { RouterProvider } from 'react-router';
import { router } from './router';

const Routing = () => {
  return <RouterProvider {...{ router }} />;
};

export default Routing;
