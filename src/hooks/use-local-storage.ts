import { useState } from 'react';
import { errorHandler } from '../utils/helper';

// const [state, setState, removeState] = useLocalStorage("keyName", initialValue);

interface UseLocalStorageReturn<T>
  extends Array<T | ((value: T | ((val: T) => T)) => void) | (() => void)> {
  0: T;
  1: (value: T | ((val: T) => T)) => void;
  2: () => void;
  storedValue: T;
  setValue: (value: T | ((val: T) => T)) => void;
  removeValue: () => void;
}

const useLocalStorage = <T>(
  dataKey: string,
  initialValue: T
): UseLocalStorageReturn<T> => {
  const key = dataKey;
  const [storedValue, setStoredValue] = useState<T>(() => {
    return errorHandler(
      () => {
        const item = window?.localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : initialValue;
      },
      () => {
        return initialValue;
      }
    ) as T;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    errorHandler(() => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window?.localStorage.setItem(key, JSON.stringify(valueToStore));
    });
  };

  const removeValue = () => {
    errorHandler(() => {
      window?.localStorage.removeItem(key);
      setStoredValue(undefined as unknown as T);
    });
  };

  const hookData = [
    storedValue,
    setValue,
    removeValue,
  ] as UseLocalStorageReturn<T>;
  hookData.storedValue = storedValue;
  hookData.setValue = setValue;
  hookData.removeValue = removeValue;
  return hookData;
};

export default useLocalStorage;
