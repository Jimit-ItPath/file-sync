import { Group, Stack } from '@mantine/core';
import { Input } from '../../../components';
import { useMemo } from 'react';

type FormFieldsProps = {
  methods: any;
  registerFormData: any[];
};

export const FormFields: React.FC<FormFieldsProps> = ({
  methods,
  registerFormData,
}) => {
  const {
    formState: { errors },
  } = methods;

  const firstNameField = useMemo(
    () => registerFormData.find(f => f.name === 'firstName'),
    []
  );
  const lastNameField = useMemo(
    () => registerFormData.find(f => f.name === 'lastName'),
    []
  );
  const otherFields = useMemo(
    () =>
      registerFormData.filter(
        f => f.name !== 'firstName' && f.name !== 'lastName'
      ),
    []
  );

  return (
    <Stack gap={16} mb={6}>
      <Group gap={12} grow>
        <Input
          {...firstNameField}
          error={errors?.firstName?.message || firstNameField?.error}
          radius="md"
          size="md"
          withAsterisk
        />
        <Input
          {...lastNameField}
          error={errors?.lastName?.message || lastNameField?.error}
          radius="md"
          size="md"
          withAsterisk
        />
      </Group>
      {otherFields.map(
        ({
          id,
          label,
          placeholder,
          type,
          error,
          name,
          isRequired,
          ...props
        }) => (
          <Input
            key={id}
            name={name}
            label={label}
            placeholder={placeholder}
            type={type}
            error={errors?.[name]?.message || error}
            radius="md"
            size="md"
            withAsterisk={isRequired}
            {...props}
          />
        )
      )}
    </Stack>
  );
};
