import {
  Loader,
  Select as MantineSelect,
  type SelectProps as MantineSelectProps,
} from '@mantine/core';
import { useEffect } from 'react';
import useFetchWithAbort from '../../../hooks/use-fetch-with-abort';

type SelectProps = {
  field: any;
  loading?: boolean;
  getData?: any;
  returnObject?: boolean;
  nothingFoundMessage?: string;
  onChange?: (value: string | any) => void;
  [key: string]: any;
} & MantineSelectProps;

const Select = ({
  field,
  loading,
  getData,
  returnObject = false,
  nothingFoundMessage,
  onChange,
  ...props
}: SelectProps) => {
  const { value, onChange: fieldOnChange, onBlur, ref } = field;

  const isGetData = Boolean(getData);

  const [fetchData] = useFetchWithAbort(getData);

  useEffect(() => {
    if (isGetData) {
      fetchData({ params: { page: 1, limit: 25 } });
    }
  }, [fetchData, isGetData]);

  return (
    <MantineSelect
      {...{ onBlur, ref }}
      value={(returnObject ? value?.value : value)?.toString() || null}
      onChange={(_value, option) => {
        fieldOnChange(returnObject ? option : option?.value || '');
        onChange && onChange(returnObject ? option : option?.value || '');
      }}
      nothingFoundMessage={`${
        loading ? 'Loading' : nothingFoundMessage || 'Nothing found'
      }...`}
      {...(loading && {
        rightSection: <Loader color="var(--mantine-color-dimmed)" size={14} />,
      })}
      {...props}
    />
  );
};

export default Select;
