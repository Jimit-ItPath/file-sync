import { useContext } from 'react';
import { AuthContext } from './auth-provider';

const useAuth = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default useAuth;
