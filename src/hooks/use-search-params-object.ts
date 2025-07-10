import { useSearchParams } from 'react-router';

const useSearchParamsObject = () => {
  const [searchParams] = useSearchParams();
  return Object.fromEntries(searchParams.entries());
};

export default useSearchParamsObject;
export type UseSearchParamsObjectReturn = ReturnType<
  typeof useSearchParamsObject
>;

export type SearchParamsObject = {
  [key: string]: string | undefined;
};
