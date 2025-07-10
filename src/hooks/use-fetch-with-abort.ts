import { useCallback, useRef, useEffect } from 'react';

// const [fetchData] = useApiWithAbort(apiFunction);

interface FetchConfigs {
  [key: string]: any;
  signal?: AbortSignal;
}

type ApiFunction = (configs: FetchConfigs) => void;

type UseFetchWithAbortReturn = [(configs: FetchConfigs) => () => void];

const useFetchWithAbort = (
  apiFunction: ApiFunction
): UseFetchWithAbortReturn => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    (configs: FetchConfigs): (() => void) => {
      // Abort the previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      apiFunction({ signal, ...configs });

      return () => {
        controller.abort();
      };
    },
    [apiFunction]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return [fetchData];
};

export default useFetchWithAbort;
