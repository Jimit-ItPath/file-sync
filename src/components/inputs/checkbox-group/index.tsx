import { useEffect } from 'react';
import { Checkbox, Loader, Stack } from '@mantine/core';
import useFetchWithAbort from '../../../hooks/use-fetch-with-abort';

type CheckBoxGroupProps = {
  field: any;
  data?: any[];
  getData?: any;
  loading?: boolean;
  [key: string]: any;
};

const CheckboxGroup = ({
  field,
  data,
  getData,
  loading,
  ...props
}: CheckBoxGroupProps) => {
  const { value, onChange, onBlur, ref } = field;

  const isGetData = Boolean(getData);

  const isNoData = data?.length === 0;

  const [fetchData] = useFetchWithAbort(getData);

  useEffect(() => {
    if (isGetData) {
      fetchData({ params: { page: 1, limit: 25 } });
    }
  }, [fetchData, isGetData]);

  return (
    <Checkbox.Group {...{ value, onChange, onBlur, ref }} {...props}>
      {loading && isNoData ? (
        <Loader size="md" type="dots" />
      ) : (
        <Stack gap="sm" my="sm">
          {data?.map(({ label, value }) => {
            return <Checkbox {...{ label, value }} />;
          })}
        </Stack>
      )}
    </Checkbox.Group>
  );
};

export default CheckboxGroup;
